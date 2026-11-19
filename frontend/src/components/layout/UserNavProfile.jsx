import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext.jsx";
import { useDataset } from "../../context/DatasetContext.jsx";
import { toast } from "react-toastify";
import { 
  User, 
  LogOut, 
  ChevronDown 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UserNavProfile() {
  const { user, profilePic, logout } = useUser();
  const { clearDataset } = useDataset();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isInApp = location.pathname.startsWith("/app");
  const isProfileActive = isInApp && location.search.includes("tab=profile");

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  const initials = user.username ? user.username.substring(0, 2).toUpperCase() : "US";

  const handleLogout = () => {
    clearDataset();
    logout();
    setIsOpen(false);
    toast.success("Successfully logged out!");
    navigate("/");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 sm:gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-full bg-black/[0.04] dark:bg-[#10171F] hover:bg-black/[0.08] dark:hover:bg-[#17212B] border border-[#E2E8F0] dark:border-[#1B232C] transition-all duration-200 outline-none select-none cursor-pointer group active:scale-95"
        aria-label="User profile menu"
      >
        {/* Avatar */}
        {profilePic ? (
          <img
            src={profilePic}
            alt="Profile Avatar"
            className="w-7 h-7 rounded-full object-cover border border-[#D97706]/40 dark:border-[#F7D154]/40 shadow-sm shrink-0"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-[#D97706] dark:bg-[#F7D154] flex items-center justify-center text-white dark:text-[#0B0F14] text-[11px] font-bold shadow-sm shrink-0">
            {initials}
          </div>
        )}

        {/* Username Label */}
        <span className="hidden sm:inline-block text-xs font-semibold text-[#0F172A] dark:text-[#F2F4F7] max-w-[90px] md:max-w-[120px] truncate">
          {user.username}
        </span>

        <ChevronDown 
          className={`w-3.5 h-3.5 text-[#64748B] dark:text-[#7B8794] transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-[#D97706] dark:text-[#F7D154]" : ""
          }`} 
        />
      </button>

      {/* Modal / Dropdown Window with Outside Click Protection */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-2.5 w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-[#FFFFFF] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1F2630] shadow-xl p-2 z-[999] text-[#0F172A] dark:text-[#F2F4F7]"
          >
            {/* User Info Header */}
            <div className="px-3.5 py-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F14] mb-1.5 border border-[#E2E8F0] dark:border-[#1B232C]">
              <div className="flex items-center gap-3">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile Avatar"
                    className="w-9 h-9 rounded-full object-cover border border-[#D97706]/40 dark:border-[#F7D154]/40 shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#D97706] dark:bg-[#F7D154] flex items-center justify-center text-white dark:text-[#0B0F14] text-xs font-bold shadow-sm shrink-0">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-sm font-bold tracking-tight text-[#0F172A] dark:text-[#F2F4F7] truncate">
                      {user.username}
                    </p>
                    <span className="shrink-0 text-[10px] font-semibold text-[#10B981] dark:text-[#3CCB7F] bg-[#10B981]/10 dark:bg-[#3CCB7F]/10 px-1.5 py-0.5 rounded-full">
                      Online
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-[#7B8794] truncate font-normal">
                    {user.email || "Active User"}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation links */}
            <div className="space-y-1">
              {/* Account Profile link */}
              <Link
                to="/app?tab=profile"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 sm:py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer active:scale-[0.98] ${
                  isProfileActive
                    ? "bg-[#D97706]/10 text-[#D97706] dark:bg-[#F7D154]/15 dark:text-[#F7D154]"
                    : "text-[#0F172A] dark:text-[#F2F4F7] hover:bg-[#F1F5F9] dark:hover:bg-[#17212B]"
                }`}
              >
                <User className="w-4 h-4 shrink-0" />
                <span>Account Profile</span>
              </Link>
            </div>

            <div className="my-1.5 h-px bg-[#E2E8F0] dark:bg-[#1B232C]" />

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 sm:py-2 text-xs font-semibold rounded-xl text-[#EF4444] dark:text-[#E5484D] hover:bg-[#EF4444]/10 dark:hover:bg-[#E5484D]/10 transition-colors cursor-pointer active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
