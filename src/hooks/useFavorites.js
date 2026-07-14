import { useEffect, useState } from "react";

const STORAGE_KEY = "phonk_hub_favorites";

/**
 * Persists favorited song ids to localStorage and keeps them in sync.
 * Guards against corrupted/foreign localStorage data so a bad value
 * there can't crash the app on load.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // Storage can be unavailable (e.g. private browsing quota) — fail silently,
      // favorites just won't persist for this session.
    }
  }, [favorites]);

  const toggleFavorite = (songId) => {
    setFavorites((prev) =>
      prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId],
    );
  };

  return { favorites, toggleFavorite };
}
