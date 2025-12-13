// src/components/ui/AvatarPicker.tsx

import React from "react";
import type { ProfileType, AvatarOption } from "../../config/avatarOptions";
import { AVATAR_COLORS, AVATARS_BY_PROFILE } from "../../config/avatarOptions";

type AvatarPickerProps = {
    profileType: ProfileType;
    selectedAvatarId?: string;
    selectedColor?: string;
    onAvatarChange: (avatar: AvatarOption) => void;
    onColorChange: (color: string) => void;
};

const AvatarPicker: React.FC<AvatarPickerProps> = ({
                                                       profileType,
                                                       selectedAvatarId,
                                                       selectedColor,
                                                       onAvatarChange,
                                                       onColorChange,
                                                   }) => {
    const avatars = AVATARS_BY_PROFILE[profileType];
    const currentColor = selectedColor ?? AVATAR_COLORS[0];

    const selectedAvatar =
        avatars.find((a) => a.id === selectedAvatarId) ?? avatars[0];

    return (
        <div className="space-y-4">
            {/* Aperçu */}
            <div className="flex items-center gap-4">
                <div
                    className="w-20 h-20 rounded-full flex items-center justify-center border border-slate-200"
                    style={{ backgroundColor: currentColor }}
                >
                    {selectedAvatar && (
                        <img
                            src={selectedAvatar.src}
                            alt={selectedAvatar.label}
                            className="w-20 h-20 object-contain"
                        />
                    )}
                </div>
                <div className="text-xs text-slate-600">
                    <p className="font-semibold text-slate-800 mb-1">Avatar du profil</p>
                    <p>Choisissez une image et une couleur de fond pour votre avatar.</p>
                </div>
            </div>

            {/* Choix de l'image */}
            <div>
                <p className="text-xs font-medium text-slate-700 mb-2">
                    Image d'avatar
                </p>
                <div className="flex flex-wrap gap-2">
                    {avatars.map((avatar) => {
                        const isActive = avatar.id === selectedAvatarId;

                        return (
                            <button
                                key={avatar.id}
                                type="button"
                                onClick={() => onAvatarChange(avatar)}
                                className={[
                                    "w-12 h-12 rounded-full flex items-center justify-center border",
                                    "bg-white",
                                    isActive
                                        ? "border-[#A93AFF] ring-2 ring-[#A93AFF]/40"
                                        : "border-slate-200 hover:border-slate-400",
                                ].join(" ")}
                            >
                                <img
                                    src={avatar.src}
                                    alt={avatar.label}
                                    className="w-9 h-9 object-contain"
                                />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Choix de la couleur */}
            <div>
                <p className="text-xs font-medium text-slate-700 mb-2">
                    Couleur de fond
                </p>
                <div className="flex flex-wrap gap-2">
                    {AVATAR_COLORS.map((color) => {
                        const isActive = color === currentColor;
                        return (
                            <button
                                key={color}
                                type="button"
                                onClick={() => onColorChange(color)}
                                className={[
                                    "w-7 h-7 rounded-full border",
                                    isActive
                                        ? "border-slate-900 ring-2 ring-slate-400"
                                        : "border-slate-300 hover:border-slate-500",
                                ].join(" ")}
                                style={{ backgroundColor: color }}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AvatarPicker;
