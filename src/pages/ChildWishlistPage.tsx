// src/pages/ChildWishlistPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../components/layout/Header";
import {
  childWishlistService,
  WISHLIST_UPDATED_EVENT,
} from "../services/childWishlistService";
import {
  fetchParentCart,
  isBookInParentCart,
  requestBookForParentCart,
  type ParentCartItem,
} from "../features/cart/cartService";
import { useAuth } from "../contexts/AuthContext";

type LocationState = {
  childId?: number;
};

type Book = {
  id: number;
  title: string;
  author: string;
  coverUrlFront?: string | null;
  summary?: string | null;
  audience: string;
  averageRating?: number | null;
  qualityScore?: number | null;
};

const fallbackCover = "/books/cover-not-found.png";

const formatAudience = (audience: string): string => {
  switch (audience) {
    case "TODDLER":
      return "0–5 ans";
    case "CHILDREN":
      return "5–10 ans";
    case "TEEN":
      return "11–17 ans";
    case "GENERAL":
    default:
      return "Tout public";
  }
};

const ChildWishlistPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const { user } = useAuth();

  // childId peut venir soit du state, soit du param URL (/child/:profileId/wishlist)
  const locationState = (location.state ?? {}) as LocationState;
  const childIdFromParams = params.profileId ? Number(params.profileId) : undefined;

  const childId =
    Number.isFinite(locationState.childId) && (locationState.childId ?? 0) > 0
      ? locationState.childId
      : Number.isFinite(childIdFromParams) && (childIdFromParams ?? 0) > 0
        ? childIdFromParams
        : undefined;

  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [booksById, setBooksById] = useState<Record<number, Book>>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [requestingByBook, setRequestingByBook] = useState<Record<number, boolean>>({});
  const [requestedByBook, setRequestedByBook] = useState<Record<number, boolean>>({});

  // Panier du parent (pour bloquer "Demander" si déjà présent)
  const [parentCartItems, setParentCartItems] = useState<ParentCartItem[]>([]);
  const [parentCartLoading, setParentCartLoading] = useState<boolean>(true);

  // 1) Charge la wishlist IDs dès qu’on a childId
  useEffect(() => {
    if (!childId) {
      setLoading(false);
      setError("childId manquant : impossible d’afficher la liste de souhaits.");
      return;
    }

    setError(null);
    setWishlistIds(childWishlistService.getIds(childId));
  }, [childId]);

  // 2) Écoute l’event wishlist pour rester synchro (instantané)
  useEffect(() => {
    if (!childId) return;

    const onWishlistUpdated = (event: Event) => {
      const custom = event as CustomEvent<{ childId: number }>;
      const updatedChildId = custom.detail?.childId;

      if (updatedChildId === childId) {
        setWishlistIds(childWishlistService.getIds(childId));
      }
    };

    window.addEventListener(WISHLIST_UPDATED_EVENT, onWishlistUpdated);
    return () => window.removeEventListener(WISHLIST_UPDATED_EVENT, onWishlistUpdated);
  }, [childId]);

  // 3) Charge la map des livres (une fois) + re-filtre ensuite via wishlistIds
  useEffect(() => {
    if (!childId) return;

    const fetchBooks = async () => {
      setLoading(true);
      setError(null);

      try {
        const resp = await fetch("http://localhost:8081/api/books", {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (!resp.ok) throw new Error("Erreur lors du chargement des livres.");

        const all: Book[] = await resp.json();
        const map: Record<number, Book> = {};
        for (const b of all) map[b.id] = b;
        setBooksById(map);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur inconnue.");
      } finally {
        setLoading(false);
      }
    };

    void fetchBooks();
  }, [childId]);

  // 4) Charge le panier du parent connecté (pour bloquer "Demander" si déjà dedans)
  useEffect(() => {
    const loadParentCart = async () => {
      // Si non connecté, on ne peut pas vérifier => on n’applique pas le blocage.
      if (!user?.id) {
        setParentCartItems([]);
        setParentCartLoading(false);
        return;
      }

      setParentCartLoading(true);
      try {
        const items = await fetchParentCart(user.id);
        setParentCartItems(items);
      } catch {
        // En cas d’erreur, on ne bloque pas
        setParentCartItems([]);
      } finally {
        setParentCartLoading(false);
      }
    };

    void loadParentCart();
  }, [user?.id]);

  const wishlistBooks = useMemo(() => {
    return wishlistIds.map((id) => booksById[id]).filter((b): b is Book => !!b);
  }, [wishlistIds, booksById]);

  const handleRemove = (bookId: number) => {
    if (!childId) return;

    // remove() émet déjà l’event => wishlistIds sera resync via le listener
    childWishlistService.remove(childId, bookId);

    setRequestedByBook((prev) => {
      const copy = { ...prev };
      delete copy[bookId];
      return copy;
    });
  };

  const handleRequest = async (bookId: number) => {
    if (!childId) return;

    // Si déjà en cours / déjà demandé
    if (requestingByBook[bookId] || requestedByBook[bookId]) return;

    // Si déjà dans le panier parent, on bloque
    if (!parentCartLoading && isBookInParentCart(parentCartItems, bookId)) {
      setRequestedByBook((prev) => ({ ...prev, [bookId]: true }));
      return;
    }

    setRequestingByBook((prev) => ({ ...prev, [bookId]: true }));
    setError(null);

    try {
      const result = await requestBookForParentCart({ childId, bookId });

      if (result === "CREATED" || result === "ALREADY_EXISTS") {
        setRequestedByBook((prev) => ({ ...prev, [bookId]: true }));

        // Refresh panier parent pour bloquer immédiatement
        if (user?.id) {
          try {
            const updated = await fetchParentCart(user.id);
            setParentCartItems(updated);
          } catch {
            // ignore
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
    } finally {
      setRequestingByBook((prev) => ({ ...prev, [bookId]: false }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#3DCCC7]/10 to-[#AEEA7C]/10">
      <Header />

      <main className="flex-1 px-4 py-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm font-semibold text-slate-700 hover:text-slate-900"
          >
            Retour
          </button>

          <h1 className="mt-3 text-2xl md:text-3xl font-bold text-slate-900">
            Ma liste de souhaits
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Clique sur “Demander ce livre” si tu veux que papa/maman le voie dans son panier.
          </p>

          {childId && (
            <div className="mt-3">
              <Link
                to={`/child/${childId}`}
                className="text-[12px] font-bold text-slate-700 hover:text-slate-900"
              >
                Retour à mon espace
              </Link>
            </div>
          )}
        </div>

        {loading && <p className="text-sm text-slate-600">Chargement...</p>}

        {error && !loading && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {!loading && !error && childId && wishlistIds.length === 0 && (
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
            <p className="text-sm text-slate-700 font-semibold">Ta liste est vide.</p>
            <p className="text-sm text-slate-600 mt-1">
              Va dans le catalogue et clique sur “J’aime” pour ajouter un livre ici.
            </p>

            <div className="mt-4">
              <Link
                to="/books"
                state={{ viewerMode: "child", childId }}
                className="inline-flex items-center justify-center rounded-full bg-[#FFD67B] px-5 py-2 text-[12px] font-bold text-slate-900 hover:brightness-95 active:brightness-90 transition"
              >
                Chercher d’autres livres
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && wishlistBooks.length > 0 && (
          <>
            <div className="mb-3 text-xs text-slate-500">
              {wishlistBooks.length} livre(s) dans ta liste.
            </div>

            <section className="grid gap-5 mt-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {wishlistBooks.map((book) => {
                const rating = book.averageRating ?? book.qualityScore ?? null;
                const isRequesting = requestingByBook[book.id] ?? false;

                const alreadyInParentCart =
                  !parentCartLoading && isBookInParentCart(parentCartItems, book.id);

                // On considère "Demandé" si déjà dans panier OU si on vient de le demander dans cette page
                const isRequested = requestedByBook[book.id] ?? false;
                const buttonLocked = isRequesting || isRequested || alreadyInParentCart;

                const buttonLabel = alreadyInParentCart
                  ? "Déjà dans le panier"
                  : isRequested
                    ? "Demandé"
                    : isRequesting
                      ? "En cours..."
                      : "Demander ce livre";

                return (
                  <article
                    key={book.id}
                    className="group bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden flex flex-col transition-transform duration-200 ease-out hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="p-3 flex flex-col h-full">
                      <div className="relative mb-3">
                        <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-[4/3] flex items-center justify-center">
                          <img
                            src={book.coverUrlFront || fallbackCover}
                            alt={book.title}
                            className="w-full h-full object-cover transition-transform duration-200 ease-out group-hover:scale-105"
                          />
                        </div>

                        {rating !== null && (
                          <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/90 text-[10px] font-semibold shadow-sm">
                            <span>★</span>
                            <span>{rating.toFixed(1)}</span>
                          </span>
                        )}
                      </div>

                      <h2 className="text-sm font-semibold text-slate-900 line-clamp-2">
                        {book.title}
                      </h2>

                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                        {book.author}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                          {formatAudience(book.audience)}
                        </span>
                      </div>

                      {book.summary && (
                        <p className="mt-2 text-[11px] text-slate-600 line-clamp-3">
                          {book.summary}
                        </p>
                      )}

                      <div className="mt-4 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleRequest(book.id)}
                          disabled={buttonLocked}
                          className={`flex-1 rounded-full px-4 py-2 text-[12px] font-bold transition ${
                            buttonLocked
                              ? "bg-slate-200 text-slate-600 cursor-not-allowed"
                              : "bg-[#AEEA7C] text-slate-900 hover:brightness-95 active:brightness-90"
                          }`}
                        >
                          {buttonLabel}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemove(book.id)}
                          className="rounded-full bg-red-50 border border-red-100 px-3 py-2 text-[12px] font-bold text-red-600 hover:bg-red-100 transition"
                          aria-label="Retirer"
                          title="Retirer"
                        >
                          Supprimer
                        </button>
                      </div>

                      <div className="mt-3 flex justify-center">
                        <Link
                          to={`/books/${book.id}`}
                          state={{ viewerMode: "child", childId }}
                          className="text-[12px] font-bold text-slate-700 hover:text-slate-900"
                        >
                          Voir le détail
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default ChildWishlistPage;
