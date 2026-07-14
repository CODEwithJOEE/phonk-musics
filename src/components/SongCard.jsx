import React from "react";
import { Play, Pause, Heart } from "lucide-react";

export default function SongCard({
  song,
  isFavorite,
  onToggleFavorite,
  currentSong,
  isPlaying,
  onPlaySong,
}) {
  const isCurrent = currentSong?.id === song.id;
  const isCurrentPlaying = isCurrent && isPlaying;

  return (
    <div
      /* 
        Updates:
        - Switched background to 'bg-white/[0.03]' and 'backdrop-blur-lg' for glassmorphism.
        - Replaced dark border with 'border-white/10' which acts as a sleek light-catcher.
        - Hover state now gets a slightly brighter background 'hover:bg-white/[0.07]'.
      */
      className="group relative bg-white/[0.03] backdrop-blur-lg border border-white/10 rounded-2xl p-2.5 sm:p-4 hover:bg-white/[0.07] hover:border-pink-500/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col justify-between"
    >
      {/* Album Cover Art */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black/40 border border-white/5 mb-2.5 sm:mb-4">
        <img
          src={song.coverUrl}
          alt={song.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Glassmorphic play overlay */}
        <div
          onClick={() => onPlaySong(song)}
          className={`absolute inset-0 bg-black/40 sm:bg-black/60 flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-350 cursor-pointer ${
            isCurrentPlaying ? "opacity-100" : "opacity-0 sm:opacity-0"
          }`}
        >
          <div className="p-3 bg-pink-600 text-white rounded-full transform scale-90 active:scale-75 sm:scale-100 sm:group-hover:scale-110 transition shadow-lg">
            {isCurrentPlaying ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white ml-0.5" />
            )}
          </div>
        </div>

        {/* Floating Active Pulse Dot */}
        {isCurrentPlaying && (
          <div className="absolute top-2.5 right-2.5 bg-pink-600/90 backdrop-blur-sm p-1.5 rounded-full shadow-lg">
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
            </span>
          </div>
        )}
      </div>

      {/* Title, Artist and Heart Favorite */}
      <div className="flex items-center justify-between gap-1.5 mt-auto">
        <div className="overflow-hidden flex-1">
          <h3
            className={`text-sm sm:text-base font-bold truncate transition-colors duration-200 ${
              isCurrent
                ? "text-pink-500"
                : "text-zinc-100 group-hover:text-pink-500"
            }`}
          >
            {song.title}
          </h3>
          <p className="text-[11px] sm:text-xs text-zinc-400 truncate mt-0.5">
            {song.artist}
          </p>
        </div>

        <button
          onClick={() => onToggleFavorite(song.id)}
          className="p-2 rounded-lg hover:bg-white/10 active:scale-90 transition-all cursor-pointer shrink-0"
          aria-label="Favorite button"
        >
          <Heart
            className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-all duration-200 ${
              isFavorite
                ? "fill-pink-500 text-pink-500 scale-110"
                : "text-zinc-500 hover:text-pink-400"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
