import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Fisher-Yates shuffle (in place) — unbiased, O(n).
 */
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Builds the active playback order.
 * - Shuffle off  → the playlist, as-is.
 * - Shuffle on   → shuffled, but the current song is hoisted to index 0
 *                  so playback continues from where the user is.
 */
function buildQueue(playlist, shuffleOn, currentSongId) {
  if (!shuffleOn) return playlist;
  if (!currentSongId) return shuffleArray(playlist);
  const current = playlist.find((s) => s.id === currentSongId);
  if (!current) return shuffleArray(playlist);
  const rest = playlist.filter((s) => s.id !== currentSongId);
  return [current, ...shuffleArray(rest)];
}

export function useAudioPlayer(playlist) {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [shuffle, setShuffle] = useState(() => {
    try {
      return localStorage.getItem("phonk_shuffle") === "true";
    } catch {
      return false;
    }
  });

  // loop: "off" | "on" | "one"
  const [loop, setLoop] = useState(() => {
    try {
      const saved = localStorage.getItem("phonk_loop");
      return saved === "off" || saved === "one" || saved === "on"
        ? saved
        : "on";
    } catch {
      return "on";
    }
  });

  const [volume, setVolume] = useState(() => {
    try {
      const saved = parseFloat(localStorage.getItem("phonk_volume"));
      return Number.isFinite(saved) ? saved : 0.8;
    } catch {
      return 0.8;
    }
  });

  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Counter that bumps when the shuffled queue completes a full cycle.
  // Bumping it forces the queue memo to rebuild → fresh shuffle.
  const [shuffleEpoch, setShuffleEpoch] = useState(0);

  // Persist preferences
  useEffect(() => {
    try {
      localStorage.setItem("phonk_shuffle", String(shuffle));
    } catch {
      /* ignore */
    }
  }, [shuffle]);

  useEffect(() => {
    try {
      localStorage.setItem("phonk_loop", loop);
    } catch {
      /* ignore */
    }
  }, [loop]);

  useEffect(() => {
    try {
      localStorage.setItem("phonk_volume", volume.toString());
    } catch {
      /* ignore */
    }
  }, [volume]);

  // ---- Playback order -----------------------------------------------------
  const queue = useMemo(
    () => buildQueue(playlist, shuffle, currentSong?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playlist, shuffle, shuffleEpoch],
  );

  // ---- Audio element sync -------------------------------------------------
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    audio.volume = volume;
    audio.load();

    if (isPlaying) {
      audio.play().catch((err) => {
        if (err.name === "AbortError") {
          audio.addEventListener(
            "canplay",
            () => audio.play().catch(() => {}),
            { once: true },
          );
        } else {
          console.warn("Playback interrupted:", err);
        }
      });
    } else {
      audio.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentSong]);

  // Live volume sync
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume, currentSong]);

  // Preload next track — respects the active queue.
  useEffect(() => {
    if (!currentSong || queue.length === 0) return;

    const idx = queue.findIndex((s) => s.id === currentSong.id);
    const next = queue[idx + 1];
    if (!next) return; // don't preload anything if we're at the tail

    const preload = new Audio();
    preload.preload = "auto";
    preload.src = next.audioUrl;
    preload.load();

    return () => {
      preload.src = "";
    };
  }, [currentSong, queue]);

  // Reset timer when song changes
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
  }, [currentSong]);

  // ---- Controls -----------------------------------------------------------
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

  const playNext = useCallback(
    (opts = {}) => {
      // opts.auto = true means it was triggered by onEnded (natural end)
      const auto = opts.auto === true;

      if (queue.length === 0) return;

      // Repeat ONE: restart the same song (only when triggered by natural end)
      if (auto && loop === "one" && currentSong && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
        return;
      }

      // Single-track queue → restart the same song
      if (queue.length === 1) {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
        setIsPlaying(true);
        return;
      }

      const currentIndex = queue.findIndex((s) => s.id === currentSong?.id);
      const isLast = currentIndex === queue.length - 1;

      // Loop OFF + we're at the last song (or current song isn't in queue
      // and the user manually hit next → play first) → stop.
      if (auto && loop === "off" && (isLast || currentIndex === -1)) {
        setIsPlaying(false);
        return;
      }

      let nextIndex;
      if (currentIndex !== -1 && !isLast) {
        nextIndex = currentIndex + 1;
      } else {
        // Wrapping around
        nextIndex = 0;
        if (shuffle) {
          // Force a fresh shuffle for the next full cycle
          setShuffleEpoch((n) => n + 1);
        }
      }

      setCurrentSong(queue[nextIndex]);
      setIsPlaying(true);
    },
    [queue, currentSong, loop, shuffle],
  );

  const playPrevious = useCallback(() => {
    if (queue.length === 0) return;

    // Single-track queue → restart
    if (queue.length === 1) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      setIsPlaying(true);
      return;
    }

    const currentIndex = queue.findIndex((s) => s.id === currentSong?.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1;

    // If loop is off and we're at the very first song, restart it from 0
    // instead of wrapping backward.
    if (loop === "off" && currentIndex <= 0 && audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(true);
      return;
    }

    setCurrentSong(queue[prevIndex]);
    setIsPlaying(true);
  }, [queue, currentSong, loop]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => !prev);
  }, []);

  const cycleLoop = useCallback(() => {
    setLoop((prev) => (prev === "on" ? "one" : prev === "one" ? "off" : "on"));
  }, []);

  const seek = useCallback((time) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  /**
   * onEnded handler wired to the <audio> element.
   * Delegates to playNext with auto: true so loop/repeat logic kicks in.
   */
  const handleEnded = useCallback(() => {
    playNext({ auto: true });
  }, [playNext]);

  // ---- Media Session ------------------------------------------------------
  useEffect(() => {
    if (!("mediaSession" in navigator) || !currentSong) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title,
      artist: currentSong.artist,
      album: "Phonk Hub",
      artwork: [{ src: currentSong.coverUrl, sizes: "512x512" }],
    });

    navigator.mediaSession.setActionHandler("play", () => setIsPlaying(true));
    navigator.mediaSession.setActionHandler("pause", () => setIsPlaying(false));
    navigator.mediaSession.setActionHandler("previoustrack", playPrevious);
    navigator.mediaSession.setActionHandler("nexttrack", () => playNext());

    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [currentSong, isPlaying, playNext, playPrevious]);

  return {
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
  };
}
