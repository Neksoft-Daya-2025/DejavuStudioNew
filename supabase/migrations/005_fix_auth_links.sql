-- ─────────────────────────────────────────────────────────────────────────────
-- Déjà Vu OS — Migration 005: Fix auth_user_id per profiel
-- Veilig om meerdere keren uit te voeren (idempotent).
-- Matcht op display_name → bekende auth e-mail.
-- Conflicteert niet met eerdere migraties.
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE profiles
SET auth_user_id = (SELECT id FROM auth.users WHERE lower(email) = 'sariov2@hotmail.com' LIMIT 1)
WHERE display_name = 'Sario'
  AND EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = 'sariov2@hotmail.com');

UPDATE profiles
SET auth_user_id = (SELECT id FROM auth.users WHERE lower(email) = 'jarnelleramdin@gmail.com' LIMIT 1)
WHERE display_name = 'Yarri'
  AND EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = 'jarnelleramdin@gmail.com');

UPDATE profiles
SET auth_user_id = (SELECT id FROM auth.users WHERE lower(email) = 'myroncampbell2506@gmail.com' LIMIT 1)
WHERE display_name = 'LV Exclusive'
  AND EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = 'myroncampbell2506@gmail.com');

UPDATE profiles
SET auth_user_id = (SELECT id FROM auth.users WHERE lower(email) = 'jerramaatsen@gmail.com' LIMIT 1)
WHERE display_name = 'JSR'
  AND EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = 'jerramaatsen@gmail.com');

UPDATE profiles
SET auth_user_id = (SELECT id FROM auth.users WHERE lower(email) = 'prodby.kn9ne@gmail.com' LIMIT 1)
WHERE display_name = 'K9'
  AND EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = 'prodby.kn9ne@gmail.com');

UPDATE profiles
SET auth_user_id = (SELECT id FROM auth.users WHERE lower(email) = 'dejavustudio036@gmail.com' LIMIT 1)
WHERE lower(email) = 'dejavustudio036@gmail.com'
  AND EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = 'dejavustudio036@gmail.com');
