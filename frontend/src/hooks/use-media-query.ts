import { useCallback, useSyncExternalStore } from "react";

function getSnapshot(query: string): boolean {
  return window.matchMedia(query).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribe(query: string, callback: () => void): () => void {
  const mediaQueryList = window.matchMedia(query);
  mediaQueryList.addEventListener("change", callback);
  return () => mediaQueryList.removeEventListener("change", callback);
}

export function useMediaQuery(query: string): boolean {
  const subscribeToQuery = useCallback(
    (callback: () => void) => subscribe(query, callback),
    [query]
  );

  const getQuerySnapshot = useCallback(() => getSnapshot(query), [query]);

  return useSyncExternalStore(
    subscribeToQuery,
    getQuerySnapshot,
    getServerSnapshot
  );
}

export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 768px)");
}
