// src/pages/RegisterPage.tsx
// Page d’inscription LoopyBook (création de l’espace famille)

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import logoLoopy from "../assets/logo/logo-loopybook.svg";
import { registerParent } from "../features/auth/authService";
import { Eye, EyeClosed } from "lucide-react";
import AvatarPicker from "../components/ui/AvatarPicker";
import {
    AVATARS_BY_PROFILE,
    type AvatarOption,
} from "../config/avatarOptions";
import { useAuth } from "../contexts/AuthContext";
const RegisterPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();
    // Récupération de l’email passé dans l’URL : /register?email=...
    const searchParams = new URLSearchParams(location.search);
    const initialEmail = searchParams.get("email") ?? "";

    // Avatars disponibles pour un parent (avec typage explicite)
    const parentAvatars: AvatarOption[] = AVATARS_BY_PROFILE.parent;
    const defaultAvatar: AvatarOption | null = parentAvatars[0] ?? null;

    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthDate, setBirthDate] = useState(""); // yyyy-MM-dd
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Avatar : id choisi + couleur de fond + URL + état de la modale
    const [selectedAvatarId, setSelectedAvatarId] = useState<string | undefined>(
        defaultAvatar?.id
    );
    const [selectedAvatarColor, setSelectedAvatarColor] =
        useState<string>("#E5E7EB"); // gris par défaut
    const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<
        string | undefined
    >(defaultAvatar?.src);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

    // Avatar actuellement sélectionné (ou le premier par défaut pour l’aperçu)
    const currentAvatar: AvatarOption | null =
        parentAvatars.find((a) => a.id === selectedAvatarId) ?? defaultAvatar;

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        if (!initialEmail) {
            setError("Email manquant. Veuillez revenir depuis la page de connexion.");
            return;
        }

        if (
            !username ||
            !firstName ||
            !lastName ||
            !birthDate ||
            !password ||
            !passwordConfirm
        ) {
            setError("Tous les champs sont obligatoires.");
            return;
        }

        if (password !== passwordConfirm) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        if (password.length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères.");
            return;
        }

        // Couleur et URL finales de l’avatar
        const finalAvatarColor = selectedAvatarColor;
        const finalAvatarUrl = selectedAvatarUrl ?? currentAvatar?.src ?? "";

        if (!finalAvatarUrl) {
            setError("Veuillez choisir un avatar.");
            return;
        }

        setLoading(true);
        try {
            await registerParent({
                email: initialEmail,
                username,
                firstName,
                lastName,
                birthDate,
                password,
                confirmPassword: passwordConfirm,
                avatarColor: finalAvatarColor,
                avatarUrl: finalAvatarUrl,
            });
            const loggedIn = await login(initialEmail, password);
            if (!loggedIn) {
                // Si jamais le login échoue, on renvoie vers la page de connexion
                setSuccess("Compte créé, mais la connexion automatique a échoué. Veuillez vous connecter.");
                navigate("/auth");
                return;
            }
            setSuccess("Compte créé avec succès. Vous allez maintenant choisir votre profil.");
            navigate("/profiles");
        } catch (err) {
            console.error(err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Erreur lors de l’inscription. Réessayez plus tard."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#3DCCC7]/10 to-[#AEEA7C]/10">
            <Header />

            <main className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 border border-slate-200">
                    {/* Logo */}
                    <div className="flex justify-center mb-4">
                        <img
                            src={logoLoopy}
                            alt="LoopyBook"
                            className="max-h-16 object-contain"
                        />
                    </div>

                    <h1 className="text-2xl font-bold mb-1 text-slate-800 text-center">
                        Inscription
                    </h1>
                    <p className="text-sm text-slate-600 mb-2 text-center">
                        Créez votre espace famille
                    </p>

                    {/* Email affiché en texte simple */}
                    <p className="text-xs text-slate-500 mb-6 text-center break-all">
                        {initialEmail || "votre@email.com"}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Avatar + pseudo */}
                        <div>
                            {/* Sélection d'avatar (aperçu + bouton) */}
                            <div className="flex flex-col items-center mb-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAvatarModalOpen(true)}
                                    className="focus:outline-none"
                                >
                                    <div
                                        className="w-20 h-20 rounded-full flex items-center justify-center border border-slate-300 bg-slate-100"
                                        style={{ backgroundColor: selectedAvatarColor }}
                                    >
                                        {currentAvatar ? (
                                            <img
                                                src={currentAvatar.src}
                                                alt={currentAvatar.label}
                                                className="w-20 h-20 object-contain"
                                            />
                                        ) : (
                                            <span className="text-xs text-slate-400">Avatar</span>
                                        )}
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsAvatarModalOpen(true)}
                                    className="mt-2 text-xs text-slate-600 underline"
                                >
                                    Choisir un avatar
                                </button>
                            </div>

                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-slate-700 mb-1"
                            >
                                Pseudo
                            </label>
                            <input
                                id="username"
                                type="text"
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3DCCC7]"
                                placeholder="Votre pseudo"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                            />
                        </div>

                        {/* Prénom */}
                        <div>
                            <label
                                htmlFor="firstName"
                                className="block text-sm font-medium text-slate-700 mb-1"
                            >
                                Prénom
                            </label>
                            <input
                                id="firstName"
                                type="text"
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3DCCC7]"
                                placeholder="Votre prénom"
                                value={firstName}
                                onChange={(event) => setFirstName(event.target.value)}
                            />
                        </div>

                        {/* Nom */}
                        <div>
                            <label
                                htmlFor="lastName"
                                className="block text-sm font-medium text-slate-700 mb-1"
                            >
                                Nom
                            </label>
                            <input
                                id="lastName"
                                type="text"
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3DCCC7]"
                                placeholder="Votre nom"
                                value={lastName}
                                onChange={(event) => setLastName(event.target.value)}
                            />
                        </div>

                        {/* Date de naissance */}
                        <div>
                            <label
                                htmlFor="birthDate"
                                className="block text-sm font-medium text-slate-700 mb-1"
                            >
                                Date de naissance
                            </label>
                            <input
                                id="birthDate"
                                type="date"
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3DCCC7]"
                                value={birthDate}
                                onChange={(event) => setBirthDate(event.target.value)}
                            />
                        </div>

                        {/* Mot de passe */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-slate-700 mb-1"
                            >
                                Mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className="w-full border rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#3DCCC7]"
                                    placeholder="Votre mot de passe"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute inset-y-0 right-2 px-2 text-slate-600"
                                >
                                    {showPassword ? <EyeClosed size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirmation */}
                        <div>
                            <label
                                htmlFor="passwordConfirm"
                                className="block text-sm font-medium text-slate-700 mb-1"
                            >
                                Confirmer votre mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    id="passwordConfirm"
                                    type={showPasswordConfirm ? "text" : "password"}
                                    className="w-full border rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#3DCCC7]"
                                    placeholder="Confirmer votre mot de passe"
                                    value={passwordConfirm}
                                    onChange={(event) =>
                                        setPasswordConfirm(event.target.value)
                                    }
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPasswordConfirm((prev) => !prev)
                                    }
                                    className="absolute inset-y-0 right-2 px-2 text-slate-600"
                                >
                                    {showPasswordConfirm ? (
                                        <EyeClosed size={16} />
                                    ) : (
                                        <Eye size={16} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Messages d’erreur / succès */}
                        {error && (
                            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                {error}
                            </p>
                        )}

                        {success && (
                            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                {success}
                            </p>
                        )}

                        {/* Bouton */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#AEEA7C] text-slate-800 font-semibold rounded-full py-2 hover:bg-[#9BD65A] disabled:opacity-60"
                        >
                            {loading ? "Inscription..." : "S’inscrire"}
                        </button>
                    </form>

                    {/* Modale de sélection d'avatar */}
                    {isAvatarModalOpen && (
                        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
                            <div className="w-full max-w-lg mx-4 rounded-3xl bg-white shadow-xl p-6 relative">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                    Choisissez votre avatar
                                </h3>

                                <AvatarPicker
                                    profileType="parent"
                                    selectedAvatarId={selectedAvatarId}
                                    selectedColor={selectedAvatarColor}
                                    onAvatarChange={(avatar) => {
                                        setSelectedAvatarId(avatar.id);
                                        setSelectedAvatarUrl(avatar.src);
                                    }}
                                    onColorChange={(color) => setSelectedAvatarColor(color)}
                                />

                                <div className="flex items-center justify-end gap-2 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsAvatarModalOpen(false)}
                                        className="px-4 py-2 rounded-full border border-slate-300 text-sm text-slate-700 bg-white hover:bg-slate-50"
                                    >
                                        Annuler
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setIsAvatarModalOpen(false)}
                                        className="px-5 py-2 rounded-full bg-[#A93AFF] text-sm font-semibold text-white shadow hover:bg-[#8D31D6]"
                                    >
                                        Valider cet avatar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default RegisterPage;
