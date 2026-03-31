import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const status = searchParams.get("status");
  const featured = searchParams.get("featured");
  const organizerId = searchParams.get("organizerId");
  const sort = searchParams.get("sort") || "date";
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const location = searchParams.get("location");

  let query = supabase.from("events").select("*");

  // Status filtering
  if (organizerId) {
    query = query.eq("organizer_id", organizerId);
  } else if (status === "pending") {
    query = query.eq("status", "pending");
  } else if (status === "all") {
    // no filter
  } else if (featured === "true") {
    query = query.eq("status", "approved").eq("is_featured", true);
  } else {
    query = query.eq("status", "approved");
  }

  if (category) {
    query = query.eq("category", category);
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%,organizer_name.ilike.%${search}%`
    );
  }

  if (dateFrom) {
    query = query.gte("date", dateFrom);
  }
  if (dateTo) {
    query = query.lte("date", dateTo);
  }

  if (location) {
    query = query.ilike("location", `%${location}%`);
  }

  // Sort
  switch (sort) {
    case "date":
      query = query.order("date", { ascending: true });
      break;
    case "date-desc":
      query = query.order("date", { ascending: false });
      break;
    case "popular":
      query = query.order("rsvp_count", { ascending: false });
      break;
    case "recent":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query.order("date", { ascending: true });
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map snake_case DB columns to camelCase for frontend compatibility
  const events = (data || []).map(mapEventFromDb);

  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("events")
    .insert({
      title: body.title,
      description: body.description,
      date: body.date,
      end_date: body.endDate || null,
      time: body.time,
      end_time: body.endTime || null,
      location: body.location,
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      category: body.category,
      status: "pending",
      image:
        body.image ||
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=500&fit=crop",
      organizer_id: body.organizerId,
      organizer_name: body.organizerName || "Guest User",
      registration_link: body.registrationLink || null,
      is_featured: false,
      rsvp_count: 0,
      capacity: body.capacity || null,
      is_virtual: body.isVirtual || false,
      virtual_link: body.virtualLink || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(mapEventFromDb(data), { status: 201 });
}

// Helper to map snake_case DB row to camelCase for frontend
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
