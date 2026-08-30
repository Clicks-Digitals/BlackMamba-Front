import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { API_CONFIG } from "./config";
import type { ApiResponse, FetchOptions } from "./types";

/** Recursively flattens nested error objects to dot-notation keys. */
function flattenErrors(errors: unknown, prefix = ""): Record<string, string[]> {
  if (!errors || typeof errors !== "object" || Array.isArray(errors)) return {};
  const result: Record<string, string[]> = {};
  for (const [key, val] of Object.entries(errors as Record<string, unknown>)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(val)) {
      result[fullKey] = val.map(String);
    } else if (val !== null && typeof val === "object") {
      Object.assign(result, flattenErrors(val, fullKey));
    } else if (typeof val === "string") {
      result[fullKey] = [val];
    }
  }
  return result;
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { tags, revalidate, cache, redirectOn401 = false, headers: customHeaders, ...rest } = options;

  if (!API_CONFIG.baseUrl || !/^https?:\/\//i.test(API_CONFIG.baseUrl)) {
    return {
      ok: false,
      error: "API is not configured.",
      message: "API is not configured. Set BACK_API_URL or API_BASE_URL in .env.",
      status: 0
    };
  }

  const hasNextOptions = tags !== undefined || revalidate !== undefined;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const cartToken = cookieStore.get("cart_token")?.value;
  const locale = cookieStore.get("NEXT_LOCALE")?.value ?? "en";
  const currency = cookieStore.get("NEXT_CURRENCY")?.value ?? "JOD";

  const baseHeaders: Record<string, string> = {
    ...API_CONFIG.headers,
    "Accept-Language": locale,
    "X-Currency": currency
  };

  if (rest.body instanceof FormData) {
    delete baseHeaders["Content-Type"];
  }

  const fetchOptions: RequestInit & {
    next?: { tags?: string[]; revalidate?: number | false };
  } = {
    headers: {
      ...baseHeaders,
      ...(customHeaders as Record<string, string>),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(cartToken ? { "X-Cart-Token": cartToken } : {})
    },
    ...(hasNextOptions
      ? {
          next: {
            ...(tags !== undefined && { tags }),
            ...(revalidate !== undefined && { revalidate })
          }
        }
      : { cache: cache ?? API_CONFIG.defaultCache }),
    ...rest,
    signal: rest.signal ?? AbortSignal.timeout(8_000)
  };

  try {
    const res = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, fetchOptions);
    if (res.status === 401 && token && redirectOn401) {
      const headerList = await headers();
      const referer = headerList.get("referer") || "/";
      redirect(`/login?error=session_expired&callback=${encodeURIComponent(referer)}`);
    }

    if (!res.ok) {
      let error = "Something went wrong. Please try again later.";
      let apiErrors: string[] | undefined;
      let fieldErrors: Record<string, string[]> | undefined;

      const skipKeys = new Set([
        "message",
        "detail",
        "error",
        "success",
        "data",
        "status",
        "code",
        "non_field_errors"
      ]);

      try {
        const body = await res.json();
        const apiError = body?.message || body?.detail || body?.error;
        if (typeof apiError === "string" && apiError.length > 0) {
          error = apiError;
        } else if (body && typeof body === "object") {
          const raw = body as Record<string, unknown>;
          const nonField = raw.non_field_errors;
          if (Array.isArray(nonField) && nonField.length > 0) {
            error = String(nonField[0]);
          } else {
            const firstKey = Object.keys(raw)[0];
            const firstVal = firstKey ? raw[firstKey] : undefined;
            if (Array.isArray(firstVal) && firstVal.length > 0) {
              error = String(firstVal[0]);
            }
          }
        }

        if (body?.errors && typeof body.errors === "object") {
          fieldErrors = flattenErrors(body.errors);
        }

        if (body && typeof body === "object") {
          const rootCandidates = Object.fromEntries(
            Object.entries(body as Record<string, unknown>).filter(
              ([k, v]) =>
                !skipKeys.has(k) &&
                (Array.isArray(v) || (v !== null && typeof v === "object" && !Array.isArray(v)))
            )
          );
          if (Object.keys(rootCandidates).length > 0) {
            fieldErrors = { ...fieldErrors, ...flattenErrors(rootCandidates) };
          }
        }

        if (fieldErrors && Object.keys(fieldErrors).length > 0) {
          apiErrors = Object.values(fieldErrors).flat();
        }
      } catch {
        // use default message
      }
      return { ok: false, error, message: error, apiErrors, fieldErrors, status: res.status };
    }

    let body: unknown;
    const text = await res.text();
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        return { ok: true, data: text as unknown as T, status: res.status };
      }
    }

    if (body !== null && typeof body === "object" && "success" in body) {
      const envelope = body as unknown as { data: T; message: string };
      return {
        ok: true,
        data: envelope.data,
        message: envelope.message,
        status: res.status
      };
    }

    return { ok: true, data: body as T, status: res.status };
  } catch (err) {
    if (
      err !== null &&
      typeof err === "object" &&
      "digest" in err &&
      typeof (err as { digest: unknown }).digest === "string" &&
      ((err as { digest: string }).digest.startsWith("NEXT_REDIRECT") ||
        (err as { digest: string }).digest.startsWith("NEXT_NOT_FOUND"))
    ) {
      throw err;
    }

    if (
      err instanceof Error &&
      (err.message === "NEXT_REDIRECT" || err.message === "NEXT_NOT_FOUND")
    ) {
      throw err;
    }

    return {
      ok: false,
      error: "Unable to connect. Please check your internet connection or try again later.",
      message: "Unable to connect. Please check your internet connection or try again later.",
      status: 0
    };
  }
}
