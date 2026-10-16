import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQueue(playlist, shuffleOn, currentSongId) {
  if (!shuffleOn) return playlist;
  if (!currentSongId) return shuffleArray(playlist);
  const current = playlist.find((s) => s.id === currentSongId);
  if (!current) return shuffleArray(playlist);
  const rest = playlist.filter((s) => s.id !== currentSongId);
  return [current, ...shuffleArray(rest)];
}

function warmAudioCache(url) {
  if (!url || !("serviceWorker" in navigator)) return;
  fetch(url, { cache: "no-store" }).catch(() => {});
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
  const loadedUrlRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffleEpoch, setShuffleEpoch] = useState(0);

  // Persist preferences
  useEffect(() => {
    try {
      localStorage.setItem("phonk_shuffle", String(shuffle));
    } catch {}
  }, [shuffle]);

  useEffect(() => {
    try {
      localStorage.setItem("phonk_loop", loop);
    } catch {}
  }, [loop]);

  useEffect(() => {
    try {
      localStorage.setItem("phonk_volume", volume.toString());
    } catch {}
  }, [volume]);

  // Intentionally NOT depending on currentSong.id — we don't want the queue
  // to re-shuffle every time the user clicks next.
  const queue = useMemo(
    () => buildQueue(playlist, shuffle, currentSong?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playlist, shuffle, shuffleEpoch],
  );

  // ---- Load source only when the SONG actually changes -------------------
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (loadedUrlRef.current !== currentSong.audioUrl) {
      loadedUrlRef.current = currentSong.audioUrl;
      audio.src = currentSong.audioUrl;
      audio.load();
      warmAudioCache(currentSong.audioUrl);
    }

    setCurrentTime(0);
    setDuration(0);
  }, [currentSong]);

  // ---- Play / pause -------------------------------------------------------
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isPlaying) {
      const p = audio.play();
      if (p) {
        p.catch((err) => {
          // AbortError = another load/pause interrupted this play. Ignore.
          if (err.name === "AbortError") return;
          // Autoplay blocked.
          if (err.name === "NotAllowedError") {
            setIsPlaying(false);
            return;
          }
          console.warn("Playback error:", err);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong]);

  // Live volume sync
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  // ---- Preload next track (SW-cached) ------------------------------------
  useEffect(() => {
    if (!currentSong || queue.length === 0) return;

    const idx = queue.findIndex((s) => s.id === currentSong.id);
    const next = queue[idx + 1];
    if (!next) return;

    warmAudioCache(next.audioUrl);
  }, [currentSong, queue]);

  // ---- Controls ----------------------------------------------------------
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
      const auto = opts.auto === true;
      if (queue.length === 0) return;

      if (auto && loop === "one" && currentSong && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
        return;
      }

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

      if (auto && loop === "off" && (isLast || currentIndex === -1)) {
        setIsPlaying(false);
        return;
      }

      let nextIndex;
      if (currentIndex !== -1 && !isLast) {
        nextIndex = currentIndex + 1;
      } else {
        nextIndex = 0;
        if (shuffle) setShuffleEpoch((n) => n + 1);
      }

      setCurrentSong(queue[nextIndex]);
      setIsPlaying(true);
    },
    [queue, currentSong, loop, shuffle],
  );

  const playPrevious = useCallback(() => {
    if (queue.length === 0) return;

    if (queue.length === 1) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      setIsPlaying(true);
      return;
    }

    const currentIndex = queue.findIndex((s) => s.id === currentSong?.id);

    // Current song isn't in queue → start from the top.
    if (currentIndex === -1) {
      setCurrentSong(queue[0]);
      setIsPlaying(true);
      return;
    }

    // loop off + first song → restart it.
    if (loop === "off" && currentIndex === 0 && audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(true);
      return;
    }

    const prevIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1;
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

  const handleEnded = useCallback(() => {
    playNext({ auto: true });
  }, [playNext]);

  // ---- Media Session -----------------------------------------------------
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
  }, [currentSong, playNext, playPrevious]);

  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    }
  }, [isPlaying]);

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
