import React, { useState, useRef, useEffect } from "react";
import { Database, ChevronDown, Check, Table2, Layers, FileSpreadsheet } from "lucide-react";
import { useDataset } from "../../context/DatasetContext.jsx";

/**
 * DatasetSelector
 * High-contrast, crystal-clear custom dropdown for active table selection.
 * Fully optimized for both Dark Theme and Light Theme with 100% solid, non-bleeding backgrounds.
 */
export default function DatasetSelector({ allowAll = false }) {
  const { dataset, activeFileIndex, setActiveFileIndex } = useDataset();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const files = dataset?.files ?? [];

  // Close dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (files.length <= 1) return null;

  const currentFile =
    activeFileIndex === -1
      ? {
          filename: `All Tables Combined (${files.length})`,
          schema: {
            row_count: files.reduce((s, f) => s + (f.schema?.row_count || 0), 0),
            column_count: files.reduce((s, f) => s + (f.schema?.column_count || 0), 0),
          },
        }
      : files[activeFileIndex] || files[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* ── Trigger Button (Solid high-contrast styling) ── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex items-center gap-2.5 sm:gap-3 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#1c1c1e] hover:bg-stone-50 dark:hover:bg-[#28282b] border border-stone-300 dark:border-white/[0.15] shadow-sm transition-all duration-150 cursor-pointer text-left select-none"
      >
        {/* Label Tag with Database Icon */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-500/10 dark:bg-blue-400/15 border border-blue-500/25 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider shrink-0">
          <Database size={12} className="shrink-0" />
          <span>Dataset</span>
        </div>

        {/* Selected Table Name + Stats */}
        <div className="flex items-center gap-2 truncate max-w-[200px] sm:max-w-[300px]">
          <span className="font-semibold text-xs text-stone-900 dark:text-white truncate">
            {currentFile?.filename}
          </span>
          {currentFile?.schema?.row_count != null && (
            <span className="hidden sm:inline-block text-[11px] text-stone-500 dark:text-stone-400 font-mono shrink-0">
              — {currentFile.schema.row_count.toLocaleString()} rows, {currentFile.schema.column_count} cols
            </span>
          )}
        </div>

        {/* Badge with Files Count & Chevron */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-white/[0.1] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-white/[0.1]">
            {files.length} files
          </span>
          <ChevronDown
            size={14}
            className={`text-stone-400 dark:text-stone-400 ${
              isOpen ? "rotate-180 text-blue-600 dark:text-blue-400" : ""
            }`}
          />
        </div>
      </button>

      {/* ── Custom Pop-up Menu (100% Solid Non-Bleeding Background, Instant Open) ── */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-full min-w-[340px] sm:min-w-[420px] rounded-2xl bg-white dark:bg-[#18181b] border border-stone-300 dark:border-stone-700 shadow-2xl overflow-hidden p-2 z-50">
          {/* Header Row */}
          <div className="px-3 py-2 mb-1.5 flex items-center justify-between border-b border-stone-200 dark:border-stone-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
              <Table2 size={13} className="text-blue-600 dark:text-blue-400" />
              Switch Active Table
            </span>
            <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 font-mono bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full">
              {files.length} tables in memory
            </span>
          </div>

          {/* List of Tables */}
          <div className="space-y-1.5 max-h-[340px] overflow-y-auto overscroll-contain pr-1">
            {allowAll && (
              <button
                type="button"
                onClick={() => {
                  setActiveFileIndex(-1);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  activeFileIndex === -1
                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 border border-blue-300 dark:border-blue-700 font-semibold"
                    : "bg-stone-50 dark:bg-stone-900/60 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-900 dark:text-stone-200 border border-stone-200 dark:border-stone-800"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className={`p-1.5 rounded-lg shrink-0 ${activeFileIndex === -1 ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300" : "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400"}`}>
                    <Layers size={15} />
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-bold text-stone-900 dark:text-white">All Tables Combined</span>
                    <span className="text-[11px] text-stone-600 dark:text-stone-400">
                      Query across all {files.length} tables in SQL & AI
                    </span>
                  </div>
                </div>
                {activeFileIndex === -1 && <Check size={16} className="shrink-0 text-blue-600 dark:text-sky-400 font-bold" />}
              </button>
            )}

            {files.map((f, idx) => {
              const isSelected = activeFileIndex === idx;
              return (
                <button
                  key={`${f.table_name}-${idx}`}
                  type="button"
                  onClick={() => {
                    setActiveFileIndex(idx);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left cursor-pointer ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-sky-200 border border-blue-400 dark:border-blue-600 shadow-xs"
                      : "bg-white dark:bg-[#202023] hover:bg-stone-100 dark:hover:bg-[#2a2a2e] text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-white/[0.08]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isSelected
                          ? "bg-blue-500 text-white shadow-xs"
                          : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                      }`}
                    >
                      <FileSpreadsheet size={15} />
                    </div>
                    <div className="flex flex-col truncate">
                      <span className={`text-xs truncate ${isSelected ? "font-bold text-blue-700 dark:text-sky-300" : "font-semibold text-stone-900 dark:text-white"}`}>
                        {f.filename}
                      </span>
                      {f.schema?.row_count != null && (
                        <span className={`text-[11px] font-mono mt-0.5 ${isSelected ? "text-blue-600 dark:text-sky-400" : "text-stone-600 dark:text-stone-400"}`}>
                          {f.schema.row_count.toLocaleString()} rows · {f.schema.column_count} columns
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 uppercase tracking-wider">
                        Active
                      </span>
                      <Check size={16} className="text-blue-600 dark:text-sky-400 font-bold" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
