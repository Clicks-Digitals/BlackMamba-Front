"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { googleLoginAction } from "@/features/auth/actions/google-login";
import { trackLogin, trackSignUp } from "@/features/analytics";
import { useAuthStore } from "@/stores/auth-store";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const GSI_SRC = "https://accounts.google.com/gsi/client";

type CredentialResponse = { credential?: string };

type GoogleAccounts = {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: CredentialResponse) => void;
        ux_mode?: "popup" | "redirect";
      }) => void;
      renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleAccounts;
  }
}

/**
 * Injects the Google Identity Services script at most once per page.
 * Every caller shares the same promise, so mounting the button on both the
 * login and register routes never adds a second <script>.
 */
let gsiPromise: Promise<void> | null = null;

function loadGsi(): Promise<void> {
  if (gsiPromise) return gsiPromise;

  gsiPromise = new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    const script = existing ?? document.createElement("script");

    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("Failed to load Google Sign-In.")));

    if (!existing) {
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });

  return gsiPromise;
}

function useGsiScript() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    let active = true;
    loadGsi()
      .then(() => {
        if (active) setReady(true);
      })
      .catch(() => {
        // Google is unreachable; the container just stays empty.
      });

    return () => {
      active = false;
    };
  }, []);

  return ready;
}

/**
 * Google's own rendered button.
 *
 * Google requires its official button markup, so we hand it a container and
 * let it draw inside. The width is re-read on resize because GIS renders at a
 * fixed pixel width rather than stretching.
 */
/** Google's four-colour "G", inline so no external asset is required. */
function GoogleGlyph() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 7.9-21l5.7-5.7A20 20 0 1 0 24 44a20 20 0 0 0 19.6-23.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8A12 12 0 0 1 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7A20 20 0 0 0 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

export function GoogleSignInButton() {
  const t = useTranslations("Auth.Google");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const scriptReady = useGsiScript();

  const callbackUrl = searchParams.get("callback");

  const handleCredential = useCallback(
    (response: CredentialResponse) => {
      startTransition(async () => {
        const result = await googleLoginAction(response.credential ?? "");

        if (result.status === "success" && result.data) {
          setAuth(result.data);
          if (result.created) {
            trackSignUp({ method: "google" });
          }
          trackLogin({ method: "google" });
          toast.success(result.message, { id: "google-login" });

          // A full document navigation, not router.push. The session cookies
          // were just set by the server action, and this runs after an await
          // inside a transition - by then the transition scope has ended and
          // the client-side push is dropped, which left the user sitting on
          // the login page with a success toast. Reloading also guarantees
          // every server component re-renders with the new session.
          window.location.assign(callbackUrl || "/");
        } else {
          toast.error(result.message);
        }
      });
    },
    [callbackUrl, setAuth]
  );

  useEffect(() => {
    if (!scriptReady || !containerRef.current || !window.google) return;

    const container = containerRef.current;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredential,
      ux_mode: "popup",
    });

    const render = () => {
      container.innerHTML = "";
      // `width` must be a number of pixels - GIS ignores percentages and caps
      // at 400. Render at the wrapper's width so the real (invisible) button
      // covers our visible one exactly.
      const width = Math.min(
        400,
        Math.round(container.getBoundingClientRect().width) || 320
      );
      window.google?.accounts.id.renderButton(container, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        logo_alignment: "left",
        locale,
        width,
      });
    };

    render();
    window.addEventListener("resize", render);
    return () => window.removeEventListener("resize", render);
  }, [scriptReady, handleCredential, locale]);

  // Without a client ID there is nothing to sign in with - render nothing
  // rather than a button that can only fail.
  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-[11px] uppercase tracking-widest text-white/35">{t("divider")}</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      {/*
        Google draws into a cross-origin iframe we cannot restyle, and once the
        visitor has a live Google session it switches to a personalised card
        ("Continue as Ali") on a white background that ignores `filled_black`
        entirely. So we draw our own button and lay Google's real one over it,
        invisible but still the thing being clicked - their script sees a
        genuine click on their own button, and the page keeps its dark theme.
      */}
      <div className="relative h-11 w-full" aria-busy={isPending}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center gap-3
                     rounded-md border border-white/15 bg-white/5 px-4
                     text-[13px] font-semibold tracking-wide text-white
                     transition-colors duration-150"
        >
          <GoogleGlyph />
          <span>{t("continueWith")}</span>
        </div>

        <div
          ref={containerRef}
          className="absolute inset-0 z-10 overflow-hidden opacity-0
                     [color-scheme:light] [&>div]:!w-full [&_iframe]:!w-full"
        />
      </div>

      {isPending && (
        <p className="text-center text-[12px] text-white/45">{t("signingIn")}</p>
      )}
    </div>
  );
}
