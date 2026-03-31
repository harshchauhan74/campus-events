import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyPassword } from "@/lib/password";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Find user by email
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !profile) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  // Verify password
  if (!profile.password_hash || !verifyPassword(password, profile.password_hash)) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  // Return user profile (without password hash)
  return NextResponse.json({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    avatar: profile.avatar,
    createdAt: profile.created_at,
  });
}
