import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Scale, 
  Globe, 
  Shield, 
  AlertTriangle, 
  FileCheck,
  ArrowRight,
  ArrowLeft,
  LayoutDashboard,
  Menu,
  X
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { useUser } from "../context/UserContext.jsx";
import UserNavProfile from "../components/layout/UserNavProfile.jsx";

export default function Terms() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Track scroll position to morph navbar from full width (top) to floating pill (scrolled)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] dark:bg-[#0B0F14] dark:text-[#F2F4F7] font-sans antialiased overflow-x-hidden selection:bg-[#D97706]/20 dark:selection:bg-[#F7D154]/20 transition-colors duration-300">
      
      {/* Subtle macOS Ambient Aura Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[90vw] h-[550px] bg-gradient-to-b from-amber-400/10 via-amber-200/5 to-transparent dark:from-[#F7D154]/10 dark:via-[#F7D154]/5 blur-[140px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#ded7cc_1px,transparent_1px)] dark:bg-[radial-gradient(#2d2d30_1px,transparent_1px)] [background-size:24px_24px] opacity-60 dark:opacity-40" />
      </div>

      {/* Dynamic Navigation Bar (Full width initially -> Floating squeezed pill on scroll) */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none"
      >
        <div className="w-full flex flex-col items-center">
          <div className={`pointer-events-auto flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isScrolled
              ? "mt-2.5 sm:mt-3 w-full max-w-5xl h-14 sm:h-16 px-3.5 sm:px-7 rounded-2xl sm:rounded-full bg-white/90 dark:bg-[#10171F]/90 backdrop-blur-2xl shadow-[0_12px_36px_rgba(15,23,42,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)] border border-[#E2E8F0] dark:border-[#1F2630]"
              : "mt-0 w-full max-w-7xl h-16 sm:h-20 px-3 sm:px-8 bg-transparent border-transparent shadow-none"
          }`}>
            
            {/* Back Button & Logo with Favicon */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => {
                  if (window.history.length > 1) {
                    navigate(-1);
                  } else {
                    navigate("/");
                  }
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold text-[#515154] dark:text-[#a1a1a6] hover:text-[#D97706] dark:hover:text-[#F7D154] bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.06] dark:hover:bg-white/[0.1] transition-all cursor-pointer select-none"
                title="Back to previous page"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Back</span>
              </button>

              <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer select-none shrink-0">
                <img 
                  src="/favicon.webp" 
                  alt="AI Data Analysis Logo" 
                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition-transform duration-300 group-hover:scale-105 shrink-0"
                />
                <span className="font-bold text-base sm:text-lg tracking-tight text-[#0F172A] dark:text-[#F2F4F7] group-hover:opacity-90 transition-opacity">
                  <span className="hidden sm:inline">AI Data Analysis</span>
                  <span className="sm:hidden">AI Analysis</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-7 text-sm font-medium text-[#515154] dark:text-[#a1a1a6]">
              <Link to="/#features" className="hover:text-[#D97706] dark:hover:text-[#F7D154] transition-colors duration-200">Features</Link>
              <Link to="/#demo" className="hover:text-[#D97706] dark:hover:text-[#F7D154] transition-colors duration-200">Interactive Demo</Link>
              <Link to="/docs" className="hover:text-[#D97706] dark:hover:text-[#F7D154] transition-colors duration-200">Documentation</Link>
              <Link to="/faq" className="hover:text-[#D97706] dark:hover:text-[#F7D154] transition-colors duration-200">FAQs</Link>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <ThemeToggle />
              
              {user ? (
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <UserNavProfile />
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                    <Link to="/app" className="relative group inline-flex items-center justify-center p-2 sm:px-4 sm:py-2 rounded-full text-white text-xs sm:text-sm font-medium bg-[#D97706] hover:bg-[#b45309] dark:bg-[#F7D154] dark:hover:bg-[#f5c730] dark:text-[#0B0F14] font-extrabold shadow-md transition-all duration-300">
                      <span className="relative flex items-center gap-1.5">
                        <LayoutDashboard className="w-4 h-4 sm:hidden" />
                        <span className="hidden sm:inline">Launch App</span>
                        <ArrowRight className="hidden sm:inline w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </Link>
                  </motion.div>
                </div>
              ) : (
                <>
                  <Link to="/login" className="hidden sm:inline-block text-[#515154] dark:text-[#a1a1a6] hover:text-[#D97706] dark:hover:text-[#F7D154] font-medium text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06]">
                    Sign In
                  </Link>
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                    <Link to="/register" className="relative group inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-white text-xs sm:text-sm font-medium bg-[#D97706] hover:bg-[#b45309] dark:bg-[#F7D154] dark:hover:bg-[#f5c730] dark:text-[#0B0F14] font-extrabold shadow-md transition-all duration-300">
                      <span className="relative flex items-center gap-1.5">
                        Get Started
                      </span>
                    </Link>
                  </motion.div>
                </>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="md:hidden p-1.5 sm:p-2 rounded-full text-[#515154] dark:text-[#a1a1a6] hover:text-[#D97706] dark:hover:text-[#F7D154] bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08]"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>

          </div>

          {/* Mobile Drawer */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto md:hidden w-full max-w-5xl mt-2 p-4 rounded-2xl bg-[#fcfaf5]/95 dark:bg-[#1d1d1f]/95 border border-stone-200/80 dark:border-white/[0.12] shadow-2xl backdrop-blur-2xl"
              >
                <div className="flex flex-col space-y-3 text-sm font-medium">
                  <Link to="/#features" onClick={() => setIsMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06]">Features</Link>
                  <Link to="/#demo" onClick={() => setIsMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06]">Interactive Demo</Link>
                  <Link to="/docs" onClick={() => setIsMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06]">Documentation</Link>
                  <Link to="/faq" onClick={() => setIsMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06]">FAQs</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Centered Hero Header Section (Matching FAQs style with full unclipped cursive script) */}
      <section className="pt-36 sm:pt-40 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#D97706] dark:text-[#F7D154] text-xs font-bold uppercase tracking-wider mb-4">
            <FileCheck className="w-4 h-4" /> Legal & Service Agreement
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-normal mb-4 text-[#0F172A] dark:text-[#f5f5f7] leading-relaxed">
            <span className="font-black text-[#0F172A] dark:text-[#F2F4F7]">
              Terms of Service
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#64748B] dark:text-[#a1a1a6] max-w-2xl mx-auto font-normal">
            Please read these terms carefully before using our AI Data Analysis platform. Last updated: {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Main Content Cards */}
      <section className="pb-28 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#fcfaf5]/85 dark:bg-gray-900/40 backdrop-blur-md rounded-3xl p-6 sm:p-10 md:p-12 border border-stone-200/80 dark:border-gray-800/50 shadow-sm">
            
            <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
              <p className="text-base text-stone-700 dark:text-gray-300 leading-relaxed">
                Welcome to AI Data Analysis. By accessing or using our platform, you agree to be bound by these Terms of Service.
              </p>
              
              <div className="macos-card p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-50 text-[#D97706] dark:text-[#F7D154] rounded-xl flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-semibold m-0 text-[#0F172A] dark:text-[#f5f5f7]">1. Acceptable Use of the Platform</h3>
                </div>
                <p className="text-sm text-[#64748B] dark:text-[#a1a1a6] leading-relaxed font-normal">
                  You agree to use the platform only for lawful analytics purposes. You are strictly prohibited from uploading datasets that contain malicious code, illegal material, or data that you do not have the explicit right to process.
                </p>
              </div>

              <div className="macos-card p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-50 text-[#D97706] dark:text-[#F7D154] rounded-xl flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-semibold m-0 text-[#0F172A] dark:text-[#f5f5f7]">2. Intellectual Property Rights</h3>
                </div>
                <p className="text-sm text-[#64748B] dark:text-[#a1a1a6] leading-relaxed font-normal">
                  The service, including its original software codebase, algorithms, and interface functionality, is owned by AI Data Analysis and protected by copyright and intellectual property standards. You retain all ownership rights to your uploaded data.
                </p>
              </div>

              <div className="macos-card p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-50 text-[#D97706] dark:text-[#F7D154] rounded-xl flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-semibold m-0 text-[#0F172A] dark:text-[#f5f5f7]">3. AI Insights Disclaimer</h3>
                </div>
                <p className="text-sm text-[#64748B] dark:text-[#a1a1a6] leading-relaxed font-normal">
                  The platform is provided on an "AS IS" basis. While our AI engine executes verified DuckDB SQL to deliver accurate analytics, you should always review critical automated conclusions prior to high-stakes business decision-making.
                </p>
              </div>

              <div className="macos-card p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-50 text-[#D97706] dark:text-[#F7D154] rounded-xl flex items-center justify-center shrink-0">
                    <Scale className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-semibold m-0 text-[#0F172A] dark:text-[#f5f5f7]">4. Limitation of Liability</h3>
                </div>
                <p className="text-sm text-[#64748B] dark:text-[#a1a1a6] leading-relaxed font-normal">
                  In no event shall AI Data Analysis, nor its developers, be liable for any indirect, incidental, or consequential damages resulting from your use of or inability to use the platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Static Footer */}
      <footer className="bg-white dark:bg-[#0B0F14] border-t border-[#E2E8F0] dark:border-[#1B232C] py-12 text-[#64748B] dark:text-[#7B8794] select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-medium">&copy; {new Date().getFullYear()} <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#0071e3] to-[#06b6d4]">AI Data Analysis</span></span>
          <div className="flex space-x-6 text-sm">
            <Link to="/docs" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-[#64748B] dark:text-[#7B8794]">Documentation</Link>
            <Link to="/faq" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-[#64748B] dark:text-[#7B8794]">FAQs</Link>
            <Link to="/privacy" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-[#64748B] dark:text-[#7B8794]">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
