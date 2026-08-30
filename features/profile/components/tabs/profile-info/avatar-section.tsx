"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { User, Loader2, Camera } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores";
import { updateAvatarAction } from "@/features/profile";

interface AvatarSectionProps {
  avatarUrl: string | null | undefined;
}

export function AvatarSection({ avatarUrl }: AvatarSectionProps) {
  const t = useTranslations("Profile.ProfileInfoTab");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { setAuth } = useAuthStore((s) => s);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(t("avatarInvalidType"));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(t("avatarTooLarge", { size: (file.size / 1024 / 1024).toFixed(2) }));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    const formData = new FormData();
    formData.append("avatar", file);

    startTransition(async () => {
      const result = await updateAvatarAction(formData);
      if (result.status === "success" && result.data) {
        setAuth(result.data);
        toast.success(result.message);
      } else {
        setPreviewUrl(null);
        toast.error(result.message);
      }
    });

    e.target.value = "";
  }

  const displayUrl = previewUrl ?? avatarUrl;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative inline-flex">
        <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-[#26292C] bg-[#0B0F0E]">
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt="Profile avatar"
              fill
              className="object-cover"
              sizes="128px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User size={48} className="text-white/30" />
            </div>
          )}

          {isPending && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
              <Loader2 size={32} className="animate-spin text-white" />
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={isPending}
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 end-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-primary text-white transition-all duration-200 hover:bg-primary/90 hover:scale-110 disabled:opacity-50"
          title={t("changePhoto")}
          aria-label={t("changePhoto")}
        >
          {isPending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Camera size={18} />
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
