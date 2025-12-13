// loopybook-frontend/src/features/child/childService.ts
// Service front pour gérer les profils enfants (lecture)

export type ChildProfile = {
    id: number;
    username: string;
    birthDate?: string | null;
    avatarColor?: string | null;
    avatarUrl?: string | null;
};

type FetchOptions = {
    signal?: AbortSignal;
};

const API_BASE_URL = "http://localhost:8081";

/**
 * Récupère la liste des enfants liés à un parent.
 * Backend : GET /api/child-profiles/by-parent/{parentId}
 */
export async function fetchChildrenByParent(
    parentId: number,
    options: FetchOptions = {}
): Promise<ChildProfile[]> {
    if (!Number.isFinite(parentId) || parentId <= 0) {
        throw new Error("parentId invalide");
    }

    const response = await fetch(
        `${API_BASE_URL}/api/child-profiles/by-parent/${parentId}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
            signal: options.signal,
        }
    );

    if (!response.ok) {
        throw new Error("Impossible de charger les profils enfants");
    }

    return response.json();
}
