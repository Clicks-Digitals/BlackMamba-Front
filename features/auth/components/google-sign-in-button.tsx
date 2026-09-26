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
      // Google draws into its own cross-origin iframe, so these options and the
      // wrapper below are the only styling available. `width` must be a number
      // of pixels - GIS ignores percentages and caps at 400.
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

      {/* The iframe carries its own focus ring and a light default corner, so
          the wrapper squares the corners, suppresses the stray outline and
          holds the row height steady while Google's script loads. */}
      <div
        ref={containerRef}
        aria-busy={isPending}
        className="flex h-11 w-full items-center justify-center overflow-hidden rounded-md
                   [&_iframe]:!mx-auto [&_iframe]:!my-0 [&>div]:w-full
                   [&_*]:!outline-none [&_*]:!rounded-md"
      />

      {isPending && (
        <p className="text-center text-[12px] text-white/45">{t("signingIn")}</p>
      )}
    </div>
  );
}
