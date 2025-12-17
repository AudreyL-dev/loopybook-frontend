// src/pages/ChildSpace.tsx
// Espace enfant – LOOP-7
// Affiche les livres recommandés pour l'enfant sélectionné

import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import Header from "../components/layout/Header";
import {
    fetchRecommendedBooksByChild,
    type RecommendedBook,
} from "../features/recommendation/recommendationService";

import {
    childWishlistService,
    WISHLIST_UPDATED_EVENT,
} from "../services/childWishlistService";

const API_BASE_URL = "http://localhost:8081";

type ChildProfileResponse = {
    id?: number;
    username?: string | null;
};

const ChildSpace = () => {
    const { profileId } = useParams<{ profileId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const childId = useMemo(() => {
        const parsed = Number(profileId);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }, [profileId]);

    const [books, setBooks] = useState<RecommendedBook[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [likeLoadingByBookId, setLikeLoadingByBookId] = useState<Record<number, boolean>>({});

    // Compteur favoris
    const [favoritesCount, setFavoritesCount] = useState<number>(0);

    // Nom affiché (username)
    const [childDisplayName, setChildDisplayName] = useState<string | null>(null);

    // Charge le username de l’enfant via /api/child-profiles/{childId}
    useEffect(() => {
        if (!childId) {
            setChildDisplayName(null);
            return;
        }

        fetch(`${API_BASE_URL}/api/child-profiles/${childId}`, {
            method: "GET",
            headers: { Accept: "application/json" },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Impossible de charger le profil enfant");
                return res.json();
            })
            .then((child: ChildProfileResponse) => {
                const name = (child?.username ?? "").toString().trim();
                setChildDisplayName(name ? name : null);
            })
            .catch((err) => {
                console.error(err);
                setChildDisplayName(null);
            });
    }, [childId]);

    // Recharge compteur favoris à l’arrivée sur la page / changement d’enfant
    useEffect(() => {
        if (!childId) {
            setFavoritesCount(0);
            return;
        }
        setFavoritesCount(childWishlistService.getIds(childId).length);
    }, [childId, location.key]);

    // Mise à jour instantanée via event wishlist
    useEffect(() => {
        if (!childId) return;

        const onWishlistUpdated = (event: Event) => {
            const custom = event as CustomEvent<{ childId: number }>;
            const updatedChildId = custom.detail?.childId;

            if (updatedChildId === childId) {
                setFavoritesCount(childWishlistService.getIds(childId).length);
            }
        };

        window.addEventListener(WISHLIST_UPDATED_EVENT, onWishlistUpdated);
        return () => window.removeEventListener(WISHLIST_UPDATED_EVENT, onWishlistUpdated);
    }, [childId]);

    // Recommandations
    useEffect(() => {
        if (!childId) {
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        setLoading(true);
        setError(null);

        fetchRecommendedBooksByChild(childId, { signal: controller.signal })
            .then((data) => {
                setBooks(data);
            })
            .catch((err: unknown) => {
                if ((err as { name?: string })?.name === "AbortError") return;
                console.error(err);
                setError("Impossible de charger les recommandations.");
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [childId]);

    const handleGoToAllBooks = () => {
        if (!childId) return;
        navigate("/books", {
            state: { viewerMode: "child", childId },
        });
    };

    const handleGoToWishlist = () => {
        if (!childId) return;
        navigate(`/child/${childId}/wishlist`);
    };

    const handleGoToLibrary = () => {
        if (!childId) return;
        navigate(`/library/${childId}`);
    };

    // J’aime = wishlist (comme BooksPage)
    const handleLikeBook = async (bookId: number) => {
        if (!childId) return;
        if (likeLoadingByBookId[bookId]) return;

        setError(null);
        setLikeLoadingByBookId((prev) => ({ ...prev, [bookId]: true }));

        try {
            childWishlistService.toggle(childId, bookId);
        } catch (err) {
            console.error(err);
            setError("Impossible de mettre à jour tes favoris.");
        } finally {
            setLikeLoadingByBookId((prev) => ({ ...prev, [bookId]: false }));
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#FFD67B]/10 to-[#AEEA7C]/10">
            <Header />

            <main className="flex-1">
                <section className="container px-4 pt-10 pb-6 text-center">
                    <p className="text-slate-700 font-semibold">
                        Salut{childDisplayName ? ` ${childDisplayName}` : ""} !
                    </p>
                    <p className="text-sm text-slate-600 mt-1">Prêt pour de nouvelles aventures ?</p>

                    <div className="mt-5 flex justify-center gap-3">
                        <button
                            type="button"
                            onClick={handleGoToLibrary}
                            disabled={!childId}
                            className="px-5 py-2 rounded-full bg-[#AEEA7C] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Ma Bibliothèque
                        </button>

                        <button
                            type="button"
                            onClick={handleGoToWishlist}
                            disabled={!childId}
                            className="px-5 py-2 rounded-full bg-[#FFD67B] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Mes Favoris ({favoritesCount})
                        </button>
                    </div>

                    <h1 className="mt-8 text-xl font-extrabold text-slate-900">
                        Livres que tu pourrais aimer
                    </h1>
                </section>

                <section className="container px-4 pb-10">
                    {loading && (
                        <p className="text-sm text-slate-500 text-center">
                            Chargement des recommandations…
                        </p>
                    )}

                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {books.map((book) => {
                            const coverUrl = book.coverUrlFront ?? book.coverUrlBack ?? "";
                            const isLikeLoading = !!likeLoadingByBookId[book.id];
                            const isFav = !!childId ? childWishlistService.isLiked(childId, book.id) : false;

                            return (
                                <article
                                    key={book.id}
                                    className="flex flex-col rounded-[28px] bg-[#FDECEC] px-4 pt-4 pb-5"
                                >
                                    <div className="mb-4 flex items-center justify-center">
                                        <div className="h-20 w-full rounded-2xl bg-[#E6DCDC] flex items-center justify-center">
                                            {coverUrl && (
                                                <img
                                                    src={coverUrl}
                                                    alt={book.title}
                                                    className="h-16 object-contain"
                                                    loading="lazy"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <h2 className="text-sm font-extrabold text-center text-slate-900 leading-tight">
                                        {book.title}
                                    </h2>

                                    <p className="mt-1 text-xs text-center text-slate-600">{book.author}</p>

                                    <div className="mt-2 flex justify-center">
                    <span className="rounded-full bg-[#FFD67B] px-3 py-0.5 text-xs font-semibold text-slate-900">
                      Pour toi
                    </span>
                                    </div>

                                    <p className="mt-3 text-xs text-slate-700 line-clamp-3 text-center">
                                        {book.summary ?? ""}
                                    </p>

                                    <div className="mt-auto pt-4 flex flex-col items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => void handleLikeBook(book.id)}
                                            disabled={!childId || isLikeLoading}
                                            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-slate-900 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                                                isFav
                                                    ? "bg-slate-200 hover:bg-slate-300"
                                                    : "bg-[#AEEA7C] hover:brightness-95 active:brightness-90"
                                            }`}
                                        >
                                            {isLikeLoading ? "..." : isFav ? "Aimé" : "J’aime"}
                                        </button>

                                        {isFav && (
                                            <p className="text-xs text-slate-600 text-center">
                                                Ajouté à tes favoris
                                            </p>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    <div className="mt-12 flex justify-center">
                        <button
                            type="button"
                            onClick={handleGoToAllBooks}
                            disabled={!childId}
                            className="rounded-full bg-[#FFD67B] px-6 py-3 text-sm font-extrabold text-slate-900 hover:brightness-95 active:brightness-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Voir tous les livres
                        </button>
                    </div>

                    <div className="mt-14 flex justify-center">
                        <div className="w-full max-w-3xl rounded-[28px] bg-[#FDECEC] px-6 py-10 text-center">
                            <h2 className="text-2xl font-extrabold text-slate-900">Continue à explorer !</h2>

                            <p className="mt-4 text-sm text-slate-700">
                                Chaque livre est une nouvelle aventure qui t’attend. Clique sur J’aime pour
                                l’ajouter à tes favoris.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ChildSpace;
