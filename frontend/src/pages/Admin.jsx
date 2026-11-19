import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  Users,
  Activity,
  Terminal,
  BarChart3,
  LogOut,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Database,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
  Filter,
  Calendar,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { StatCardSkeletonGrid, TableSkeleton } from "../components/shared/CardSkeleton.jsx";

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("groq"); // groq | users | health | logs
  const [adminUser, setAdminUser] = useState(null);

  // --- Groq Usage State ---
  const [groqData, setGroqData] = useState(null);
  const [loadingGroq, setLoadingGroq] = useState(false);
  const [groqRangeMode, setGroqRangeMode] = useState("all"); // all | today | 7days | 30days | custom
  const [groqStartDate, setGroqStartDate] = useState("");
  const [groqEndDate, setGroqEndDate] = useState("");

  // --- Users Paginated State ---
  const [users, setUsers] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState("all"); // all | admin | user
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total_users: 0,
    admin_count: 0,
    standard_user_count: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  });
  const [userSearch, setUserSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);

  // --- Create Admin State ---
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminUsername, setNewAdminUsername] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("Admin@12345");
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // --- Active WebApp Sessions State ---
  const [activeSessions, setActiveSessions] = useState(null);

  // --- Health State ---
  const [healthData, setHealthData] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  // --- Logs State ---
  const [logs, setLogs] = useState([]);
  const [logLevel, setLogLevel] = useState("ALL");
  const [logSearch, setLogSearch] = useState("");
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [autoRefreshLogs, setAutoRefreshLogs] = useState(false);

  const rawApiUrl = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
  const API_URL = rawApiUrl.endsWith("/api") ? rawApiUrl.slice(0, -4) : rawApiUrl;

  // Helper axios instance with Admin Auth Token
  const getAdminAxios = useCallback(() => {
    const token = localStorage.getItem("admin_token");
    return axios.create({
      baseURL: API_URL,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }, [API_URL]);

  // Authenticate admin access on mount
  useEffect(() => {
    const userStr = localStorage.getItem("admin_user");
    const token = localStorage.getItem("admin_token");
    if (!token || !userStr) {
      toast.error("Please login to access Admin Panel.");
      navigate("/admin/login");
      return;
    }
    try {
      setAdminUser(JSON.parse(userStr));
    } catch {
      navigate("/admin/login");
    }
  }, [navigate]);

  // ── Fetch Active WebApp User Sessions ─────────────────────────────────────
  const fetchActiveSessions = useCallback(async () => {
    try {
      const axiosInst = getAdminAxios();
      const res = await axiosInst.get("/api/admin/active-sessions");
      setActiveSessions(res.data);
    } catch {
      // ignore
    }
  }, [getAdminAxios]);

  // ── Fetch Groq API Usage Stats (with Date Filter) ─────────────────────────
  const fetchGroqUsage = useCallback(async (start = groqStartDate, end = groqEndDate) => {
    setLoadingGroq(true);
    try {
      const axiosInst = getAdminAxios();
      const res = await axiosInst.get("/api/admin/groq-usage", {
        params: {
          start_date: start || undefined,
          end_date: end || undefined,
        },
      });
      setGroqData(res.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Admin session expired. Please sign in again.");
        navigate("/admin/login");
      } else {
        toast.error("Failed to load Groq API usage stats.");
      }
    } finally {
      setLoadingGroq(false);
    }
  }, [getAdminAxios, navigate, groqStartDate, groqEndDate]);

  // Quick Preset Date Range Selector
  const handleGroqPresetRange = (mode) => {
    setGroqRangeMode(mode);
    const today = new Date();
    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (mode === "all") {
      setGroqStartDate("");
      setGroqEndDate("");
      fetchGroqUsage("", "");
    } else if (mode === "today") {
      const tStr = formatDate(today);
      setGroqStartDate(tStr);
      setGroqEndDate(tStr);
      fetchGroqUsage(tStr, tStr);
    } else if (mode === "7days") {
      const start = new Date();
      start.setDate(today.getDate() - 6);
      const sStr = formatDate(start);
      const eStr = formatDate(today);
      setGroqStartDate(sStr);
      setGroqEndDate(eStr);
      fetchGroqUsage(sStr, eStr);
    } else if (mode === "30days") {
      const start = new Date();
      start.setDate(today.getDate() - 29);
      const sStr = formatDate(start);
      const eStr = formatDate(today);
      setGroqStartDate(sStr);
      setGroqEndDate(eStr);
      fetchGroqUsage(sStr, eStr);
    }
  };

  // ── Fetch Paginated Users (MongoDB .skip & .limit) ───────────────────────
  const fetchUsers = useCallback(async (page = 1, limit = 10, search = "", role = "all") => {
    setLoadingUsers(true);
    try {
      const axiosInst = getAdminAxios();
      const res = await axiosInst.get("/api/admin/users", {
        params: {
          page,
          limit,
          search: search.trim() || undefined,
          role: role === "all" ? undefined : role,
        },
      });
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error("Failed to load users list.");
    } finally {
      setLoadingUsers(false);
    }
  }, [getAdminAxios]);

  // ── Create or Assign Admin Account ─────────────────────────────────────────
  const handleCreateAdmin = async (e) => {
    if (e) e.preventDefault();
    if (!newAdminEmail.trim()) {
      toast.error("Please enter a valid admin email address.");
      return;
    }
    setCreatingAdmin(true);
    try {
      const axiosInst = getAdminAxios();
      const res = await axiosInst.post("/api/admin/create-admin", {
        email: newAdminEmail.trim(),
        username: newAdminUsername.trim(),
        password: newAdminPassword.trim() || "Admin@12345",
      });
      toast.success(res.data.message || "Admin account created successfully!");
      setNewAdminEmail("");
      setNewAdminUsername("");
      setNewAdminPassword("Admin@12345");
      setShowCreateModal(false);
      fetchUsers(1, pagination.limit, userSearch, "admin");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create admin account.");
    } finally {
      setCreatingAdmin(false);
    }
  };

  // ── Fetch Health Check ────────────────────────────────────────────────────
  const fetchHealth = useCallback(async () => {
    setLoadingHealth(true);
    try {
      const axiosInst = getAdminAxios();
      const res = await axiosInst.get("/api/admin/health");
      setHealthData(res.data);
    } catch (err) {
      toast.error("Failed to fetch system health status.");
    } finally {
      setLoadingHealth(false);
    }
  }, [getAdminAxios]);

  // ── Fetch System Logs ─────────────────────────────────────────────────────
  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const axiosInst = getAdminAxios();
      const res = await axiosInst.get("/api/admin/logs", {
        params: {
          limit: 150,
          level: logLevel,
          search: logSearch.trim() || undefined,
        },
      });
      setLogs(res.data.logs);
    } catch (err) {
      toast.error("Failed to stream backend system logs.");
    } finally {
      setLoadingLogs(false);
    }
  }, [getAdminAxios, logLevel, logSearch]);

  // Initial tab fetch triggers
  useEffect(() => {
    fetchActiveSessions();
    if (activeTab === "groq") fetchGroqUsage();
    if (activeTab === "admins") fetchUsers(1, pagination.limit, userSearch, "admin");
    if (activeTab === "users") fetchUsers(1, pagination.limit, userSearch, "user");
    if (activeTab === "health") fetchHealth();
    if (activeTab === "logs") fetchLogs();
  }, [activeTab, fetchActiveSessions]);

  // Auto-refresh interval for logs when enabled
  useEffect(() => {
    let interval;
    if (activeTab === "logs" && autoRefreshLogs) {
      interval = setInterval(() => {
        fetchLogs();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [activeTab, autoRefreshLogs, fetchLogs]);

  // Periodic auto-refresh for active sessions (every 8 seconds) so the admin panel live count stays current
  useEffect(() => {
    const interval = setInterval(() => {
      fetchActiveSessions();
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchActiveSessions]);

  // Handle Logout
  const handleLogout = async () => {
    const token = localStorage.getItem("admin_token");
    const userStr = localStorage.getItem("admin_user");
    let adminEmail = "";
    try {
      if (userStr) {
        const u = JSON.parse(userStr);
        adminEmail = u.email || u.username;
      }
    } catch {}

    try {
      const axiosInst = getAdminAxios();
      await axiosInst.post("/api/auth/logout", {
        email: adminEmail || undefined,
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        timeout: 3000,
      });
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      toast.info("Logged out from Admin Panel.");
      navigate("/admin/login");
    }
  };

  // ── Render Groq SVG Chart Component ─────────────────────────────────────────
  const renderGroqChart = () => {
    const records = groqData?.daily_records || [];

    if (records.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02]">
          <BarChart3 className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            No Groq API usage recorded yet today.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Usage automatically tracks date and API call counts when users interact with the AI chatbot.
          </p>
        </div>
      );
    }

    const maxCalls = Math.max(...records.map((r) => r.total_calls), 5);
    const chartHeight = 220;

    return (
      <div className="bg-[#FFFFFF] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1F2630] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold tracking-tight text-[#0F172A] dark:text-[#F2F4F7]">Groq API Calls Per Day</h3>
            <p className="text-xs text-[#64748B] dark:text-[#7B8794]">
              Recorded in MongoDB <code className="text-[#D97706] dark:text-[#F7D154] font-mono">groq_usage</code> collection
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-[#D97706]/10 text-[#D97706] dark:bg-[#F7D154]/10 dark:text-[#F7D154] rounded-full border border-[#D97706]/20 dark:border-[#F7D154]/20">
            Daily Aggregated
          </span>
        </div>

        {/* SVG Custom Responsive Bar Chart */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[500px]">
            <svg viewBox={`0 0 ${Math.max(records.length * 70, 500)} ${chartHeight}`} className="w-full h-56">
              {/* Horizontal Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = chartHeight - 30 - ratio * (chartHeight - 50);
                const val = Math.round(ratio * maxCalls);
                return (
                  <g key={i}>
                    <line x1="35" y1={y} x2="100%" y2={y} stroke="currentColor" className="text-[#E2E8F0] dark:text-[#1B232C]" strokeDasharray="4 4" />
                    <text x="5" y={y + 4} className="fill-[#64748B] dark:fill-[#7B8794] text-[10px] font-mono">{val}</text>
                  </g>
                );
              })}

              {/* Bars */}
              {records.map((r, i) => {
                const barWidth = 36;
                const gap = Math.max((500 - 40) / records.length, 65);
                const x = 45 + i * gap;
                const barHeight = (r.total_calls / maxCalls) * (chartHeight - 50);
                const y = chartHeight - 30 - barHeight;

                return (
                  <g key={r.date} className="group cursor-pointer">
                    {/* Hover Glow */}
                    <rect
                      x={x - 4}
                      y={y - 4}
                      width={barWidth + 8}
                      height={barHeight + 8}
                      rx="8"
                      className="fill-[#D97706]/0 group-hover:fill-[#D97706]/10 dark:group-hover:fill-[#F7D154]/10 transition-colors"
                    />
                    {/* Main Bar */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx="6"
                      className="fill-[#D97706] dark:fill-[#F7D154] group-hover:opacity-80 transition-all duration-300"
                    />
                    {/* Value Badge on bar */}
                    <text
                      x={x + barWidth / 2}
                      y={y - 8}
                      textAnchor="middle"
                      className="fill-[#0F172A] dark:fill-[#F2F4F7] text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {r.total_calls} calls
                    </text>
                    {/* Date label */}
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      className="fill-[#64748B] dark:fill-[#7B8794] text-[10px] font-mono"
                    >
                      {r.date.slice(5)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F14] text-[#0F172A] dark:text-[#F2F4F7] font-sans transition-colors duration-300 pb-16">
      
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-30 bg-[#FFFFFF]/90 dark:bg-[#10171F]/90 backdrop-blur-xl border-b border-[#E2E8F0] dark:border-[#1B232C] px-3.5 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#D97706] dark:bg-[#F7D154] flex items-center justify-center shadow-sm shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white dark:text-[#0B0F14]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <h1 className="font-bold text-base sm:text-lg tracking-tight text-[#0F172A] dark:text-[#F2F4F7] truncate">
                  Admin Portal
                </h1>
                <span className="hidden sm:inline-block text-[10px] bg-[#D97706]/10 text-[#D97706] dark:bg-[#F7D154]/10 dark:text-[#F7D154] border border-[#D97706]/20 dark:border-[#F7D154]/20 font-bold px-2 py-0.5 rounded-full uppercase shrink-0">
                  Control Center
                </span>
              </div>
              <p className="hidden xs:block text-xs text-[#64748B] dark:text-[#7B8794] truncate">
                Logged in as <span className="font-medium text-[#0F172A] dark:text-[#F2F4F7]">{adminUser?.email || "Admin"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            <ThemeToggle />
            <Link
              to="/app"
              className="p-2 sm:px-3.5 sm:py-2 rounded-xl border border-[#E2E8F0] dark:border-[#1F2630] bg-[#FFFFFF] dark:bg-[#10171F] hover:bg-[#F1F5F9] dark:hover:bg-[#17212B] text-xs font-semibold text-[#0F172A] dark:text-[#F2F4F7] flex items-center space-x-1.5 transition"
              title="Go to App"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Go to App</span>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-[#EF4444]/10 dark:bg-[#E5484D]/10 text-[#EF4444] dark:text-[#E5484D] hover:bg-[#EF4444]/20 dark:hover:bg-[#E5484D]/20 text-xs font-semibold flex items-center space-x-1.5 transition border border-[#EF4444]/20 dark:border-[#E5484D]/20 cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 pt-8">
        
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-[#E2E8F0] dark:border-[#1B232C] mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("groq")}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "groq"
                ? "bg-[#D97706] text-white dark:bg-[#F7D154] dark:text-[#0B0F14] shadow-sm"
                : "text-[#64748B] dark:text-[#7B8794] hover:bg-[#F1F5F9] dark:hover:bg-[#10171F]"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Groq API Usage</span>
          </button>

          <button
            onClick={() => setActiveTab("admins")}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "admins"
                ? "bg-[#D97706] text-white dark:bg-[#F7D154] dark:text-[#0B0F14] shadow-sm"
                : "text-[#64748B] dark:text-[#7B8794] hover:bg-[#F1F5F9] dark:hover:bg-[#10171F]"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Management</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "users"
                ? "bg-[#D97706] text-white dark:bg-[#F7D154] dark:text-[#0B0F14] shadow-sm"
                : "text-[#64748B] dark:text-[#7B8794] hover:bg-[#F1F5F9] dark:hover:bg-[#10171F]"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Management</span>
          </button>

          <button
            onClick={() => setActiveTab("health")}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "health"
                ? "bg-[#D97706] text-white dark:bg-[#F7D154] dark:text-[#0B0F14] shadow-sm"
                : "text-[#64748B] dark:text-[#7B8794] hover:bg-[#F1F5F9] dark:hover:bg-[#10171F]"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Health Check</span>
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "logs"
                ? "bg-[#D97706] text-white dark:bg-[#F7D154] dark:text-[#0B0F14] shadow-sm"
                : "text-[#64748B] dark:text-[#7B8794] hover:bg-[#F1F5F9] dark:hover:bg-[#10171F]"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>System Logs</span>
          </button>
        </div>

        {/* ── TAB 1: Groq API Usage Analytics ─────────────────────────────────── */}
        {activeTab === "groq" && (
          <div className="space-y-6">
            
            {/* Stats Overview Grid */}
            {loadingGroq ? (
              <StatCardSkeletonGrid count={4} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#FFFFFF] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1F2630] p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#64748B] dark:text-[#7B8794] uppercase tracking-wider">
                      Total API Calls
                    </span>
                    <Sparkles className="w-4 h-4 text-[#D97706] dark:text-[#F7D154]" />
                  </div>
                  <div className="text-2xl font-black tracking-tight text-[#0F172A] dark:text-[#F2F4F7]">
                    {groqData?.summary?.total_calls_all_time || 0}
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-[#7B8794] mt-1">All-time Groq LLM requests</p>
                </div>

                <div className="bg-[#10B981]/10 dark:bg-[#3CCB7F]/10 border border-[#10B981]/20 dark:border-[#3CCB7F]/20 p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#10B981] dark:text-[#3CCB7F] uppercase tracking-wider">
                      Today's Calls
                    </span>
                    <Clock className="w-4 h-4 text-[#10B981] dark:text-[#3CCB7F]" />
                  </div>
                  <div className="text-3xl font-black tracking-tight text-[#10B981] dark:text-[#3CCB7F]">
                    {groqData?.summary?.today_calls ?? 0}
                  </div>
                  <p className="text-[11px] text-[#10B981]/80 dark:text-[#3CCB7F]/80 mt-1">Groq LLM calls executed today</p>
                </div>

                <div className="bg-[#FFFFFF] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1F2630] p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#64748B] dark:text-[#7B8794] uppercase tracking-wider">
                      Estimated Tokens
                    </span>
                    <Cpu className="w-4 h-4 text-[#D97706] dark:text-[#F7D154]" />
                  </div>
                  <div className="text-2xl font-black tracking-tight text-[#0F172A] dark:text-[#F2F4F7]">
                    {(groqData?.summary?.total_tokens_all_time || 0).toLocaleString()}
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-[#7B8794] mt-1">Tokens processed across requests</p>
                </div>

                <div className="bg-[#FFFFFF] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1F2630] p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#64748B] dark:text-[#7B8794] uppercase tracking-wider">
                      Tracked Days
                    </span>
                    <Database className="w-4 h-4 text-[#D97706] dark:text-[#F7D154]" />
                  </div>
                  <div className="text-2xl font-black tracking-tight text-[#0F172A] dark:text-[#F2F4F7]">
                    {groqData?.summary?.recorded_days || 0}
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-[#7B8794] mt-1">Days logged in MongoDB collection</p>
                </div>
              </div>
            )}

            {/* Groq API Usage Date Filter Control Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FFFFFF] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1F2630] p-4 rounded-2xl shadow-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[#D97706] dark:text-[#F7D154]" />
                <span className="text-xs font-bold text-[#0F172A] dark:text-[#F2F4F7] uppercase tracking-wider">
                  Filter Usage By Date
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center space-x-1 p-1 bg-[#F1F5F9] dark:bg-[#0B0F14] border border-[#E2E8F0] dark:border-[#1B232C] rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => handleGroqPresetRange("all")}
                    className={`px-3 py-1.5 rounded-lg transition font-bold cursor-pointer ${
                      groqRangeMode === "all"
                        ? "bg-[#D97706] text-white dark:bg-[#F7D154] dark:text-[#0B0F14] shadow-sm"
                        : "text-[#64748B] dark:text-[#7B8794] hover:bg-[#FFFFFF] dark:hover:bg-[#10171F]"
                    }`}
                  >
                    All Time
                  </button>
                  <button
                    onClick={() => handleGroqPresetRange("today")}
                    className={`px-3 py-1.5 rounded-lg transition font-bold cursor-pointer ${
                      groqRangeMode === "today"
                        ? "bg-[#D97706] text-white dark:bg-[#F7D154] dark:text-[#0B0F14] shadow-sm"
                        : "text-[#64748B] dark:text-[#7B8794] hover:bg-[#FFFFFF] dark:hover:bg-[#10171F]"
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => handleGroqPresetRange("7days")}
                    className={`px-3 py-1.5 rounded-lg transition font-bold cursor-pointer ${
                      groqRangeMode === "7days"
                        ? "bg-[#D97706] text-white dark:bg-[#F7D154] dark:text-[#0B0F14] shadow-sm"
                        : "text-[#64748B] dark:text-[#7B8794] hover:bg-[#FFFFFF] dark:hover:bg-[#10171F]"
                    }`}
                  >
                    Last 7 Days
                  </button>
                  <button
                    onClick={() => handleGroqPresetRange("30days")}
                    className={`px-3 py-1.5 rounded-lg transition font-bold cursor-pointer ${
                      groqRangeMode === "30days"
                        ? "bg-[#D97706] text-white dark:bg-[#F7D154] dark:text-[#0B0F14] shadow-sm"
                        : "text-[#64748B] dark:text-[#7B8794] hover:bg-[#FFFFFF] dark:hover:bg-[#10171F]"
                    }`}
                  >
                    Last 30 Days
                  </button>
                  <button
                    onClick={() => setGroqRangeMode("custom")}
                    className={`px-3 py-1.5 rounded-lg transition font-bold cursor-pointer ${
                      groqRangeMode === "custom"
                        ? "bg-[#D97706] text-white dark:bg-[#F7D154] dark:text-[#0B0F14] shadow-sm"
                        : "text-[#64748B] dark:text-[#7B8794] hover:bg-[#FFFFFF] dark:hover:bg-[#10171F]"
                    }`}
                  >
                    Custom Date Range
                  </button>
                </div>

                {groqRangeMode === "custom" && (
                  <div className="flex items-center space-x-2 text-xs">
                    <input
                      type="date"
                      value={groqStartDate}
                      onChange={(e) => setGroqStartDate(e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl bg-[#FFFFFF] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1B232C] text-xs font-medium text-[#0F172A] dark:text-[#F2F4F7] focus:outline-none"
                    />
                    <span className="text-[#64748B] dark:text-[#7B8794] font-semibold">to</span>
                    <input
                      type="date"
                      value={groqEndDate}
                      onChange={(e) => setGroqEndDate(e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl bg-[#FFFFFF] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1B232C] text-xs font-medium text-[#0F172A] dark:text-[#F2F4F7] focus:outline-none"
                    />
                    <button
                      onClick={() => fetchGroqUsage(groqStartDate, groqEndDate)}
                      className="px-3 py-1.5 bg-[#D97706] hover:bg-[#b45309] text-white dark:bg-[#F7D154] dark:hover:bg-[#f5c730] dark:text-[#0B0F14] rounded-xl font-bold transition active:scale-95 shadow-sm cursor-pointer"
                    >
                      Apply Filter
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Graphical Chart */}
            {loadingGroq ? (
              <div className="p-12 text-center text-sm text-slate-500">Loading usage statistics...</div>
            ) : (
              renderGroqChart()
            )}
          </div>
        )}

        {/* ── TAB 2: Admin Management (Dedicated Section) ─────────────────── */}
        {activeTab === "admins" && (
          <div className="space-y-6">
            {/* Header Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#FFFFFF] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1F2630] p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#64748B] dark:text-[#7B8794] uppercase tracking-wider">
                    Total Administrator Accounts
                  </span>
                  <ShieldCheck className="w-5 h-5 text-[#D97706] dark:text-[#F7D154]" />
                </div>
                <div className="text-3xl font-black text-[#D97706] dark:text-[#F7D154]">
                  {pagination.admin_count || pagination.total_users || 0}
                </div>
                <p className="text-[11px] text-[#64748B] dark:text-[#7B8794] mt-1">Users with administrator privileges</p>
              </div>

              <div className="bg-[#10B981]/10 dark:bg-[#3CCB7F]/10 border border-[#10B981]/20 dark:border-[#3CCB7F]/20 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#10B981] dark:text-[#3CCB7F] uppercase tracking-wider">Active Admin Sessions</span>
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] dark:text-[#3CCB7F]" />
                </div>
                <div className="text-3xl font-black text-[#10B981] dark:text-[#3CCB7F]">1 Active</div>
                <p className="text-[11px] text-[#10B981]/80 dark:text-[#3CCB7F]/80 mt-1">Current logged-in admin session</p>
              </div>

              <div className="bg-[#FFFFFF] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1F2630] p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#64748B] dark:text-[#7B8794] uppercase tracking-wider">Security Access Level</span>
                  <Sparkles className="w-5 h-5 text-[#D97706] dark:text-[#F7D154]" />
                </div>
                <div className="text-3xl font-black text-[#0F172A] dark:text-[#F2F4F7]">Super Admin</div>
                <p className="text-[11px] text-[#64748B] dark:text-[#7B8794] mt-1">MongoDB & DuckDB system control</p>
              </div>
            </div>

            {/* Admin Controls & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FFFFFF] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1F2630] p-4 rounded-2xl shadow-sm">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#64748B] dark:text-[#7B8794] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    fetchUsers(1, pagination.limit, e.target.value, "admin");
                  }}
                  placeholder="Search admin username or email..."
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F14] border border-[#E2E8F0] dark:border-[#1B232C] text-[#0F172A] dark:text-[#F2F4F7] focus:outline-none focus:ring-2 focus:ring-[#D97706]/50 dark:focus:ring-[#F7D154]/50"
                />
              </div>

              <div className="flex items-center space-x-3 text-xs w-full sm:w-auto justify-between sm:justify-end">
                <button
                  onClick={() => setShowCreateModal(!showCreateModal)}
                  className="px-4 py-2 bg-[#D97706] hover:bg-[#b45309] text-white dark:bg-[#F7D154] dark:hover:bg-[#f5c730] dark:text-[#0B0F14] font-bold rounded-xl text-xs flex items-center space-x-2 transition shadow-sm active:scale-95 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{showCreateModal ? "Cancel" : "+ Add New Admin"}</span>
                </button>

                <div className="flex items-center space-x-2">
                  <span className="text-[#64748B] dark:text-[#7B8794] font-medium">Rows:</span>
                  <select
                    value={pagination.limit}
                    onChange={(e) => {
                      const newLimit = Number(e.target.value);
                      fetchUsers(1, newLimit, userSearch, "admin");
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F14] border border-[#E2E8F0] dark:border-[#1B232C] text-[#0F172A] dark:text-[#F2F4F7] text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>

                  <button
                    onClick={() => fetchUsers(pagination.page, pagination.limit, userSearch, "admin")}
                    className="p-2 rounded-xl hover:bg-[#F1F5F9] dark:hover:bg-[#17212B] border border-[#E2E8F0] dark:border-[#1B232C] text-[#0F172A] dark:text-[#F2F4F7] transition cursor-pointer"
                    title="Refresh Admin List"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Create Admin Form Card (Collapsible) */}
            {showCreateModal && (
              <form onSubmit={handleCreateAdmin} className="bg-[#FFFFFF] dark:bg-[#10171F] border border-[#D97706]/40 dark:border-[#F7D154]/40 p-6 rounded-2xl space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1B232C] pb-3">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-[#D97706] dark:text-[#F7D154]" />
                    <h4 className="font-extrabold text-sm text-[#0F172A] dark:text-[#F2F4F7]">
                      Assign New Administrator Account
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D97706]/10 text-[#D97706] dark:bg-[#F7D154]/10 dark:text-[#F7D154] border border-[#D97706]/20 dark:border-[#F7D154]/20">
                    Default Password Assisted
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#0F172A] dark:text-[#F2F4F7] mb-1 uppercase tracking-wider">
                      Admin Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="admin2@domain.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F14] border border-[#E2E8F0] dark:border-[#1B232C] text-xs text-[#0F172A] dark:text-[#F2F4F7] focus:outline-none focus:ring-2 focus:ring-[#D97706]/50 dark:focus:ring-[#F7D154]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0F172A] dark:text-[#F2F4F7] mb-1 uppercase tracking-wider">
                      Admin Username (Optional)
                    </label>
                    <input
                      type="text"
                      value={newAdminUsername}
                      onChange={(e) => setNewAdminUsername(e.target.value)}
                      placeholder="admin_john"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F14] border border-[#E2E8F0] dark:border-[#1B232C] text-xs text-[#0F172A] dark:text-[#F2F4F7] focus:outline-none focus:ring-2 focus:ring-[#D97706]/50 dark:focus:ring-[#F7D154]/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0F172A] dark:text-[#F2F4F7] mb-1 uppercase tracking-wider">
                      Default Password *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="Admin@12345"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F14] border border-[#E2E8F0] dark:border-[#1B232C] text-xs font-mono text-[#0F172A] dark:text-[#F2F4F7] focus:outline-none focus:ring-2 focus:ring-[#D97706]/50 dark:focus:ring-[#F7D154]/50"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-[11px] text-[#64748B] dark:text-[#7B8794]">
                    If account exists, it will be upgraded to Admin and assigned this default password.
                  </p>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-[#64748B] hover:text-[#0F172A] dark:text-[#7B8794] dark:hover:text-[#F2F4F7] transition cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={creatingAdmin}
                      className="px-5 py-2 rounded-xl bg-[#D97706] hover:bg-[#b45309] text-white dark:bg-[#F7D154] dark:hover:bg-[#f5c730] dark:text-[#0B0F14] font-bold text-xs flex items-center space-x-2 shadow-sm transition disabled:opacity-50 cursor-pointer"
                    >
                      {creatingAdmin ? (
                        <div className="w-4 h-4 border-2 border-white dark:border-[#0B0F14] border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Create / Assign Admin</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Admin Table */}
            <div className="bg-[#FFFFFF] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1F2630] rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 bg-[#F8FAFC] dark:bg-[#0B0F14] border-b border-[#E2E8F0] dark:border-[#1B232C] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#D97706] dark:text-[#F7D154]" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#0F172A] dark:text-[#F2F4F7]">
                    Administrator Accounts Directory
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#D97706]/10 text-[#D97706] dark:bg-[#F7D154]/10 dark:text-[#F7D154] border border-[#D97706]/20 dark:border-[#F7D154]/20">
                  {pagination.total_users || 0} Admins Found
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] dark:bg-[#0B0F14] border-b border-[#E2E8F0] dark:border-[#1B232C] text-[#64748B] dark:text-[#7B8794] font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Admin User</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Role & Privileges</th>
                      <th className="py-3.5 px-4">Account Status</th>
                      <th className="py-3.5 px-4">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1B232C]">
                    {loadingUsers ? (
                      Array.from({ length: 5 }).map((_, idx) => (
                        <tr key={idx} className="animate-pulse">
                          <td className="py-3.5 px-4 flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-full bg-[#D97706]/20 dark:bg-[#F7D154]/20" />
                            <div className="h-3 w-24 rounded bg-stone-300/60 dark:bg-white/10" />
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="h-3 w-36 rounded bg-stone-200/70 dark:bg-white/[0.07]" />
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="h-4 w-24 rounded-full bg-[#D97706]/20" />
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="h-4 w-20 rounded-full bg-emerald-200/50 dark:bg-emerald-950/40" />
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="h-3 w-16 rounded bg-stone-200/60 dark:bg-white/[0.05]" />
                          </td>
                        </tr>
                      ))
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[#64748B] dark:text-[#7B8794]">No administrator accounts found.</td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u._id} className="hover:bg-[#F1F5F9]/50 dark:hover:bg-[#17212B]/50 transition">
                          <td className="py-3.5 px-4 font-bold text-[#0F172A] dark:text-[#F2F4F7] flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-full bg-[#D97706]/20 text-[#D97706] dark:bg-[#F7D154]/20 dark:text-[#F7D154] flex items-center justify-center font-bold text-xs">
                              {u.username?.[0]?.toUpperCase() || "A"}
                            </div>
                            <span>{u.username}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[#64748B] dark:text-[#7B8794]">{u.email}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/20 dark:bg-[#F7D154]/10 dark:text-[#F7D154] dark:border-[#F7D154]/20">
                              ADMINISTRATOR
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#10B981]/10 text-[#10B981] dark:bg-[#3CCB7F]/10 dark:text-[#3CCB7F]">
                              Active & Verified
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#64748B] dark:text-[#7B8794] font-mono text-[11px]">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : "N/A"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Server-side Pagination */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#F8FAFC] dark:bg-[#0B0F14] border-t border-[#E2E8F0] dark:border-[#1B232C] text-xs text-[#64748B] dark:text-[#7B8794]">
                <div>
                  Showing page <span className="font-semibold text-[#0F172A] dark:text-[#F2F4F7]">{pagination.page}</span> of{" "}
                  <span className="font-semibold text-[#0F172A] dark:text-[#F2F4F7]">{pagination.total_pages}</span> (
                  <span className="font-medium">{pagination.total_users} total admins</span>)
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    disabled={!pagination.has_prev || loadingUsers}
                    onClick={() => fetchUsers(pagination.page - 1, pagination.limit, userSearch, "admin")}
                    className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#1B232C] hover:bg-[#F1F5F9] dark:hover:bg-[#17212B] text-[#0F172A] dark:text-[#F2F4F7] disabled:opacity-40 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={!pagination.has_next || loadingUsers}
                    onClick={() => fetchUsers(pagination.page + 1, pagination.limit, userSearch, "admin")}
                    className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#1B232C] hover:bg-[#F1F5F9] dark:hover:bg-[#17212B] text-[#0F172A] dark:text-[#F2F4F7] disabled:opacity-40 transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: Standard User Management (Dedicated Section) ─────────── */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Header Cards Grid */}
            {loadingUsers ? (
              <StatCardSkeletonGrid count={4} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-[#FFFFFF] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1F2630] p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#64748B] dark:text-[#7B8794] uppercase tracking-wider">
                      Total Standard Users
                    </span>
                    <Users className="w-5 h-5 text-[#D97706] dark:text-[#F7D154]" />
                  </div>
                  <div className="text-3xl font-black text-[#D97706] dark:text-[#F7D154]">
                    {pagination.standard_user_count || pagination.total_users || 0}
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-[#7B8794] mt-1">Application end-user accounts</p>
                </div>

                <div className="bg-[#10B981]/10 dark:bg-[#3CCB7F]/10 border border-[#10B981]/20 dark:border-[#3CCB7F]/20 p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#10B981] dark:text-[#3CCB7F] uppercase tracking-wider">
                      Active User Sessions
                    </span>
                    <div className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </div>
                  </div>
                  <div className="text-3xl font-black text-[#10B981] dark:text-[#3CCB7F]">
                    {activeSessions?.active_user_sessions ?? activeSessions?.total_active_sessions ?? 1} Active
                  </div>
                  <p className="text-[11px] text-[#10B981]/80 dark:text-[#3CCB7F]/80 mt-1">Live active user sessions</p>
                </div>

                <div className="bg-[#FFFFFF] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1F2630] p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#64748B] dark:text-[#7B8794] uppercase tracking-wider">Verified Accounts</span>
                    <CheckCircle2 className="w-5 h-5 text-[#10B981] dark:text-[#3CCB7F]" />
                  </div>
                  <div className="text-3xl font-black text-[#0F172A] dark:text-[#F2F4F7]">
                    {users.filter(u => u.is_verified).length} Verified
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-[#7B8794] mt-1">OTP verified user emails</p>
                </div>

                <div className="bg-[#FFFFFF] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1F2630] p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#64748B] dark:text-[#7B8794] uppercase tracking-wider">Database Isolation</span>
                    <Database className="w-5 h-5 text-[#D97706] dark:text-[#F7D154]" />
                  </div>
                  <div className="text-3xl font-black text-[#0F172A] dark:text-[#F2F4F7]">MongoDB</div>
                  <p className="text-[11px] text-[#64748B] dark:text-[#7B8794] mt-1">Per-session isolated data</p>
                </div>
              </div>
            )}

            {/* User Controls & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FFFFFF] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1F2630] p-4 rounded-2xl shadow-sm">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#64748B] dark:text-[#7B8794] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    fetchUsers(1, pagination.limit, e.target.value, "user");
                  }}
                  placeholder="Search standard user username or email..."
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F14] border border-[#E2E8F0] dark:border-[#1B232C] text-[#0F172A] dark:text-[#F2F4F7] focus:outline-none focus:ring-2 focus:ring-[#D97706]/50 dark:focus:ring-[#F7D154]/50"
                />
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <span className="text-[#64748B] dark:text-[#7B8794] font-medium">Rows per page:</span>
                <select
                  value={pagination.limit}
                  onChange={(e) => {
                    const newLimit = Number(e.target.value);
                    fetchUsers(1, newLimit, userSearch, "user");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F14] border border-[#E2E8F0] dark:border-[#1B232C] text-[#0F172A] dark:text-[#F2F4F7] text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>

                <button
                  onClick={() => fetchUsers(pagination.page, pagination.limit, userSearch, "user")}
                  className="p-2 rounded-xl hover:bg-[#F1F5F9] dark:hover:bg-[#17212B] border border-[#E2E8F0] dark:border-[#1B232C] text-[#0F172A] dark:text-[#F2F4F7] transition cursor-pointer"
                  title="Refresh User List"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Standard User Table */}
            <div className="bg-[#FFFFFF] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1F2630] rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 bg-[#F8FAFC] dark:bg-[#0B0F14] border-b border-[#E2E8F0] dark:border-[#1B232C] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-[#D97706] dark:text-[#F7D154]" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#0F172A] dark:text-[#F2F4F7]">
                    Standard User Accounts Directory
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] dark:bg-[#3CCB7F]/10 dark:text-[#3CCB7F] border border-[#10B981]/20 dark:border-[#3CCB7F]/20 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{activeSessions?.active_user_sessions ?? activeSessions?.total_active_sessions ?? 1} Active Now</span>
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#F1F5F9] dark:bg-[#0B0F14] text-[#64748B] dark:text-[#7B8794]">
                    {pagination.total_users || 0} Total Users
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] dark:bg-[#0B0F14] border-b border-[#E2E8F0] dark:border-[#1B232C] text-[#64748B] dark:text-[#7B8794] font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1B232C]">
                    {loadingUsers ? (
                      Array.from({ length: 5 }).map((_, idx) => (
                        <tr key={idx} className="animate-pulse">
                          <td className="py-3.5 px-4 flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-full bg-[#D97706]/20 dark:bg-[#F7D154]/20" />
                            <div className="h-3 w-24 rounded bg-stone-300/60 dark:bg-white/10" />
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="h-3 w-36 rounded bg-stone-200/70 dark:bg-white/[0.07]" />
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="h-4 w-20 rounded-full bg-slate-200/60 dark:bg-white/10" />
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="h-4 w-16 rounded-full bg-emerald-200/50 dark:bg-emerald-950/40" />
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="h-3 w-16 rounded bg-stone-200/60 dark:bg-white/[0.05]" />
                          </td>
                        </tr>
                      ))
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[#64748B] dark:text-[#7B8794]">No standard user accounts found.</td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u._id} className="hover:bg-[#F1F5F9]/50 dark:hover:bg-[#17212B]/50 transition">
                          <td className="py-3.5 px-4 font-semibold text-[#0F172A] dark:text-[#F2F4F7] flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-full bg-[#D97706]/10 text-[#D97706] dark:bg-[#F7D154]/10 dark:text-[#F7D154] flex items-center justify-center font-bold text-xs">
                              {u.username?.[0]?.toUpperCase() || "U"}
                            </div>
                            <span>{u.username}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[#64748B] dark:text-[#7B8794]">{u.email}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase bg-[#F1F5F9] dark:bg-[#0B0F14] text-[#64748B] dark:text-[#7B8794]">
                              Standard User
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              u.is_verified
                                ? "bg-[#10B981]/10 text-[#10B981] dark:bg-[#3CCB7F]/10 dark:text-[#3CCB7F]"
                                : "bg-[#D97706]/10 text-[#D97706] dark:bg-[#F7D154]/10 dark:text-[#F7D154]"
                            }`}>
                              {u.is_verified ? "Verified" : "Unverified"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#64748B] dark:text-[#7B8794] font-mono text-[11px]">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : "N/A"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Server-side Pagination */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#F8FAFC] dark:bg-[#0B0F14] border-t border-[#E2E8F0] dark:border-[#1B232C] text-xs text-[#64748B] dark:text-[#7B8794]">
                <div>
                  Showing page <span className="font-semibold text-[#0F172A] dark:text-[#F2F4F7]">{pagination.page}</span> of{" "}
                  <span className="font-semibold text-[#0F172A] dark:text-[#F2F4F7]">{pagination.total_pages}</span> (
                  <span className="font-medium">{pagination.total_users} total users</span>)
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    disabled={!pagination.has_prev || loadingUsers}
                    onClick={() => fetchUsers(pagination.page - 1, pagination.limit, userSearch, "user")}
                    className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#1B232C] hover:bg-[#F1F5F9] dark:hover:bg-[#17212B] text-[#0F172A] dark:text-[#F2F4F7] disabled:opacity-40 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={!pagination.has_next || loadingUsers}
                    onClick={() => fetchUsers(pagination.page + 1, pagination.limit, userSearch, "user")}
                    className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#1B232C] hover:bg-[#F1F5F9] dark:hover:bg-[#17212B] text-[#0F172A] dark:text-[#F2F4F7] disabled:opacity-40 transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: Health Check ───────────────────────────────────────────── */}
        {activeTab === "health" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#FFFFFF] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1F2630] p-5 rounded-2xl shadow-sm">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  healthData?.status === "healthy" ? "bg-[#10B981] dark:bg-[#3CCB7F] animate-pulse" : "bg-[#EF4444] dark:bg-[#E5484D]"
                }`} />
                <div>
                  <h3 className="font-bold text-base text-[#0F172A] dark:text-[#F2F4F7]">System Status: {healthData?.status?.toUpperCase() || "CHECKING"}</h3>
                  <p className="text-xs text-[#64748B] dark:text-[#7B8794]">Last verified at {healthData?.timestamp ? new Date(healthData.timestamp).toLocaleTimeString() : "N/A"}</p>
                </div>
              </div>
              <button
                onClick={fetchHealth}
                disabled={loadingHealth}
                className="px-4 py-2 bg-[#D97706] hover:bg-[#b45309] text-white dark:bg-[#F7D154] dark:hover:bg-[#f5c730] dark:text-[#0B0F14] rounded-xl text-xs font-bold flex items-center space-x-2 transition active:scale-95 shadow-sm cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingHealth ? "animate-spin" : ""}`} />
                <span>Re-check Health</span>
              </button>
            </div>

            {loadingHealth ? (
              <StatCardSkeletonGrid count={4} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {/* MongoDB Diagnostics */}
              <div className="bg-[#FFFFFF] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1F2630] p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Database className="w-5 h-5 text-[#10B981] dark:text-[#3CCB7F]" />
                    <h4 className="font-bold text-sm text-[#0F172A] dark:text-[#F2F4F7]">MongoDB Database</h4>
                  </div>
                  <span className="px-2 py-0.5 bg-[#10B981]/10 text-[#10B981] dark:bg-[#3CCB7F]/10 dark:text-[#3CCB7F] text-[10px] font-bold rounded-full border border-[#10B981]/20 dark:border-[#3CCB7F]/20">
                    {healthData?.mongodb?.status || "Unknown"}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#E2E8F0] dark:border-[#1B232C]">
                    <span className="text-[#64748B] dark:text-[#7B8794]">Ping Response:</span>
                    <span className="font-mono font-bold text-[#10B981] dark:text-[#3CCB7F]">{healthData?.mongodb?.ping_ms} ms</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#64748B] dark:text-[#7B8794]">Database Name:</span>
                    <span className="font-mono text-[#0F172A] dark:text-[#F2F4F7]">{healthData?.mongodb?.database_name}</span>
                  </div>
                </div>
              </div>

              {/* DuckDB Engine Diagnostics */}
              <div className="bg-[#FFFFFF] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1F2630] p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-5 h-5 text-[#D97706] dark:text-[#F7D154]" />
                    <h4 className="font-bold text-sm text-[#0F172A] dark:text-[#F2F4F7]">DuckDB Engine</h4>
                  </div>
                  <span className="px-2 py-0.5 bg-[#D97706]/10 text-[#D97706] dark:bg-[#F7D154]/10 dark:text-[#F7D154] text-[10px] font-bold rounded-full border border-[#D97706]/20 dark:border-[#F7D154]/20">
                    Active
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#E2E8F0] dark:border-[#1B232C]">
                    <span className="text-[#64748B] dark:text-[#7B8794]">Active Connections:</span>
                    <span className="font-mono font-bold text-[#0F172A] dark:text-[#F2F4F7]">{healthData?.duckdb?.active_connections}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#64748B] dark:text-[#7B8794]">Isolation Mode:</span>
                    <span className="font-mono text-[#0F172A] dark:text-[#F2F4F7]">In-Memory Sandbox</span>
                  </div>
                </div>
              </div>

              {/* Live WebApp Sessions */}
              <div className="bg-[#FFFFFF] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1F2630] p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-[#D97706] dark:text-[#F7D154]" />
                    <h4 className="font-bold text-sm text-[#0F172A] dark:text-[#F2F4F7]">Active WebApp Sessions</h4>
                  </div>
                  <span className="px-2 py-0.5 bg-[#D97706]/10 text-[#D97706] dark:bg-[#F7D154]/10 dark:text-[#F7D154] text-[10px] font-bold rounded-full border border-[#D97706]/20 dark:border-[#F7D154]/20">
                    Live Tracking
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#E2E8F0] dark:border-[#1B232C]">
                    <span className="text-[#64748B] dark:text-[#7B8794]">Active Sessions (5m):</span>
                    <span className="font-mono font-bold text-[#D97706] dark:text-[#F7D154]">
                      {activeSessions?.sessions?.length ?? activeSessions?.total_active_sessions ?? healthData?.active_sessions?.total_active_sessions ?? 0} Live
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#64748B] dark:text-[#7B8794]">Admins / Users:</span>
                    <span className="font-mono text-[#0F172A] dark:text-[#F2F4F7]">
                      {activeSessions?.sessions?.filter(s => s.role === "admin").length ?? activeSessions?.active_admin_sessions ?? healthData?.active_sessions?.active_admin_sessions ?? 0} Admins | {activeSessions?.sessions?.filter(s => s.role !== "admin").length ?? activeSessions?.active_user_sessions ?? healthData?.active_sessions?.active_user_sessions ?? 0} Users
                    </span>
                  </div>
                </div>
              </div>

              {/* Groq API Configuration */}
              <div className="bg-[#FFFFFF] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1F2630] p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-[#D97706] dark:text-[#F7D154]" />
                    <h4 className="font-bold text-sm text-[#0F172A] dark:text-[#F2F4F7]">Groq LLM Service</h4>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                    healthData?.groq_configured
                      ? "bg-[#10B981]/10 text-[#10B981] dark:bg-[#3CCB7F]/10 dark:text-[#3CCB7F] border-[#10B981]/20 dark:border-[#3CCB7F]/20"
                      : "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20"
                  }`}>
                    {healthData?.groq_configured ? "API Key Loaded" : "Key Missing"}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#E2E8F0] dark:border-[#1B232C]">
                    <span className="text-[#64748B] dark:text-[#7B8794]">App Environment:</span>
                    <span className="font-mono font-bold text-[#0F172A] dark:text-[#F2F4F7]">{healthData?.env}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#64748B] dark:text-[#7B8794]">API Health Latency:</span>
                    <span className="font-mono text-[#0F172A] dark:text-[#F2F4F7]">{healthData?.latency_ms} ms</span>
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* Live Active Sessions Table */}
            <div className="bg-[#FFFFFF] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1F2630] rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 bg-[#F8FAFC] dark:bg-[#0B0F14] border-b border-[#E2E8F0] dark:border-[#1B232C] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-[#D97706] dark:text-[#F7D154]" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#0F172A] dark:text-[#F2F4F7]">
                    Live Active User Sessions
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#D97706]/10 text-[#D97706] dark:bg-[#F7D154]/10 dark:text-[#F7D154] border border-[#D97706]/20 dark:border-[#F7D154]/20">
                    {activeSessions?.sessions?.length ?? 1} Active Session(s)
                  </span>
                  <button
                    onClick={fetchActiveSessions}
                    className="p-1 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#17212B] text-[#64748B] dark:text-[#7B8794] transition cursor-pointer"
                    title="Refresh Active Sessions"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] dark:bg-[#0B0F14] border-b border-[#E2E8F0] dark:border-[#1B232C] text-[#64748B] dark:text-[#7B8794] font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">User Session</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Login Time</th>
                      <th className="py-3.5 px-4">Idle Status</th>
                      <th className="py-3.5 px-4">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1B232C]">
                    {(!activeSessions?.sessions || activeSessions.sessions.length === 0) ? (
                      <tr className="hover:bg-[#F1F5F9]/50 dark:hover:bg-[#17212B]/50 transition">
                        <td className="py-3.5 px-4 font-bold text-[#0F172A] dark:text-[#F2F4F7] flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-[#D97706]/20 text-[#D97706] dark:bg-[#F7D154]/20 dark:text-[#F7D154] flex items-center justify-center font-bold text-[10px]">
                            A
                          </div>
                          <span>{adminUser?.email || "admin@demo.com"}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#D97706]/10 text-[#D97706] dark:bg-[#F7D154]/10 dark:text-[#F7D154]">
                            ADMIN
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#64748B] dark:text-[#7B8794] text-[11px]">Just now</td>
                        <td className="py-3.5 px-4 font-mono text-[#10B981] dark:text-[#3CCB7F] font-bold">Active (&lt;1s)</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#10B981]/10 text-[#10B981] dark:bg-[#3CCB7F]/10 dark:text-[#3CCB7F]">
                            Online
                          </span>
                        </td>
                      </tr>
                    ) : (
                      activeSessions.sessions.map((sess, idx) => (
                        <tr key={idx} className="hover:bg-[#F1F5F9]/50 dark:hover:bg-[#17212B]/50 transition">
                          <td className="py-3.5 px-4 font-bold text-[#0F172A] dark:text-[#F2F4F7] flex items-center space-x-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                              sess.role === "admin"
                                ? "bg-[#D97706]/20 text-[#D97706] dark:bg-[#F7D154]/20 dark:text-[#F7D154]"
                                : "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                            }`}>
                              {sess.username?.[0]?.toUpperCase() || "U"}
                            </div>
                            <span>{sess.username} ({sess.user_key})</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              sess.role === "admin"
                                ? "bg-[#D97706]/10 text-[#D97706] dark:bg-[#F7D154]/10 dark:text-[#F7D154]"
                                : "bg-[#F1F5F9] dark:bg-[#0B0F14] text-[#64748B] dark:text-[#7B8794]"
                            }`}>
                              {sess.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[#64748B] dark:text-[#7B8794] text-[11px]">
                            {sess.login_at ? new Date(sess.login_at).toLocaleTimeString() : "N/A"}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-[#0F172A] dark:text-[#F2F4F7]">
                            {sess.idle_seconds}s idle
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#10B981]/10 text-[#10B981] dark:bg-[#3CCB7F]/10 dark:text-[#3CCB7F] flex items-center space-x-1 w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] dark:bg-[#3CCB7F] animate-pulse" />
                              <span>Online</span>
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: Live System Log Viewer ───────────────────────────────────── */}
        {activeTab === "logs" && (
          <div className="space-y-4">
            
            {/* Filter and Control Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FFFFFF] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1F2630] p-4 rounded-2xl shadow-sm">
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-[#64748B] dark:text-[#7B8794] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="Search backend log text..."
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#F8FAFC] dark:bg-[#0B0F14] border border-[#E2E8F0] dark:border-[#1B232C] text-[#0F172A] dark:text-[#F2F4F7] focus:outline-none"
                  />
                </div>

                <div className="flex items-center space-x-1 border border-[#E2E8F0] dark:border-[#1B232C] rounded-xl p-1 bg-[#F1F5F9] dark:bg-[#0B0F14]">
                  {["ALL", "INFO", "WARNING", "ERROR"].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setLogLevel(lvl)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        logLevel === lvl
                          ? "bg-[#D97706] text-white dark:bg-[#F7D154] dark:text-[#0B0F14] shadow-sm"
                          : "text-[#64748B] dark:text-[#7B8794] hover:bg-[#FFFFFF] dark:hover:bg-[#10171F]"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoRefreshLogs}
                    onChange={(e) => setAutoRefreshLogs(e.target.checked)}
                    className="rounded border-[#E2E8F0] dark:border-[#1B232C] text-[#D97706] dark:text-[#F7D154] focus:ring-[#D97706] dark:focus:ring-[#F7D154]"
                  />
                  <span className="text-[#64748B] dark:text-[#7B8794] font-medium">Live Auto-Stream (3s)</span>
                </label>

                <button
                  onClick={fetchLogs}
                  disabled={loadingLogs}
                  className="px-3 py-1.5 bg-[#D97706] hover:bg-[#b45309] text-white dark:bg-[#F7D154] dark:hover:bg-[#f5c730] dark:text-[#0B0F14] rounded-xl text-xs font-bold flex items-center space-x-1.5 transition active:scale-95 shadow-sm cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Dark Terminal Log Window */}
            <div className="bg-[#0B0F14] border border-[#1F2630] rounded-2xl overflow-hidden shadow-2xl font-mono text-xs">
              <div className="bg-[#10171F] px-4 py-2.5 border-b border-[#1B232C] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-3.5 h-3.5 text-[#7B8794]" />
                  <span className="text-[#F2F4F7] text-[11px] font-medium">backend_system.log (In-Memory Ring Buffer)</span>
                </div>
                <span className="text-[#7B8794] text-[10px]">{logs.length} entries captured</span>
              </div>

              <div className="p-4 h-[450px] overflow-y-auto space-y-2">
                {logs.length === 0 ? (
                  <div className="text-[#7B8794] text-center py-20">
                    No backend logs captured for current filter criteria.
                  </div>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="flex items-start space-x-3 hover:bg-white/[0.02] p-1 rounded transition">
                      <span className="text-[#7B8794] text-[11px] whitespace-nowrap">
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ""}
                      </span>

                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase whitespace-nowrap ${
                        log.level === "ERROR"
                          ? "bg-[#E5484D]/20 text-[#E5484D] border border-[#E5484D]/30"
                          : log.level === "WARNING"
                          ? "bg-[#F7D154]/20 text-[#F7D154] border border-[#F7D154]/30"
                          : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      }`}>
                        {log.level}
                      </span>

                      <span className="text-[#7B8794] text-[11px] font-semibold whitespace-nowrap">
                        [{log.logger}]:
                      </span>

                      <span className="text-[#F2F4F7] text-[11px] break-all">
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
