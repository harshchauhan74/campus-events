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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json(mapEventFromDb(data));
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();

  // Map camelCase from frontend to snake_case for DB
  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.date !== undefined) updates.date = body.date;
  if (body.endDate !== undefined) updates.end_date = body.endDate;
  if (body.time !== undefined) updates.time = body.time;
  if (body.endTime !== undefined) updates.end_time = body.endTime;
  if (body.location !== undefined) updates.location = body.location;
  if (body.category !== undefined) updates.category = body.category;
  if (body.status !== undefined) updates.status = body.status;
  if (body.image !== undefined) updates.image = body.image;
  if (body.isFeatured !== undefined) updates.is_featured = body.isFeatured;
  if (body.capacity !== undefined) updates.capacity = body.capacity;
  if (body.registrationLink !== undefined) updates.registration_link = body.registrationLink;

  const { data, error } = await supabase
    .from("events")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json(mapEventFromDb(data));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
