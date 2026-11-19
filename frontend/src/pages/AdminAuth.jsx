import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowLeft,
  Eye,
  EyeOff,
  X,
  Zap,
  CheckCircle2,
  BarChart3,
  Users,
  Activity,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function AdminAuth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const rawApiUrl = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
  const API_URL = rawApiUrl.endsWith("/api") ? rawApiUrl.slice(0, -4) : rawApiUrl;

  const validateEmail = (val) => /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(val.trim());

  const handleAdminLogin = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      toast.error("Please enter admin email and password.");
      return;
    }
    if (!validateEmail(cleanEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/admin/login`, {
        email: cleanEmail,
        password: password.trim(),
      });

      const { access_token, user } = response.data;
      localStorage.setItem("admin_token", access_token);
      localStorage.setItem("admin_user", JSON.stringify(user));

      toast.success(`Welcome to Admin Portal, ${user.username}!`);
      navigate("/admin");
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Admin authentication failed.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] dark:bg-[#0B0F14] text-[#0F172A] dark:text-[#F2F4F7] overflow-hidden select-none transition-colors duration-500">
      {/* Left side: Premium Brand & Admin Feature Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-[50%] relative bg-[#FFFFFF] dark:bg-[#10171F] flex-col justify-between p-12 overflow-hidden border-r border-[#E2E8F0] dark:border-[#1B232C] transition-colors duration-500">
        {/* SVG Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1B232C_1px,transparent_1px),linear-gradient(to_bottom,#1B232C_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)] pointer-events-none transition-colors duration-500" />

        {/* Moving glowing background gradients */}
        <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] rounded-full bg-[#D97706]/[0.05] dark:bg-[#F7D154]/[0.05] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#D97706]/[0.03] dark:bg-[#F7D154]/[0.03] blur-[100px] pointer-events-none" />

        {/* Brand Header */}
        <Link
          to="/"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="relative z-10 flex items-center gap-2.5 group cursor-pointer"
        >
          <img
            src="/favicon.webp"
            alt="AI Data Analysis Logo"
            className="w-8 h-8 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-sm"
          />
          <span className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F2F4F7]">
            AI Data Analysis
          </span>
        </Link>

        {/* Admin Feature Showcase List */}
        <div className="relative z-10 my-auto max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D97706]/10 border border-[#D97706]/20 text-[#D97706] dark:bg-[#F7D154]/10 dark:border-[#F7D154]/20 dark:text-[#F7D154] text-xs font-semibold mb-6">
            <ShieldCheck className="w-3.5 h-3.5" /> System Control Center
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight leading-tight mb-8">
            Comprehensive system <br />
            <span className="text-[#D97706] dark:text-[#F7D154]">
              administration & metrics.
            </span>
          </h2>

          <div className="space-y-6">
            {/* Admin Feature 1: Groq LLM Usage Analytics */}
            <div className="flex gap-4 items-start group cursor-default select-none">
              <div 
                className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F14] border border-[#E2E8F0] dark:border-[#1F2630] flex items-center justify-center shadow-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1.5 group-hover:scale-110 group-hover:shadow-md group-hover:border-[#D97706]/40 dark:group-hover:border-[#F7D154]/40 cursor-default"
              >
                <BarChart3 className="w-5 h-5 text-[#D97706] dark:text-[#F7D154] transition-transform duration-300 group-hover:scale-105 pointer-events-none" />
              </div>
              <div className="cursor-default select-none">
                <h4 className="text-sm font-semibold text-[#0F172A] dark:text-[#F2F4F7] cursor-default select-none">
                  Groq LLM Usage Analytics
                </h4>
                <p className="text-xs text-[#64748B] dark:text-[#7B8794] mt-1 leading-relaxed cursor-default select-none">
                  Real-time interactive SVG bar charts tracking daily API calls, total token volume, and daily aggregated MongoDB records.
                </p>
              </div>
            </div>

            {/* Admin Feature 2: Paginated User Management */}
            <div className="flex gap-4 items-start group cursor-default select-none">
              <div 
                className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F14] border border-[#E2E8F0] dark:border-[#1F2630] flex items-center justify-center shadow-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1.5 group-hover:scale-110 group-hover:shadow-md group-hover:border-[#D97706]/40 dark:group-hover:border-[#F7D154]/40 cursor-default"
              >
                <Users className="w-5 h-5 text-[#D97706] dark:text-[#F7D154] transition-transform duration-300 group-hover:scale-105 pointer-events-none" />
              </div>
              <div className="cursor-default select-none">
                <h4 className="text-sm font-semibold text-[#0F172A] dark:text-[#F2F4F7] cursor-default select-none">
                  Paginated User Management
                </h4>
                <p className="text-xs text-[#64748B] dark:text-[#7B8794] mt-1 leading-relaxed cursor-default select-none">
                  Server-side MongoDB pagination, instant regex search across usernames and emails, role control, and account verification status.
                </p>
              </div>
            </div>

            {/* Admin Feature 3: System Health & Live Logs */}
            <div className="flex gap-4 items-start group cursor-default select-none">
              <div 
                className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F14] border border-[#E2E8F0] dark:border-[#1F2630] flex items-center justify-center shadow-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1.5 group-hover:scale-110 group-hover:shadow-md group-hover:border-[#D97706]/40 dark:group-hover:border-[#F7D154]/40 cursor-default"
              >
                <Activity className="w-5 h-5 text-[#D97706] dark:text-[#F7D154] transition-transform duration-300 group-hover:scale-105 pointer-events-none" />
              </div>
              <div className="cursor-default select-none">
                <h4 className="text-sm font-semibold text-[#0F172A] dark:text-[#F2F4F7] cursor-default select-none">
                  System Health & Live Logs
                </h4>
                <p className="text-xs text-[#64748B] dark:text-[#7B8794] mt-1 leading-relaxed cursor-default select-none">
                  Monitor MongoDB ping response time, DuckDB memory sandboxes, and auto-stream backend server logs via in-memory ring buffer.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Left Side Footer */}
        <div className="relative z-10 flex justify-between items-center text-xs text-[#64748B] dark:text-[#7B8794]">
          <span>&copy; {new Date().getFullYear()} AI Data Analysis. All rights reserved.</span>
          <span>Admin Control v2.1</span>
        </div>
      </div>

      {/* Right side: Admin Auth Form Container */}
      <div className="w-full lg:w-[50%] flex items-center justify-center p-6 sm:p-12 relative bg-[#F8FAFC] dark:bg-[#0B0F14] transition-colors duration-500">
        {/* Top Actions: Back to Home & Theme Toggle */}
        <div className="absolute top-6 left-6 right-6 sm:top-10 sm:left-10 sm:right-10 flex items-center justify-between z-20 pointer-events-auto">
          <Link
            to="/"
            className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F2F4F7] flex items-center text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          <ThemeToggle />
        </div>

        {/* Glow circles for mobile/tablet background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.02),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,#1e293b,transparent_70%)] opacity-20 lg:hidden pointer-events-none transition-colors duration-500" />
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-[#D97706]/5 dark:bg-[#F7D154]/5 blur-[120px] lg:hidden pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-[#D97706]/5 dark:bg-[#F7D154]/5 blur-[120px] lg:hidden pointer-events-none" />

        <div className="w-full max-w-[400px] relative z-10">
          {/* Logo for mobile only */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden justify-center mt-8 sm:mt-0">
            <div className="w-9 h-9 rounded-xl bg-[#D97706] dark:bg-[#F7D154] flex items-center justify-center shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-5 h-5 text-white dark:text-[#0B0F14]" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#0F172A] dark:text-[#F2F4F7]">
              AI Data Analysis Admin
            </span>
          </div>

          {/* Form Header */}
          <div className="mb-8 text-center lg:text-left mt-8 lg:mt-0">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-[#F2F4F7] mb-2 transition-colors duration-500">
              Admin Access
            </h2>
            <p className="text-[#64748B] dark:text-[#7B8794] text-xs sm:text-sm font-medium transition-colors duration-500">
              Sign in to manage system metrics, user accounts, and API analytics
            </p>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleAdminLogin} className="space-y-5" autoComplete="off">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F2F4F7] mb-2 uppercase tracking-wider transition-colors duration-500">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@demo.com"
                  autoComplete="off"
                  className="w-full px-4 py-3 rounded-xl bg-[#FFFFFF] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1F2630] hover:border-[#D97706]/50 dark:hover:border-[#F7D154]/50 focus:border-[#D97706] dark:focus:border-[#F7D154] focus:bg-white dark:focus:bg-[#0B0F14] focus:ring-4 focus:ring-amber-500/10 text-sm text-[#0F172A] dark:text-[#F2F4F7] placeholder-[#64748B]/60 dark:placeholder-[#7B8794]/60 outline-none transition-all duration-200 pr-10"
                />
                {email && (
                  <button
                    type="button"
                    onClick={() => setEmail("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] dark:text-[#7B8794] dark:hover:text-[#F2F4F7] transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F2F4F7] mb-2 uppercase tracking-wider transition-colors duration-500">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl bg-[#FFFFFF] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1F2630] hover:border-[#D97706]/50 dark:hover:border-[#F7D154]/50 focus:border-[#D97706] dark:focus:border-[#F7D154] focus:bg-white dark:focus:bg-[#0B0F14] focus:ring-4 focus:ring-amber-500/10 text-sm text-[#0F172A] dark:text-[#F2F4F7] placeholder-[#64748B]/60 dark:placeholder-[#7B8794]/60 outline-none transition-all duration-200 pr-16"
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {password && (
                    <button
                      type="button"
                      onClick={() => setPassword("")}
                      className="text-[#64748B] hover:text-[#0F172A] dark:text-[#7B8794] dark:hover:text-[#F2F4F7] transition-colors cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#64748B] hover:text-[#0F172A] dark:text-[#7B8794] dark:hover:text-[#F2F4F7] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-[#D97706] hover:bg-[#b45309] text-white dark:bg-[#F7D154] dark:hover:bg-[#f5c730] dark:text-[#0B0F14] font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 shadow-md outline-none flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white dark:border-[#0B0F14] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Sign In to Admin Portal"
              )}
            </button>
          </form>

          {/* Footer link back to standard user login */}
          <div className="text-center mt-6 pt-4 border-t border-[#E2E8F0] dark:border-[#1B232C]">
            <Link
              to="/login"
              className="text-xs font-semibold text-[#64748B] dark:text-[#7B8794] hover:text-[#D97706] dark:hover:text-[#F7D154] transition-colors hover:underline hover:underline-offset-4"
            >
              &larr; Return to Standard User Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
