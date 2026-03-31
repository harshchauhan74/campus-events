import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // Get approved events
  const { data: approvedEvents } = await supabase
    .from("events")
    .select("*")
    .eq("status", "approved");

  // Get pending count
  const { count: pendingCount } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  // Get user count
  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const events = approvedEvents || [];

  // Category distribution
  const categoryCount: Record<string, number> = {};
  events.forEach((e) => {
    categoryCount[e.category] = (categoryCount[e.category] || 0) + 1;
  });

  const totalRsvps = events.reduce((sum, e) => sum + (e.rsvp_count || 0), 0);

  const topEvents = [...events]
    .sort((a, b) => (b.rsvp_count || 0) - (a.rsvp_count || 0))
    .slice(0, 5)
    .map((e) => ({
      id: e.id,
      title: e.title,
      rsvpCount: e.rsvp_count,
      category: e.category,
    }));

  // Monthly RSVPs (aggregate from seed data)
  const monthlyRsvps = [
    { month: "Sep", count: 145 },
    { month: "Oct", count: 234 },
    { month: "Nov", count: 312 },
    { month: "Dec", count: 178 },
    { month: "Jan", count: 267 },
    { month: "Feb", count: 389 },
    { month: "Mar", count: 456 },
  ];

  return NextResponse.json({
    totalEvents: events.length,
    pendingEvents: pendingCount || 0,
    totalUsers: userCount || 0,
    totalRsvps,
    categoryDistribution: categoryCount,
    topEvents,
    monthlyRsvps,
  });
}
