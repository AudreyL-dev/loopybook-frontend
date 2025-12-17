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

    price: string;

    status: "PENDING" | "REQUEST" | "WISHLIST" | "ORDERED" | "RECEIVED";

    addedAt: string;
};

type FetchOptions = {
    signal?: AbortSignal;
};

const API_BASE_URL = "http://localhost:8081";

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
        headers: { Accept: "application/json" },
        signal: options.signal,
    });

    if (!response.ok) {
        throw new Error("Impossible de charger le panier du parent");
    }

    return response.json();
}

/**
 * Parent : valide une demande enfant
 * REQUEST -> PENDING
 * POST /api/cart/items/{cartItemId}/approve
 */
export async function approveCartRequest(cartItemId: number): Promise<void> {
    if (!Number.isFinite(cartItemId) || cartItemId <= 0) {
        throw new Error("cartItemId invalide");
    }

    const response = await fetch(
        `${API_BASE_URL}/api/cart/items/${cartItemId}/approve`,
        {
            method: "POST",
            headers: { Accept: "application/json" },
        }
    );

    if (!response.ok) {
        throw new Error("Impossible de valider la demande (OK)");
    }
}

export async function orderCartItem(cartItemId: number): Promise<void> {
    if (!Number.isFinite(cartItemId) || cartItemId <= 0) {
        throw new Error("cartItemId invalide");
    }

    const response = await fetch(
        `${API_BASE_URL}/api/cart/items/${cartItemId}/order`,
        {
            method: "POST",
            headers: { Accept: "application/json" },
        }
    );

    if (!response.ok) {
        throw new Error("Impossible de valider l’item du panier");
    }
}

export async function wishlistCartItem(cartItemId: number): Promise<void> {
    if (!Number.isFinite(cartItemId) || cartItemId <= 0) {
        throw new Error("cartItemId invalide");
    }

    const response = await fetch(
        `${API_BASE_URL}/api/cart/items/${cartItemId}/wishlist`,
        {
            method: "POST",
            headers: { Accept: "application/json" },
        }
    );

    if (!response.ok) {
        throw new Error("Impossible de mettre l’item de côté");
    }
}

export async function deleteCartItem(cartItemId: number): Promise<void> {
    if (!Number.isFinite(cartItemId) || cartItemId <= 0) {
        throw new Error("cartItemId invalide");
    }

    const response = await fetch(`${API_BASE_URL}/api/cart/items/${cartItemId}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
    });

    if (!response.ok) {
        throw new Error("Impossible de supprimer l’item du panier");
    }
}

/**
 * Enfant : "Demander ce livre"
 * => POST /api/cart/requests
 * Body : { childId, bookId }
 * parentId déduit côté back.
 */
export async function requestBookForParentCart(params: {
    childId: number;
    bookId: number;
}): Promise<"CREATED" | "ALREADY_EXISTS"> {
    const { childId, bookId } = params;

    if (!Number.isFinite(childId) || childId <= 0) throw new Error("childId invalide");
    if (!Number.isFinite(bookId) || bookId <= 0) throw new Error("bookId invalide");

    const response = await fetch(`${API_BASE_URL}/api/cart/requests`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({ childId, bookId }),
    });

    if (response.status === 409) return "ALREADY_EXISTS";
    if (!response.ok) throw new Error("Impossible de demander ce livre");

    return "CREATED";
}

export function parsePriceToNumber(price: string): number {
    const value = Number(price);
    return Number.isFinite(value) ? value : 0;
}

export function computeCartTotal(items: ParentCartItem[]): number {
    return items.reduce((sum, item) => sum + parsePriceToNumber(item.price), 0);
}

export function formatEuro(amount: number): string {
    return amount.toFixed(2).replace(".", ",") + " €";
}

/**
 * Indique si un livre est déjà présent dans le panier du parent.
 */
export function isBookInParentCart(items: ParentCartItem[], bookId: number): boolean {
    return items.some((it) => it.bookId === bookId);
}
