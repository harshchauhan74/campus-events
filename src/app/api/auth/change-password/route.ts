import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hashPassword, verifyPassword, validatePassword } from "@/lib/password";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, currentPassword, newPassword } = body;

  if (!userId || !currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "User ID, current password, and new password are required" },
      { status: 400 }
    );
  }

  // Validate new password strength
  const passwordError = validatePassword(newPassword);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  if (currentPassword === newPassword) {
    return NextResponse.json(
      { error: "New password must be different from current password" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Get current user
  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (fetchError || !profile) {
    console.error("Change password - fetch error:", fetchError?.message);
    return NextResponse.json({ error: "User not found. Please log out and log back in." }, { status: 404 });
  }

  // Verify current password (if no password_hash column yet, accept any current password for first-time setup)
  if (profile.password_hash) {
    if (!verifyPassword(currentPassword, profile.password_hash)) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }
  }

  // Hash and save new password
  const newHash = hashPassword(newPassword);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ password_hash: newHash })
    .eq("id", userId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Password changed successfully" });
}
