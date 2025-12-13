// loopybook-frontend/src/features/cart/cartService.ts
// Service front pour lire et modifier le panier du parent (LOOP-23).

export type ParentCartItem = {
    cartItemId: number;

    childId: number | null;
    childUsername: string | null;

    bookId: number;
    title: string;
    author: string;

    coverUrlFront: string | null;
    coverUrlBack: string | null;

    price: string; // BigDecimal côté back => JSON souvent string
    status: "PENDING" | "WISHLIST" | "ORDERED" | "RECEIVED";

    addedAt: string; // ISO
};

type FetchOptions = {
    signal?: AbortSignal;
};

const API_BASE_URL = "http://localhost:8081";

/**
 * Récupère le panier PENDING d'un parent.
 * Optionnellement filtré sur un enfant.
 */
export async function fetchParentCart(
    parentId: number,
    childId?: number,
    options: FetchOptions = {}
): Promise<ParentCartItem[]> {
    if (!Number.isFinite(parentId) || parentId <= 0) {
        throw new Error("parentId invalide");
    }

    const url = new URL(`${API_BASE_URL}/api/cart/parent/${parentId}`);

    if (childId !== undefined) {
        if (!Number.isFinite(childId) || childId <= 0) {
            throw new Error("childId invalide");
        }
        url.searchParams.set("childId", String(childId));
    }

    const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
        signal: options.signal,
    });

    if (!response.ok) {
        throw new Error("Impossible de charger le panier du parent");
    }

    return response.json();
}

/**
 * Valide un item du panier.
 * Passe son statut à ORDERED.
 */
export async function orderCartItem(cartItemId: number): Promise<void> {
    if (!Number.isFinite(cartItemId) || cartItemId <= 0) {
        throw new Error("cartItemId invalide");
    }

    const response = await fetch(
        `${API_BASE_URL}/api/cart/items/${cartItemId}/order`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error("Impossible de valider l’item du panier");
    }
}

/**
 * Met un item du panier de côté.
 * Passe son statut à WISHLIST.
 */
export async function wishlistCartItem(cartItemId: number): Promise<void> {
    if (!Number.isFinite(cartItemId) || cartItemId <= 0) {
        throw new Error("cartItemId invalide");
    }

    const response = await fetch(
        `${API_BASE_URL}/api/cart/items/${cartItemId}/wishlist`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error("Impossible de mettre l’item de côté");
    }
}

/**
 * Supprime un item du panier.
 */
export async function deleteCartItem(cartItemId: number): Promise<void> {
    if (!Number.isFinite(cartItemId) || cartItemId <= 0) {
        throw new Error("cartItemId invalide");
    }

    const response = await fetch(
        `${API_BASE_URL}/api/cart/items/${cartItemId}`,
        {
            method: "DELETE",
            headers: {
                Accept: "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error("Impossible de supprimer l’item du panier");
    }
}

/**
 * Convertit un prix JSON (string) en nombre utilisable.
 */
export function parsePriceToNumber(price: string): number {
    const value = Number(price);
    return Number.isFinite(value) ? value : 0;
}

/**
 * Calcule le total du panier.
 */
export function computeCartTotal(items: ParentCartItem[]): number {
    return items.reduce((sum, item) => sum + parsePriceToNumber(item.price), 0);
}

/**
 * Formatte un montant en euros (format FR).
 */
export function formatEuro(amount: number): string {
    return amount.toFixed(2).replace(".", ",") + " €";
}
