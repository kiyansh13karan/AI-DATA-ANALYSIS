import React from "react";
import { AnimatedThemeToggler } from "./AnimatedThemeToggler";

export default function ThemeToggle({ className = "", variant = "circle", duration = 1200, ...props }) {
  return (
    <AnimatedThemeToggler
      variant={variant}
      duration={duration}
      className={`p-2 rounded-full text-[#64748B] hover:text-[#0F172A] dark:text-[#7B8794] dark:hover:text-[#F2F4F7] bg-black/[0.04] hover:bg-black/[0.08] dark:bg-[#10171F] dark:hover:bg-[#17212B] border border-[#E2E8F0] dark:border-[#1B232C] transition-all duration-200 outline-none select-none cursor-pointer active:scale-95 focus:outline-none focus:ring-0 focus-visible:ring-2 focus-visible:ring-[#D97706] dark:focus-visible:ring-[#F7D154] [&_svg]:w-4.5 [&_svg]:h-4.5 dark:[&_svg]:text-[#F7D154] ${className}`}
      aria-label="Toggle Dark Mode"
      {...props}
    />
  );
}

export { AnimatedThemeToggler };
