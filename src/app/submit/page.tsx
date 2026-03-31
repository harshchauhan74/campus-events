"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { PlusCircle, Upload, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useMounted } from "@/hooks";
import { CATEGORY_CONFIG, type EventCategory } from "@/lib/types";
import { toast } from "sonner";
import Link from "next/link";

export default function SubmitEventPage() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const mounted = useMounted();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    endDate: "",
    time: "",
    endTime: "",
    location: "",
    category: "social" as EventCategory,
    registrationLink: "",
    capacity: "",
    image: "",
    isVirtual: false,
    virtualLink: "",
  });

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn || !user) {
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          capacity: form.capacity ? parseInt(form.capacity) : undefined,
          organizerId: user.id,
          organizerName: user.name,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        toast.success("Event submitted for review!");
      } else {
        toast.error("Failed to submit event");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <PlusCircle className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h2 className="font-display text-xl font-bold text-foreground">Sign in to submit events</h2>
        <p className="text-sm text-muted-foreground mt-1">You need an account to submit campus events.</p>
        <Link
          href="/login"
          className="mt-4 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.4 }}>
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
        </motion.div>
        <h2 className="font-display text-2xl font-bold text-foreground">Event Submitted!</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md text-center">
          Your event has been submitted for review. An admin will review and approve it shortly.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => { setSubmitted(false); setForm({ title: "", description: "", date: "", endDate: "", time: "", endTime: "", location: "", category: "social", registrationLink: "", capacity: "", image: "", isVirtual: false, virtualLink: "" }); }}
            className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-muted/60 transition-colors"
          >
            Submit Another
          </button>
          <Link
            href="/events"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Submit an Event</h1>
        <p className="text-muted-foreground mt-1">
          Fill out the form below to submit your event for review.
        </p>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6"
      >
        {/* Title */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Event Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="e.g. Spring Hackathon 2026"
            required
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            suppressHydrationWarning
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Describe your event in detail..."
            required
            rows={5}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            suppressHydrationWarning
          />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Start Date *</label>
            <input type="date" value={form.date} onChange={(e) => updateField("date", e.target.value)} required className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" suppressHydrationWarning />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">End Date</label>
            <input type="date" value={form.endDate} onChange={(e) => updateField("endDate", e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" suppressHydrationWarning />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Start Time *</label>
            <input type="time" value={form.time} onChange={(e) => updateField("time", e.target.value)} required className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" suppressHydrationWarning />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">End Time</label>
            <input type="time" value={form.endTime} onChange={(e) => updateField("endTime", e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" suppressHydrationWarning />
          </div>
        </div>

        {/* Location & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Location *</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="e.g. Student Union Ballroom"
              required
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              suppressHydrationWarning
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Category *</label>
            <select
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
              suppressHydrationWarning
            >
              {(Object.keys(CATEGORY_CONFIG) as EventCategory[]).map((cat) => (
                <option key={cat} value={cat}>{CATEGORY_CONFIG[cat].label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Virtual toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="virtual"
            checked={form.isVirtual}
            onChange={(e) => updateField("isVirtual", e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
            suppressHydrationWarning
          />
          <label htmlFor="virtual" className="text-sm text-foreground cursor-pointer">This is a virtual/online event</label>
        </div>

        {form.isVirtual && (
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Virtual Link</label>
            <input
              type="url"
              value={form.virtualLink}
              onChange={(e) => updateField("virtualLink", e.target.value)}
              placeholder="https://zoom.us/j/..."
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              suppressHydrationWarning
            />
          </div>
        )}

        {/* Optional fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Capacity</label>
            <input
              type="number"
              value={form.capacity}
              onChange={(e) => updateField("capacity", e.target.value)}
              placeholder="e.g. 200"
              min="1"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              suppressHydrationWarning
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Registration Link</label>
            <input
              type="url"
              value={form.registrationLink}
              onChange={(e) => updateField("registrationLink", e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              suppressHydrationWarning
            />
          </div>
        </div>

        {/* Image URL */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Event Image URL</label>
          <div className="relative">
            <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="url"
              value={form.image}
              onChange={(e) => updateField("image", e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              suppressHydrationWarning
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Provide a direct URL to an event image. Leave blank for a default.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          suppressHydrationWarning
        >
          {loading ? "Submitting..." : <><PlusCircle className="h-4 w-4" /> Submit Event for Review</>}
        </button>

        <p className="text-xs text-center text-muted-foreground">
          Events are reviewed by an admin before being published.
        </p>
      </motion.form>
    </div>
  );
}
