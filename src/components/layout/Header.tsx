// src/components/layout/Header.tsx

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.tsx";
import { useProfile } from "../../contexts/ProfileContext"; // ← AJOUT
import logo from "../../assets/logo/logo-loopybook-animate.gif";

const Header: React.FC = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const { activeProfile } = useProfile(); // ← profil actif (parent / enfant / employé / admin)
    const location = useLocation();

    // Détecter l'espace selon l'URL
    const path = location.pathname;

    let headerBg = "bg-linear-to-r from-mint to-kiwi"; // défaut : espace parent

    if (path.startsWith("/admin")) {
        headerBg = "bg-[linear-gradient(90deg,#9134EA,#2663EB)]";
    } else if (path.startsWith("/employee")) {
        headerBg = "bg-[linear-gradient(90deg,#4B5563,#202A38)]";
    } else if (path.startsWith("/child") || path.startsWith("/kids")) {
        headerBg = "bg-[linear-gradient(90deg,#FFD67B,#AEEA7C)]"; // apricot → kiwi
    }

    // Détermination de la couleur et de l'URL d'avatar :
    // 1) profil actif en priorité
    // 2) sinon user connecté
    // 3) sinon couleur neutre
    const avatarColor =
        activeProfile?.avatarColor ??
        user?.avatarColor ??
        "#E5E7EB";

    const avatarUrl =
        activeProfile?.avatarUrl ??
        user?.avatarUrl ??
        undefined;

    return (
        <header className={`${headerBg} shadow-md`}>
            <div className="container px-4 h-full flex justify-between items-center">

                {/* LOGO */}
                <Link to="/" className="flex items-center">
                    <img
                        src={logo}
                        alt="LoopyBook logo"
                        className="h-full max-h-14 object-contain"
                    />
                </Link>

                {/* NAVIGATION */}
                <nav className="flex items-center gap-4 text-sm text-white">
                    <Link to="/search" className="hover:underline">
                        Rechercher
                    </Link>

                    {/* Avatar cliquable vers /profiles (remplace le texte "Profils") */}
                    {isAuthenticated && (
                        <Link
                            to="/profiles"
                            className="flex items-center"
                            aria-label="Gérer les profils"
                        >
                            <div
                                className="w-9 h-9 rounded-full flex items-center justify-center border border-white/60 bg-white/10 overflow-hidden"
                                style={{ backgroundColor: avatarColor }}
                            >
                                {avatarUrl && (
                                    <img
                                        src={avatarUrl}
                                        alt="Profil actif"
                                        className="w-8 h-8 object-contain"
                                    />
                                )}
                            </div>
                        </Link>
                    )}

                    {!isAuthenticated && (
                        <Link
                            to="/auth"
                            className="bg-white/20 rounded-full px-3 py-1 font-medium"
                        >
                            Connexion
                        </Link>
                    )}

                    {isAuthenticated && (
                        <button
                            onClick={logout}
                            className="bg-white text-mint px-3 py-1 rounded-full font-medium"
                        >
                            Déconnexion
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
