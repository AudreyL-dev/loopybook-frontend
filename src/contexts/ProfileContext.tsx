// src/contexts/ProfileContext.tsx

import  {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from "react";

/**
 * Type de profil actif.
 */
export type ActiveProfileType = "PARENT" | "CHILD" | "EMPLOYEE" | "ADMIN";

/**
 * Représente le profil actuellement sélectionné dans l'UI.
 * - Exemple enfant : type = "CHILD", id = 3, displayName = "Léo",
 *   avatarColor / avatarUrl = avatar de l'enfant
 * - Exemple parent : type = "PARENT", id = id_user, displayName = "Audrey"
 */
export interface ActiveProfile {
    type: ActiveProfileType;
    id?: number;
    displayName: string;
    avatarColor?: string | null;
    avatarUrl?: string | null;
    age?: number;
}

interface ProfileContextValue {
    activeProfile: ActiveProfile | null;
    setActiveProfile: (profile: ActiveProfile) => void;
    clearActiveProfile: () => void;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(
    undefined
);

/**
 * Hook custom pour consommer le contexte de profil.
 */
export function useProfile(): ProfileContextValue {
    const ctx = useContext(ProfileContext);
    if (!ctx) {
        throw new Error("useProfile doit être utilisé dans un ProfileProvider");
    }
    return ctx;
}

/**
 * ProfileProvider
 *
 * Fournit le profil actif à toute l'application.
 */
export function ProfileProvider({ children }: { children: ReactNode }) {
    const [activeProfile, setActiveProfileState] =
        useState<ActiveProfile | null>(null);

    const setActiveProfile = (profile: ActiveProfile) => {
        setActiveProfileState(profile);
    };

    const clearActiveProfile = () => {
        setActiveProfileState(null);
    };

    return (
        <ProfileContext.Provider
            value={{ activeProfile, setActiveProfile, clearActiveProfile }}
        >
            {children}
        </ProfileContext.Provider>
    );
}
