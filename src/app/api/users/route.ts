import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function mapProfileFromDb(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    avatar: row.avatar,
    createdAt: row.created_at,
  };
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const email = searchParams.get("email");

  if (id) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(mapProfileFromDb(data));
  }

  if (email) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(mapProfileFromDb(data));
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data || []).map(mapProfileFromDb));
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  // Check if email already exists
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", body.email)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      name: body.name,
      email: body.email,
      role: body.role || "user",
      avatar: body.avatar || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(mapProfileFromDb(data), { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  const { id, ...updates } = body;

  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.email !== undefined) dbUpdates.email = updates.email;
  if (updates.role !== undefined) dbUpdates.role = updates.role;
  if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;

  const { data, error } = await supabase
    .from("profiles")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(mapProfileFromDb(data));
}
