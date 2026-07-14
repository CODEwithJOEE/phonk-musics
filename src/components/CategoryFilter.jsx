import React from "react";
import { Radio } from "lucide-react";

export default function CategoryFilter({
  categories,
  activeCategory,
  onSelectCategory,
}) {
  return (
    /* 
      We wrap the swiper inside an 'w-full overflow-hidden' container.
      This acts as a safety shield, stopping negative margins from spilling
      beyond the layout screen boundaries.
    */
    <div className="w-full overflow-hidden py-1">
      <div className="w-full overflow-x-auto no-scrollbar flex gap-2 pb-3 px-4 -mx-4 sm:mx-0 sm:px-0 sm:pb-0 sm:flex-wrap sm:justify-center scroll-smooth snap-x">
        {categories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-xs sm:text-sm tracking-wide transition-all duration-300 transform active:scale-95 shrink-0 snap-start cursor-pointer ${
                isActive
                  ? "bg-pink-600 text-white shadow-[0_0_15px_rgba(219,39,119,0.5)] border border-pink-500"
                  : "bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-800/80"
              }`}
            >
              {category === "All" && <Radio className="w-3.5 h-3.5" />}
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}
