// src/pages/AdminSpace.tsx

import React, { useMemo, useState } from "react";
import Header from "../components/layout/Header";
import { ChartColumn, Users, BookOpen, ChartColumnStacked } from "lucide-react";

import AdminBooksSection from "../features/admin/books/AdminBooksSection";
import AdminUsersSection from "../features/admin/users/AdminUsersSection";

type AdminTab = "dashboard" | "users" | "books" | "categories";

const AdminSpace: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>("books");

    const titleByTab = useMemo(() => {
        switch (activeTab) {
            case "users":
                return "Utilisateurs";
            case "books":
                return "Livres";
            case "categories":
                return "Catégories";
            case "dashboard":
            default:
                return "Tableau de bord";
        }
    }, [activeTab]);

    return (
        <div className="min-h-screen flex flex-col bg-[#E5E7E5]">
            <Header />

            <main className="flex-1 w-full">
                <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
                    <header className="mb-5 md:mb-6">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                            Espace Admin
                        </h1>
                        <p className="mt-1 text-sm text-slate-700">
                            Gestion complète de la plateforme LoopyBook.
                        </p>
                    </header>

                    {/* Onglets : scroll horizontal sur mobile */}
                    <nav className="mb-6">
                        <div className="rounded-2xl bg-white/80 shadow-sm px-2 py-2 border border-white/60">
                            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                <AdminTabButton
                                    label="Tableau de bord"
                                    icon={ChartColumn}
                                    isActive={activeTab === "dashboard"}
                                    onClick={() => setActiveTab("dashboard")}
                                />
                                <AdminTabButton
                                    label="Utilisateurs"
                                    icon={Users}
                                    isActive={activeTab === "users"}
                                    onClick={() => setActiveTab("users")}
                                />
                                <AdminTabButton
                                    label="Livres"
                                    icon={BookOpen}
                                    isActive={activeTab === "books"}
                                    onClick={() => setActiveTab("books")}
                                />
                                <AdminTabButton
                                    label="Catégories"
                                    icon={ChartColumnStacked}
                                    isActive={activeTab === "categories"}
                                    onClick={() => setActiveTab("categories")}
                                />
                            </div>
                        </div>

                        {/* Petit indicateur de contexte (utile sur mobile) */}
                        <p className="mt-3 text-sm font-semibold text-slate-900">
                            Gestion des {titleByTab.toLowerCase()}
                        </p>
                    </nav>

                    {/* Contenu */}
                    {activeTab === "books" && <AdminBooksSection />}
                    {activeTab === "users" && <AdminUsersSection />}
                    {activeTab === "categories" && (
                        <PlaceholderSection title="Gestion des catégories" />
                    )}
                    {activeTab === "dashboard" && (
                        <PlaceholderSection title="Tableau de bord admin" />
                    )}
                </div>
            </main>
        </div>
    );
};

type AdminTabButtonProps = {
    label: string;
    isActive: boolean;
    onClick: () => void;
    icon: React.ComponentType<{ size?: number; className?: string }>;
};

const AdminTabButton: React.FC<AdminTabButtonProps> = ({
                                                           label,
                                                           isActive,
                                                           onClick,
                                                           icon: Icon,
                                                       }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "inline-flex items-center gap-2",
                "flex-shrink-0",
                "px-4 md:px-6 py-2",
                "rounded-xl",
                "text-sm font-medium transition",
                "border",
                isActive
                    ? "bg-[#A93AFF] text-white shadow border-[#A93AFF]"
                    : "bg-white/40 text-slate-700 border-white/60 hover:bg-white/60",
            ].join(" ")}
        >
            <Icon size={16} className={isActive ? "text-white" : "text-slate-500"} />
            <span className="truncate">{label}</span>
        </button>
    );
};

type PlaceholderProps = {
    title: string;
};

const PlaceholderSection: React.FC<PlaceholderProps> = ({ title }) => (
    <section className="mt-4 rounded-3xl bg-white/80 border border-slate-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">{title}</h2>
        <p className="text-sm text-slate-600">
            Cette section sera implémentée après la gestion des livres.
        </p>
    </section>
);

export default AdminSpace;
