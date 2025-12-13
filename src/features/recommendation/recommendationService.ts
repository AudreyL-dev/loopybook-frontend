// src/features/recommendation/recommendationService.ts

export type RecommendedBook = {
    id: number;
    title: string;
    author: string;
    coverUrlFront: string | null;
    coverUrlBack: string | null;
    summary: string | null;
};

/**
 * Récupère les livres recommandés pour un enfant
 * Version SIMPLE (LOOP-7)
 */
export async function fetchRecommendedBooksByChild(
    childId: number,
    options?: { signal?: AbortSignal }
): Promise<RecommendedBook[]> {
    if (!Number.isFinite(childId) || childId <= 0) {
        throw new Error("childId invalide");
    }

    const response = await fetch(
        `http://localhost:8081/api/recommendations/children/${childId}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
            signal: options?.signal,
        }
    );

    if (!response.ok) {
        const message = await safeReadErrorMessage(response);
        throw new Error(message ?? "Impossible de charger les livres recommandés");
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data)) {
        throw new Error("Format de réponse inattendu (liste attendue)");
    }

    return data as RecommendedBook[];
}

/**
 * Essaie de lire un message d'erreur JSON ou texte sans casser le flux.
 */
async function safeReadErrorMessage(response: Response): Promise<string | null> {
    try {
        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
            const body = (await response.json()) as { message?: string };
            return body?.message ?? null;
        }
        const text = await response.text();
        return text?.trim() ? text.trim() : null;
    } catch {
        return null;
    }
}
