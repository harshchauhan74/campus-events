"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CATEGORY_CONFIG, type CampusEvent, type EventCategory } from "@/lib/types";

export default function CalendarPage() {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 3, 1)); // April 2026
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<EventCategory>>(
    new Set(Object.keys(CATEGORY_CONFIG) as EventCategory[])
  );
  const [view, setView] = useState<"month" | "week">("month");

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then(setEvents)
      .catch(() => {});
  }, []);

  const filteredEvents = useMemo(
    () => events.filter((e) => activeCategories.has(e.category)),
    [events, activeCategories]
  );

  const getEventsForDay = (day: Date) =>
    filteredEvents.filter((e) => isSameDay(parseISO(e.date), day));

  const toggleCategory = (cat: EventCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  // Calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Event Calendar</h1>
        <p className="text-muted-foreground mt-1">Visual overview of all campus events</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar: Categories */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-semibold text-sm text-foreground mb-3">Filter by Category</h3>
            <div className="space-y-2">
              {(Object.keys(CATEGORY_CONFIG) as EventCategory[]).map((cat) => {
                const config = CATEGORY_CONFIG[cat];
                const isActive = activeCategories.has(cat);
                const count = events.filter((e) => e.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={cn(
                      "flex items-center justify-between w-full rounded-lg px-3 py-2 text-xs font-medium transition-all",
                      isActive
                        ? `${config.bgColor} ${config.color}`
                        : "bg-muted/40 text-muted-foreground opacity-50"
                    )}
                  >
                    <span>{config.label}</span>
                    <span className="text-[10px] font-bold">{count}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setActiveCategories(new Set(Object.keys(CATEGORY_CONFIG) as EventCategory[]))}
              className="mt-3 text-xs text-primary hover:underline font-medium"
            >
              Select All
            </button>
          </div>

          {/* View toggle */}
          <div className="rounded-xl border border-border bg-card p-3 flex gap-2">
            <button
              onClick={() => setView("month")}
              className={cn(
                "flex-1 rounded-lg py-2 text-xs font-medium transition-colors",
                view === "month" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/60"
              )}
            >
              Month
            </button>
            <button
              onClick={() => setView("week")}
              className={cn(
                "flex-1 rounded-lg py-2 text-xs font-medium transition-colors",
                view === "week" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/60"
              )}
            >
              Week
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="lg:col-span-3">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="rounded-lg border border-border p-2 hover:bg-muted/60 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="font-display text-xl font-bold text-foreground">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="rounded-lg border border-border p-2 hover:bg-muted/60 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-px mb-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-px rounded-xl overflow-hidden border border-border bg-border">
            {calDays.map((day) => {
              const dayEvents = getEventsForDay(day);
              const inMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const today = isToday(day);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={cn(
                    "relative min-h-[80px] sm:min-h-[100px] p-1.5 sm:p-2 text-left transition-colors bg-card",
                    !inMonth && "opacity-40",
                    isSelected && "ring-2 ring-primary ring-inset",
                    today && "bg-primary/5"
                  )}
                >
                  <span className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                    today && "bg-primary text-primary-foreground",
                    isSelected && !today && "bg-foreground text-background"
                  )}>
                    {format(day, "d")}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 3).map((e) => (
                      <div
                        key={e.id}
                        className={cn(
                          "truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight",
                          CATEGORY_CONFIG[e.category].bgColor,
                          CATEGORY_CONFIG[e.category].color
                        )}
                      >
                        <span className="hidden sm:inline">{e.title}</span>
                        <span className="sm:hidden">•</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[10px] text-muted-foreground pl-1">+{dayEvents.length - 3} more</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected day events */}
          {selectedDay && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <h3 className="font-semibold text-foreground mb-3">
                Events on {format(selectedDay, "EEEE, MMMM d, yyyy")}
              </h3>
              {selectedDayEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDayEvents.map((event) => {
                    const catConfig = CATEGORY_CONFIG[event.category];
                    return (
                      <Link
                        key={event.id}
                        href={`/events/${event.id}`}
                        className="flex gap-4 rounded-xl border border-border bg-card p-4 hover:shadow-md hover:border-primary/20 transition-all group"
                      >
                        <div className={cn("w-1 rounded-full shrink-0", catConfig.bgColor)} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                            {event.title}
                          </h4>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {event.time}{event.endTime ? ` – ${event.endTime}` : ""}
                            </span>
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </span>
                          </div>
                          <Badge variant="secondary" className={cn("mt-2 text-[10px]", catConfig.bgColor, catConfig.color)}>
                            {catConfig.label}
                          </Badge>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No events on this day.</p>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
