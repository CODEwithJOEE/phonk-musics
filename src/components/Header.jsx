import React from "react";

export default function Header() {
  return (
    <header className="text-center mb-10 sm:mb-12 flex flex-col items-center">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-200 to-pink-500 bg-clip-text text-transparent">
        PHONK<span className="text-pink-500">.</span>HUB
      </h1>
      <p className="text-xs text-zinc-500 mt-2 tracking-widest uppercase">
        Curated Underground Beats
      </p>
    </header>
  );
}
