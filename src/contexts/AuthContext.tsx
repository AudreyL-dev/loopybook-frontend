// src/contexts/AuthContext.tsx

import React, {
    createContext,
    useContext,
    useState,
    useMemo,
    type ReactNode,
} from "react";
import {
    loginParent,
    type LoginResponse,
} from "../features/auth/authService";

type UserRole = "parent" | "admin" | "employee" | "child" | null;

/**
 * Représente l'utilisateur connecté côté front.
 * On stocke aussi le pseudo, le prénom et l'avatar.
 */
interface AuthUser {
    id: number;                     // <- number, comme dans la réponse backend
    email: string;
    role: UserRole;
    name: string;                   // utilisé pour les affichages "généraux"
    username?: string | null;       // pseudo
    firstName?: string | null;      // prénom
    avatarColor?: string | null;
    avatarUrl?: string | null;
    token: string;
}

interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth doit être utilisé dans un AuthProvider");
    }
    return ctx;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
                                                                    children,
                                                                }) => {
    const [user, setUser] = useState<AuthUser | null>(null);

    const login = async (email: string, password: string): Promise<boolean> => {
        if (!email || !password) {
            return false;
        }

        try {
            const data: LoginResponse = await loginParent({ email, password });

            // On nettoie les champs pour éviter les espaces chelous
            const username = data.username?.trim() || null;
            const firstName = data.firstName?.trim() || null;

            // Rôle très simplifié pour l’instant
            let role: UserRole = "parent";
            if (email.startsWith("ADM-")) role = "admin";
            else if (email.startsWith("EMP-")) role = "employee";

            // Pour debug si besoin : tu peux laisser ça temporairement
            // console.log("LoginResponse backend :", data);

            setUser({
                id: data.userId,                       // number directement
                email: data.email,
                role,
                name: username || firstName || data.email, // ordre de priorité : pseudo > prénom > email
                username,
                firstName,
                avatarColor: data.avatarColor ?? null,
                avatarUrl: data.avatarUrl ?? null,
                token: data.token,
            });

            return true;
        } catch (error) {
            console.error("Erreur lors du login :", error);
            setUser(null);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
    };

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            isAuthenticated: !!user,
            login,
            logout,
        }),
        [user]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
