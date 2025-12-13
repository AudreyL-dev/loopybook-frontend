// src/features/admin/books/AdminBooksSection.tsx

import React, { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { BookPlus, BookX, Search, SquarePen } from "lucide-react";

export type Book = {
    id?: number;
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
    publicationDate?: string | null; // ISO
    audience: string;
    ean?: string | null;
    isbn?: string | null;
    writingLanguage: string;
    averageRating?: number | null;
    stockQuantity: number;
    available: boolean;
};

const emptyBook: Book = {
    title: "",
    author: "",
    publisher: "",
    price: undefined,
    coverUrlFront: "",
    coverUrlBack: "",
    summary: "",
    qualityScore: undefined,
    collectionName: "",
    pageCount: undefined,
    publicationDate: "",
    audience: "GENERAL",
    ean: "",
    isbn: "",
    writingLanguage: "fr",
    averageRating: undefined,
    stockQuantity: 0,
    available: true,
};

const AdminBooksSection: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const [saving, setSaving] = useState(false);

    // Chargement des livres depuis le backend
    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch("http://localhost:8081/api/books");
                if (!response.ok) {
                    throw new Error("Impossible de charger les livres.");
                }
                const data: Book[] = await response.json();
                setBooks(data);
            } catch (err) {
                console.error(err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Erreur lors du chargement des livres."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    const openCreateModal = () => {
        setEditingBook({ ...emptyBook });
        setIsModalOpen(true);
    };

    const openEditModal = (book: Book) => {
        setEditingBook({ ...book });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;
        setIsModalOpen(false);
        setEditingBook(null);
    };

    const handleDelete = async (book: Book) => {
        if (!book.id) return;

        const confirmDelete = window.confirm(
            `Supprimer le livre "${book.title}" ?`
        );
        if (!confirmDelete) return;

        try {
            const response = await fetch(
                `http://localhost:8081/api/books/${book.id}`,
                {
                    method: "DELETE",
                }
            );
            if (!response.ok && response.status !== 204) {
                throw new Error("Erreur lors de la suppression du livre.");
            }
            setBooks((prev) => prev.filter((b) => b.id !== book.id));
        } catch (err) {
            console.error(err);
            window.alert(
                err instanceof Error
                    ? err.message
                    : "Impossible de supprimer ce livre pour le moment."
            );
        }
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!editingBook) return;

        if (!editingBook.title.trim() || !editingBook.author.trim()) {
            window.alert("Titre et auteur sont obligatoires.");
            return;
        }

        setSaving(true);
        setError(null);

        const isEdit = Boolean(editingBook.id);
        const url = isEdit
            ? `http://localhost:8081/api/books/${editingBook.id}`
            : "http://localhost:8081/api/books";
        const method = isEdit ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editingBook),
            });

            if (!response.ok) {
                throw new Error(
                    isEdit
                        ? "Erreur lors de la mise à jour du livre."
                        : "Erreur lors de la création du livre."
                );
            }

            const saved: Book = await response.json();

            setBooks((prev) => {
                if (isEdit) {
                    return prev.map((b) => (b.id === saved.id ? saved : b));
                }
                return [...prev, saved];
            });

            setIsModalOpen(false);
            setEditingBook(null);
        } catch (err) {
            console.error(err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Une erreur est survenue lors de l’enregistrement."
            );
        } finally {
            setSaving(false);
        }
    };

    const filteredBooks = books.filter((book) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            (book.title && book.title.toLowerCase().includes(q)) ||
            (book.author && book.author.toLowerCase().includes(q))
        );
    });

    const formatPrice = (price?: number | null): string => {
        if (price == null) return "-";
        return `${price.toFixed(2).replace(".", ",")} €`;
    };

    const stockBadgeClasses = (stock: number | undefined) => {
        const value = stock ?? 0;

        if (value < 5) {
            return "bg-[#F55E5E] text-black"; // Rouge
        }
        if (value < 50) {
            return "bg-[#EEB360] text-black"; // Orange
        }
        return "bg-[#A0EE60] text-black"; // Vert
    };

    return (
        <section className="mt-4">
            {/* En-tête section + bouton nouveau livre */}
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                        Gestions des livres
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                        Consultation, ajout, modification et suppression des livres du
                        catalogue.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2
               rounded-full bg-[#AEEA7C]
               text-[#1A1A1A] text-xs font-medium
               px-3 py-1 h-7
               shadow-sm hover:shadow-md hover:bg-[#9BD65A]
               transition"
                >
                    <BookPlus size={14} strokeWidth={2} />
                    Nouveau livre
                </button>
            </div>

            {/* Barre de recherche */}
            <div className="mb-4">
                <div className="flex items-center gap-2 rounded-full bg-white/80 border border-slate-200 px-4 py-2 shadow-sm">
          <span className="text-slate-400 text-sm">
            <Search size={16} className="text-[#AEB4BC]" />
          </span>
                    <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Rechercher un livre..."
                        className="flex-1 bg-transparent border-none text-sm focus:outline-none"
                    />
                </div>
            </div>

            {/* États de chargement / erreur */}
            {loading && (
                <p className="text-sm text-slate-700">Chargement des livres...</p>
            )}

            {error && !loading && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-3">
                    {error}
                </p>
            )}

            {/* Liste responsive : mobile = cartes, desktop = tableau */}
            {!loading && !error && (
                <>
                    {/* MOBILE (cartes) */}
                    <div className="md:hidden space-y-3">
                        {filteredBooks.length === 0 && (
                            <div className="rounded-3xl bg-white/90 border border-slate-100 shadow-sm p-4 text-sm text-slate-500 text-center">
                                Aucun livre ne correspond à la recherche.
                            </div>
                        )}

                        {filteredBooks.map((book) => (
                            <article
                                key={book.id}
                                className="rounded-3xl bg-white/90 border border-slate-100 shadow-sm p-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-semibold text-slate-900 break-words">
                                            {book.title}
                                        </h3>
                                        <p className="mt-1 text-xs text-slate-600 break-words">
                                            {book.author}
                                        </p>

                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <span className="text-sm font-semibold text-slate-900">
                                                {formatPrice(book.price)}
                                            </span>

                                            <span
                                                className={[
                                                    "inline-flex items-center justify-center",
                                                    "min-w-6 h-6 px-2 rounded-full",
                                                    "text-xs text-black",
                                                    stockBadgeClasses(book.stockQuantity),
                                                ].join(" ")}
                                            >
                                                Stock: {book.stockQuantity ?? 0}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(book)}
                                            className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition"
                                            title="Modifier"
                                        >
                                            <SquarePen size={16} className="text-[#2ECC71]" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(book)}
                                            className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition"
                                            title="Supprimer"
                                        >
                                            <BookX size={16} className="text-[#F55E5E]" />
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* DESKTOP (tableau) */}
                    <div className="hidden md:block rounded-3xl bg-white/90 border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left px-6 py-3 font-semibold text-slate-700">
                                        Titre
                                    </th>
                                    <th className="text-left px-6 py-3 font-semibold text-slate-700">
                                        Auteur
                                    </th>
                                    <th className="text-left px-6 py-3 font-semibold text-slate-700">
                                        Prix
                                    </th>
                                    <th className="text-left px-6 py-3 font-semibold text-slate-700">
                                        Stock
                                    </th>
                                    <th className="text-right px-6 py-3 font-semibold text-slate-700">
                                        Actions
                                    </th>
                                </tr>
                                </thead>

                                <tbody>
                                {filteredBooks.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-4 text-sm text-slate-500 text-center"
                                        >
                                            Aucun livre ne correspond à la recherche.
                                        </td>
                                    </tr>
                                )}

                                {filteredBooks.map((book) => (
                                    <tr
                                        key={book.id}
                                        className="border-t border-slate-100 hover:bg-slate-50/80 transition"
                                    >
                                        <td className="px-6 py-3 text-slate-900">
                                            {book.title}
                                        </td>
                                        <td className="px-6 py-3 text-slate-700">
                                            {book.author}
                                        </td>
                                        <td className="px-6 py-3 text-slate-900">
                                            {formatPrice(book.price)}
                                        </td>
                                        <td className="px-6 py-3">
                                                <span
                                                    className={[
                                                        "inline-flex items-center justify-center",
                                                        "w-5 h-5 rounded-full",
                                                        "text-xs text-black",
                                                        stockBadgeClasses(book.stockQuantity),
                                                    ].join(" ")}
                                                >
                                                    {book.stockQuantity ?? 0}
                                                </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(book)}
                                                    className="inline-flex items-center justify-center px-3 py-1 transition-transform duration-150 hover:scale-110"
                                                    title="Modifier"
                                                >
                                                    <SquarePen size={16} className="text-[#2ECC71]" />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(book)}
                                                    className="inline-flex items-center justify-center px-3 py-1 transition-transform duration-150 hover:scale-110"
                                                    title="Supprimer"
                                                >
                                                    <BookX size={16} className="text-[#F55E5E]" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}


            {/* Modal création / édition */}
            {isModalOpen && editingBook && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-lg mx-4 rounded-3xl bg-white shadow-xl p-6 relative">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">
                            {editingBook.id ? "Modifier un livre" : "Nouveau livre"}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* ... tous les inputs comme dans ton fichier d’origine ... */}
                                {/* (je n'ai rien changé, juste déplacé dans ce composant) */}

                                {/* Titre */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Titre
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editingBook.title}
                                        onChange={(event) =>
                                            setEditingBook((prev) =>
                                                prev ? { ...prev, title: event.target.value } : prev
                                            )
                                        }
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A93AFF]"
                                    />
                                </div>

                                {/* Auteur */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Auteur
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editingBook.author}
                                        onChange={(event) =>
                                            setEditingBook((prev) =>
                                                prev ? { ...prev, author: event.target.value } : prev
                                            )
                                        }
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A93AFF]"
                                    />
                                </div>

                                {/* Prix */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Prix (€)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={editingBook.price ?? ""}
                                        onChange={(event) =>
                                            setEditingBook((prev) =>
                                                prev
                                                    ? {
                                                        ...prev,
                                                        price:
                                                            event.target.value === ""
                                                                ? undefined
                                                                : Number(event.target.value),
                                                    }
                                                    : prev
                                            )
                                        }
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A93AFF]"
                                    />
                                </div>

                                {/* Stock */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Stock
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editingBook.stockQuantity}
                                        onChange={(event) =>
                                            setEditingBook((prev) =>
                                                prev
                                                    ? {
                                                        ...prev,
                                                        stockQuantity: Number(event.target.value) || 0,
                                                    }
                                                    : prev
                                            )
                                        }
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A93AFF]"
                                    />
                                </div>

                                {/* Audience */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Audience
                                    </label>
                                    <select
                                        value={editingBook.audience}
                                        onChange={(event) =>
                                            setEditingBook((prev) =>
                                                prev ? { ...prev, audience: event.target.value } : prev
                                            )
                                        }
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#A93AFF]"
                                    >
                                        <option value="TODDLER">0–5 ans</option>
                                        <option value="CHILDREN">5–10 ans</option>
                                        <option value="TEEN">11–17 ans</option>
                                        <option value="GENERAL">Tout public</option>
                                    </select>
                                </div>

                                {/* Langue */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Langue
                                    </label>
                                    <select
                                        value={editingBook.writingLanguage}
                                        onChange={(event) =>
                                            setEditingBook((prev) =>
                                                prev
                                                    ? { ...prev, writingLanguage: event.target.value }
                                                    : prev
                                            )
                                        }
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#A93AFF]"
                                    >
                                        <option value="fr">Français</option>
                                        <option value="en">Anglais</option>
                                    </select>
                                </div>
                            </div>

                            {/* Résumé */}
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">
                                    Résumé
                                </label>
                                <textarea
                                    rows={3}
                                    value={editingBook.summary ?? ""}
                                    onChange={(event) =>
                                        setEditingBook((prev) =>
                                            prev ? { ...prev, summary: event.target.value } : prev
                                        )
                                    }
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A93AFF] resize-y"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="px-4 py-2 rounded-full border border-slate-300 text-sm text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 rounded-full bg-[#A93AFF] text-sm font-semibold text-white shadow hover:bg-[#8D31D6] disabled:opacity-50"
                                >
                                    {saving
                                        ? "Enregistrement..."
                                        : editingBook.id
                                            ? "Mettre à jour"
                                            : "Créer le livre"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AdminBooksSection;
