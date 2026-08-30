export type ApiSuccess<T> = {
  ok: true;
  data: T;
  message?: string;
  status: number;
};

export type ApiFailure = {
  ok: false;
  error: string;
  message: string;
  apiErrors?: string[];
  fieldErrors?: Record<string, string[]>;
  status: number;
};

/** Discriminated union returned by every apiClient call. */
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type FetchOptions = Omit<RequestInit, "cache"> & {
  /** Override HTTP cache behaviour. Defaults to "no-store". */
  cache?: RequestCache;
  /** Next.js ISR: revalidate after N seconds. `false` keeps the response forever (force-cache). */
  revalidate?: number | false;
  /** Next.js tag-based revalidation – pair with `revalidateTag()` in server actions. */
  tags?: string[];
  /**
   * When true, a 401 response with a valid token triggers a server-side redirect to
   * /login?error=session_expired. Defaults to false so public-layout calls (cart, wishlist)
   * fall back to empty data instead of redirecting the entire page.
   */
  redirectOn401?: boolean;
};
