"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { motion } from "motion/react";
import {
  User,
  CalendarDays,
  Clock,
  MapPin,
  FileText,
  LogOut,
  Shield,
  Loader2,
  Settings,
  Save,
  Pencil,
  Lock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useMounted } from "@/hooks";
import { CATEGORY_CONFIG, type CampusEvent } from "@/lib/types";

interface RsvpWithEvent {
  id: string;
  userId: string;
  eventId: string;
  createdAt: string;
  event: CampusEvent | null;
}

export default function ProfilePage() {
  const { user, isLoggedIn, logout, updateProfile, changePassword, loading: authLoading } = useAuth();
  const mounted = useMounted();
  const router = useRouter();
  const [rsvps, setRsvps] = useState<RsvpWithEvent[]>([]);
  const [myEvents, setMyEvents] = useState<CampusEvent[]>([]);
  const [tab, setTab] = useState<"rsvps" | "submitted" | "settings">("rsvps");
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mounted || authLoading) return;
    if (!isLoggedIn || !user) { router.push("/login"); return; }

    setLoading(true);
    Promise.all([
      fetch(`/api/rsvps?userId=${user.id}`).then((r) => r.json()),
      fetch(`/api/events?organizerId=${user.id}`).then((r) => r.json()),
    ])
      .then(([rsvpData, eventsData]) => {
        setRsvps(rsvpData);
        setMyEvents(eventsData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn, user, router, mounted, authLoading]);

  if (!mounted || authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isLoggedIn || !user) return null;

  const initEditForm = () => {
    setEditName(user.name);
    setEditEmail(user.email);
    setEditAvatar(user.avatar || "");
    setEditSuccess(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setEditSuccess(false);
    const success = await updateProfile({
      name: editName,
      email: editEmail,
      avatar: editAvatar || undefined,
    });
    setSaving(false);
    if (success) setEditSuccess(true);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);

    if (newPw !== confirmPw) {
      setPwError("New passwords do not match");
      return;
    }
    if (newPw.length < 6) {
      setPwError("Password must be at least 6 characters");
      return;
    }
    if (!/[A-Za-z]/.test(newPw)) {
      setPwError("Password must contain at least one letter");
      return;
    }
    if (!/[0-9]/.test(newPw)) {
      setPwError("Password must contain at least one number");
      return;
    }

    setPwSaving(true);
    const result = await changePassword(currentPw, newPw);
    setPwSaving(false);
    if (result.success) {
      setPwSuccess(true);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } else {
      setPwError(result.error || "Failed to change password");
    }
  };

  const upcomingRsvps = rsvps.filter((r) => r.event && r.event.date >= new Date().toISOString().split("T")[0]);
  const pastRsvps = rsvps.filter((r) => r.event && r.event.date < new Date().toISOString().split("T")[0]);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm"
      >
        <div className="flex items-start gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-16 w-16 rounded-2xl object-cover" />
            ) : (
              <User className="h-8 w-8" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-bold text-foreground">{user.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="secondary" className="capitalize">
                <Shield className="h-3 w-3 mr-1" />
                {user.role}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Member since {format(parseISO(user.createdAt), "MMMM yyyy")}
              </span>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.push("/"); }}
            className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{rsvps.length}</p>
            <p className="text-xs text-muted-foreground">RSVPs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{myEvents.length}</p>
            <p className="text-xs text-muted-foreground">Events Submitted</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{myEvents.filter((e) => e.status === "approved").length}</p>
            <p className="text-xs text-muted-foreground">Approved</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 bg-muted/50 rounded-xl p-1">
        <button
          onClick={() => setTab("rsvps")}
          className={cn(
            "flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors",
            tab === "rsvps" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <CalendarDays className="h-4 w-4 inline mr-1.5" />
          My RSVPs ({rsvps.length})
        </button>
        <button
          onClick={() => setTab("submitted")}
          className={cn(
            "flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors",
            tab === "submitted" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <FileText className="h-4 w-4 inline mr-1.5" />
          Submitted Events ({myEvents.length})
        </button>
        <button
          onClick={() => { setTab("settings"); initEditForm(); }}
          className={cn(
            "flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors",
            tab === "settings" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Settings className="h-4 w-4 inline mr-1.5" />
          Settings
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-4 h-20" />
            ))}
          </div>
        ) : tab === "rsvps" ? (
          <>
            {upcomingRsvps.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Upcoming</h3>
                <div className="space-y-3">
                  {upcomingRsvps.map((rsvp) => rsvp.event && (
                    <Link key={rsvp.id} href={`/events/${rsvp.event.id}`} className="flex gap-4 rounded-xl border border-border bg-card p-4 hover:shadow-md hover:border-primary/20 transition-all group">
                      <div className="flex flex-col items-center justify-center rounded-lg bg-primary/10 px-3 py-2 min-w-[56px]">
                        <span className="text-xs font-semibold text-primary uppercase">{format(parseISO(rsvp.event.date), "MMM")}</span>
                        <span className="text-xl font-bold text-primary leading-tight">{format(parseISO(rsvp.event.date), "dd")}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{rsvp.event.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{rsvp.event.time}</span>
                          <span className="flex items-center gap-1 truncate"><MapPin className="h-3 w-3 shrink-0" />{rsvp.event.location}</span>
                        </div>
                        <Badge variant="secondary" className={cn("mt-1.5 text-[10px]", CATEGORY_CONFIG[rsvp.event.category].bgColor, CATEGORY_CONFIG[rsvp.event.category].color)}>
                          {CATEGORY_CONFIG[rsvp.event.category].label}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {pastRsvps.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Past Events</h3>
                <div className="space-y-3">
                  {pastRsvps.map((rsvp) => rsvp.event && (
                    <Link key={rsvp.id} href={`/events/${rsvp.event.id}`} className="flex gap-4 rounded-xl border border-border bg-card p-4 opacity-60 hover:opacity-100 transition-all group">
                      <div className="flex flex-col items-center justify-center rounded-lg bg-muted px-3 py-2 min-w-[56px]">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">{format(parseISO(rsvp.event.date), "MMM")}</span>
                        <span className="text-xl font-bold text-muted-foreground leading-tight">{format(parseISO(rsvp.event.date), "dd")}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-foreground">{rsvp.event.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{rsvp.event.location}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {rsvps.length === 0 && (
              <div className="text-center py-12">
                <CalendarDays className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-semibold text-foreground">No RSVPs yet</p>
                <p className="text-sm text-muted-foreground mt-1">Browse events and RSVP to the ones you&apos;re interested in.</p>
                <Link href="/events" className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">Explore Events →</Link>
              </div>
            )}
          </>
        ) : tab === "submitted" ? (
          <>
            {myEvents.length > 0 ? (
              <div className="space-y-3">
                {myEvents.map((event) => {
                  const statusColors: Record<string, string> = {
                    approved: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
                    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
                    rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
                  };
                  return (
                    <Link key={event.id} href={`/events/${event.id}`} className="flex gap-4 rounded-xl border border-border bg-card p-4 hover:shadow-md transition-all group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{event.title}</h4>
                          <Badge className={cn("text-[10px] capitalize", statusColors[event.status])}>
                            {event.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{format(parseISO(event.date), "MMM d, yyyy")}</span>
                          <span>{event.location}</span>
                          <span>{event.rsvpCount} RSVPs</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </>
        ) : null}

        {tab === "settings" && (
          <>
          <motion.form
            onSubmit={handleSaveProfile}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <Pencil className="h-5 w-5 text-primary" />
              <h3 className="font-display text-lg font-bold text-foreground">Edit Profile</h3>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                suppressHydrationWarning
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Email</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                suppressHydrationWarning
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Avatar URL</label>
              <input
                type="url"
                value={editAvatar}
                onChange={(e) => setEditAvatar(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                suppressHydrationWarning
              />
              <p className="text-[11px] text-muted-foreground mt-1">Provide a direct URL to your profile picture. Leave blank for default.</p>
            </div>

            {editAvatar && (
              <div className="flex items-center gap-3">
                <img src={editAvatar} alt="Preview" className="h-12 w-12 rounded-xl object-cover border border-border" />
                <span className="text-xs text-muted-foreground">Avatar preview</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                suppressHydrationWarning
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
              {editSuccess && (
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">Profile updated!</span>
              )}
            </div>
          </motion.form>

          {/* Change Password */}
          <motion.form
            onSubmit={handleChangePassword}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5 mt-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-5 w-5 text-primary" />
              <h3 className="font-display text-lg font-bold text-foreground">Change Password</h3>
            </div>

            {pwError && (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {pwError}
              </div>
            )}

            {pwSuccess && (
              <div className="flex items-center gap-2 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Password changed successfully!
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Current Password</label>
              <input
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="Enter your current password"
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                suppressHydrationWarning
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">New Password</label>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="At least 6 chars, 1 letter, 1 number"
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                suppressHydrationWarning
              />
              {newPw.length > 0 && (
                <div className="mt-2 space-y-1">
                  {[
                    { check: newPw.length >= 6, label: "At least 6 characters" },
                    { check: /[A-Za-z]/.test(newPw), label: "Contains a letter" },
                    { check: /[0-9]/.test(newPw), label: "Contains a number" },
                  ].map((rule) => (
                    <div key={rule.label} className="flex items-center gap-1.5 text-xs">
                      <CheckCircle2 className={`h-3 w-3 ${rule.check ? "text-green-500" : "text-muted-foreground/30"}`} />
                      <span className={rule.check ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Confirm New Password</label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Re-enter new password"
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                suppressHydrationWarning
              />
              {confirmPw.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs mt-1.5">
                  <CheckCircle2 className={`h-3 w-3 ${newPw === confirmPw ? "text-green-500" : "text-destructive"}`} />
                  <span className={newPw === confirmPw ? "text-green-600 dark:text-green-400" : "text-destructive"}>
                    {newPw === confirmPw ? "Passwords match" : "Passwords do not match"}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={pwSaving || !currentPw || newPw.length < 6 || newPw !== confirmPw}
              className="flex items-center gap-2 rounded-xl bg-foreground text-background px-6 py-2.5 text-sm font-semibold shadow-sm hover:bg-foreground/90 transition-colors disabled:opacity-50"
              suppressHydrationWarning
            >
              {pwSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {pwSaving ? "Changing..." : "Change Password"}
            </button>
          </motion.form>
          </>
        )}
      </div>
    </div>
  );
}
