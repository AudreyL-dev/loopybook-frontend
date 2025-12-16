// src/pages/AuthPage.tsx
// Page d'authentification LoopyBook
// Étape 1 : vérifier l'email ou l'identifiant via l'API
// Étape 2 : demander le mot de passe adapté (parent / employé / admin)

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import { useAuth } from "../contexts/AuthContext";
import { checkIdentifier } from "../features/auth/authService";
import type { IdentifierCheckResponse } from "../features/auth/authService";
import logoLoopy from "../assets/logo/logo-loopybook.svg";
import { Eye, EyeClosed } from "lucide-react";

type Step = "IDENTIFIER" | "PASSWORD";

const AuthPage: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState<Step>("IDENTIFIER");
    const [identifier, setIdentifier] = useState("");
    const [identifierInfo, setIdentifierInfo] =
        useState<IdentifierCheckResponse | null>(null);

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Étape 1 : envoi de l’email ou de l’identifiant EMP/ADM
    const handleIdentifierSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        const trimmed = identifier.trim();
        if (!trimmed) {
            setError("Champ obligatoire.");
            return;
        }

        setLoading(true);
        try {
            const result = await checkIdentifier(trimmed);

            switch (result.status) {
                case "EMAIL_FOUND":
                case "EMPLOYEE_FOUND":
                    setIdentifierInfo(result);
                    setStep("PASSWORD");
                    break;

                case "EMAIL_NOT_FOUND":
                    // Redirection vers l’inscription parent avec l’email pré-rempli
                    navigate(`/register?email=${encodeURIComponent(trimmed)}`);
                    break;

                case "EMPLOYEE_NOT_FOUND":
                    setError("Identifiant employé ou administrateur inconnu.");
                    break;

                case "INVALID_FORMAT":
                default:
                    setError(
                        "L’email saisi ne correspond pas à un format valide ou l’identifiant est inconnu."
                    );
                    break;
            }
        } catch (err) {
            console.error(err);
            setError(
                "Erreur lors de la vérification de l’identifiant. Réessayer plus tard."
            );
        } finally {
            setLoading(false);
        }
    };

    // Étape 2 : envoi du mot de passe (parent ou employé/admin)
    const handlePasswordSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        if (!identifierInfo) {
            setError("Une erreur interne est survenue. Revenir à l’étape précédente.");
            setStep("IDENTIFIER");
            return;
        }

        const trimmedIdentifier = identifier.trim();

        if (!trimmedIdentifier) {
            setError("Champ obligatoire.");
            setStep("IDENTIFIER");
            return;
        }

        if (!password) {
            setError("Mot de passe obligatoire.");
            return;
        }

        setLoading(true);
        try {
            const success = await login(trimmedIdentifier, password);

            if (!success) {
                setError("Identifiants invalides.");
                return;
            }

            // Détermination de la route cible
            let targetPath = "/profiles"; // parent par défaut

            if (identifierInfo.identifierType === "EMPLOYEE") {
                const roles = identifierInfo.roles ?? [];

                if (roles.includes("ROLE_LOOPADMIN")) {
                    targetPath = "/admin";
                } else if (roles.includes("ROLE_EMPLOYEE")) {
                    targetPath = "/employee";
                } else {
                    // Sécurité : si jamais roles est vide/inattendu
                    targetPath = "/employee";
                }
            }

            navigate(targetPath, { replace: true });
        } catch (err) {
            console.error(err);
            setError("Erreur lors de la connexion. Réessayer plus tard.");
        } finally {
            setLoading(false);
        }
    };

    const isEmail =
        identifierInfo?.identifierType === "EMAIL" ||
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#3DCCC7]/10 to-[#AEEA7C]/10">
            <Header />

            <main className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 border border-slate-200">
                    {/* LOGO */}
                    <div className="flex justify-center mb-4">
                        <img
                            src={logoLoopy}
                            alt="LoopyBook"
                            className="max-h-24 object-contain mx-auto mb-4"
                        />
                    </div>

                    <h1 className="text-2xl font-bold mb-4 text-slate-800 text-center">
                        Connexion
                    </h1>
                    <p className="text-sm text-slate-600 mb-6 text-center">
                        Retrouvez vos livres préférés
                    </p>

                    {step === "IDENTIFIER" && (
                        <form onSubmit={handleIdentifierSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="identifier"
                                    className="block text-sm font-medium text-slate-700 mb-1"
                                >
                                    Email ou identifiant
                                </label>
                                <input
                                    id="identifier"
                                    type="text"
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3DCCC7]"
                                    value={identifier}
                                    onChange={(event) => setIdentifier(event.target.value)}
                                    autoComplete="username"
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#3DCCC7] text-white rounded-lg py-2 font-semibold hover:bg-[#35b4b1] disabled:opacity-60"
                            >
                                {loading ? "Vérification..." : "Continuer"}
                            </button>
                        </form>
                    )}

                    {step === "PASSWORD" && (
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div className="mb-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm">
                                <p className="font-medium text-slate-700">
                                    Connexion pour{" "}
                                    <span className="font-semibold break-all">{identifier}</span>
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Type de compte :{" "}
                                    {isEmail
                                        ? "parent / utilisateur"
                                        : "employé ou administrateur"}
                                </p>
                            </div>

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
                                        className="w-full border rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[#3DCCC7]"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        autoComplete="current-password"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                                    >
                                        {showPassword ? <EyeClosed size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#3DCCC7] text-white rounded-lg py-2 font-semibold hover:bg-[#35b4b1] disabled:opacity-60"
                            >
                                {loading ? "Connexion..." : "Se connecter"}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setStep("IDENTIFIER");
                                    setPassword("");
                                    setIdentifierInfo(null);
                                    setError(null);
                                }}
                                className="w-full text-xs text-slate-500 underline mt-2"
                            >
                                Changer d’email ou d’identifiant
                            </button>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AuthPage;
