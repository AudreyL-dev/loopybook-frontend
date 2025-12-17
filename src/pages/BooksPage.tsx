// src/pages/BooksPage.tsx
// Page "Tous les livres" : liste du catalogue LoopyBook.
// Cette page peut être affichée en mode parent (prix) ou enfant (bouton "J'aime").

import React, { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import Header from "../components/layout/Header.tsx";
import { childWishlistService } from "../services/childWishlistService";

type ViewerMode = "parent" | "child";

type LocationState = {
    viewerMode?: ViewerMode;
    childId?: number;
};

type Book = {
    id: number;
    title: string;
    author: string;
    publisher?: string | null;
    price?: number | null;
    coverUrlFront?: string | null;
    coverUrlBack?: string | null;
    summary?: string | null;
    qualityScore?: number | null;
    collectionName?: string | null;
    pageCount?: number | null;
    publicationDate?: string | null; // ISO "yyyy-MM-dd"
    audience: string;
    ean?: string | null;
    isbn?: string | null;
    writingLanguage: string;
    averageRating?: number | null;
    stockQuantity: number;
    available: boolean;
};

type CoverIndexState = Record<number, number>;

const fallbackCover = "/books/cover-not-found.png";

const BooksPage: React.FC = () => {
    const location = useLocation();

    const locationState = (location.state ?? {}) as LocationState;

    const viewerMode: ViewerMode = useMemo(() => {
        return locationState.viewerMode === "child" ? "child" : "parent";
    }, [locationState.viewerMode]);

    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState<string>("");

    // index de couverture par livre (0 = première, 1 = deuxième…)
    const [coverIndexByBook, setCoverIndexByBook] = useState<CoverIndexState>({});

    // Force un rerender quand on toggle la wishlist (stockée en localStorage)
    const [wishlistVersion, setWishlistVersion] = useState<number>(0);

    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch("http://localhost:8081/api/books", {
                    method: "GET",
                    headers: { Accept: "application/json" },
                });

                if (!response.ok) {
                    throw new Error("Erreur lors du chargement des livres.");
                }

                const data: Book[] = await response.json();
                setBooks(data);
            } catch (err) {
                console.error(err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Impossible de charger les livres. Réessayez plus tard."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    const filteredBooks = books.filter((book) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            (book.title && book.title.toLowerCase().includes(q)) ||
            (book.author && book.author.toLowerCase().includes(q)) ||
            (book.summary && book.summary.toLowerCase().includes(q))
        );
    });

    const formatPrice = (price?: number | null): string => {
        if (price == null) return "Prix non renseigné";
        return `${price.toFixed(2).replace(".", ",")} €`;
    };

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

    const formatLanguage = (code: string): string => {
        switch (code.toLowerCase()) {
            case "fr":
                return "Français";
            case "en":
                return "Anglais";
            default:
                return code.toUpperCase();
        }
    };

    const formatPublicationYear = (date?: string | null): string | null => {
        if (!date) return null;
        return date.slice(0, 4);
    };

    const handleNextCover = (bookId: number, coversCount: number) => {
        if (coversCount <= 1) return;
        setCoverIndexByBook((prev) => {
            const current = prev[bookId] ?? 0;
            const next = (current + 1) % coversCount;
            return { ...prev, [bookId]: next };
        });
    };

    const handleLike = (bookId: number) => {
        const childId = locationState.childId;

        if (!childId) {
            console.warn("Mode enfant sans childId : like ignoré.");
            return;
        }

        childWishlistService.toggle(childId, bookId);
        setWishlistVersion((v) => v + 1);
    };

    // (wishlistVersion est volontairement référencé pour rerender quand on toggle)
    void wishlistVersion;

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#3DCCC7]/10 to-[#AEEA7C]/10">
            <Header />

            <main className="flex-1 px-4 py-8 max-w-6xl mx-auto">
                {/* Titre + barre de recherche */}
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                            {viewerMode === "child" ? "Découvrir des livres" : "Rechercher des livres"}
                        </h1>
                        <p className="text-sm text-slate-600 mt-1">
                            {viewerMode === "child"
                                ? "Choisis un livre et clique sur J’aime."
                                : "Trouvez le livre parfait pour votre enfant."}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            {filteredBooks.length} livre(s) affiché(s) sur {books.length}.
                        </p>
                    </div>

                    <div className="w-full md:w-80">
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                            Rechercher par titre, auteur ou résumé
                        </label>
                        <input
                            type="text"
                            className="w-full border border-slate-200 shadow-sm rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3DCCC7] bg-white"
                            placeholder="Ex. dragons, aventure, Martin..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />

                        {viewerMode === "child" && locationState.childId && (
                            <div className="mt-2">
                                <Link
                                    to={`/child/${locationState.childId}/wishlist`}
                                    className="inline-flex items-center justify-center rounded-full bg-white border border-slate-200 px-4 py-2 text-[12px] font-bold text-slate-800 hover:bg-slate-50 transition"
                                >
                                    Ma liste de souhaits
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* États de chargement / erreur / vide */}
                {loading && <p className="text-sm text-slate-600">Chargement des livres...</p>}

                {error && !loading && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}

                {!loading && !error && filteredBooks.length === 0 && (
                    <p className="text-sm text-slate-600">Aucun livre ne correspond à votre recherche.</p>
                )}

                {/* Grille */}
                {!loading && !error && filteredBooks.length > 0 && (
                    <section className="grid gap-5 mt-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {filteredBooks.map((book) => {
                            const year = formatPublicationYear(book.publicationDate);
                            const isAvailable = book.available && (book.stockQuantity ?? 0) > 0;
                            const rating = book.averageRating ?? book.qualityScore ?? null;

                            const covers = [
                                book.coverUrlFront || fallbackCover,
                                book.coverUrlBack || null,
                            ].filter((url): url is string => !!url);

                            const activeIndex = coverIndexByBook[book.id] ?? 0;
                            const activeCover = covers[activeIndex] ?? covers[0] ?? null;
                            const hasCarousel = covers.length > 1;

                            const childId = locationState.childId;
                            const liked =
                                viewerMode === "child" && !!childId
                                    ? childWishlistService.isLiked(childId, book.id)
                                    : false;

                            return (
                                <article
                                    key={book.id}
                                    className="group bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden flex flex-col transition-transform duration-200 ease-out hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <div className="p-3 flex flex-col h-full">
                                        {/* Vignette image */}
                                        <div className="relative mb-3">
                                            <div
                                                className="rounded-2xl overflow-hidden bg-slate-100 aspect-[4/3] flex items-center justify-center cursor-pointer"
                                                onClick={() => handleNextCover(book.id, covers.length)}
                                            >
                                                {activeCover ? (
                                                    <img
                                                        src={activeCover}
                                                        alt={book.title}
                                                        className="w-full h-full object-cover transition-transform duration-200 ease-out group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="text-xs text-slate-400 px-3 text-center">
                                                        Pas d’image disponible
                                                    </div>
                                                )}
                                            </div>

                                            {/* Badge note (on le garde aussi en mode enfant) */}
                                            {rating !== null && (
                                                <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/90 text-[10px] font-semibold shadow-sm">
                                                    <span>★</span>
                                                    <span>{rating.toFixed(1)}</span>
                                                </span>
                                            )}

                                            {/* Indicateurs carrousel */}
                                            {hasCarousel && (
                                                <div className="absolute bottom-2 right-2 flex gap-1 bg-white/70 rounded-full px-2 py-0.5">
                                                    {covers.map((_, index) => (
                                                        <span
                                                            key={index}
                                                            className={`h-1.5 w-1.5 rounded-full ${
                                                                index === activeIndex ? "bg-slate-700" : "bg-slate-300"
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Texte */}
                                        <h2 className="text-sm font-semibold text-slate-900 line-clamp-2">
                                            {book.title}
                                        </h2>

                                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                                            {book.author}
                                            {year && <span className="text-slate-400"> • {year}</span>}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                                                {formatAudience(book.audience)}
                                            </span>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#3DCCC7]/10 text-slate-800">
                                                {formatLanguage(book.writingLanguage)}
                                            </span>
                                        </div>

                                        {book.summary && (
                                            <p className="mt-2 text-[11px] text-slate-600 line-clamp-3">
                                                {book.summary}
                                            </p>
                                        )}

                                        {/* Bouton En voir plus (même style que J’aime) */}
                                        <div className="mt-3 flex justify-center">
                                            <Link
                                                to={`/books/${book.id}`}
                                                state={{ viewerMode, childId: locationState.childId }}
                                                className="rounded-full bg-[#AEEA7C] px-4 py-2 text-[12px] font-bold text-slate-900 hover:brightness-95 active:brightness-90 transition"
                                            >
                                                En voir plus
                                            </Link>
                                        </div>

                                        {/* Bas de carte : mode parent vs mode enfant */}
                                        {viewerMode === "parent" ? (
                                            <div className="mt-3 pt-2 flex items-center justify-between border-t border-slate-100">
                                                <span className="text-sm font-semibold text-emerald-600">
                                                    {formatPrice(book.price)}
                                                </span>

                                                {isAvailable ? (
                                                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
                                                        En stock
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-100 rounded-full px-2 py-0.5">
                                                        Indisponible
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleLike(book.id)}
                                                    className={`rounded-full px-4 py-2 text-[12px] font-bold transition ${
                                                        liked
                                                            ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                                            : "bg-[#AEEA7C] text-slate-900 hover:brightness-95 active:brightness-90"
                                                    }`}
                                                >
                                                    {liked ? "Aimé" : "J’aime"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </section>
                )}
            </main>
        </div>
    );
};

export default BooksPage;
