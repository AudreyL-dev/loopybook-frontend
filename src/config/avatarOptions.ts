// src/config/avatarOptions.ts

export type ProfileType = "parent" | "child" | "employee" | "admin";

export type AvatarOption = {
    id: string;
    label: string;
    src: string;
};

// Helper pour transformer le résultat de import.meta.glob en AvatarOption[]
function mapAvatarsFromGlob(
    images: Record<string, unknown>,
    folder: string
): AvatarOption[] {
    return Object.entries(images).map(([path, src], index) => {
        const fileName = path.split("/").pop() ?? `avatar-${index}`;
        const clean = fileName.split(".")[0];

        return {
            id: `${folder}-${clean}`,
            label: clean,
            src: src as string,
        };
    });
}

// 4 globs STATIQUES (obligatoire avec Vite)
const parentImages = import.meta.glob(
    "../assets/avatars/parent/*.{png,jpg,jpeg,svg}",
    {
        eager: true,
        import: "default",
    }
);

const childImages = import.meta.glob(
    "../assets/avatars/child/*.{png,jpg,jpeg,svg}",
    {
        eager: true,
        import: "default",
    }
);

const employeeImages = import.meta.glob(
    "../assets/avatars/employee/*.{png,jpg,jpeg,svg}",
    {
        eager: true,
        import: "default",
    }
);

const adminImages = import.meta.glob(
    "../assets/avatars/admin/*.{png,jpg,jpeg,svg}",
    {
        eager: true,
        import: "default",
    }
);

// Palette de couleurs dispo pour les avatars
export const AVATAR_COLORS = [
    "#AEEA7C", // kiwi
    "#FFD67B", // apricot
    "#3DCCC7", // mint
    "#9475D3", // indigo
    "#f37c35", // orange
    "#F55E5E", // rouge
    "#FF99DB", // rose
];

// Avatars par type de profil
export const AVATARS_BY_PROFILE: Record<ProfileType, AvatarOption[]> = {
    parent: mapAvatarsFromGlob(parentImages, "parent"),
    child: mapAvatarsFromGlob(childImages, "child"),
    employee: mapAvatarsFromGlob(employeeImages, "employee"),
    admin: mapAvatarsFromGlob(adminImages, "admin"),
};
