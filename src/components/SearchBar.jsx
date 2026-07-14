import React from "react";
import { Search, Heart } from "lucide-react";

export default function SearchBar({
  searchQuery,
  onSearchChange,
  showOnlyFavorites,
  onToggleShowFavorites,
  favoritesCount,
}) {
  return (
    <div className="mb-6 max-w-xl mx-auto flex flex-col xs:flex-row gap-2.5 items-stretch px-1">
      {/* Custom input container */}
      <div className="relative group flex-1">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-pink-500 transition-colors duration-200">
          <Search className="w-4.5 h-4.5" />
        </span>
        <input
          type="text"
          placeholder="Search title or artist..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-pink-500/80 focus:ring-1 focus:ring-pink-500/20 transition-all text-sm sm:text-base"
        />
      </div>

      {/* Tap-friendly Liked/Favorite Button */}
      <button
        onClick={onToggleShowFavorites}
        className={`px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all duration-350 active:scale-95 cursor-pointer text-sm sm:text-base ${
          showOnlyFavorites
            ? "bg-pink-600 border-pink-500 text-white shadow-[0_0_15px_rgba(219,39,119,0.3)]"
            : "bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:text-zinc-200"
        }`}
      >
        <Heart
          className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${showOnlyFavorites ? "fill-white text-white" : ""}`}
        />
        <span className="whitespace-nowrap">Liked ({favoritesCount})</span>
      </button>
    </div>
  );
}
