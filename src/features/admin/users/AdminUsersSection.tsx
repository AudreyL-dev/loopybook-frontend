// src/features/admin/users/AdminUsersSection.tsx

import React, { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Eye, UserPen, UserPlus, UserX } from "lucide-react";

export type AdminUser = {
    id: number;
    fullName: string;
    email: string;
    mainRole: "parent" | "employee" | "admin";
    childrenCount: number;
};

// DTO détail renvoyé par le backend (AdminUserDetailDto)
type AdminUserDetail = {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    jobTitle?: string | null;
    mainRole: "parent" | "employee" | "admin";
    childrenCount?: number;
    // NOUVEAU : date de naissance au format "YYYY-MM-DD"
    birthDate?: string | null;
};

const API_BASE = "http://localhost:8081/api/admin/users";

const emptyUserDetail: AdminUserDetail = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    jobTitle: "",
    mainRole: "parent",
    birthDate: "",
};

const getRoleBadge = (mainRole: string | undefined) => {
    switch (mainRole) {
        case "admin":
            return {
                label: "admin",
                className: "bg-[#F97316]/10 text-[#C2410C] border border-[#FDBA74]/70",
            };
        case "employee":
            return {
                label: "employee",
                className: "bg-[#EDE9FE] text-[#4C1D95] border border-[#C4B5FD]",
            };
        case "parent":
        default:
            return {
                label: "parent",
                className: "bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]",
            };
    }
};

const mapDetailToSummary = (detail: AdminUserDetail): AdminUser => {
    const fullName = `${detail.firstName ?? ""} ${detail.lastName ?? ""}`.trim();

    return {
        id: detail.id as number,
        fullName: fullName || "(sans nom)",
        email: detail.email,
        mainRole: detail.mainRole,
        childrenCount: detail.childrenCount ?? 0,
    };
};

const AdminUsersSection: React.FC = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateMode, setIsCreateMode] = useState(true);
    const [editingUser, setEditingUser] = useState<AdminUserDetail | null>(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // ===================== CHARGEMENT INITIAL =====================

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(API_BASE);
                if (!response.ok) {
                    throw new Error("Impossible de charger les utilisateurs.");
                }
                const data: AdminUser[] = await response.json();
                setUsers(data);
            } catch (err) {
                console.error(err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Erreur lors du chargement des utilisateurs."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // ===================== FILTRAGE =====================

    const filteredUsers = users.filter((user) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        const fullName = user.fullName.toLowerCase();
        const { label: roleLabel } = getRoleBadge(user.mainRole);

        return (
            fullName.includes(q) ||
            user.email.toLowerCase().includes(q) ||
            roleLabel.toLowerCase().includes(q)
        );
    });

    // ===================== HANDLERS =====================

    const openCreateModal = () => {
        setIsCreateMode(true);
        setEditingUser({ ...emptyUserDetail });
        setFormError(null);
        setIsModalOpen(true);
    };

    const openEditModal = async (user: AdminUser) => {
        setIsCreateMode(false);
        setFormError(null);
        setSaving(false);

        try {
            const response = await fetch(`${API_BASE}/${user.id}`);
            if (!response.ok) {
                throw new Error("Impossible de charger les détails de l'utilisateur.");
            }

            const detail: AdminUserDetail = await response.json();
            // On suppose que le backend renvoie birthDate en "YYYY-MM-DD"
            setEditingUser(detail);
            setIsModalOpen(true);
        } catch (err) {
            console.error(err);
            window.alert(
                err instanceof Error
                    ? err.message
                    : "Erreur lors du chargement des détails utilisateur."
            );
        }
    };

    const closeModal = () => {
        if (saving) return;
        setIsModalOpen(false);
        setEditingUser(null);
        setFormError(null);
    };

    const handleViewChildren = (user: AdminUser) => {
        window.alert(`${user.fullName} a ${user.childrenCount} enfant(s).`);
    };

    const handleDeleteUser = async (user: AdminUser) => {
        const ok = window.confirm(
            `Supprimer l'utilisateur "${user.fullName}" ?`
        );
        if (!ok) return;

        try {
            const response = await fetch(`${API_BASE}/${user.id}`, {
                method: "DELETE",
            });
            if (!response.ok && response.status !== 204) {
                throw new Error("Erreur lors de la suppression de l'utilisateur.");
            }

            setUsers((prev) => prev.filter((u) => u.id !== user.id));
        } catch (err) {
            console.error(err);
            window.alert(
                err instanceof Error
                    ? err.message
                    : "Impossible de supprimer cet utilisateur pour le moment."
            );
        }
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!editingUser) return;

        // Validation minimale
        if (!editingUser.firstName.trim() || !editingUser.lastName.trim()) {
            setFormError("Prénom et nom sont obligatoires.");
            return;
        }
        if (!editingUser.email.trim()) {
            setFormError("L'email est obligatoire.");
            return;
        }
        if (!editingUser.birthDate || !editingUser.birthDate.trim()) {
            setFormError("La date de naissance est obligatoire.");
            return;
        }

        setSaving(true);
        setFormError(null);

        try {
            // Payload aligné avec AdminUserCreateRequest / AdminUserUpdateRequest
            const payload = {
                firstName: editingUser.firstName,
                lastName: editingUser.lastName,
                email: editingUser.email,
                phone: editingUser.phone ?? "",
                jobTitle: editingUser.jobTitle ?? "",
                mainRole: editingUser.mainRole,
                birthDate: editingUser.birthDate && editingUser.birthDate !== ""
                    ? editingUser.birthDate
                    : null, // NOUVEAU
                // employeeLogin : laissé vide → le backend générera EMP- / ADM- si besoin
            };

            const isEdit = !isCreateMode && editingUser.id != null;
            const url = isEdit ? `${API_BASE}/${editingUser.id}` : API_BASE;
            const method = isEdit ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(
                    isEdit
                        ? "Erreur lors de la mise à jour de l'utilisateur."
                        : "Erreur lors de la création de l'utilisateur."
                );
            }

            const savedDetail: AdminUserDetail = await response.json();
            const summary = mapDetailToSummary(savedDetail);

            setUsers((prev) => {
                if (isEdit) {
                    return prev.map((u) => (u.id === summary.id ? summary : u));
                }
                return [...prev, summary];
            });

            setIsModalOpen(false);
            setEditingUser(null);
        } catch (err) {
            console.error(err);
            setFormError(
                err instanceof Error
                    ? err.message
                    : "Une erreur est survenue lors de l’enregistrement."
            );
        } finally {
            setSaving(false);
        }
    };

    // ===================== RENDU =====================

    return (
        <section className="mt-4">
            {/* En-tête section + bouton nouvel utilisateur */}
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                        Gestion des utilisateurs
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                        Consultation, création et gestion des comptes parents et employés.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2
                     rounded-full bg-[#AEEA7C]
                     text-[#1A1A1A] text-xs font-medium
                     px-3 py-1 h-7
                     shadow-sm hover:shadow-md hover:bg-[#9BD65A]
                     transition"
                >
                    <UserPlus size={14} strokeWidth={2} />
                    Nouvel utilisateur
                </button>
            </div>

            {/* Barre de recherche */}
            <div className="mb-4">
                <div className="flex items-center gap-2 rounded-full bg-white/80 border border-slate-200 px-4 py-2 shadow-sm">
                    <span className="text-slate-400 text-sm">🔍</span>
                    <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Rechercher un utilisateur..."
                        className="flex-1 bg-transparent border-none text-sm focus:outline-none"
                    />
                </div>
            </div>

            {/* États de chargement / erreur globales */}
            {loading && (
                <p className="text-sm text-slate-700">
                    Chargement des utilisateurs...
                </p>
            )}

            {error && !loading && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-3">
                    {error}
                </p>
            )}

            {/* Liste responsive : mobile = cartes, desktop = tableau */}
            {!loading && !error && (
                <>
                    {/* MOBILE (cartes) */}
                    <div className="md:hidden space-y-3">
                        {filteredUsers.length === 0 && (
                            <div className="rounded-3xl bg-white/90 border border-slate-100 shadow-sm p-4 text-sm text-slate-500 text-center">
                                Aucun utilisateur ne correspond à la recherche.
                            </div>
                        )}

                        {filteredUsers.map((user) => {
                            const { label: roleLabel, className: roleClassName } =
                                getRoleBadge(user.mainRole);

                            return (
                                <article
                                    key={user.id}
                                    className="rounded-3xl bg-white/90 border border-slate-100 shadow-sm p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="text-sm font-semibold text-slate-900 break-words">
                                                {user.fullName}
                                            </h3>

                                            <p className="mt-1 text-xs text-slate-700 break-words">
                                                {user.email}
                                            </p>

                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                      className={[
                          "inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold",
                          roleClassName,
                      ].join(" ")}
                  >
                    {roleLabel}
                  </span>

                                                <span className="text-xs text-slate-700">
                    Enfants :{" "}
                                                    <span className="font-semibold">{user.childrenCount}</span>
                  </span>
                                            </div>
                                        </div>

                                        {/* Actions (identiques à ton tableau) */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleViewChildren(user)}
                                                className="inline-flex items-center justify-center
                             rounded-full bg-emerald-50
                             hover:bg-emerald-100
                             transform hover:scale-110
                             transition"
                                                title="Voir les enfants"
                                            >
                                                <Eye size={16} className="text-[#22C55E]" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => openEditModal(user)}
                                                className="inline-flex items-center justify-center
                             rounded-full bg-emerald-50
                             hover:bg-emerald-100
                             transform hover:scale-110
                             transition"
                                                title="Modifier"
                                            >
                                                <UserPen size={16} className="text-[#22C55E]" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDeleteUser(user)}
                                                className="inline-flex items-center justify-center
                             rounded-full bg-red-50
                             hover:bg-red-100
                             transform hover:scale-110
                             transition"
                                                title="Supprimer"
                                            >
                                                <UserX size={16} className="text-[#F55E5E]" />
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    {/* DESKTOP (tableau) */}
                    <div className="hidden md:block rounded-3xl bg-white/90 border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left px-6 py-3 font-semibold text-slate-700">
                                        Nom
                                    </th>
                                    <th className="text-left px-6 py-3 font-semibold text-slate-700">
                                        Email
                                    </th>
                                    <th className="text-left px-6 py-3 font-semibold text-slate-700">
                                        Rôle
                                    </th>
                                    <th className="text-left px-6 py-3 font-semibold text-slate-700">
                                        Enfants
                                    </th>
                                    <th className="text-right px-6 py-3 font-semibold text-slate-700">
                                        Actions
                                    </th>
                                </tr>
                                </thead>

                                <tbody>
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-4 text-sm text-slate-500 text-center"
                                        >
                                            Aucun utilisateur ne correspond à la recherche.
                                        </td>
                                    </tr>
                                )}

                                {filteredUsers.map((user) => {
                                    const { label: roleLabel, className: roleClassName } =
                                        getRoleBadge(user.mainRole);

                                    return (
                                        <tr
                                            key={user.id}
                                            className="border-t border-slate-100 hover:bg-slate-50/80 transition"
                                        >
                                            <td className="px-6 py-3 text-slate-900">{user.fullName}</td>
                                            <td className="px-6 py-3 text-slate-700">{user.email}</td>
                                            <td className="px-6 py-3">
                    <span
                        className={[
                            "inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold",
                            roleClassName,
                        ].join(" ")}
                    >
                      {roleLabel}
                    </span>
                                            </td>
                                            <td className="px-6 py-3 text-slate-900">
                                                {user.childrenCount}
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleViewChildren(user)}
                                                        className="inline-flex items-center justify-center
                                 rounded-full bg-emerald-50
                                 hover:bg-emerald-100
                                 transform hover:scale-110
                                 transition"
                                                        title="Voir les enfants"
                                                    >
                                                        <Eye size={16} className="text-[#22C55E]" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(user)}
                                                        className="inline-flex items-center justify-center
                                 rounded-full bg-emerald-50
                                 hover:bg-emerald-100
                                 transform hover:scale-110
                                 transition"
                                                        title="Modifier"
                                                    >
                                                        <UserPen size={16} className="text-[#22C55E]" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteUser(user)}
                                                        className="inline-flex items-center justify-center
                                 rounded-full bg-red-50
                                 hover:bg-red-100
                                 transform hover:scale-110
                                 transition"
                                                        title="Supprimer"
                                                    >
                                                        <UserX size={16} className="text-[#F55E5E]" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}


            {/* MODALE CRÉATION / ÉDITION */}
            {isModalOpen && editingUser && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-lg mx-4 rounded-3xl bg-white shadow-xl p-6 relative">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">
                            {isCreateMode
                                ? "Nouvel utilisateur"
                                : `Modifier l'utilisateur`}
                        </h3>

                        {formError && (
                            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-3">
                                {formError}
                            </p>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Prénom
                                    </label>
                                    <input
                                        type="text"
                                        value={editingUser.firstName}
                                        onChange={(event) =>
                                            setEditingUser((prev) =>
                                                prev
                                                    ? { ...prev, firstName: event.target.value }
                                                    : prev
                                            )
                                        }
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A93AFF]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Nom
                                    </label>
                                    <input
                                        type="text"
                                        value={editingUser.lastName}
                                        onChange={(event) =>
                                            setEditingUser((prev) =>
                                                prev
                                                    ? { ...prev, lastName: event.target.value }
                                                    : prev
                                            )
                                        }
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A93AFF]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={editingUser.email}
                                        onChange={(event) =>
                                            setEditingUser((prev) =>
                                                prev
                                                    ? { ...prev, email: event.target.value }
                                                    : prev
                                            )
                                        }
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A93AFF]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        value={editingUser.phone ?? ""}
                                        onChange={(event) =>
                                            setEditingUser((prev) =>
                                                prev
                                                    ? { ...prev, phone: event.target.value }
                                                    : prev
                                            )
                                        }
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A93AFF]"
                                    />
                                </div>


                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Date de naissance
                                    </label>
                                    <input
                                        type="date"
                                        value={editingUser.birthDate ?? ""}
                                        onChange={(event) =>
                                            setEditingUser((prev) =>
                                                prev
                                                    ? { ...prev, birthDate: event.target.value }
                                                    : prev
                                            )
                                        }
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A93AFF]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Rôle principal
                                    </label>
                                    <select
                                        value={editingUser.mainRole}
                                        onChange={(event) =>
                                            setEditingUser((prev) =>
                                                prev
                                                    ? {
                                                        ...prev,
                                                        mainRole:
                                                            event.target
                                                                .value as AdminUser["mainRole"],
                                                    }
                                                    : prev
                                            )
                                        }
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#A93AFF]"
                                    >
                                        <option value="parent">Parent</option>
                                        <option value="employee">Employé</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Poste (si employé)
                                    </label>
                                    <input
                                        type="text"
                                        value={editingUser.jobTitle ?? ""}
                                        onChange={(event) =>
                                            setEditingUser((prev) =>
                                                prev
                                                    ? { ...prev, jobTitle: event.target.value }
                                                    : prev
                                            )
                                        }
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A93AFF]"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="px-4 py-2 rounded-full border border-slate-300 text-sm text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 rounded-full bg-[#A93AFF] text-sm font-semibold text-white shadow hover:bg-[#8D31D6] disabled:opacity-50"
                                >
                                    {saving
                                        ? "Enregistrement..."
                                        : isCreateMode
                                            ? "Créer l'utilisateur"
                                            : "Mettre à jour"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AdminUsersSection;
