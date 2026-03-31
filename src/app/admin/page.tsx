"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Trash2,
  Shield,
  BarChart3,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useMounted } from "@/hooks";
import { CATEGORY_CONFIG, type CampusEvent, type User as AppUser, type UserRole } from "@/lib/types";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

type Tab = "overview" | "moderation" | "events" | "users";

interface Analytics {
  totalEvents: number;
  pendingEvents: number;
  totalUsers: number;
  totalRsvps: number;
  categoryDistribution: Record<string, number>;
  topEvents: CampusEvent[];
  monthlyRsvps: { month: string; count: number }[];
}

const PIE_COLORS = [
  "oklch(0.49 0.22 264)",
  "oklch(0.65 0.20 22)",
  "oklch(0.80 0.15 85)",
  "oklch(0.65 0.16 163)",
  "oklch(0.55 0.20 300)",
  "oklch(0.70 0.15 40)",
  "oklch(0.60 0.18 200)",
  "oklch(0.50 0.15 120)",
];

export default function AdminDashboard() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const mounted = useMounted();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [pendingEvents, setPendingEvents] = useState<CampusEvent[]>([]);
  const [allEvents, setAllEvents] = useState<CampusEvent[]>([]);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mounted || authLoading) return;
    if (!isLoggedIn || !user || user.role !== "admin") {
      router.push("/login");
      return;
    }
    loadData();
  }, [isLoggedIn, user, router, mounted, authLoading]);

  async function loadData() {
    setLoading(true);
    try {
      const [analyticsRes, pendingRes, allEventsRes, usersRes] = await Promise.all([
        fetch("/api/analytics"),
        fetch("/api/events?status=pending"),
        fetch("/api/events?status=all"),
        fetch("/api/users"),
      ]);
      setAnalytics(await analyticsRes.json());
      setPendingEvents(await pendingRes.json());
      setAllEvents(await allEventsRes.json());
      setAllUsers(await usersRes.json());
    } catch {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }

  const handleModerate = async (eventId: string, status: "approved" | "rejected") => {
    try {
      await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setPendingEvents((prev) => prev.filter((e) => e.id !== eventId));
      setAllEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, status } : e))
      );
      if (analytics) {
        setAnalytics({
          ...analytics,
          pendingEvents: analytics.pendingEvents - 1,
          totalEvents: status === "approved" ? analytics.totalEvents + 1 : analytics.totalEvents,
        });
      }
      toast.success(`Event ${status}`);
    } catch {
      toast.error("Failed to update event");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      setAllEvents((prev) => prev.filter((e) => e.id !== eventId));
      setPendingEvents((prev) => prev.filter((e) => e.id !== eventId));
      toast.success("Event deleted");
    } catch {
      toast.error("Failed to delete event");
    }
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role }),
      });
      setAllUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u))
      );
      toast.success("Role updated");
    } catch {
      toast.error("Failed to update role");
    }
  };

  if (!mounted || authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isLoggedIn || !user || user.role !== "admin") return null;

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "moderation", label: "Moderation", icon: Clock },
    { id: "events", label: "All Events", icon: CalendarDays },
    { id: "users", label: "Users", icon: Users },
  ];

  const categoryPieData = analytics
    ? Object.entries(analytics.categoryDistribution).map(([name, value]) => ({
        name: CATEGORY_CONFIG[name as keyof typeof CATEGORY_CONFIG]?.label || name,
        value,
      }))
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage events, users, and view analytics</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 rounded-xl p-1 mb-8 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap",
              tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
            {t.id === "moderation" && pendingEvents.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                {pendingEvents.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-6 h-32" />
          ))}
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {tab === "overview" && analytics && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Events", value: analytics.totalEvents, icon: CalendarDays, color: "text-primary" },
                  { label: "Pending Review", value: analytics.pendingEvents, icon: Clock, color: "text-amber-600" },
                  { label: "Total Users", value: analytics.totalUsers, icon: Users, color: "text-emerald-600" },
                  { label: "Total RSVPs", value: analytics.totalRsvps, icon: TrendingUp, color: "text-accent" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                      <stat.icon className={cn("h-5 w-5", stat.color)} />
                    </div>
                    <p className="text-3xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* RSVPs Over Time */}
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    RSVPs Over Time
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.monthlyRsvps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                        <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        />
                        <Line type="monotone" dataKey="count" stroke="oklch(0.49 0.22 264)" strokeWidth={2} dot={{ fill: "oklch(0.49 0.22 264)", r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Category Distribution */}
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-accent" />
                    Events by Category
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                          labelLine={false}
                        >
                          {categoryPieData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Top Events */}
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Top Events by RSVP
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.topEvents.map((e) => ({ name: e.title.length > 20 ? e.title.slice(0, 20) + "..." : e.title, rsvps: e.rsvpCount }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                      <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="rsvps" fill="oklch(0.65 0.20 22)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {/* Moderation Tab */}
          {tab === "moderation" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="font-semibold text-lg text-foreground mb-4">
                Pending Events ({pendingEvents.length})
              </h2>
              {pendingEvents.length > 0 ? (
                <div className="space-y-4">
                  {pendingEvents.map((event) => {
                    const catConfig = CATEGORY_CONFIG[event.category];
                    return (
                      <div key={event.id} className="rounded-xl border border-border bg-card p-5">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-foreground">{event.title}</h3>
                              <Badge className={cn("text-[10px]", catConfig.bgColor, catConfig.color)}>
                                {catConfig.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{format(parseISO(event.date), "MMM d, yyyy")} at {event.time}</span>
                              <span>{event.location}</span>
                              <span>by {event.organizerName}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0 items-start">
                            <button
                              onClick={() => handleModerate(event.id, "approved")}
                              className="flex items-center gap-1.5 rounded-lg bg-green-100 dark:bg-green-900/40 px-3 py-2 text-xs font-medium text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/60 transition-colors"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleModerate(event.id, "rejected")}
                              className="flex items-center gap-1.5 rounded-lg bg-red-100 dark:bg-red-900/40 px-3 py-2 text-xs font-medium text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 rounded-xl border border-border bg-card">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="font-semibold text-foreground">All caught up!</p>
                  <p className="text-sm text-muted-foreground mt-1">No events pending review.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* All Events Tab */}
          {tab === "events" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="font-semibold text-lg text-foreground mb-4">
                All Events ({allEvents.length})
              </h2>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Event</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Category</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Date</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">RSVPs</th>
                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allEvents.map((event) => {
                        const catConfig = CATEGORY_CONFIG[event.category];
                        const statusColors: Record<string, string> = {
                          approved: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
                          pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
                          rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
                        };
                        return (
                          <tr key={event.id} className="border-b border-border/60 hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3">
                              <div className="max-w-[200px]">
                                <p className="font-medium text-foreground truncate">{event.title}</p>
                                <p className="text-xs text-muted-foreground">{event.organizerName}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={cn("text-[10px]", catConfig.bgColor, catConfig.color)}>
                                {catConfig.label}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                              {format(parseISO(event.date), "MMM d, yyyy")}
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={cn("text-[10px] capitalize", statusColors[event.status])}>
                                {event.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-xs font-medium">{event.rsvpCount}</td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() => router.push(`/events/${event.id}`)}
                                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                                  title="View"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                {event.status === "pending" && (
                                  <button
                                    onClick={() => handleModerate(event.id, "approved")}
                                    className="rounded-lg p-1.5 text-green-600 hover:bg-green-50 transition-colors"
                                    title="Approve"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Users Tab */}
          {tab === "users" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="font-semibold text-lg text-foreground mb-4">
                All Users ({allUsers.length})
              </h2>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">User</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Email</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Role</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Joined</th>
                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map((u) => (
                        <tr key={u.id} className="border-b border-border/60 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                                {u.name.charAt(0)}
                              </div>
                              <span className="font-medium text-foreground">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{u.email}</td>
                          <td className="px-4 py-3">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                              disabled={u.id === user.id}
                              className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-medium capitalize focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 cursor-pointer"
                            >
                              <option value="user">User</option>
                              <option value="organizer">Organizer</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                            {format(parseISO(u.createdAt), "MMM d, yyyy")}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {u.id === user.id && (
                              <Badge variant="secondary" className="text-[10px]">You</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
