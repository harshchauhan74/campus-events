"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Search,
  ArrowRight,
  GraduationCap,
  Trophy,
  Users,
  Palette,
  Cpu,
  Heart,
  Briefcase,
  Flag,
  CalendarDays,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { EventCard } from "@/components/event-card";
import type { CampusEvent, EventCategory } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/types";

const categoryIcons: Record<EventCategory, React.ElementType> = {
  academic: GraduationCap,
  sports: Trophy,
  social: Users,
  arts: Palette,
  tech: Cpu,
  health: Heart,
  career: Briefcase,
  clubs: Flag,
};

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [featured, setFeatured] = useState<CampusEvent[]>([]);
  const [upcoming, setUpcoming] = useState<CampusEvent[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/events?featured=true")
      .then((r) => r.json())
      .then(setFeatured)
      .catch(() => {});

    fetch("/api/events?sort=date")
      .then((r) => r.json())
      .then((events: CampusEvent[]) => {
        setUpcoming(events.slice(0, 6));
        const counts: Record<string, number> = {};
        events.forEach((e) => {
          counts[e.category] = (counts[e.category] || 0) + 1;
        });
        setCategoryCounts(counts);
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,oklch(0.49_0.22_264/0.12),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                <Sparkles className="h-4 w-4" />
                Your campus, your community
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                Discover What&apos;s{" "}
                <span className="text-primary">Happening</span> on Campus
              </h1>
              <p className="mt-5 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Find academic workshops, social events, sports activities, and more.
                Never miss out on what matters to you.
              </p>
            </motion.div>

            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-8 flex items-center gap-3 mx-auto max-w-xl"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events, categories, locations..."
                  className="w-full rounded-xl border border-border bg-card pl-12 pr-4 py-3.5 text-sm shadow-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  suppressHydrationWarning
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors shrink-0"
                suppressHydrationWarning
              >
                Search
              </button>
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <span><strong className="text-foreground">{upcoming.length + featured.length}+</strong> events</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" />
                <span><strong className="text-foreground">1,200+</strong> students</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-chart-3" />
                <span><strong className="text-foreground">8</strong> categories</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      {featured.length > 0 && (
        <section className="py-14 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Featured Events
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Don&apos;t miss these highlighted events this month
                </p>
              </div>
              <Link
                href="/events"
                className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {featured.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="snap-start shrink-0 w-[340px]"
                >
                  <EventCard event={event} variant="featured" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Grid */}
      <section className="py-14 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Browse by Category
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Find events that match your interests
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(Object.keys(CATEGORY_CONFIG) as EventCategory[]).map((cat, i) => {
              const config = CATEGORY_CONFIG[cat];
              const Icon = categoryIcons[cat];
              const count = categoryCounts[cat] || 0;
              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/events?category=${cat}`}
                    className="group flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card p-5 text-center transition-all hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5"
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${config.bgColor} transition-transform group-hover:scale-110`}>
                      <Icon className={`h-6 w-6 ${config.color}`} />
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-foreground block">
                        {config.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {count} event{count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      {upcoming.length > 0 && (
        <section className="py-14 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Upcoming Events
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  What&apos;s coming up next on campus
                </p>
              </div>
              <Link
                href="/events"
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                See all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcoming.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Have an event to share?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Submit your event and reach the entire campus community.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link
              href="/submit"
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              Submit an Event
            </Link>
            <Link
              href="/calendar"
              className="rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-sm hover:bg-muted/60 transition-colors"
            >
              View Calendar
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
