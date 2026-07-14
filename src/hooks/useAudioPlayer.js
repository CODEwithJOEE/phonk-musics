import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Owns playback state and wires it up to:
 *  - the actual <audio> element (via audioRef)
 *  - the OS-level Media Session API, so lock-screen / notification-shade /
 *    headphone controls and background playback work like a native app.
 *
 * `playlist` is the list playback should step through with next/previous —
 * pass the currently *filtered* song list so skip controls stay in sync
 * with whatever the user is looking at.
 */
export function useAudioPlayer(playlist) {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Keep the <audio> element's play/pause state in sync with isPlaying.
  useEffect(() => {
    if (!currentSong || !audioRef.current) return;

    if (isPlaying) {
      // play() returns a promise that rejects if playback is interrupted
      // (e.g. user skips tracks quickly) — swallow that expected case.
      audioRef.current.play().catch((err) => {
        console.warn("Playback interrupted:", err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong]);

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

  // Media Session: lets lock screen / notification shade / earbuds control
  // playback, and shows the track's title, artist and artwork there too.
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
    playSong,
    playNext,
    playPrevious,
    togglePlayPause,
  };
}
