// src/pages/ProfileSelector.tsx
// Sélecteur de profil LoopyBook (LOOP-7)
// - Charge les enfants du parent connecté depuis le backend
// - Affiche chaque enfant dans une carte comme "Ajouter un enfant" / "Espace Adulte"
// - Met à jour le ProfileContext pour que le Header affiche l’avatar du profil actif

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/layout/Header";
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../contexts/ProfileContext";
import {
    fetchChildrenByParent,
    type ChildProfile,
} from "../features/child/childService";
import { AVATARS_BY_PROFILE } from "../config/avatarOptions";

const ProfileSelector = () => {
    const { user } = useAuth();
    const { setActiveProfile } = useProfile();
    const navigate = useNavigate();

    const [children, setChildren] = useState<ChildProfile[]>([]);
    const [loadingChildren, setLoadingChildren] = useState(false);
    const [childrenError, setChildrenError] = useState<string | null>(null);

    // Avatars enfants disponibles (fallback si avatarUrl n'est pas exploitable)
    const childAvatars = AVATARS_BY_PROFILE.child;

    // Nom affiché sur la carte adulte : pseudo > prénom > libellé par défaut
    const parentDisplayName =
        (user?.username && user.username.trim()) ||
        (user?.firstName && user.firstName.trim()) ||
        "Espace Adulte";

    // Fonction utilitaire pour calculer l'âge à partir de la date de naissance
    const computeAge = (birthDate: string | null | undefined): number | null => {
        if (!birthDate) return null;
        const date = new Date(birthDate);
        if (Number.isNaN(date.getTime())) return null;

        const now = new Date();
        let age = now.getFullYear() - date.getFullYear();
        const m = now.getMonth() - date.getMonth();

        if (m < 0 || (m === 0 && now.getDate() < date.getDate())) {
            age--;
        }
        return age;
    };

    // Chargement des enfants du parent connecté
    useEffect(() => {
        if (!user) return;

        setLoadingChildren(true);
        setChildrenError(null);

        fetchChildrenByParent(user.id)
            .then((data) => {
                setChildren(data);
            })
            .catch((error) => {
                console.error("Erreur chargement enfants :", error);
                setChildrenError(
                    "Impossible de charger les profils enfants pour le moment."
                );
            })
            .finally(() => {
                setLoadingChildren(false);
            });
    }, [user]);

    /**
     * Clic sur une carte enfant
     * - met à jour le profil actif (ProfileContext)
     * - redirige vers /child/:profileId
     */
    const handleChildClick = (child: ChildProfile, index: number) => {
        const age = computeAge(child.birthDate);

        // Fallback avatar (si URL de la BDD inutilisable côté front)
        const fallbackAvatar = childAvatars[index % childAvatars.length];
        const avatarSrc = child.avatarUrl || fallbackAvatar.src;
        const avatarBg = child.avatarColor || "#AEEA7C";

        setActiveProfile({
            type: "CHILD",
            id: child.id,
            displayName: child.username,
            avatarColor: avatarBg,
            avatarUrl: avatarSrc,
            age: age ?? undefined,
        });

        navigate(`/child/${child.id}`);
    };

    /**
     * Clic sur la carte "Espace Adulte"
     */
    const handleParentClick = () => {
        if (!user) {
            navigate("/auth");
            return;
        }

        setActiveProfile({
            type: "PARENT",
            id: Number(user.id),
            displayName: parentDisplayName,
            avatarColor: user.avatarColor ?? "#FFD67B",
            avatarUrl: user.avatarUrl ?? undefined,
        });

        navigate("/parent");
    };

    /**
     * Clic sur "Ajouter un enfant"
     */
    const handleAddChildClick = () => {
        if (!user) {
            navigate("/auth");
            return;
        }

        navigate("/parent");
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#AEEA7C]/20 via-[#3DCCC7]/15 to-[#FFD67B]/20">
            <Header />

            <main className="flex-1 container px-4 py-10">
                {/* Titre + sous-titre */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2 font-comic">
                        Qui lit aujourd&apos;hui ?
                    </h1>
                    <p className="text-sm text-slate-600">
                        Choisissez votre profil pour commencer l&apos;aventure
                    </p>
                </div>

                {/* Messages globaux si besoin */}
                {loadingChildren && (
                    <p className="text-sm text-slate-500 text-center mb-4">
                        Chargement des profils enfants...
                    </p>
                )}

                {childrenError && (
                    <p className="text-sm text-red-600 text-center mb-4">
                        {childrenError}
                    </p>
                )}

                {/* Grille de cartes exactement comme la maquette */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                    {/* Cartes enfants (une carte par enfant, même design que les autres) */}
                    {children.map((child, index) => {
                        const age = computeAge(child.birthDate);
                        const fallbackAvatar = childAvatars[index % childAvatars.length];
                        const avatarSrc = child.avatarUrl || fallbackAvatar.src;
                        const avatarBg = child.avatarColor || "#AEEA7C";

                        return (
                            <button
                                key={child.id}
                                type="button"
                                onClick={() => handleChildClick(child, index)}
                                className="group rounded-3xl bg-white/80 border border-white/60 shadow-sm px-6 py-6 flex flex-col items-center justify-center hover:-translate-y-1 hover:shadow-md transition-all"
                            >
                                <div
                                    className="w-20 h-20 rounded-full flex items-center justify-center mb-4 border border-slate-100 overflow-hidden"
                                    style={{ backgroundColor: avatarBg }}
                                >
                                    <img
                                        src={avatarSrc}
                                        alt={child.username}
                                        className="w-16 h-16 object-contain"
                                    />
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold text-slate-800 mb-1">
                                        {child.username}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {age !== null ? `${age} ans` : "Âge non renseigné"}
                                    </div>
                                </div>
                            </button>
                        );
                    })}

                    {/* Carte "Ajouter un enfant" */}
                    <button
                        type="button"
                        onClick={handleAddChildClick}
                        className="rounded-3xl bg-white/80 border border-dashed border-[#A93AFF]/40 px-6 py-6 flex flex-col items-center justify-center hover:bg-[#F5E9FF] hover:-translate-y-1 hover:shadow-md transition-all"
                    >
                        <div className="w-16 h-16 rounded-full bg-[#A93AFF] flex items-center justify-center mb-3 text-white text-3xl leading-none">
                            +
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-slate-800 mb-1">
                                Ajouter un enfant
                            </div>
                            <div className="text-xs text-slate-500">
                                Créer un nouveau profil de lecture
                            </div>
                        </div>
                    </button>

                    {/* Carte "Espace Adulte" */}
                    <button
                        type="button"
                        onClick={handleParentClick}
                        className="rounded-3xl bg-white/80 border border-white/60 shadow-sm px-6 py-6 flex flex-col items-center justify-center hover:-translate-y-1 hover:shadow-md transition-all"
                    >
                        <div
                            className="w-20 h-20 rounded-full flex items-center justify-center mb-4 border border-slate-100 overflow-hidden"
                            style={{ backgroundColor: user?.avatarColor ?? "#FFD67B" }}
                        >
                            {user?.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={parentDisplayName}
                                    className="w-16 h-16 object-contain"
                                />
                            ) : (
                                <span className="text-sm text-slate-600">Adulte</span>
                            )}
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-slate-800 mb-1">
                                {parentDisplayName}
                            </div>
                            <div className="text-xs text-slate-500">Gestion &amp; Achats</div>
                        </div>
                    </button>
                </div>

                {/* Si aucun enfant, on laisse quand même les cartes "Ajouter" + "Adulte" dans la grille */}
                {!loadingChildren && !childrenError && children.length === 0 && (
                    <p className="text-sm text-slate-500 text-center mt-4">
                        Aucun profil enfant pour le moment. Vous pouvez en créer un via
                        &quot;Ajouter un enfant&quot;.
                    </p>
                )}
            </main>
        </div>
    );
};

export default ProfileSelector;
