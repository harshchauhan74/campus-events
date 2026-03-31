-- Fix RLS policies for profile updates (including password change)
-- Run this in your Supabase SQL Editor

-- Drop restrictive update policy and replace with permissive one
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Allow profile updates" ON profiles FOR UPDATE USING (true) WITH CHECK (true);
