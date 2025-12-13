import { useEffect, useState } from "react";
import { getAllBooks, type Book } from "./bookService.ts";

export default function BookList() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadBooks() {
            try {
                const data = await getAllBooks();
                setBooks(data);
            } catch (error) {
                console.error("Erreur chargement livres :", error);
            } finally {
                setLoading(false);
            }
        }

        loadBooks();
    }, []);

    if (loading) {
        return <p className="text-center mt-4">Chargement des livres...</p>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {books.map((book) => (
                <div
                    key={book.id}
                    className="bg-white shadow-md rounded-xl p-4 flex flex-col items-center hover:scale-105 transition"
                >
                    <img
                        src={book.coverUrlFront}
                        alt={book.title}
                        className="w-32 h-48 object-cover mb-3 rounded"
                    />
                    <h2 className="font-semibold text-lg">{book.title}</h2>
                    <p className="text-gray-600">{book.author}</p>
                    <p className="font-bold mt-2">{book.price.toFixed(2)} €</p>
                </div>
            ))}
        </div>
    );
}
