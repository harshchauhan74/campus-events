"use client";

import { useState, useEffect, use, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { motion } from "motion/react";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  ExternalLink,
  Share2,
  ArrowLeft,
  Star,
  Send,
  Copy,
  CheckCircle2,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useMounted } from "@/hooks";
import { CATEGORY_CONFIG, type CampusEvent, type Review } from "@/lib/types";
import { toast } from "sonner";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const mounted = useMounted();
  const showAuthUI = mounted && !authLoading;
  const [event, setEvent] = useState<CampusEvent | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasRsvped, setHasRsvped] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [eventRes, reviewsRes] = await Promise.all([
          fetch(`/api/events/${id}`),
          fetch(`/api/reviews?eventId=${id}`),
        ]);
        if (!eventRes.ok) { router.push("/events"); return; }
        const eventData = await eventRes.json();
        const reviewsData = await reviewsRes.json();
        setEvent(eventData);
        setReviews(reviewsData);

        if (user) {
          const rsvpRes = await fetch(`/api/rsvps?userId=${user.id}&eventId=${id}`);
          const rsvpData = await rsvpRes.json();
          setHasRsvped(rsvpData.hasRsvped);
        }
      } catch {
        router.push("/events");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, user, router]);

  const handleRsvp = async () => {
    if (!isLoggedIn) { router.push("/login"); return; }
    if (!user || !event) return;
    setRsvpLoading(true);
    try {
      if (hasRsvped) {
        await fetch(`/api/rsvps?userId=${user.id}&eventId=${event.id}`, { method: "DELETE" });
        setHasRsvped(false);
        setEvent((prev) => prev ? { ...prev, rsvpCount: prev.rsvpCount - 1 } : prev);
        toast.success("RSVP cancelled");
      } else {
        await fetch("/api/rsvps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, eventId: event.id }),
        });
        setHasRsvped(true);
        setEvent((prev) => prev ? { ...prev, rsvpCount: prev.rsvpCount + 1 } : prev);
        toast.success("RSVP confirmed!");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn || !user || !event || !reviewText.trim()) return;
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          eventId: event.id,
          rating: reviewRating,
          comment: reviewText.trim(),
        }),
      });
      const newReview = await res.json();
      setReviews((prev) => [newReview, ...prev]);
      setReviewText("");
      setReviewRating(5);
      toast.success("Review submitted!");
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToSocial = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out "${event?.title}" on CampusEvents!`);
    const links: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    };
    if (links[platform]) window.open(links[platform], "_blank", "width=600,height=400");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-32" />
          <div className="h-80 bg-muted rounded-2xl" />
          <div className="h-8 bg-muted rounded w-2/3" />
          <div className="h-4 bg-muted rounded w-full" />
        </div>
      </div>
    );
  }

  if (!event) return null;

  const catConfig = CATEGORY_CONFIG[event.category];
  const eventDate = parseISO(event.date);
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link href="/events" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-64 sm:h-80 rounded-2xl overflow-hidden"
          >
            <Image src={event.image} alt={event.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 66vw" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <Badge className={cn("absolute top-4 left-4", catConfig.bgColor, catConfig.color)}>
              {catConfig.label}
            </Badge>
            {event.isFeatured && (
              <Badge className="absolute top-4 right-4 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                ⭐ Featured
              </Badge>
            )}
          </motion.div>

          {/* Title & Meta */}
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              {event.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Organized by <span className="font-medium text-foreground">{event.organizerName}</span>
            </p>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h2 className="font-semibold text-lg text-foreground mb-2">About this Event</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </div>

          {/* Map placeholder */}
          {event.latitude && event.longitude && (
            <div>
              <h2 className="font-semibold text-lg text-foreground mb-3">Location</h2>
              <div className="rounded-xl border border-border overflow-hidden bg-muted/30 h-56 flex items-center justify-center">
                <div className="text-center p-6">
                  <MapPin className="h-8 w-8 text-accent mx-auto mb-2" />
                  <p className="font-semibold text-foreground">{event.location}</p>
                  <a
                    href={`https://www.google.com/maps?q=${event.latitude},${event.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    Open in Google Maps <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg text-foreground">
                Reviews {reviews.length > 0 && `(${reviews.length})`}
              </h2>
              {avgRating && (
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-sm">{avgRating}</span>
                  <span className="text-xs text-muted-foreground">avg</span>
                </div>
              )}
            </div>

            {/* Review form */}
            {showAuthUI && isLoggedIn ? (
              <form onSubmit={handleReview} className="mb-6 rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-muted-foreground">Your rating:</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-0.5"
                        suppressHydrationWarning
                      >
                        <Star className={cn("h-5 w-5", star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience..."
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    suppressHydrationWarning
                  />
                  <button
                    type="submit"
                    disabled={!reviewText.trim() || submittingReview}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
                    suppressHydrationWarning
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            ) : showAuthUI ? (
              <p className="text-sm text-muted-foreground mb-4">
                <Link href="/login" className="text-primary hover:underline">Sign in</Link> to leave a review.
              </p>
            ) : null}

            {/* Reviews list */}
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                          {review.userName.charAt(0)}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-foreground">{review.userName}</span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className={cn("h-3 w-3", star <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20")} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(review.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No reviews yet. Be the first!</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* RSVP Card */}
          <div className="sticky top-24 rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CalendarDays className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-foreground">{format(eventDate, "EEEE, MMMM d, yyyy")}</p>
                  {event.endDate && event.endDate !== event.date && (
                    <p className="text-xs text-muted-foreground">to {format(parseISO(event.endDate), "MMMM d, yyyy")}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <span className="text-foreground">
                  {event.time}{event.endTime ? ` – ${event.endTime}` : ""}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-5 w-5 text-accent shrink-0" />
                <span className="text-foreground">{event.location}</span>
              </div>
              {event.isVirtual && event.virtualLink && (
                <div className="flex items-center gap-3 text-sm">
                  <Video className="h-5 w-5 text-primary shrink-0" />
                  <a href={event.virtualLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                    Virtual Link
                  </a>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Users className="h-5 w-5 text-primary shrink-0" />
                <span className="text-foreground">
                  {event.rsvpCount} attending
                  {event.capacity && <span className="text-muted-foreground"> / {event.capacity} capacity</span>}
                </span>
              </div>
            </div>

            {event.capacity && (
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min(100, (event.rsvpCount / event.capacity) * 100)}%` }}
                />
              </div>
            )}

            <button
              onClick={handleRsvp}
              disabled={rsvpLoading}
              className={cn(
                "w-full rounded-xl py-3 text-sm font-semibold transition-all shadow-sm",
                hasRsvped
                  ? "bg-muted text-foreground hover:bg-muted/80 border border-border"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
              suppressHydrationWarning
            >
              {rsvpLoading ? "..." : hasRsvped ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> You&apos;re Going!
                </span>
              ) : "RSVP Now"}
            </button>

            {event.registrationLink && (
              <a
                href={event.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-xl border border-border py-3 text-sm font-semibold text-foreground hover:bg-muted/60 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Registration Page
              </a>
            )}

            <Separator />

            {/* Share */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Share</p>
              <div className="flex gap-2">
                <button
                  onClick={() => shareToSocial("twitter")}
                  className="flex-1 rounded-lg border border-border py-2 text-xs font-medium hover:bg-muted/60 transition-colors"
                  suppressHydrationWarning
                >
                  Twitter/X
                </button>
                <button
                  onClick={() => shareToSocial("facebook")}
                  className="flex-1 rounded-lg border border-border py-2 text-xs font-medium hover:bg-muted/60 transition-colors"
                  suppressHydrationWarning
                >
                  Facebook
                </button>
                <button
                  onClick={copyShareLink}
                  className="flex items-center justify-center rounded-lg border border-border px-3 py-2 hover:bg-muted/60 transition-colors"
                  suppressHydrationWarning
                >
                  {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
