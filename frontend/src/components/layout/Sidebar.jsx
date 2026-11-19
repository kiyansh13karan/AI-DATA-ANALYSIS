import React from "react";
import { Table, LineChart, MessageSquare, User, Code2, PanelLeftClose, PanelLeftOpen } from "lucide-react";

const NAV_ITEMS = [
  { key: "preview", label: "Data Preview", icon: Table },
  { key: "explore", label: "Explore", icon: LineChart },
  { key: "chat", label: "Ask AI", icon: MessageSquare },
  { key: "sql-editor", label: "SQL Editor", icon: Code2 },
  { key: "profile", label: "User Profile", icon: User },
];

export default function Sidebar({ active, onSelect, isOpen = true, onToggle }) {
  return (
    <aside 
      className={`sidebar-wrapper shrink-0 border-r border-[#E2E8F0] dark:border-[#1B232C] bg-[#FFFFFF] dark:bg-[#10171F] select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between relative z-40 ${
        isOpen ? "w-56 p-3" : "w-16 p-2"
      }`}
    >
      <div className="flex flex-col gap-2">
        {/* Sidebar Header with macOS Toggle Icon Button */}
        <div className={`flex items-center pb-2 border-b border-[#E2E8F0] dark:border-[#1B232C] ${
          isOpen ? "justify-between px-1" : "justify-center"
        }`}>
          {isOpen && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#7B8794]">
              Workspace
            </span>
          )}
          <button
            onClick={onToggle}
            className="p-1.5 rounded-xl text-[#64748B] dark:text-[#7B8794] hover:bg-stone-100 dark:hover:bg-[#1B232C] hover:text-[#D97706] dark:hover:text-[#F7D154] transition-all duration-200 cursor-pointer shadow-sm"
            title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            aria-label="Toggle Sidebar"
          >
            {isOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <div key={item.key} className="relative group">
                <button
                  onClick={() => onSelect(item.key)}
                  className={`w-full flex items-center rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isOpen 
                      ? "gap-3 px-3 py-2 text-left" 
                      : "justify-center p-2.5"
                  } ${
                    isActive
                      ? "bg-[#D97706] dark:bg-[#F7D154] text-white dark:text-[#0B0F14] font-bold shadow-[0_4px_14px_rgba(247,209,84,0.35)] scale-[1.02]"
                      : "text-[#64748B] dark:text-[#7B8794] hover:bg-stone-100 dark:hover:bg-[#1B232C] hover:text-[#0F172A] dark:hover:text-[#F2F4F7]"
                  }`}
                >
                  <Icon size={18} className={isActive ? "text-white dark:text-[#0B0F14] shrink-0 drop-shadow-sm" : "opacity-80 shrink-0 group-hover:scale-110 transition-transform"} />
                  {isOpen && (
                    <span className="sidebar-label tracking-tight truncate">{item.label}</span>
                  )}
                </button>

                {/* Floating macOS Tooltip (Shown on hover when collapsed) */}
                {!isOpen && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 rounded-lg bg-[#0F172A] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1F2630] text-white text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl z-50">
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#0F172A] dark:border-r-[#10171F]" />
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom status badge / indicator */}
      {isOpen ? (
        <div className="px-2 py-1.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F14] border border-[#E2E8F0] dark:border-[#1B232C] text-[11px] text-[#64748B] dark:text-[#7B8794] flex items-center justify-between">
          <span className="font-medium">Studio Engine</span>
          <span className="inline-flex items-center gap-1 font-semibold text-[#10B981] dark:text-[#3CCB7F]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] dark:bg-[#3CCB7F] animate-pulse" />
            Active
          </span>
        </div>
      ) : (
        <div className="flex justify-center pb-1">
          <span className="w-2 h-2 rounded-full bg-[#10B981] dark:bg-[#3CCB7F] animate-pulse" title="Engine Active" />
        </div>
      )}
    </aside>
  );
}
