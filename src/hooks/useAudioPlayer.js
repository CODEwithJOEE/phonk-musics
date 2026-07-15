import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Owns playback state and wires it up to the actual <audio> element.
 * Now manages a synchronized volume level state.
 */
export function useAudioPlayer(playlist) {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8); // Default volume at 80%
  const audioRef = useRef(null);

  // Keep the <audio> element's play/pause state in sync with isPlaying.
  useEffect(() => {
    if (!currentSong || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.warn("Playback interrupted:", err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong]);

  // Synchronize volume adjustments with the HTML5 audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume, currentSong]); // Runs on volume changes or when a new track mounts

  const playSong = useCallback(
    (song) => {
      if (currentSong?.id === song.id) {
        setIsPlaying((prev) => !prev);
      } else {
        setCurrentSong(song);
        setIsPlaying(true);
      }
    },
    [currentSong],
  );

  const playNext = useCallback(() => {
    if (playlist.length === 0) return;
    const currentIndex = playlist.findIndex((s) => s.id === currentSong?.id);
    const nextIndex =
      currentIndex !== -1 && currentIndex < playlist.length - 1
        ? currentIndex + 1
        : 0;
    setCurrentSong(playlist[nextIndex]);
    setIsPlaying(true);
  }, [playlist, currentSong]);

  const playPrevious = useCallback(() => {
    if (playlist.length === 0) return;
    const currentIndex = playlist.findIndex((s) => s.id === currentSong?.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
    setCurrentSong(playlist[prevIndex]);
    setIsPlaying(true);
  }, [playlist, currentSong]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Media Session metadata matching native platform features
  useEffect(() => {
    if (!("mediaSession" in navigator) || !currentSong) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title,
      artist: currentSong.artist,
      album: "Phonk Hub",
      artwork: [
        { src: currentSong.coverUrl, sizes: "512x512", type: "image/jpeg" },
      ],
    });

    navigator.mediaSession.setActionHandler("play", () => setIsPlaying(true));
    navigator.mediaSession.setActionHandler("pause", () => setIsPlaying(false));
    navigator.mediaSession.setActionHandler("previoustrack", playPrevious);
    navigator.mediaSession.setActionHandler("nexttrack", playNext);

    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [currentSong, isPlaying, playNext, playPrevious]);

  return {
    audioRef,
    currentSong,
    isPlaying,
    volume,
    setVolume,
    playSong,
    playNext,
    playPrevious,
    togglePlayPause,
  };
}
