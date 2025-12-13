import React from "react";
import Header from "../components/layout/Header.tsx";

const SearchPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 container px-4 py-8">
        <h1 className="text-2xl font-bold mb-4 text-slate-800">
          Recherche de livres
        </h1>
        <p className="text-slate-600 mb-4">
          Plus tard : champ de recherche, filtres par âge, catégories, etc.
        </p>
      </main>
    </div>
  );
};

export default SearchPage;
