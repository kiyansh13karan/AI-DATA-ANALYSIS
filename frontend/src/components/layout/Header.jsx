import React from "react";
import { Link } from "react-router-dom";
import { useDataset } from "../../context/DatasetContext.jsx";
import UserNavProfile from "./UserNavProfile.jsx";
import NetworkStatusBadge from "../shared/NetworkStatusBadge.jsx";
import ThemeToggle from "../ThemeToggle.jsx";

export default function Header() {
  const { dataset } = useDataset();

  return (
    <header className="h-14 flex items-center justify-between px-3 sm:px-6 border-b border-[#E2E8F0] dark:border-[#1B232C] bg-[#FFFFFF]/90 dark:bg-[#10171F]/90 backdrop-blur-2xl select-none relative z-50 transition-all duration-200">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {/* macOS Traffic Dots with Apple Gloss */}
        <div className="hidden sm:flex items-center gap-2 mr-1 shrink-0">
          <button 
            type="button" 
            title="Close" 
            className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] hover:brightness-110 active:scale-95 transition-all shadow-[0_0_8px_rgba(255,95,86,0.35)] cursor-default" 
          />
          <button 
            type="button" 
            title="Minimize" 
            className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] hover:brightness-110 active:scale-95 transition-all shadow-[0_0_8px_rgba(255,189,46,0.35)] cursor-default" 
          />
          <button 
            type="button" 
            title="Maximize" 
            className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] hover:brightness-110 active:scale-95 transition-all shadow-[0_0_8px_rgba(39,201,63,0.35)] cursor-default" 
          />
        </div>

        <Link 
          to="/" 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer shrink-0"
        >
          <img 
            src="/favicon.webp" 
            alt="AI Data Analysis Logo" 
            className="w-7 h-7 object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_2px_10px_rgba(0,113,227,0.3)] shrink-0"
          />
          <span className="header-title text-sm sm:text-base font-bold tracking-tight font-outfit bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#FBBF24] dark:from-[#F7D154] dark:via-[#FDE68A] dark:to-[#F7D154] bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
            <span className="hidden sm:inline">AI Data Analysis</span>
            <span className="sm:hidden">AI Analysis</span>
          </span>
        </Link>
        {dataset && (
          <span
            className="header-dataset-pill hidden md:inline-block text-xs font-medium text-[#64748B] dark:text-[#7B8794] ml-2 bg-[#F1F5F9] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1F2630] px-2.5 py-0.5 rounded-full backdrop-blur-sm truncate max-w-[220px]"
            title={dataset.files?.map(f => f.filename).join(", ") || dataset.filename}
          >
            {dataset.files?.length > 1
              ? `${dataset.files.length} files · ${dataset.files.reduce((sum, f) => sum + (f.schema?.row_count || 0), 0).toLocaleString()} rows`
              : `${dataset.filename} · ${dataset.schema?.row_count?.toLocaleString()} rows`
            }
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Network and Background Sync Indicator */}
        <NetworkStatusBadge />
        <ThemeToggle />

        {/* User Nav Profile with outside click handling */}
        <UserNavProfile />
      </div>
    </header>
  );
}
