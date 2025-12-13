import React from "react";
import Header from "../components/layout/Header.tsx";

const EmployeeSpace: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 container px-4 py-8">
        <h1 className="text-2xl font-bold mb-4 text-slate-800">
          Espace employé
        </h1>
        <p className="text-slate-600">
          Plus tard : préparation des commandes, suivi des clients, gestion du stock.
        </p>
      </main>
    </div>
  );
};

export default EmployeeSpace;
