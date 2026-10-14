import React, { useEffect, useMemo, useState } from "react";
import { songs, categories } from "./data/songs";
import { useFavorites } from "./hooks/useFavorites";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import CategoryFilter from "./components/CategoryFilter";
import SongGrid from "./components/SongGrid";
import PlayerBar from "./components/PlayerBar";

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const { favorites, toggleFavorite } = useFavorites();

  const filteredSongs = useMemo(() => {
    const cleanQuery = searchQuery.toLowerCase().trim();

    return songs.filter((song) => {
      const matchesFavorites =
        !showOnlyFavorites || favorites.includes(song.id);
      const matchesCategory =
        selectedCategory === "All" || song.category === selectedCategory;
      const matchesSearch =
        song.title.toLowerCase().includes(cleanQuery) ||
        song.artist.toLowerCase().includes(cleanQuery);

      return matchesFavorites && matchesCategory && matchesSearch;
    });
  }, [searchQuery, showOnlyFavorites, favorites, selectedCategory]);

  const {
    audioRef,
    currentSong,
    isPlaying,
    volume,
    setVolume,
    shuffle,
    toggleShuffle,
    loop,
    cycleLoop,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    seek,
    playSong,
    playNext,
    playPrevious,
    togglePlayPause,
    handleEnded,
  } = useAudioPlayer(filteredSongs);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT") return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlayPause();
      }
      if (e.code === "ArrowRight") playNext();
      if (e.code === "ArrowLeft") playPrevious();
      if (e.code === "KeyS") toggleShuffle();
      if (e.code === "KeyL") cycleLoop();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlayPause, playNext, playPrevious, toggleShuffle, cycleLoop]);

  return (
    <div
      className="min-h-screen bg-zinc-950 text-zinc-100 relative pb-28 sm:pb-32 selection:bg-pink-500 selection:text-white overflow-x-hidden bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/background-image.png')" }}
    >
      {/* Background Music Engine */}
      <audio
        ref={audioRef}
        src={currentSong?.audioUrl || ""}
        preload="metadata"
        onEnded={handleEnded}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
      />

      {/* Fixed Dark Overlay */}
      <div className="fixed inset-0 bg-black/55 pointer-events-none z-0" />

      {/* Ambient neon accents */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-pink-600/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        <Header />

        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showOnlyFavorites={showOnlyFavorites}
          onToggleShowFavorites={() => setShowOnlyFavorites((prev) => !prev)}
          favoritesCount={favorites.length}
        />

        <div className="flex justify-center mb-8 sm:mb-10">
          <CategoryFilter
            categories={categories}
            activeCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        <SongGrid
          songs={filteredSongs}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          currentSong={currentSong}
          isPlaying={isPlaying}
          onPlaySong={playSong}
        />
      </div>

      <PlayerBar
        currentSong={currentSong}
        isPlaying={isPlaying}
        hasMultipleTracks={filteredSongs.length > 1}
        volume={volume}
        onVolumeChange={setVolume}
        shuffle={shuffle}
        onToggleShuffle={toggleShuffle}
        loop={loop}
        onCycleLoop={cycleLoop}
        currentTime={currentTime}
        duration={duration}
        onSeek={seek}
        onTogglePlayPause={togglePlayPause}
        onNext={() => playNext()}
        onPrevious={playPrevious}
      />
    </div>
  );
}
