// src/services/authService.ts

/* ---------- Vérification de l'identifiant (email / EMP / ADM) ---------- */

export type IdentifierCheckStatus =
    | "EMAIL_FOUND"
    | "EMAIL_NOT_FOUND"
    | "EMPLOYEE_FOUND"
    | "EMPLOYEE_NOT_FOUND"
    | "INVALID_FORMAT";

export type IdentifierCheckResponse = {
    identifierType: "EMAIL" | "EMPLOYEE" | "INVALID_FORMAT";
    status: IdentifierCheckStatus;
    message: string;
    userId?: number;
    roles?: string[];
};

export async function checkIdentifier(
    identifier: string
): Promise<IdentifierCheckResponse> {
    const response = await fetch(
        "http://localhost:8081/api/auth/check-identifier",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier }),
        }
    );

    if (!response.ok) {
        throw new Error("Erreur lors de la vérification de l’identifiant");
    }

    return response.json();
}

/* ---------- Inscription parent / utilisateur ---------- */

export type RegisterParentPayload = {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    birthDate: string; // format ISO yyyy-MM-dd
    password: string;
    confirmPassword: string; // IMPORTANT : envoyé au back pour la comparaison
    avatarId?: string;
    avatarColor?: string;
    avatarUrl: string;
};

export async function registerParent(
    payload: RegisterParentPayload
): Promise<void> {
    const response = await fetch(
        "http://localhost:8081/api/auth/register-parent",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }
    );

    if (!response.ok) {
        // On tente de récupérer le message d’erreur du back
        const text = await response.text();
        throw new Error(text || "Erreur lors de l’inscription.");
    }
}

/* ---------- Login parent ---------- */

export type LoginPayload = {
    email: string;
    password: string;
};

export type LoginResponse = {
    userId: number;
    email: string;
    username?: string | null;
    firstName: string;
    lastName: string;
    token: string;
    avatarColor?: string | null;
    avatarUrl?: string | null;
};

export async function loginParent(
    payload: LoginPayload
): Promise<LoginResponse> {
    const response = await fetch("http://localhost:8081/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Erreur lors de la connexion.");
    }

    return response.json();
}
