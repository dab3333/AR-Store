import { createContext, useContext, useState, useCallback, useMemo } from "react";

const LikesContext = createContext(null);
const STORAGE_KEY = "arstore_likes";

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function LikesProvider({ children }) {
  const [likedIds, setLikedIds] = useState(readStored);

  const persist = useCallback((next) => {
    setLikedIds(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      // localStorage unavailable (private mode, etc.) - liked state just won't persist
    }
  }, []);

  const isLiked = useCallback((productId) => likedIds.has(productId), [likedIds]);

  const toggleLike = useCallback(
    (productId) => {
      const next = new Set(likedIds);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      persist(next);
    },
    [likedIds, persist]
  );

  const value = useMemo(
    () => ({ isLiked, toggleLike, likedIds }),
    [isLiked, toggleLike, likedIds]
  );

  return <LikesContext.Provider value={value}>{children}</LikesContext.Provider>;
}

export function useLikes() {
  const ctx = useContext(LikesContext);
  if (!ctx) throw new Error("useLikes must be used within LikesProvider");
  return ctx;
}
