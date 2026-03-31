import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function mapEventFromDb(row: Record<string, unknown>) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    date: row.date,
    endDate: row.end_date,
    time: row.time,
    endTime: row.end_time,
    location: row.location,
    latitude: row.latitude,
    longitude: row.longitude,
    category: row.category,
    status: row.status,
    image: row.image,
    organizerId: row.organizer_id,
    organizerName: row.organizer_name,
    registrationLink: row.registration_link,
    isFeatured: row.is_featured,
    rsvpCount: row.rsvp_count,
    capacity: row.capacity,
    createdAt: row.created_at,
    isVirtual: row.is_virtual,
    virtualLink: row.virtual_link,
  };
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const eventId = searchParams.get("eventId");

  if (userId && eventId) {
    const { data } = await supabase
      .from("rsvps")
      .select("id")
      .eq("user_id", userId)
      .eq("event_id", eventId)
      .maybeSingle();

    return NextResponse.json({ hasRsvped: !!data });
  }

  if (userId) {
    const { data, error } = await supabase
      .from("rsvps")
      .select("*, events(*)")
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const enriched = (data || []).map((r: Record<string, unknown>) => ({
      id: r.id,
      userId: r.user_id,
      eventId: r.event_id,
      createdAt: r.created_at,
      event: r.events ? mapEventFromDb(r.events as Record<string, unknown>) : null,
    }));

    return NextResponse.json(enriched);
  }

  if (eventId) {
    const { data, error } = await supabase
      .from("rsvps")
      .select("*")
      .eq("event_id", eventId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  }

  return NextResponse.json([]);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  const { userId, eventId } = body;

  // Check if already RSVPed
  const { data: existing } = await supabase
    .from("rsvps")
    .select("id")
    .eq("user_id", userId)
    .eq("event_id", eventId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Already RSVPed" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("rsvps")
    .insert({ user_id: userId, event_id: eventId })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Note: rsvp_count is auto-updated by the database trigger

  return NextResponse.json(
    { id: data.id, userId: data.user_id, eventId: data.event_id, createdAt: data.created_at },
    { status: 201 }
  );
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const eventId = searchParams.get("eventId");

  if (!userId || !eventId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const { error } = await supabase
    .from("rsvps")
    .delete()
    .eq("user_id", userId)
    .eq("event_id", eventId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Note: rsvp_count is auto-updated by the database trigger

  return NextResponse.json({ success: true });
}
