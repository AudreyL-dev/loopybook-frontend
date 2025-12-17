// src/services/childWishlistService.ts
// Wishlist enfant (front-only) : stockée en localStorage par childId + event de synchro UI.

const storageKey = (childId: number) => `loopybook:wishlist:child:${childId}`;

const safeParseIds = (raw: string | null): number[] => {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((x) => typeof x === "number" && Number.isFinite(x) && x > 0);
    } catch {
        return [];
    }
};

// Event global pour notifier les écrans (ChildSpace, etc.)
export const WISHLIST_UPDATED_EVENT = "loopybook:wishlist-updated";

const emitWishlistUpdated = (childId: number) => {
    window.dispatchEvent(
        new CustomEvent(WISHLIST_UPDATED_EVENT, {
            detail: { childId },
        })
    );
};

export const childWishlistService = {
    getIds(childId: number): number[] {
        return safeParseIds(localStorage.getItem(storageKey(childId)));
    },

    isLiked(childId: number, bookId: number): boolean {
        return this.getIds(childId).includes(bookId);
    },

    toggle(childId: number, bookId: number): number[] {
        const current = this.getIds(childId);
        const next = current.includes(bookId)
            ? current.filter((id) => id !== bookId)
            : [...current, bookId];

        localStorage.setItem(storageKey(childId), JSON.stringify(next));
        emitWishlistUpdated(childId);
        return next;
    },

    remove(childId: number, bookId: number): number[] {
        const current = this.getIds(childId);
        const next = current.filter((id) => id !== bookId);

        localStorage.setItem(storageKey(childId), JSON.stringify(next));
        emitWishlistUpdated(childId);
        return next;
    },

    clear(childId: number): void {
        localStorage.removeItem(storageKey(childId));
        emitWishlistUpdated(childId);
    },
};
