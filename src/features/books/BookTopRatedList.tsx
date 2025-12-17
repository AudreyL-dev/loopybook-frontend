import { useEffect, useState } from "react";
import { type Book, getTopRatedBooks } from "./bookService.ts";

export default function BookTopRatedList() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await getTopRatedBooks(3);
                setBooks(data);
            } catch (err) {
                console.error("Erreur meilleurs livres :", err);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    if (loading) {
        return <p className="text-center mt-4">Chargement...</p>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6">
            {books.map((book) => {
                const coverSrc = book.coverUrlFront ?? undefined;

                return (
                    <div
                        key={book.id}
                        className="bg-white shadow-md rounded-xl p-4 text-center hover:scale-105 transition"
                    >
                        {coverSrc ? (
                            <img
                                src={coverSrc}
                                alt={book.title}
                                className="w-32 h-48 object-cover mx-auto rounded mb-3"
                            />
                        ) : (
                            <div className="w-32 h-48 mx-auto mb-3 rounded bg-slate-100 flex items-center justify-center text-xs text-slate-500 text-center px-2">
                                Couverture indisponible
                            </div>
                        )}

                        <h2 className="font-semibold">{book.title}</h2>
                        <p className="text-gray-600">{book.author}</p>

                        <p className="font-bold mt-2">
                            {book.averageRating} ★
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
