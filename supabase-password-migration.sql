-- Add password_hash column to profiles table
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/bolnavzjrwjutneezrtc/sql

-- 1. Add password_hash column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash text;

-- 2. Set default password "Demo123" for all existing seed users
-- Hash generated using Node.js scrypt: salt:hash format
UPDATE profiles SET password_hash = 'c61455ddcfe6a36d8c20b9f452a76986:49c024b721fd427ead8b88d0c6228a4f61ba9ec6f96f56f3842d19677718d0455b8ea904680041ede06114179ea89e8f6e8292cb3bb682eb6995b6c57f8ebaff'
WHERE password_hash IS NULL;
