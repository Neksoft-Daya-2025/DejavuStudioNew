-- ─────────────────────────────────────────────────────────────────────────────
-- Déjà Vu OS — Migration 004: Link profiles.auth_user_id to real auth.users
-- Run this after all users have been created in Supabase Auth.
-- It matches by email (case-insensitive) so hardcoded seed UUIDs don't matter.
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE profiles p
SET auth_user_id = au.id
FROM auth.users au
WHERE lower(au.email) = lower(p.email)
  AND (p.auth_user_id IS NULL OR p.auth_user_id != au.id);
