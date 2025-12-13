import React from "react";
import { useParams } from "react-router-dom";
import Header from "../components/layout/Header.tsx";

const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 container px-4 py-8">
        <h1 className="text-2xl font-bold mb-4 text-slate-800">
          Détail du livre {id}
        </h1>
        <p className="text-slate-600">
          Plus tard : titre, auteur, résumé, prix, bouton pour ajouter au
          panier, avis, etc.
        </p>
      </main>
    </div>
  );
};

export default BookDetails;
