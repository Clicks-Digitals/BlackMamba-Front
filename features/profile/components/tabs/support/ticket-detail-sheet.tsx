"use client";

import { useEffect, useState, useActionState, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Paperclip, X } from "lucide-react";
import { toast } from "sonner";
import { cn, formatDateTime } from "@/lib/utils";
import {
  getSupportTicketDetails,
  createTicketReplyAction,
  supportTicketStatusBadgeClasses,
  type SupportTicket,
  type TicketReply,
  type CreateSupportReplyValues,
} from "@/features/profile";

import type { ActionState } from "@/types";

interface Props {
  ticket: SupportTicket | null;
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function TicketDetailSheet({ ticket, open, onClose, onRefresh }: Props) {
  const t = useTranslations("Profile.SupportTab");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const ticketId = ticket?.id;
  const [details, setDetails] = useState<SupportTicket | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const isLoadingDetails = Boolean(open && ticketId && details?.id !== ticketId);

  const boundReplyAction = ticket
    ? createTicketReplyAction.bind(null, ticket.id)
    : null;
  const dummyAction = async () =>
    ({ status: "idle", message: "" } as ActionState<CreateSupportReplyValues, TicketReply>);

  const [state, action, isPending] = useActionState<
    ActionState<CreateSupportReplyValues, TicketReply>,
    FormData
  >(boundReplyAction || dummyAction, { status: "idle", message: "" });

  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const fe = state.fieldErrors ?? {};

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const handler = (e: FormDataEvent) => {
      if (selectedFile) e.formData.set("attachment", selectedFile);
    };
    form.addEventListener("formdata", handler);
    return () => form.removeEventListener("formdata", handler);
  }, [selectedFile]);

  useEffect(() => {
    if (!open || !ticketId) return;
    let cancelled = false;
    getSupportTicketDetails(ticketId)
      .then((res) => { if (!cancelled) setDetails(res); })
      .catch(() => { if (!cancelled) toast.error(t("failedToLoadDetails")); });
    return () => { cancelled = true; };
  }, [open, ticketId, t]);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      const newReply = state.data;
      Promise.resolve().then(() => {
        if (newReply) {
          setDetails((prev) =>
            prev ? { ...prev, messages: [...(prev.messages ?? prev.replies ?? []), newReply] } : prev
          );
        }
        setSelectedFile(null);
        onRefresh();
      });
    } else if (state.status === "error" && state.message) {
      toast.error(
        state.message === "fixErrors" || state.message.startsWith("validation.")
          ? t(state.message as never)
          : state.message
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, state.message, state.fieldErrors, ticket?.id]);

  const messageCount = (details?.messages ?? details?.replies)?.length;
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messageCount]);

  const displayStatus = details?.status ?? ticket?.status ?? "";
  const statusLabel =
    displayStatus && (t(displayStatus.toLowerCase() as never) || displayStatus);

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent
        side={isRtl ? "left" : "right"}
        className="flex w-full flex-col px-0 sm:max-w-md bg-[#121314]"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Header */}
        <SheetHeader className="px-6 border-b border-white/8 pb-4 bg-[#17181B]">
          <SheetTitle className="font-chillax text-lg text-foreground line-clamp-1 text-start">
            {ticket?.subject}
          </SheetTitle>
          <div className="flex flex-wrap items-center gap-2 text-xs font-chillax text-white/45">
            <span>#{ticket?.id.slice(0, 8)}</span>
            <span aria-hidden>•</span>
            {displayStatus ? (
              <span
                className={cn(
                  "inline-flex shrink-0 rounded-full border px-2.5 py-0.5 font-chillax text-[11px] font-semibold capitalize leading-none",
                  supportTicketStatusBadgeClasses(displayStatus)
                )}
              >
                {statusLabel}
              </span>
            ) : null}
          </div>
        </SheetHeader>

        {/* Messages */}
        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 scrollbar-thin"
        >
          {isLoadingDetails ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-foreground h-6 w-6" />
            </div>
          ) : (
            (details?.messages ?? details?.replies)?.map((msg, i) => {
              const isStaff = msg.is_staff_reply;
              const isFirst = i === 0;
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col gap-0.5 max-w-[78%]",
                    isStaff ? "self-start items-start" : "self-end items-end"
                  )}
                >
                  {/* Sender label */}
                  {isStaff && (
                    <span className="text-[11px] font-semibold text-foreground px-1 text-start">
                      {t("supportAgent")}
                    </span>
                  )}

                  {/* Bubble */}
                  <div
                  className={cn(
                    "rounded-lg px-4 py-2.5 text-sm font-chillax shadow-sm text-start",
                    isStaff
                      ? isRtl
                        ? "rounded-tr-lg bg-[#17181B] text-[#EDEFF0] border border-[#26292C]"
                        : "rounded-tl-lg bg-[#17181B] text-[#EDEFF0] border border-[#26292C]"
                      : isRtl
                        ? "rounded-tl-lg bg-primary text-white"
                        : "rounded-tr-lg bg-primary text-white"
                  )}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                    {msg.attachment && (
                      <a
                        href={msg.attachment}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "mt-2 flex items-center gap-1.5 text-xs underline-offset-2 underline opacity-80 hover:opacity-100",
                          isStaff ? "text-foreground" : "text-white/90"
                        )}
                      >
                        <Paperclip className="h-3 w-3 shrink-0" />
                        {t("downloadAttachment")}
                      </a>
                    )}
                    {/* Time inside bubble */}
                    <p className={cn(
                      "mt-1 text-end text-[10px]",
                      isStaff ? "text-white/35" : "text-white/60"
                    )}>
                      {formatDateTime(msg.created_at, locale)}
                    </p>
                  </div>

                  {isFirst && !isStaff && (
                    <span className="text-[10px] text-white/35 font-chillax px-1">{t("you")}</span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Reply Box — WhatsApp style */}
        <div className="px-3 pb-4 pt-2 bg-[#121314]">
          {details?.status === "CLOSED" || details?.status === "RESOLVED" ? (
            <div className="text-center font-chillax text-sm text-white/45 py-3 bg-[#17181B] rounded-xl border border-[#26292C]">
              {t("ticketClosed")}
            </div>
          ) : (
            <form
              key={(details?.messages ?? details?.replies)?.length ?? 0}
              action={action}
              ref={formRef}
              className={cn("flex flex-col gap-2", isRtl && "text-start")}
            >
              {/* Selected file badge */}
              {selectedFile && (
                <div className="flex items-center gap-1.5 self-start rounded-full bg-[#17181B] border border-[#26292C] px-3 py-1 text-xs text-white/60">
                  <Paperclip className="h-3 w-3 shrink-0 text-foreground" />
                  <span className="max-w-45 truncate">{selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="ms-0.5 text-white/40 hover:text-red-500 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {fe.body?.[0] && (
                <p className="text-xs font-medium text-red-500 px-1">
                  {t(fe.body[0] as never)}
                </p>
              )}

              <div className="flex items-end gap-2">
                {/* Hidden file input */}
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  accept="image/*,application/pdf,.doc,.docx"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                />

                {/* Input bar */}
                <div className={cn(
                  "flex flex-1 items-end gap-1 rounded-xl bg-[#17181B] px-2 py-1.5 border border-[#26292C]",
                  "border border-transparent focus-within:border-primary/30 transition-colors",
                  fe.body?.[0] && "border-red-400"
                )}>
                  {/* Paperclip — left inside bar */}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={isPending || isLoadingDetails}
                    title={t("attachment")}
                    className="mb-1 shrink-0 rounded-full p-1 text-white/35 transition hover:text-foreground disabled:opacity-40"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>

                  {/* Textarea */}
                  <textarea
                    name="body"
                    placeholder={t("typeReply")}
                    disabled={isPending || isLoadingDetails}
                    rows={1}
                  className="flex-1 max-h-32 resize-none bg-transparent py-1.5 text-sm text-[#EDEFF0] placeholder:text-white/40 focus:outline-none disabled:opacity-50 text-start"
                  />
                </div>

                {/* Send — circular teal button */}
                <Button
                  type="submit"
                  size="icon"
                  disabled={isPending || isLoadingDetails}
                  className="h-11 w-11 shrink-0 rounded-full bg-primary hover:bg-[#d12f27] text-white shadow-md transition-transform active:scale-95"
                >
                  {isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className={cn("h-4 w-4", isRtl && "-scale-x-100")} />
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
