"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useInView } from "react-intersection-observer";
import type { PaginatedResponse } from "@/types";

interface InfiniteScrollProps<TItem> {
  fetchAction: (page: number, filters: Record<string, string>) => Promise<PaginatedResponse<TItem>>;
  /** When omitted, the list only resets when this component remounts (e.g. parent `key`). Pass `filters` when query params should change. */
  filters?: Record<string, string>;
  /** Pre-fetched first page — skips the initial client-side fetch and starts at page 2 on scroll. */
  initialData?: PaginatedResponse<TItem>;
  children: (items: TItem[], isLoading: boolean) => React.ReactNode;
  onCountChange?: (count: number) => void;
  loadingUI?: React.ReactNode;
  endMessage?: string | React.ReactNode;
  emptyState?: React.ReactNode;
}

interface ListState<T> {
  items: T[];
  hasMore: boolean;
  isLoading: boolean;
  hasFetched: boolean;
}

const initialState = <T,>(): ListState<T> => ({
  items: [],
  hasMore: true,
  isLoading: false,
  hasFetched: false,
});

export function InfiniteScroll<TItem>({
  fetchAction,
  filters,
  initialData,
  children,
  onCountChange,
  loadingUI,
  endMessage,
  emptyState,
}: InfiniteScrollProps<TItem>) {
  const t = useTranslations("InfiniteScroll");
  const filtersResolved = filters ?? {};
  const filtersKey = filters !== undefined ? JSON.stringify(filters) : "__nofilters__";
  const [state, setState] = useState<ListState<TItem>>(() => {
    if (initialData) {
      const more = initialData.total_pages != null
        ? 1 < initialData.total_pages
        : !!(initialData.next || initialData.links?.next);
      return { items: initialData.results, hasMore: more, isLoading: false, hasFetched: true };
    }
    return initialState<TItem>();
  });
  const [prevFiltersKey, setPrevFiltersKey] = useState(filtersKey);

  // Reset list state during render when filters change (React 19 idiomatic pattern).
  // See https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (filtersKey !== prevFiltersKey) {
    setPrevFiltersKey(filtersKey);
    setState(initialState<TItem>());
  }

  const { items, hasMore, isLoading, hasFetched } = state;

  // Refs for values needed inside async callbacks (avoids stale closures)
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(
    initialData
      ? (initialData.total_pages != null ? 1 < initialData.total_pages : !!(initialData.next || initialData.links?.next))
      : true
  );
  const pageRef = useRef(initialData ? 1 : 0);
  // True on first render when initialData was provided — skip the initial fetch.
  const skipInitialFetchRef = useRef(!!initialData);
  const initialDataRef = useRef(initialData);
  const generationRef = useRef(0);
  const isInViewRef = useRef(false);
  const filtersRef = useRef(filtersResolved);
  const fetchActionRef = useRef(fetchAction);
  const onCountChangeRef = useRef(onCountChange);

  // Sync the latest props/closures into refs after render commit.
  // React 19 / React Compiler forbid mutating refs during render.
  useEffect(() => {
    filtersRef.current = filtersResolved;
    fetchActionRef.current = fetchAction;
    onCountChangeRef.current = onCountChange;
  });

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMoreRef.current) return;

    const gen = generationRef.current;
    const nextPage = pageRef.current + 1;

    isLoadingRef.current = true;
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const res = await fetchActionRef.current(nextPage, filtersRef.current);
      if (gen !== generationRef.current) return;

      pageRef.current = nextPage;

      const more =
        res.total_pages != null
          ? nextPage < res.total_pages
          : !!(res.next || res.links?.next);
      hasMoreRef.current = more;

      setState((prev) => ({
        items: nextPage === 1 ? res.results : [...prev.items, ...res.results],
        hasMore: more,
        isLoading: false,
        hasFetched: true,
      }));

      isLoadingRef.current = false;
      onCountChangeRef.current?.(res.count);
    } catch {
      if (gen === generationRef.current) {
        isLoadingRef.current = false;
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    }
  }, []);

  // Reset refs and fetch page 1 whenever filters change.
  // State reset happens above during render; refs are reset here in an effect.
  useEffect(() => {
    generationRef.current++;
    isLoadingRef.current = false;

    if (skipInitialFetchRef.current) {
      // First mount with initialData: skip the fetch and report the pre-fetched count.
      skipInitialFetchRef.current = false;
      onCountChangeRef.current?.(initialDataRef.current?.count ?? 0);
      initialDataRef.current = undefined;
      return;
    }

    hasMoreRef.current = true;
    pageRef.current = 0;
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  // Trigger 2: when a page finishes loading and sentinel is still visible, fetch next
  useEffect(() => {
    if (!isLoading && hasMore && isInViewRef.current) {
      loadMore();
    }
  }, [isLoading, hasMore, loadMore]);

  // Trigger 1: when sentinel scrolls into viewport, fetch next
  const { ref: sentinelRef } = useInView({
    onChange: (inView) => {
      isInViewRef.current = inView;
      if (inView) loadMore();
    },
    rootMargin: "600px",
  });

  const isEmpty = !isLoading && hasFetched && items.length === 0;

  return (
    <div>
      {isEmpty ? (
        emptyState ?? (
          <p className="text-center py-12 font-chillax text-sm text-muted-foreground">
            {t("noItemsFound")}
          </p>
        )
      ) : (
        children(items, isLoading)
      )}

      {/* Sentinel: fires 600 px before viewport. Keeps a min-height while more
          pages exist so the footer can never peek through before items load. */}
      {hasMore && (
        <div
          ref={sentinelRef}
          aria-hidden="true"
          className={!isLoading ? "h-2" : undefined}
        />
      )}

      {isLoading && loadingUI !== null &&
        (loadingUI ?? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
          </div>
        ))}

      {!hasMore && items.length > 0 && (
        <div className="py-8 text-center font-chillax text-sm text-muted-foreground">
          {endMessage ?? t("noMoreItems")}
        </div>
      )}
    </div>
  );
}
