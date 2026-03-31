"use client";

import Link from "next/link";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { MapPin, Clock, Users, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CATEGORY_CONFIG, type CampusEvent } from "@/lib/types";

interface EventCardProps {
  event: CampusEvent;
  variant?: "default" | "featured" | "compact";
}

export function EventCard({ event, variant = "default" }: EventCardProps) {
  const catConfig = CATEGORY_CONFIG[event.category];
  const eventDate = parseISO(event.date);

  if (variant === "compact") {
    return (
      <Link href={`/events/${event.id}`} className="group block">
        <div className="flex gap-4 rounded-xl border border-border/60 bg-card p-3 transition-all hover:shadow-md hover:border-primary/20">
          <div className="flex flex-col items-center justify-center rounded-lg bg-primary/10 px-3 py-2 min-w-[56px]">
            <span className="text-xs font-semibold text-primary uppercase">
              {format(eventDate, "MMM")}
            </span>
            <span className="text-xl font-bold text-primary leading-tight">
              {format(eventDate, "dd")}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
              {event.title}
            </h3>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {event.time}
              </span>
              <span className="flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 shrink-0" />
                {event.location}
              </span>
            </div>
            <Badge variant="secondary" className={cn("mt-1.5 text-[10px] px-2 py-0", catConfig.bgColor, catConfig.color)}>
              {catConfig.label}
            </Badge>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link href={`/events/${event.id}`} className="group block">
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 duration-300 min-w-[320px]">
          <div className="relative h-48 overflow-hidden">
            <Image
              src={event.image}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 90vw, 340px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <Badge className={cn("absolute top-3 left-3 text-xs", catConfig.bgColor, catConfig.color)}>
              {catConfig.label}
            </Badge>
            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="font-display font-bold text-lg text-white leading-tight line-clamp-2">
                {event.title}
              </h3>
            </div>
          </div>
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-primary" />
                {format(eventDate, "MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                {event.time}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-accent shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Users className="h-4 w-4 text-primary" />
                {event.rsvpCount} attending
              </span>
              {event.capacity && (
                <span className="text-xs text-muted-foreground">
                  {event.capacity - event.rsvpCount} spots left
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default card
  return (
    <Link href={`/events/${event.id}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 duration-300">
        <div className="relative h-40 overflow-hidden">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <Badge className={cn("absolute top-3 left-3 text-xs", catConfig.bgColor, catConfig.color)}>
            {catConfig.label}
          </Badge>
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-display font-bold text-base text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5 text-primary" />
              {format(eventDate, "MMM d")}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-primary" />
              {event.time}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border/60 pt-2 mt-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <Users className="h-3.5 w-3.5 text-primary" />
              {event.rsvpCount} going
            </span>
            <span className="text-xs font-semibold text-primary group-hover:underline">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
