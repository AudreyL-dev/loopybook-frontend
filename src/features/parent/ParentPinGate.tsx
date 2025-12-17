// loopybook-frontend/src/features/parent/ParentPinGate.tsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Lock, Eye, EyeOff } from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import { useProfile } from "../../contexts/ProfileContext";

type ParentPinVerifyResponse = {
    ok: boolean;
    lockedUntil: string | null;
    message: string | null;
};

const API_BASE_URL = "http://localhost:8081";

/**
 * Écran modal de saisie du code PIN pour l'accès à l'espace parent (LOOP-64).
 *
 * - 4 cases visuelles
 * - saisie possible au clavier (input invisible mais focusable)
 * - clavier numérique natif sur mobile via inputMode="numeric"
 * - keypad custom uniquement si dispositif tactile
 */
const ParentPinGate: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { setActiveProfile } = useProfile();

    const [pin, setPin] = useState("");
    const [showPin, setShowPin] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement | null>(null);

    const parentDisplayName = useMemo(() => {
        if (!user) return "Espace Adulte";
        return (
            (user.username && user.username.trim()) ||
            (user.firstName && user.firstName.trim()) ||
            "Espace Adulte"
        );
    }, [user]);

    useEffect(() => {
        const hasTouch =
            navigator.maxTouchPoints > 0 ||
            window.matchMedia("(pointer: coarse)").matches ||
            window.matchMedia("(hover: none)").matches;

        setIsTouchDevice(hasTouch);
    }, []);

    useEffect(() => {
        setError(null);
    }, [pin]);

    useEffect(() => {
        // Focus automatique à l'ouverture pour pouvoir taper tout de suite
        inputRef.current?.focus();
    }, []);

    const closeGate = () => {
        navigate(-1);
    };

    const focusPinInput = () => {
        inputRef.current?.focus();
    };

    const onPinChange = (value: string) => {
        const cleaned = value.replace(/[^0-9]/g, "").slice(0, 4);
        setPin(cleaned);
    };

    const handleDigit = (digit: string) => {
        if (submitting) return;
        if (pin.length >= 4) return;
        setPin((prev) => (prev + digit).slice(0, 4));
        focusPinInput();
    };

    const handleDelete = () => {
        if (submitting) return;
        setPin((prev) => prev.slice(0, -1));
        focusPinInput();
    };

    const handleSubmit = async () => {
        if (!user) {
            navigate("/auth");
            return;
        }

        if (pin.length !== 4) {
            setError("Veuillez saisir un code PIN à 4 chiffres.");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE_URL}/api/parent/pin/verify`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({ pinCode: pin }),
            });

            if (!res.ok) {
                setError("Impossible de vérifier le code PIN pour le moment.");
                return;
            }

            const data = (await res.json()) as ParentPinVerifyResponse;

            if (!data.ok) {
                setError(data.message || "Code PIN incorrect.");
                setPin("");
                focusPinInput();
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
        } catch (e) {
            console.error(e);
            setError("Erreur réseau lors de la vérification du code PIN.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" onClick={closeGate} />

            {/* Modal */}
            <div className="absolute inset-0 flex items-center justify-center px-4">
                <div className="w-full max-w-sm rounded-3xl bg-white shadow-xl border border-slate-100 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-start justify-between px-6 pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-mint/15 flex items-center justify-center">
                                <Lock className="w-5 h-5 text-mint-dark" />
                            </div>
                            <div>
                                <div className="font-semibold text-slate-800">
                                    Espace Parent Protégé
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                    Entrez votre code PIN pour accéder à l&apos;espace parent
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={closeGate}
                            className="rounded-full p-2 hover:bg-slate-100 transition"
                            aria-label="Fermer"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {/* PIN boxes + input invisible focusable */}
                    <div className="px-6 pt-6">
                        <div
                            className="relative flex items-center justify-center gap-3"
                            onClick={focusPinInput}
                            role="button"
                            tabIndex={-1}
                        >
                            {/* Input invisible mais focusable : permet de taper au clavier */}
                            <input
                                ref={inputRef}
                                value={pin}
                                onChange={(e) => onPinChange(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        void handleSubmit();
                                    }
                                }}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                autoComplete="one-time-code"
                                // invisible mais présent : capte la saisie
                                className="absolute inset-0 w-full h-full opacity-0"
                                aria-label="Code PIN"
                            />

                            {[0, 1, 2, 3].map((i) => {
                                const digit = pin[i] ?? "";
                                const visible = showPin ? digit : digit ? "•" : "";
                                return (
                                    <div
                                        key={i}
                                        className="w-12 h-12 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-xl font-semibold text-slate-800"
                                    >
                                        {visible}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Toggle show PIN */}
                        <button
                            type="button"
                            onClick={() => setShowPin((v) => !v)}
                            className="mt-4 w-full flex items-center justify-center gap-2 text-xs text-slate-600 hover:text-slate-800"
                        >
                            {showPin ? (
                                <>
                                    <EyeOff className="w-4 h-4" />
                                    Masquer le PIN
                                </>
                            ) : (
                                <>
                                    <Eye className="w-4 h-4" />
                                    Afficher le PIN
                                </>
                            )}
                        </button>

                        {/* Error */}
                        {error && (
                            <div className="mt-4 text-sm text-red-600 text-center">
                                {error}
                            </div>
                        )}

                        {/* Forgot link */}
                        <button
                            type="button"
                            onClick={() =>
                                setError("Fonctionnalité à venir : réinitialisation du PIN.")
                            }
                            className="mt-5 w-full text-xs text-mint-dark hover:underline"
                        >
                            Vous avez oublié votre code PIN ?
                        </button>

                        {/* Actions */}
                        <div className="mt-6 pb-6 flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={pin.length !== 4 || submitting}
                                className="w-full rounded-2xl bg-apricot px-4 py-3 font-semibold text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? "Vérification..." : "Valider"}
                            </button>

                            <button
                                type="button"
                                onClick={closeGate}
                                className="w-full rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-200"
                            >
                                Annuler
                            </button>
                        </div>

                        {/* Keypad tactile uniquement */}
                        {isTouchDevice && (
                            <div className="pb-6">
                                <div className="grid grid-cols-3 gap-3 px-6">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                                        <button
                                            key={n}
                                            type="button"
                                            onClick={() => handleDigit(String(n))}
                                            disabled={submitting}
                                            className="h-12 rounded-2xl bg-slate-100 text-slate-800 font-semibold hover:bg-slate-200 disabled:opacity-50"
                                        >
                                            {n}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={submitting}
                                        className="h-12 rounded-2xl bg-slate-100 text-slate-800 font-semibold hover:bg-slate-200 disabled:opacity-50"
                                    >
                                        ⌫
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDigit("0")}
                                        disabled={submitting}
                                        className="h-12 rounded-2xl bg-slate-100 text-slate-800 font-semibold hover:bg-slate-200 disabled:opacity-50"
                                    >
                                        0
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={pin.length !== 4 || submitting}
                                        className="h-12 rounded-2xl bg-apricot text-slate-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        ✓
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParentPinGate;
