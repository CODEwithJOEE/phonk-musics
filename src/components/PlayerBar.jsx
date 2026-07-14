import React from "react";
import { Disc, Pause, Play, SkipBack, SkipForward } from "lucide-react";

export default function PlayerBar({
  currentSong,
  isPlaying,
  hasMultipleTracks,
  onTogglePlayPause,
  onNext,
  onPrevious,
}) {
  if (!currentSong) return null;

  return (
    <div
      /* 
        Updates:
        - Lowered background opacity to 'bg-zinc-950/40' for true transparency.
        - Kept 'backdrop-blur-xl' to give it a premium frosted glass effect.
        - Softened the top border to 'border-t border-white/5' so it doesn't look harsh.
      */
      className="fixed bottom-0 left-0 right-0 bg-zinc-950/40 backdrop-blur-xl border-t border-white/5 px-4 py-3.5 z-50 grid grid-cols-12 items-center shadow-[0_-10px_40px_rgba(0,0,0,0.8)]"
      style={{ paddingBottom: "max(0.85rem, env(safe-area-inset-bottom))" }}
    >
      {/* 
        Active song metadata 
      */}
      <div className="col-span-5 sm:col-span-4 flex items-center gap-2.5 min-w-0">
        <img
          src={currentSong.coverUrl}
          alt={currentSong.title}
          /* Updated 'rounded-lg' to 'rounded-full' for the perfect circle record shape */
          className={`w-10 h-10 rounded-full object-cover shrink-0 border border-zinc-800/80 transition-transform ${
            isPlaying ? "animate-[spin_8s_linear_infinite]" : ""
          }`}
        />
        <div className="min-w-0">
          <h4 className="text-xs sm:text-sm font-bold text-zinc-100 truncate">
            {currentSong.title}
          </h4>
          <p className="text-[10px] sm:text-xs text-zinc-400 truncate mt-0.5">
            {currentSong.artist}
          </p>
        </div>
      </div>

      {/* 
        Transport controls
      */}
      <div className="col-span-7 sm:col-span-4 flex items-center justify-center gap-4 sm:gap-6">
        <button
          onClick={onPrevious}
          disabled={!hasMultipleTracks}
          aria-label="Previous track"
          className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none active:scale-90 transition cursor-pointer"
        >
          <SkipBack className="w-4.5 h-4.5 sm:w-5 sm:h-5 fill-current" />
        </button>

        <button
          onClick={onTogglePlayPause}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="p-3 bg-white text-black rounded-full hover:scale-105 active:scale-90 transition duration-200 cursor-pointer shadow-md shrink-0"
        >
          {isPlaying ? (
            <Pause className="w-4.5 h-4.5 sm:w-5 sm:h-5 fill-black" />
          ) : (
            <Play className="w-4.5 h-4.5 sm:w-5 sm:h-5 fill-black ml-0.5" />
          )}
        </button>

        <button
          onClick={onNext}
          disabled={!hasMultipleTracks}
          aria-label="Next track"
          className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none active:scale-90 transition cursor-pointer"
        >
          <SkipForward className="w-4.5 h-4.5 sm:w-5 sm:h-5 fill-current" />
        </button>
      </div>

      {/* 
        Right side spacer/vinyl 
      */}
      <div className="hidden sm:flex col-span-4 justify-end items-center gap-2">
        <Disc
          className={`w-6 h-6 text-pink-500 ${isPlaying ? "animate-spin" : ""}`}
          style={{ animationDuration: "5s" }}
        />
      </div>
    </div>
  );
}
