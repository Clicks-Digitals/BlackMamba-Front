"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AtSign,
  CalendarDays,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Shield,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useAuthStore } from "@/stores";
import { Input, SubmitButton } from "@/components/forms";
import { updateProfileAction, AvatarSection, type ProfileData } from "@/features/profile";
import type { User, ActionState } from "@/types";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { formatDateShort } from "@/lib/utils/date";

interface ProfileInfoTabProps {
  user: User;
}

const initialState: ActionState<ProfileData, User> = { status: "idle", message: "" };

const PROFILE_FIELDS: Array<{
  key: keyof User;
  icon: React.ElementType;
  translationKey: string;
  colSpan?: boolean;
}> = [
  { key: "first_name",    icon: UserRound,    translationKey: "firstName"   },
  { key: "last_name",     icon: UserRound,    translationKey: "lastName"    },
  { key: "username",      icon: AtSign,       translationKey: "username"    },
  { key: "email",         icon: Mail,         translationKey: "email"       },
  { key: "phone",         icon: Phone,        translationKey: "phone"       },
  { key: "date_of_birth", icon: CalendarDays, translationKey: "dateOfBirth" },
  { key: "address",       icon: MapPin,       translationKey: "address", colSpan: true },
];

function InfoCard({
  icon: Icon,
  label,
  value,
  emptyLabel,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
  emptyLabel: string;
}) {
  if (!value) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-dashed border-white/12 bg-white/3 px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-white/30" />
          <span className="text-[10.5px] uppercase tracking-[0.14em] text-white/35">{label}</span>
        </div>
        <span className="text-[13.5px] text-white/30 italic">{emptyLabel}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[#000000] bg-[#000000] px-4 py-3.5 transition-colors hover:border-[#EB0B1A]/30">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-white/45" />
        <span className="text-[10.5px] uppercase tracking-[0.14em] text-white/40">{label}</span>
      </div>
      <span className="text-[14px] font-medium text-[#FFFFFF]">{value}</span>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">{children}</span>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
}

export function ProfileInfoTab({ user: initialUser }: ProfileInfoTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [, startTransition] = useTransition();
  const { user: storeUser, setAuth } = useAuthStore((s) => s);
  const [state, action] = useActionState(updateProfileAction, initialState);
  const t = useTranslations("Profile.ProfileInfoTab");
  const locale = useLocale();

  const user = storeUser ?? initialUser;
  const fe = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.status === "success" && state.data) {
      setAuth(state.data);
      startTransition(() => setIsEditing(false));
      toast.success(state.message);
    } else if (state.status === "error" && state.message) {
      toast.error(
        state.message.startsWith("validation.") ? t(state.message as never) : state.message
      );
    }
  }, [state.status, state.data, state.message, setAuth]);

  if (!user) return null;

  // Profile completeness
  const completenessFields: Array<keyof User> = ["first_name", "last_name", "username", "email", "phone", "date_of_birth", "avatar"];
  const filledCount = completenessFields.filter((f) => !!user[f]).length;
  const totalCount = completenessFields.length;
  const completenessPercent = Math.round((filledCount / totalCount) * 100);
  const isComplete = filledCount === totalCount;

  return (
    <div className="space-y-6">
      {/* ── Avatar + completeness row ── */}
      <div className="flex flex-col gap-5 rounded-lg border border-[#EB0B1A]/15 bg-white/3 p-6 sm:flex-row sm:items-start sm:gap-8">
        {/* Avatar */}
        <div className="flex shrink-0 flex-col items-center gap-3">
          <AvatarSection avatarUrl={user.avatar} />
          {user.is_active ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--blue-tint)] px-3 py-1.5 text-[11.5px] font-semibold text-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t("verified")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 text-[11.5px] font-semibold text-white/45">
              <Shield className="h-3.5 w-3.5" />
              {t("unverified")}
            </span>
          )}
        </div>

        {/* Completeness + edit */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[18px] font-semibold text-[#FFFFFF]">
                {user.first_name} {user.last_name}
              </h2>
              <p className="mt-0.5 text-[13px] text-white/40">@{user.username}</p>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#EB0B1A]/30 bg-[#EB0B1A]/10 px-3.5 py-2 text-[12px] font-medium text-[#FFFFFF] transition hover:bg-[#EB0B1A]/20"
              >
                <Pencil className="h-3 w-3" />
                {t("editProfile")}
              </button>
            )}
          </div>

          {/* Profile completeness */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-white/50">
                {t("profileCompleteness")}
              </span>
              <span className={cn("text-[12px] font-bold", isComplete ? "text-primary" : "text-foreground")}>
                {t("fieldsFilled", { filled: filledCount, total: totalCount })}
                {isComplete && <CheckCircle2 className="ms-1 inline h-3.5 w-3.5" />}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className={cn("h-full rounded-full transition-all duration-500", isComplete ? "bg-primary" : "bg-primary")}
                style={{ width: `${completenessPercent}%` }}
              />
            </div>
            {!isComplete && (
              <p className="text-[11px] text-white/40">{t("completePrompt")}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── View mode ── */}
      {!isEditing ? (
        <div className="space-y-6">
          {/* Personal information */}
          <div className="space-y-3">
            <SectionHeading>{t("personalInformation")}</SectionHeading>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PROFILE_FIELDS.filter((f) => !f.colSpan).map(({ key, icon, translationKey }) => (
                <InfoCard
                  key={key}
                  icon={icon}
                  label={t(translationKey as never)}
                  value={user[key] as string | null}
                  emptyLabel={t("notSet")}
                />
              ))}
            </div>
            {user.address && (
              <InfoCard
                icon={MapPin}
                label={t("address")}
                value={user.address}
                emptyLabel={t("notSet")}
              />
            )}
          </div>

          {/* Account information */}
          <div className="space-y-3">
            <SectionHeading>{t("account")}</SectionHeading>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex flex-col gap-2 rounded-lg border border-[#000000] bg-[#000000] px-4 py-3.5">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-white/45" />
                  <span className="text-[10.5px] uppercase tracking-[0.14em] text-white/40">{t("status")}</span>
                </div>
                <span className={cn("inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold",
                  user.is_active ? "bg-primary/15 text-primary" : "bg-white/8 text-white/45"
                )}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", user.is_active ? "bg-primary" : "bg-white/40")} />
                  {user.is_active ? t("activeVerified") : t("inactive")}
                </span>
              </div>

              <div className="flex flex-col gap-2 rounded-lg border border-[#000000] bg-[#000000] px-4 py-3.5">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-white/45" />
                  <span className="text-[10.5px] uppercase tracking-[0.14em] text-white/40">{t("memberSince")}</span>
                </div>
                <span className="text-[14px] font-medium text-[#FFFFFF]">
                  {user.created_at ? formatDateShort(user.created_at, locale) : "—"}
                </span>
              </div>

              <div className="flex flex-col gap-2 rounded-lg border border-[#000000] bg-[#000000] px-4 py-3.5">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-white/45" />
                  <span className="text-[10.5px] uppercase tracking-[0.14em] text-white/40">{t("lastUpdated")}</span>
                </div>
                <span className="text-[14px] font-medium text-[#FFFFFF]">
                  {user.updated_at ? formatDateShort(user.updated_at, locale) : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Edit mode ── */
        <div className="rounded-lg border border-[#EB0B1A]/15 bg-white/3 p-6">
          <div className="mb-5 flex items-center justify-between">
            <SectionHeading>{t("editProfile")}</SectionHeading>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/8 hover:text-[#FFFFFF]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form action={action} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label={t("firstName")}
                name="first_name"
                defaultValue={state.inputs?.first_name ?? user.first_name}
                error={fe.first_name?.[0] ? t(fe.first_name[0] as never) : undefined}
              />
              <Input
                label={t("lastName")}
                name="last_name"
                defaultValue={state.inputs?.last_name ?? user.last_name}
                error={fe.last_name?.[0] ? t(fe.last_name[0] as never) : undefined}
              />
              <Input
                label={t("username")}
                name="username"
                defaultValue={state.inputs?.username ?? user.username}
                error={fe.username?.[0] ? t(fe.username[0] as never) : undefined}
              />
              <Input
                label={t("email")}
                name="email"
                type="email"
                defaultValue={state.inputs?.email ?? user.email}
                error={fe.email?.[0] ? t(fe.email[0] as never) : undefined}
              />
              <Input
                label={t("phone")}
                name="phone"
                type="tel"
                defaultValue={state.inputs?.phone ?? user.phone}
                error={fe.phone?.[0] ? t(fe.phone[0] as never) : undefined}
              />
              <Input
                label={t("dateOfBirth")}
                name="date_of_birth"
                type="date"
                defaultValue={state.inputs?.date_of_birth ?? user.date_of_birth}
                error={fe.date_of_birth?.[0] ? t(fe.date_of_birth[0] as never) : undefined}
              />
              <div className="sm:col-span-2">
                <Input
                  label={t("address")}
                  name="address"
                  defaultValue={state.inputs?.address ?? user.address}
                  error={fe.address?.[0] ? t(fe.address[0] as never) : undefined}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-white/8 pt-4">
              <SubmitButton
                pendingText={t("saving")}
                className="h-10 rounded-lg bg-primary px-8 text-[12.5px] font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#EB0B1A]"
              >
                {t("saveChanges")}
              </SubmitButton>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="h-10 rounded-lg border border-[#000000] px-6 text-[12.5px] font-medium text-white/60 transition hover:bg-white/5 hover:text-[#FFFFFF]"
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
