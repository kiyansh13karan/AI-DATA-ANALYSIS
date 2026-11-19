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
        className="group flex items-center gap-2.5 sm:gap-3 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#10171F] hover:bg-stone-50 dark:hover:bg-[#17212B] border border-[#E2E8F0] dark:border-[#1F2630] shadow-sm transition-all duration-150 cursor-pointer text-left select-none"
      >
        {/* Label Tag with Database Icon */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#D97706]/15 dark:bg-[#F7D154]/15 border border-[#D97706]/30 dark:border-[#F7D154]/30 text-[#D97706] dark:text-[#F7D154] text-[10px] font-bold uppercase tracking-wider shrink-0">
          <Database size={12} className="shrink-0" />
          <span>Dataset</span>
        </div>

        {/* Selected Table Name + Stats */}
        <div className="flex items-center gap-2 truncate max-w-[200px] sm:max-w-[300px]">
          <span className="font-semibold text-xs text-[#0F172A] dark:text-[#F2F4F7] truncate">
            {currentFile?.filename}
          </span>
          {currentFile?.schema?.row_count != null && (
            <span className="hidden sm:inline-block text-[11px] text-[#64748B] dark:text-[#7B8794] font-mono shrink-0">
              — {currentFile.schema.row_count.toLocaleString()} rows, {currentFile.schema.column_count} cols
            </span>
          )}
        </div>

        {/* Badge with Files Count & Chevron */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F1F5F9] dark:bg-[#17212B] text-[#64748B] dark:text-[#7B8794] border border-[#E2E8F0] dark:border-[#1F2630]">
            {files.length} files
          </span>
          <ChevronDown
            size={14}
            className={`text-stone-400 dark:text-[#7B8794] ${
              isOpen ? "rotate-180 text-[#D97706] dark:text-[#F7D154]" : ""
            }`}
          />
        </div>
      </button>

      {/* ── Custom Pop-up Menu (100% Solid Non-Bleeding Background, Instant Open) ── */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-full min-w-[340px] sm:min-w-[420px] rounded-2xl bg-white dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1F2630] shadow-2xl overflow-hidden p-2 z-50">
          {/* Header Row */}
          <div className="px-3 py-2 mb-1.5 flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1B232C]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#7B8794] flex items-center gap-1.5">
              <Table2 size={13} className="text-[#D97706] dark:text-[#F7D154]" />
              Switch Active Table
            </span>
            <span className="text-[10px] font-semibold text-[#64748B] dark:text-[#7B8794] font-mono bg-[#F1F5F9] dark:bg-[#17212B] px-2 py-0.5 rounded-full border border-[#E2E8F0] dark:border-[#1F2630]">
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
                    ? "bg-amber-50 dark:bg-[#F7D154]/15 text-[#D97706] dark:text-[#F7D154] border border-[#D97706]/30 dark:border-[#F7D154]/40 font-semibold"
                    : "bg-[#F8FAFC] dark:bg-[#0B0F14] hover:bg-stone-100 dark:hover:bg-[#1B232C] text-[#0F172A] dark:text-[#F2F4F7] border border-[#E2E8F0] dark:border-[#1F2630]"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className={`p-1.5 rounded-lg shrink-0 ${activeFileIndex === -1 ? "bg-[#D97706]/20 dark:bg-[#F7D154]/20 text-[#D97706] dark:text-[#F7D154]" : "bg-stone-200 dark:bg-[#1B232C] text-[#64748B] dark:text-[#7B8794]"}`}>
                    <Layers size={15} />
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-bold text-[#0F172A] dark:text-[#F2F4F7]">All Tables Combined</span>
                    <span className="text-[11px] text-[#64748B] dark:text-[#7B8794]">
                      Query across all {files.length} tables in SQL & AI
                    </span>
                  </div>
                </div>
                {activeFileIndex === -1 && <Check size={16} className="shrink-0 text-[#D97706] dark:text-[#F7D154] font-bold" />}
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
                      ? "bg-amber-50 dark:bg-[#F7D154]/15 text-[#D97706] dark:text-[#F7D154] border border-[#D97706]/40 dark:border-[#F7D154]/40 shadow-xs"
                      : "bg-[#FFFFFF] dark:bg-[#10171F] hover:bg-stone-100 dark:hover:bg-[#17212B] text-[#0F172A] dark:text-[#F2F4F7] border border-[#E2E8F0] dark:border-[#1F2630]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isSelected
                          ? "bg-[#D97706] dark:bg-[#F7D154] text-white dark:text-[#0B0F14] shadow-xs"
                          : "bg-[#F1F5F9] dark:bg-[#17212B] text-[#64748B] dark:text-[#7B8794]"
                      }`}
                    >
                      <FileSpreadsheet size={15} />
                    </div>
                    <div className="flex flex-col truncate">
                      <span className={`text-xs truncate ${isSelected ? "font-bold text-[#D97706] dark:text-[#F7D154]" : "font-semibold text-[#0F172A] dark:text-[#F2F4F7]"}`}>
                        {f.filename}
                      </span>
                      {f.schema?.row_count != null && (
                        <span className={`text-[11px] font-mono mt-0.5 ${isSelected ? "text-[#D97706] dark:text-[#F7D154]/90" : "text-[#64748B] dark:text-[#7B8794]"}`}>
                          {f.schema.row_count.toLocaleString()} rows · {f.schema.column_count} columns
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#D97706] dark:bg-[#F7D154] text-white dark:text-[#0B0F14] uppercase tracking-wider">
                        Active
                      </span>
                      <Check size={16} className="text-[#D97706] dark:text-[#F7D154] font-bold" />
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
