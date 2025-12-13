// loopybook-frontend/src/pages/ParentSpace.tsx
// Espace adulte – panier parent (LOOP-23)

import { useEffect, useMemo, useState } from "react";
import Header from "../components/layout/Header";

import {
    fetchParentCart,
    computeCartTotal,
    formatEuro,
    orderCartItem,
    wishlistCartItem,
    deleteCartItem,
    type ParentCartItem,
} from "../features/cart/cartService";

const ParentSpace = () => {
    // TEMPORAIRE : parentId en dur tant que l’auth n’est pas branchée
    const parentId = 1;

    const [items, setItems] = useState<ParentCartItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [actionLoadingByCartItemId, setActionLoadingByCartItemId] = useState<
        Record<number, boolean>
    >({});
    const [payLoading, setPayLoading] = useState<boolean>(false);

    const loadCart = async (signal?: AbortSignal) => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchParentCart(parentId, undefined, { signal });
            setItems(data);
        } catch (err) {
            if ((err as { name?: string })?.name === "AbortError") return;
            console.error(err);
            setError("Impossible de charger le panier.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        void loadCart(controller.signal);
        return () => controller.abort();
    }, []);

    const total = useMemo(() => computeCartTotal(items), [items]);
    const itemsCount = items.length;

    const setItemActionLoading = (cartItemId: number, value: boolean) => {
        setActionLoadingByCartItemId((prev) => ({ ...prev, [cartItemId]: value }));
    };

    const handleValidateItem = async (cartItemId: number) => {
        if (actionLoadingByCartItemId[cartItemId]) return;

        setError(null);
        setItemActionLoading(cartItemId, true);

        try {
            await orderCartItem(cartItemId);
            setItems((prev) => prev.filter((it) => it.cartItemId !== cartItemId));
        } catch (err) {
            console.error(err);
            setError("Impossible de valider l’item.");
        } finally {
            setItemActionLoading(cartItemId, false);
        }
    };

    const handleWishlistItem = async (cartItemId: number) => {
        if (actionLoadingByCartItemId[cartItemId]) return;

        setError(null);
        setItemActionLoading(cartItemId, true);

        try {
            await wishlistCartItem(cartItemId);
            setItems((prev) => prev.filter((it) => it.cartItemId !== cartItemId));
        } catch (err) {
            console.error(err);
            setError("Impossible de mettre l’item de côté.");
        } finally {
            setItemActionLoading(cartItemId, false);
        }
    };

    const handleDeleteItem = async (cartItemId: number) => {
        if (actionLoadingByCartItemId[cartItemId]) return;

        setError(null);
        setItemActionLoading(cartItemId, true);

        try {
            await deleteCartItem(cartItemId);
            setItems((prev) => prev.filter((it) => it.cartItemId !== cartItemId));
        } catch (err) {
            console.error(err);
            setError("Impossible de supprimer l’item.");
        } finally {
            setItemActionLoading(cartItemId, false);
        }
    };

    /**
     * Payer maintenant (version actuelle)
     * - valide tous les items visibles (PENDING) via /order (un par un)
     * - puis recharge le panier
     */
    const handlePayNow = async () => {
        if (payLoading) return;
        if (items.length === 0) return;

        setError(null);
        setPayLoading(true);

        try {
            const ids = items.map((it) => it.cartItemId);

            await Promise.all(ids.map((id) => orderCartItem(id)));

            // On recharge pour être sûr de refléter l'état backend
            await loadCart();
        } catch (err) {
            console.error(err);
            setError("Impossible de finaliser l’achat pour le moment.");
        } finally {
            setPayLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#FFD67B]/10 to-[#AEEA7C]/10">
            <Header />

            <main className="flex-1">
                <section className="container px-4 pt-10 pb-6">
                    <h1 className="text-3xl font-extrabold text-slate-900">
                        Espace Adulte
                    </h1>
                    <p className="mt-2 text-sm text-slate-700 max-w-2xl">
                        Bienvenue, ici vous pouvez gérer les lectures des enfants liés à votre profil.
                    </p>

                    <div className="mt-6 flex items-center gap-2 rounded-full bg-white/60 border border-white/50 shadow-sm px-2 py-2">
                        <button
                            type="button"
                            className="px-4 py-2 rounded-full text-sm font-semibold text-slate-700 hover:bg-white/70 transition"
                        >
                            Tableau de bord
                        </button>

                        <button
                            type="button"
                            className="px-4 py-2 rounded-full text-sm font-semibold bg-[#3DCCC7] text-white shadow-sm"
                        >
                            Panier
                            <span className="ml-2 inline-flex items-center justify-center min-w-6 h-5 px-2 rounded-full bg-white/20 text-xs font-bold">
                                {itemsCount}
                            </span>
                        </button>

                        <button
                            type="button"
                            className="px-4 py-2 rounded-full text-sm font-semibold text-slate-700 hover:bg-white/70 transition"
                        >
                            Profils
                        </button>

                        <button
                            type="button"
                            className="px-4 py-2 rounded-full text-sm font-semibold text-slate-700 hover:bg-white/70 transition"
                        >
                            Historique
                        </button>
                    </div>
                </section>

                <section className="container px-4 pb-28">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-extrabold text-slate-900">Panier</h2>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-[#3DCCC7]">Total:</p>
                            <p className="text-lg font-extrabold text-[#3DCCC7]">
                                {formatEuro(total)}
                            </p>
                        </div>
                    </div>

                    {loading && (
                        <p className="mt-6 text-sm text-slate-500">Chargement du panier…</p>
                    )}

                    {error && !loading && (
                        <p className="mt-6 text-sm text-red-600">{error}</p>
                    )}

                    {!loading && !error && items.length === 0 && (
                        <p className="mt-6 text-sm text-slate-600">
                            Aucun livre dans le panier pour le moment.
                        </p>
                    )}

                    {!loading && !error && items.length > 0 && (
                        <div className="mt-6 space-y-4">
                            {items.map((item) => {
                                const coverUrl = item.coverUrlFront ?? item.coverUrlBack ?? "";
                                const requester = item.childUsername ?? "Parent";
                                const isBusy = !!actionLoadingByCartItemId[item.cartItemId];

                                return (
                                    <article
                                        key={item.cartItemId}
                                        className="rounded-2xl bg-white/55 border border-white/60 shadow-sm px-5 py-4"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="h-24 w-20 rounded-2xl bg-white/70 border border-white/60 flex items-center justify-center overflow-hidden">
                                                {coverUrl ? (
                                                    <img
                                                        src={coverUrl}
                                                        alt={item.title}
                                                        className="h-full w-full object-cover"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="text-[10px] text-slate-400 px-2 text-center">
                                                        Pas d’image
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base font-extrabold text-slate-900 truncate">
                                                    {item.title}
                                                </h3>
                                                <p className="text-sm text-slate-700">{item.author}</p>
                                                <p className="mt-1 text-sm text-[#3DCCC7] font-semibold">
                                                    Demandé par {requester}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <p className="text-lg font-extrabold text-slate-900 w-24 text-right">
                                                    {formatEuro(Number(item.price))}
                                                </p>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => void handleValidateItem(item.cartItemId)}
                                                        disabled={isBusy || payLoading}
                                                        className="h-8 w-8 rounded-lg bg-[#AEEA7C] text-slate-900 font-extrabold shadow-sm hover:brightness-95 active:brightness-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        OK
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => void handleWishlistItem(item.cartItemId)}
                                                        disabled={isBusy || payLoading}
                                                        className="h-8 w-8 rounded-lg bg-[#FFD67B] text-slate-900 font-extrabold shadow-sm hover:brightness-95 active:brightness-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        +
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => void handleDeleteItem(item.cartItemId)}
                                                        disabled={isBusy || payLoading}
                                                        className="h-8 w-8 rounded-lg bg-red-400 text-white font-extrabold shadow-sm hover:brightness-95 active:brightness-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        X
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>

                {!loading && !error && items.length > 0 && (
                    <div className="fixed bottom-0 left-0 right-0">
                        <div className="container px-4 pb-4">
                            <div className="rounded-2xl bg-[#3DCCC7]/70 backdrop-blur border border-white/40 shadow-md px-6 py-5 flex items-center justify-between">
                                <div>
                                    <p className="text-base font-extrabold text-white">
                                        Finaliser l’achat
                                    </p>
                                    <p className="text-sm text-white/90 mt-1">
                                        Total: {formatEuro(total)}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => void handlePayNow()}
                                    disabled={payLoading}
                                    className="rounded-full bg-white px-5 py-3 text-sm font-extrabold text-[#3DCCC7] shadow-sm hover:brightness-95 active:brightness-90 transition disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {payLoading ? "Paiement..." : "Payer maintenant"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ParentSpace;
