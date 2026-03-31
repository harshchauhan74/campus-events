import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");

  if (!eventId) {
    return NextResponse.json({ error: "eventId required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const reviews = (data || []).map((r: Record<string, unknown>) => ({
    id: r.id,
    userId: r.user_id,
    userName: r.user_name,
    userAvatar: r.user_avatar,
    eventId: r.event_id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
  }));

  return NextResponse.json(reviews);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      user_id: body.userId,
      user_name: body.userName,
      user_avatar: body.userAvatar || null,
      event_id: body.eventId,
      rating: body.rating,
      comment: body.comment,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      id: data.id,
      userId: data.user_id,
      userName: data.user_name,
      userAvatar: data.user_avatar,
      eventId: data.event_id,
      rating: data.rating,
      comment: data.comment,
      createdAt: data.created_at,
    },
    { status: 201 }
  );
}
