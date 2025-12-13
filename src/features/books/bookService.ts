// src/features/books/bookService.ts

export interface Book {
    id: number;
    title: string;
    author: string;
    publisher: string;
    price: number;
    coverUrlFront: string | null;
    coverUrlBack: string | null;
    summary: string | null;
    qualityScore: number | null;
    collectionName: string | null;
    pageCount: number | null;
    publicationDate: string | null;
    audience: string;
    ean: string | null;
    isbn: string | null;
    writingLanguage: string | null;
    averageRating: number | null;
}

const API_URL = "http://localhost:8081/api/books";

/**
 * Récupère la liste complète des livres.
 */
export async function getAllBooks(): Promise<Book[]> {
    const response = await fetch(API_URL, {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("Erreur lors du chargement des livres");
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data)) {
        throw new Error("Format de réponse inattendu (liste attendue)");
    }

    return data as Book[];
}

/**
 * Récupère les livres les mieux notés.
 *
 * NOTE :
 * Pour l’instant, le tri est fait côté front.
 * Une route backend dédiée pourra être ajoutée plus tard
 * (/api/books/top-rated?limit=3).
 */
export async function getTopRatedBooks(limit: number = 3): Promise<Book[]> {
    const books = await getAllBooks();

    return books
        .filter((book) => typeof book.averageRating === "number")
        .sort(
            (a, b) =>
                (b.averageRating ?? 0) - (a.averageRating ?? 0)
        )
        .slice(0, limit);
}
