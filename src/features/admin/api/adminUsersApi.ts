// src/features/admin/api/adminUsersApi.ts
export type AdminUserSummary = {
    id: number;
    fullName: string;
    email: string;
    mainRole: "parent" | "employee" | "admin" | string;
    childrenCount: number;
};

export type AdminUserDetail = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    mainRole: "parent" | "employee" | "admin" | string;
    phone?: string | null;
    jobTitle?: string | null;
    childrenCount: number;
};

export type AdminUserCreatePayload = {
    firstName: string;
    lastName: string;
    email: string;
    mainRole: "parent" | "employee" | "admin";
    phone?: string;
    jobTitle?: string;
    employeeLogin?: string;
};

export type AdminUserUpdatePayload = {
    firstName?: string;
    lastName?: string;
    email?: string;
    mainRole?: "parent" | "employee" | "admin";
    phone?: string;
    jobTitle?: string;
    employeeLogin?: string;
};

const BASE_URL = "http://localhost:8081/api/admin/users";

export async function fetchAdminUsers(): Promise<AdminUserSummary[]> {
    const response = await fetch(BASE_URL);
    if (!response.ok) {
        throw new Error("Impossible de charger les utilisateurs.");
    }
    return response.json();
}

export async function fetchAdminUserDetail(
    id: number
): Promise<AdminUserDetail> {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) {
        throw new Error("Impossible de charger le détail de l'utilisateur.");
    }
    return response.json();
}

export async function createAdminUser(
    payload: AdminUserCreatePayload
): Promise<AdminUserDetail> {
    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error("Erreur lors de la création de l'utilisateur.");
    }
    return response.json();
}

export async function updateAdminUser(
    id: number,
    payload: AdminUserUpdatePayload
): Promise<AdminUserDetail> {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de l'utilisateur.");
    }
    return response.json();
}

export async function deleteAdminUser(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
    });

    if (!response.ok && response.status !== 204) {
        throw new Error("Erreur lors de la suppression de l'utilisateur.");
    }
}
