import { useRef, useState } from "react";
import { Download, Check, Loader2, X } from "lucide-react";
import { songs } from "../data/songs";

export default function DownloadAllButton() {
  const [state, setState] = useState("idle"); // idle | loading | done | partial
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ succeeded: 0, failed: 0 });
  const controllerRef = useRef(null);

  async function handleDownload() {
    if (state === "loading") return;

    // Request persistent storage (best-effort)
    if (navigator.storage?.persist) {
      try {
        await navigator.storage.persist();
      } catch {}
    }

    controllerRef.current = new AbortController();
    const { signal } = controllerRef.current;

    setState("loading");
    setProgress(0);
    setStats({ succeeded: 0, failed: 0 });

    let succeeded = 0;
    let failed = 0;

    for (let i = 0; i < songs.length; i++) {
      if (signal.aborted) break;
      const song = songs[i];
      try {
        const audioRes = await fetch(song.audioUrl, {
          cache: "no-store",
          signal,
        });
        if (!audioRes.ok) throw new Error("audio failed");
        await fetch(song.coverUrl, { cache: "no-store", signal });
        succeeded++;
      } catch (err) {
        if (err.name === "AbortError") break;
        failed++;
      }
      setProgress((i + 1) / songs.length);
      setStats({ succeeded, failed });
    }

    if (signal.aborted) {
      setState("idle");
    } else {
      setState(failed === 0 ? "done" : "partial");
    }
  }

  function handleCancel() {
    controllerRef.current?.abort();
  }

  return (
    <button
      onClick={state === "loading" ? handleCancel : handleDownload}
      disabled={state === "done"}
      className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold hover:border-pink-500/50 disabled:opacity-60 flex items-center gap-2 transition"
      title={`~${(songs.length * 4).toFixed(0)} MB`}
    >
      {state === "idle" && (
        <>
          <Download className="w-3.5 h-3.5" /> Download all (~{songs.length * 4}
          MB)
        </>
      )}
      {state === "loading" && (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          {Math.round(progress * 100)}% · {stats.succeeded}/{songs.length}
          <X className="w-3.5 h-3.5 ml-1" />
        </>
      )}
      {state === "done" && (
        <>
          <Check className="w-3.5 h-3.5 text-pink-500" /> Ready offline
        </>
      )}
      {state === "partial" && (
        <>
          <Check className="w-3.5 h-3.5 text-yellow-500" />
          {stats.succeeded}/{songs.length} saved
        </>
      )}
    </button>
  );
}
