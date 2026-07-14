import React from "react";
import { Disc } from "lucide-react";
import SongCard from "./SongCard";

export default function SongGrid({
  songs,
  favorites,
  onToggleFavorite,
  currentSong,
  isPlaying,
  onPlaySong,
}) {
  if (songs.length === 0) {
    return (
      <div className="text-center py-20 bg-zinc-900/20 border border-zinc-900/50 rounded-2xl backdrop-blur-sm max-w-md mx-auto flex flex-col items-center">
        <Disc className="w-12 h-12 text-zinc-700 mb-4 animate-spin-slow" />
        <h3 className="text-lg font-bold text-zinc-400">No tracks found</h3>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {songs.map((song) => (
        <SongCard
          key={song.id}
          song={song}
          isFavorite={favorites.includes(song.id)}
          onToggleFavorite={onToggleFavorite}
          currentSong={currentSong}
          isPlaying={isPlaying}
          onPlaySong={onPlaySong}
        />
      ))}
    </div>
  );
}
