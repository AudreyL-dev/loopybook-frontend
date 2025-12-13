import React from "react";
import { useParams } from "react-router-dom";
import Header from "../components/layout/Header.tsx";

const Library: React.FC = () => {
  const { profileId } = useParams<{ profileId: string }>();

  return (
    <div className="min-h-screen flex flex-col bg-[#AEEA7C]/5">
      <Header />
      <main className="flex-1 container px-4 py-8">
        <h1 className="text-2xl font-bold mb-4 text-slate-800">
          Bibliothèque de l&apos;enfant {profileId}
        </h1>
        <p className="text-slate-600">
          Plus tard : liste des livres reçus, avis, etc.
        </p>
      </main>
    </div>
  );
};

export default Library;

