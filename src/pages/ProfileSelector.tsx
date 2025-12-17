// src/pages/ProfileSelector.tsx
// Sélecteur de profil LoopyBook (LOOP-7 + LOOP-64)

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
import ParentPinGate from "../features/parent/ParentPinGate";

const ProfileSelector = () => {
    const { user } = useAuth();
    const { setActiveProfile } = useProfile();
    const navigate = useNavigate();

    const [children, setChildren] = useState<ChildProfile[]>([]);
    const [loadingChildren, setLoadingChildren] = useState(false);
    const [childrenError, setChildrenError] = useState<string | null>(null);

    // LOOP-64 : affichage de l'écran PIN
    const [showParentPinGate, setShowParentPinGate] = useState(false);

    const childAvatars = AVATARS_BY_PROFILE.child;

    const parentDisplayName =
        (user?.username && user.username.trim()) ||
        (user?.firstName && user.firstName.trim()) ||
        "Espace Adulte";

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

    useEffect(() => {
        if (!user) return;

        setLoadingChildren(true);
        setChildrenError(null);

        fetchChildrenByParent(user.id)
            .then(setChildren)
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

    const handleChildClick = (child: ChildProfile, index: number) => {
        const age = computeAge(child.birthDate);
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
     * LOOP-64 :
     * - si hasPin === true -> écran PIN
     * - sinon -> accès direct
     */
    const handleParentClick = () => {
        if (!user) {
            navigate("/auth");
            return;
        }

        if (user.hasPin) {
            setShowParentPinGate(true);
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

    const handleAddChildClick = () => {
        if (!user) {
            navigate("/auth");
            return;
        }
        navigate("/parent");
    };

    /**
     * Si le PIN est requis, on bloque ici et on affiche l'écran PIN
     */
    if (showParentPinGate) {
        return (
            <>
                <Header />
                <ParentPinGate />
            </>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#AEEA7C]/20 via-[#3DCCC7]/15 to-[#FFD67B]/20">
            <Header />

            <main className="flex-1 container px-4 py-10">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2 font-comic">
                        Qui lit aujourd&apos;hui ?
                    </h1>
                    <p className="text-sm text-slate-600">
                        Choisissez votre profil pour commencer l&apos;aventure
                    </p>
                </div>

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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
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
                            <div className="text-xs text-slate-500">
                                Gestion &amp; Achats
                            </div>
                        </div>
                    </button>
                </div>
            </main>
        </div>
    );
};

export default ProfileSelector;
