// src/pages/BookDetails.tsx
// Page "Détail livre" : affiche toutes les infos d’un livre + avis.
// Objectif : reproduire la structure UI (colonne gauche + contenus à droite).
//
// Notes techniques :
// - Récupère l'id via l’URL : /books/:id
// - Récupère viewerMode + childId via location.state (transmis depuis BooksPage)
// - Fetch :
//   - Livre : GET http://localhost:8081/api/books/{id}
//   - Avis : (optionnel) GET http://localhost:8081/api/comments/book/{id}
//   Si l’endpoint avis n’existe pas encore, la page reste fonctionnelle (fallback UI).

import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../components/layout/Header.tsx";

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

type CommentItem = {
    id: number;
    displayName: string; // ex: "Emma (7 ans)" ou "Parent - Sophie M."
    rating: number; // 1..5
    content: string;
    createdAt: string; // ISO date ou string
};

const API_BOOKS_BASE_URL = "http://localhost:8081/api/books";
const API_COMMENTS_BASE_URL = "http://localhost:8081/api/comments";
const fallbackCover = "/books/cover-not-found.png";

const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
};

const formatPrice = (price?: number | null): string => {
    if (price == null) return "Prix non renseigné";
    return `${price.toFixed(2).replace(".", ",")}€`;
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

const formatDateFr = (iso?: string | null): string => {
    if (!iso) return "Non renseignée";
    // Attend "yyyy-MM-dd" ou ISO complet
    const raw = iso.slice(0, 10);
    const [y, m, d] = raw.split("-");
    if (!y || !m || !d) return raw;
    return `${d}/${m}/${y}`;
};

const renderStars = (rating: number) => {
    const safe = clamp(Math.round(rating), 0, 5);
    const stars = Array.from({ length: 5 }, (_, index) => (index < safe ? "★" : "☆")).join("");
    return <span className="text-[12px] text-amber-500">{stars}</span>;
};

const BookDetails: React.FC = () => {
    const navigate = useNavigate();
    const params = useParams();
    const location = useLocation();
    const locationState = (location.state ?? {}) as LocationState;

    const viewerMode: ViewerMode = useMemo(() => {
        return locationState.viewerMode === "child" ? "child" : "parent";
    }, [locationState.viewerMode]);

    const bookId = useMemo(() => {
        const raw = params.id;
        const parsed = raw ? Number(raw) : NaN;
        return Number.isFinite(parsed) ? parsed : null;
    }, [params.id]);

    const [book, setBook] = useState<Book | null>(null);
    const [loadingBook, setLoadingBook] = useState<boolean>(true);
    const [bookError, setBookError] = useState<string | null>(null);

    const [comments, setComments] = useState<CommentItem[]>([]);
    const [loadingComments, setLoadingComments] = useState<boolean>(false);

    // Form avis (UI seulement pour l’instant)
    const [newRating, setNewRating] = useState<number>(0);
    const [newContent, setNewContent] = useState<string>("");
    const [submitMessage, setSubmitMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchBook = async () => {
            if (bookId == null) {
                setBookError("Identifiant de livre invalide.");
                setLoadingBook(false);
                return;
            }

            setLoadingBook(true);
            setBookError(null);

            try {
                const response = await fetch(`${API_BOOKS_BASE_URL}/${bookId}`, {
                    method: "GET",
                    headers: { Accept: "application/json" },
                });

                if (!response.ok) {
                    throw new Error("Livre introuvable ou indisponible.");
                }

                const data = (await response.json()) as Book;
                setBook(data);
            } catch (err) {
                setBook(null);
                setBookError(err instanceof Error ? err.message : "Erreur lors du chargement du livre.");
            } finally {
                setLoadingBook(false);
            }
        };

        fetchBook();
    }, [bookId]);

    useEffect(() => {
        const fetchComments = async () => {
            if (bookId == null) return;

            // On tente de charger les avis, mais si l’API n’est pas prête, la page reste OK.
            setLoadingComments(true);
            try {
                const response = await fetch(`${API_COMMENTS_BASE_URL}/book/${bookId}`, {
                    method: "GET",
                    headers: { Accept: "application/json" },
                });

                if (!response.ok) {
                    // Pas bloquant : on laisse simplement une liste vide
                    setComments([]);
                    return;
                }

                const data = (await response.json()) as CommentItem[];
                setComments(Array.isArray(data) ? data : []);
            } catch {
                setComments([]);
            } finally {
                setLoadingComments(false);
            }
        };

        fetchComments();
    }, [bookId]);

    const activeCover = useMemo(() => {
        if (!book) return fallbackCover;
        return book.coverUrlFront || fallbackCover;
    }, [book]);

    const isAvailable = useMemo(() => {
        if (!book) return false;
        return book.available && (book.stockQuantity ?? 0) > 0;
    }, [book]);

    const displayRating = useMemo(() => {
        if (!book) return null;
        const rating = book.averageRating ?? book.qualityScore ?? null;
        return rating;
    }, [book]);

    const qualityScore = useMemo(() => {
        if (!book) return null;
        return book.qualityScore ?? null;
    }, [book]);

    const qualityPercent = useMemo(() => {
        if (qualityScore == null) return 0;
        return clamp((qualityScore / 10) * 100, 0, 100);
    }, [qualityScore]);

    const commentsCount = comments.length;

    const handleAddToCart = () => {
        // TODO : brancher sur l’API panier (cart_item).
        // - viewerMode parent : ajout au panier du parent
        // - viewerMode child : ajout dans wishlist enfant -> panier parent (selon ton flux)
        setSubmitMessage(null);

        if (!book) return;
        console.log("add to cart", {
            bookId: book.id,
            viewerMode,
            childId: locationState.childId ?? null,
        });
    };

    const handleToggleWishlist = () => {
        // TODO : brancher wishlist.
        setSubmitMessage(null);

        if (!book) return;
        console.log("toggle wishlist", {
            bookId: book.id,
            viewerMode,
            childId: locationState.childId ?? null,
        });
    };

    const handleSubmitReview = (event: React.FormEvent) => {
        event.preventDefault();

        // TODO : brancher sur l’API comments (table comments).
        // Rappel : en base, c’est soit id_user soit id_child (exclusif) selon ton CHECK.
        // Pour l’instant on simule uniquement l’UI.

        if (!book) return;

        const trimmed = newContent.trim();
        if (!trimmed) {
            setSubmitMessage("Le commentaire est obligatoire.");
            return;
        }
        if (newRating < 1 || newRating > 5) {
            setSubmitMessage("La note doit être comprise entre 1 et 5.");
            return;
        }

        const simulatedItem: CommentItem = {
            id: Date.now(),
            displayName: viewerMode === "child" ? "Enfant" : "Parent",
            rating: newRating,
            content: trimmed,
            createdAt: new Date().toISOString().slice(0, 10),
        };

        setComments((prev) => [simulatedItem, ...prev]);
        setNewRating(0);
        setNewContent("");
        setSubmitMessage("Avis ajouté (simulation UI).");
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#3DCCC7]/10 to-[#AEEA7C]/10">
            <Header />

            <main className="flex-1 px-4 py-6 max-w-6xl mx-auto">
                {/* Retour */}
                <div className="mb-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="text-sm text-[#3DCCC7] hover:underline"
                    >
                        ← Retour
                    </button>
                </div>

                {loadingBook && (
                    <p className="text-sm text-slate-600">Chargement du livre...</p>
                )}

                {!loadingBook && bookError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                        {bookError}
                    </div>
                )}

                {!loadingBook && !bookError && book && (
                    <section className="grid gap-6 lg:grid-cols-[360px_1fr] items-start">
                        {/* Colonne gauche : card livre */}
                        <aside className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden">
                            <div className="p-5">
                                {/* Cover */}
                                <div className="rounded-3xl overflow-hidden bg-slate-100 aspect-[4/4] flex items-center justify-center">
                                    <img
                                        src={activeCover}
                                        alt={book.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Prix + note */}
                                <div className="mt-4 flex items-end justify-between">
                                    <div className="text-[#3DCCC7] font-extrabold text-lg">
                                        {formatPrice(book.price)}
                                    </div>

                                    {displayRating !== null && (
                                        <div className="flex items-center gap-2">
                                            {renderStars(displayRating)}
                                            <span className="text-[12px] font-semibold text-slate-700">
                                                {displayRating.toFixed(1)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Audience + pages */}
                                <div className="mt-3 flex flex-col gap-2 text-[12px] text-slate-600">
                                    <div className="flex items-center justify-between">
                                        <span>Âge</span>
                                        <span className="font-semibold text-slate-800">
                                            {formatAudience(book.audience)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span>Pages</span>
                                        <span className="font-semibold text-slate-800">
                                            {book.pageCount ?? "—"}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-5 flex items-center gap-3">
                                    {viewerMode === "parent" && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={handleAddToCart}
                                                disabled={!isAvailable}
                                                className={`flex-1 rounded-full px-4 py-3 text-[13px] font-bold transition ${
                                                    isAvailable
                                                        ? "bg-[#AEEA7C] text-slate-900 hover:brightness-95 active:brightness-90"
                                                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                                }`}
                                            >
                                                Ajouter au panier
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleToggleWishlist}
                                                className="w-12 h-12 rounded-full bg-[#FFD67B] text-slate-900 font-bold hover:brightness-95 active:brightness-90 transition"
                                                aria-label="Ajouter aux favoris"
                                            >
                                                ♥
                                            </button>
                                        </>
                                    )}

                                    {viewerMode === "child" && (
                                        <button
                                            type="button"
                                            onClick={handleToggleWishlist}
                                            className="flex-1 rounded-full bg-[#AEEA7C] px-4 py-3 text-[13px] font-bold text-slate-900 hover:brightness-95 active:brightness-90 transition"
                                        >
                                            J’aime
                                        </button>
                                    )}
                                </div>


                                {/* Stock */}
                                <div className="mt-4 text-[12px]">
                                    {isAvailable ? (
                                        <span className="inline-flex items-center rounded-full px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">
                                            En stock
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-full px-3 py-1 bg-slate-50 text-slate-600 border border-slate-100 font-medium">
                                            Indisponible
                                        </span>
                                    )}
                                </div>
                            </div>
                        </aside>

                        {/* Colonne droite : contenus */}
                        <div className="flex flex-col gap-6">
                            {/* Titre + auteur */}
                            <header>
                                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                                    {book.title}
                                </h1>
                                <p className="mt-1 text-sm text-slate-600">
                                    par <span className="font-semibold">{book.author}</span>
                                </p>
                            </header>

                            {/* Jauge de qualité */}
                            <section className="bg-white rounded-2xl shadow-md border border-slate-100 p-5">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-bold text-slate-900">
                                        Jauge de qualité LoopyBook
                                    </h2>
                                    <div className="text-[#AEEA7C] font-extrabold">
                                        {qualityScore != null ? `${qualityScore.toFixed(1)}/10` : "—/10"}
                                    </div>
                                </div>

                                <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-[#3DCCC7]"
                                        style={{ width: `${qualityPercent}%` }}
                                    />
                                </div>

                                <p className="mt-3 text-[12px] text-slate-600">
                                    Basé sur la qualité du contenu, les illustrations et les retours des familles.
                                </p>
                            </section>

                            {/* Résumé + description */}
                            <section className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
                                <h2 className="text-base font-extrabold text-slate-900">
                                    Résumé
                                </h2>
                                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                                    {book.summary ?? "Résumé non renseigné."}
                                </p>

                                <h3 className="mt-6 text-sm font-extrabold text-slate-900">
                                    Description complète
                                </h3>
                                <div className="mt-2 text-sm text-slate-700 leading-relaxed space-y-3">
                                    {/* Pour l’instant, on n’a pas un champ “description” en base (01_init_schema.sql), donc fallback sur summary */}
                                    <p>
                                        {book.summary ?? "Description non renseignée."}
                                    </p>
                                    <p>
                                        {book.collectionName
                                            ? `Collection : ${book.collectionName}.`
                                            : "Collection non renseignée."}
                                    </p>
                                </div>
                            </section>

                            {/* Informations */}
                            <section className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
                                <h2 className="text-base font-extrabold text-slate-900">
                                    Informations
                                </h2>

                                <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-600">Auteur</span>
                                        <span className="font-semibold text-slate-900">{book.author}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-600">Éditeur</span>
                                        <span className="font-semibold text-slate-900">
                                            {book.publisher ?? "—"}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-600">Date de publication</span>
                                        <span className="font-semibold text-slate-900">
                                            {formatDateFr(book.publicationDate)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-600">Nombre de pages</span>
                                        <span className="font-semibold text-slate-900">
                                            {book.pageCount ?? "—"}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-600">ISBN</span>
                                        <span className="font-semibold text-slate-900">
                                            {book.isbn ?? "—"}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-600">Langue</span>
                                        <span className="font-semibold text-slate-900">
                                            {formatLanguage(book.writingLanguage)}
                                        </span>
                                    </div>
                                </div>
                            </section>

                            {/* Avis */}
                            <section className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
                                <h2 className="text-base font-extrabold text-slate-900">
                                    Avis des lecteurs ({commentsCount})
                                </h2>

                                {/* Form avis */}
                                <div className="mt-4 bg-slate-50 rounded-2xl p-5">
                                    <h3 className="text-sm font-extrabold text-slate-900">
                                        Laisser un avis
                                    </h3>

                                    <form className="mt-4" onSubmit={handleSubmitReview}>
                                        <label className="block text-xs font-semibold text-slate-700">
                                            Note
                                        </label>

                                        <div className="mt-2 flex items-center gap-2">
                                            {Array.from({ length: 5 }, (_, index) => {
                                                const value = index + 1;
                                                const isActive = value <= newRating;
                                                return (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() => setNewRating(value)}
                                                        className={`text-lg leading-none transition ${
                                                            isActive ? "text-amber-500" : "text-slate-300"
                                                        }`}
                                                        aria-label={`Mettre ${value} étoile(s)`}
                                                        title={`${value}/5`}
                                                    >
                                                        ★
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <label className="block mt-4 text-xs font-semibold text-slate-700">
                                            Commentaire
                                        </label>

                                        <textarea
                                            className="mt-2 w-full min-h-[110px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3DCCC7]"
                                            placeholder="Partagez votre avis sur ce livre..."
                                            value={newContent}
                                            onChange={(e) => setNewContent(e.target.value)}
                                        />

                                        {submitMessage && (
                                            <p className="mt-3 text-xs text-slate-700">
                                                {submitMessage}
                                            </p>
                                        )}

                                        <button
                                            type="submit"
                                            className="mt-4 rounded-full bg-[#AEEA7C] px-5 py-2 text-[12px] font-bold text-slate-900 hover:brightness-95 active:brightness-90 transition"
                                        >
                                            Publier l’avis
                                        </button>
                                    </form>
                                </div>

                                {/* Liste avis */}
                                <div className="mt-6">
                                    {loadingComments && (
                                        <p className="text-sm text-slate-600">
                                            Chargement des avis...
                                        </p>
                                    )}

                                    {!loadingComments && comments.length === 0 && (
                                        <p className="text-sm text-slate-600">
                                            Aucun avis pour le moment.
                                        </p>
                                    )}

                                    {!loadingComments && comments.length > 0 && (
                                        <ul className="divide-y divide-slate-100">
                                            {comments.map((item) => (
                                                <li key={item.id} className="py-4">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="font-bold text-sm text-slate-900">
                                                            {item.displayName}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {renderStars(item.rating)}
                                                            <span className="text-[12px] text-slate-500">
                                                                {formatDateFr(item.createdAt)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <p className="mt-2 text-sm text-slate-700">
                                                        {item.content}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Lien optionnel vers le catalogue */}
                                <div className="mt-6">
                                    <Link
                                        to="/books"
                                        className="text-sm text-[#3DCCC7] hover:underline"
                                        state={{ viewerMode, childId: locationState.childId }}
                                    >
                                        Retour au catalogue
                                    </Link>
                                </div>
                            </section>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default BookDetails;
