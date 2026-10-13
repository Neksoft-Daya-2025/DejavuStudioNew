import http from "node:http";
import { randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);

const PORT = Number(process.env.DEJAVU_API_PORT || 3001);
const ADMIN_EMAIL = process.env.DEJAVU_ADMIN_EMAIL || "admin@gmail.com";
const SMTP_HOST = process.env.DEJAVU_SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.DEJAVU_SMTP_PORT || 587);
const SMTP_USER = process.env.DEJAVU_SMTP_USER || "";
const SMTP_PASS = (process.env.DEJAVU_SMTP_PASS || "").replace(/\s+/g, "");
const FROM_EMAIL = process.env.DEJAVU_FROM_EMAIL || SMTP_USER || "no-reply@dejavustudio.local";
const FROM_NAME = process.env.DEJAVU_FROM_NAME || "Déjà Vu Studio OS";
const STRICT_AUTH = process.env.DEJAVU_AUTH_MODE === "production";
const ALLOW_TEST_LOGIN = !STRICT_AUTH && process.env.DEJAVU_ALLOW_TEST_LOGIN === "true";
const TEST_LOGIN_PASSWORD = process.env.DEJAVU_TEST_LOGIN_PASSWORD || "";
const ADMIN_BOOTSTRAP_PASSWORD = process.env.DEJAVU_ADMIN_PASSWORD || "";
const SESSION_HOURS = Number(process.env.DEJAVU_SESSION_HOURS || 8);
const LOGIN_WINDOW_MS = Number(process.env.DEJAVU_LOGIN_WINDOW_MS || 15 * 60 * 1000);
const LOGIN_MAX_ATTEMPTS = Number(process.env.DEJAVU_LOGIN_MAX_ATTEMPTS || 5);
const REQUEST_BODY_LIMIT = Number(process.env.DEJAVU_REQUEST_BODY_LIMIT || 1024 * 1024);
const DEV_ORIGINS = ["http://127.0.0.1:5173", "http://localhost:5173"];
const ALLOWED_ORIGINS = new Set(
  String(process.env.DEJAVU_ALLOWED_ORIGINS || (STRICT_AUTH ? "" : DEV_ORIGINS.join(",")))
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean),
);

const nowIso = () => new Date().toISOString();
const id = () => randomUUID().slice(0, 8).toUpperCase();
const DATA_DIR = path.join(process.cwd(), ".local-data");
const DATA_FILE = process.env.DEJAVU_DATA_FILE || path.join(DATA_DIR, "dejavu-db.json");
const DATA_FILE_EXISTED = fs.existsSync(DATA_FILE);

function hashPassword(password, salt = randomUUID()) {
  return `scrypt:${salt}:${scryptSync(String(password), salt, 32).toString("hex")}`;
}

function verifyPassword(password, stored) {
  if (!stored) return false;
  if (!String(stored).startsWith("scrypt:")) return false;
  const [, salt, expectedHex] = String(stored).split(":");
  if (!salt || !expectedHex) return false;
  const actual = scryptSync(String(password), salt, 32);
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

const defaultDb = {
  profiles: [
    {
      id: "artist-aniket",
      organization_id: "dejavu",
      display_name: "Aniket Devworks",
      full_name: "Aniket Devworks",
      email: "aniket.devworks@gmail.com",
      password_hash: hashPassword(ALLOW_TEST_LOGIN && TEST_LOGIN_PASSWORD ? TEST_LOGIN_PASSWORD : randomUUID()),
      is_active: true,
      user_roles: [{ role: { name: "Artist", slug: "artist" } }],
      user_programs: [{ program: { name: "Goldlective", slug: "goldlective" } }],
    },
    {
      id: "staff-engineer",
      organization_id: "dejavu",
      display_name: "Studio Engineer",
      full_name: "Studio Engineer",
      email: process.env.DEJAVU_ENGINEER_EMAIL || "engineer@dejavustudio.local",
      password_hash: hashPassword(ALLOW_TEST_LOGIN && TEST_LOGIN_PASSWORD ? TEST_LOGIN_PASSWORD : randomUUID()),
      is_active: true,
      user_roles: [{ role: { name: "Engineer", slug: "engineer" } }],
      user_programs: [],
    },
    {
      id: "staff-beatmaker",
      organization_id: "dejavu",
      display_name: "Beat Maker",
      full_name: "Beat Maker",
      email: process.env.DEJAVU_BEATMAKER_EMAIL || "beatmaker@dejavustudio.local",
      password_hash: hashPassword(ALLOW_TEST_LOGIN && TEST_LOGIN_PASSWORD ? TEST_LOGIN_PASSWORD : randomUUID()),
      is_active: true,
      user_roles: [{ role: { name: "Beat Maker", slug: "beatmaker" } }],
      user_programs: [],
    },
    {
      id: "admin",
      organization_id: "dejavu",
      display_name: "Super Admin",
      full_name: "Super Admin",
      email: ADMIN_EMAIL,
      password_hash: hashPassword(ADMIN_BOOTSTRAP_PASSWORD || randomUUID()),
      is_active: true,
      user_roles: [{ role: { name: "Administrator", slug: "administrator" } }],
      user_programs: [],
    },
  ],
  roles: [
    { id: "administrator", name: "Administrator", slug: "administrator", description: "Full admin access" },
    { id: "artist", name: "Artist", slug: "artist", description: "Can book and manage own sessions" },
    { id: "engineer", name: "Engineer", slug: "engineer", description: "Required studio staff role" },
    { id: "beatmaker", name: "Beat Maker", slug: "beatmaker", description: "Optional creative staff role" },
    { id: "film-director-cameraman", name: "Film Director / Cameraman", slug: "film-director-cameraman", description: "Film direction and camera production role" },
  ],
  programs: [
    { id: "goldlective", name: "Goldlective", slug: "goldlective", description: "12 monthly studio hours plus approved extras." },
    { id: "house-artist", name: "House Artist", slug: "house-artist", description: "Individual monthly hours and financial agreement." },
  ],
  studios: [
    { id: "studio-gold", name: "Studio Gold", slug: "studio-gold", description: "Premium recording room", is_active: true, is_bookable: true, opens_at: "10:00", closes_at: "23:00" },
    { id: "studio-silver", name: "Studio Silver", slug: "studio-silver", description: "Creative production room", is_active: true, is_bookable: true, opens_at: "10:00", closes_at: "23:00" },
  ],
  services: [
    {
      id: "studio-session",
      name: "Studio Session",
      slug: "studio-session",
      description: "Professional studio session with engineer.",
      duration_minutes: 120,
      options: [{ role_id: "engineer", is_required: true, is_optional: false, label: "Engineer", role: { name: "Engineer", slug: "engineer" } }],
    },
    {
      id: "beat-session",
      name: "Beat Session",
      slug: "beat-session",
      description: "Beat creation and recording session.",
      duration_minutes: 240,
      options: [
        { role_id: "engineer", is_required: true, is_optional: false, label: "Engineer", role: { name: "Engineer", slug: "engineer" } },
        { role_id: "beatmaker", is_required: false, is_optional: true, label: "Beat Maker", role: { name: "Beat Maker", slug: "beatmaker" } },
      ],
    },
  ],
  artistTypes: [
    { id: "goldlective", name: "Goldlective", slug: "goldlective", included_hours: 12, billing: "program" },
    { id: "house-artist", name: "House Artist", slug: "house-artist", included_hours: 0, billing: "monthly/hourly agreement" },
  ],
  bookings: [],
  notifications: [],
  audit: [],
  contacts: [],
  openingHours: [
    { id: "gold-weekday", studio: { name: "Studio Gold" }, weekday: "Monday - Saturday", opens_at: "10:00", closes_at: "23:00", is_open: true, notes: "Regular hours" },
    { id: "maintenance-2026-09-25", studio: { name: "Studio Gold" }, date: "2026-09-25", is_open: false, notes: "Studio maintenance day" },
  ],
  availability: [
    { id: "avail-engineer-1", profile_id: "staff-engineer", weekday: 1, start_time: "10:00", end_time: "22:00", is_available: true },
    { id: "avail-engineer-2", profile_id: "staff-engineer", weekday: 2, start_time: "10:00", end_time: "22:00", is_available: true },
    { id: "avail-engineer-3", profile_id: "staff-engineer", weekday: 3, start_time: "10:00", end_time: "22:00", is_available: true },
    { id: "avail-engineer-4", profile_id: "staff-engineer", weekday: 4, start_time: "10:00", end_time: "22:00", is_available: true },
    { id: "avail-engineer-5", profile_id: "staff-engineer", weekday: 5, start_time: "10:00", end_time: "22:00", is_available: true },
  ],
  ledger: [{ id: "ledger-2026-09", user: { display_name: "Aniket Devworks" }, artist_type: { name: "Goldlective" }, month: "2026-09", allocated_hours: "12.00", used_hours: "0.00", remaining_hours: "12.00", expired_hours: "0.00" }],
  agreements: [{ id: "agreement-1", artist: { display_name: "Aniket Devworks" }, agreement_type: "Monthly", monthly_rate: "€0.00", included_hours: "12.00", effective_from: "2026-09-01", status: "active", history: [] }],
  settings: [
    { id: "smtp-host", name: "SMTP host", slug: "smtp_host", value: SMTP_HOST, description: "Mail server host, for Gmail use smtp.gmail.com", status: "active" },
    { id: "smtp-port", name: "SMTP port", slug: "smtp_port", value: String(SMTP_PORT), description: "587 for TLS, 465 for SSL", status: "active" },
    { id: "smtp-user", name: "SMTP username", slug: "smtp_user", value: SMTP_USER || ADMIN_EMAIL, description: "Email account used to send booking/contact emails", status: "active" },
    { id: "smtp-pass", name: "SMTP app password", slug: "smtp_pass", value: "", description: "Gmail app password or SMTP password. Leave blank to use server environment secret.", status: "active" },
    { id: "from-email", name: "From email", slug: "from_email", value: FROM_EMAIL, description: "Sender email shown in outgoing emails", status: "active" },
    { id: "from-name", name: "From name", slug: "from_name", value: FROM_NAME, description: "Sender name shown in outgoing emails", status: "active" },
    { id: "admin-recipients", name: "Admin notification recipients", slug: "admin_recipients", value: ADMIN_EMAIL, description: "Comma-separated admin emails that receive booking/contact notifications", status: "active" },
    { id: "cancellation-window", name: "Artist cancellation window", slug: "cancellation_window_hours", value: "24", description: "Minimum hours before a session when an artist may cancel their own booking", status: "active" },
  ],
  extraHours: [],
  sessions: [],
};

function mergeDefaults(base, saved) {
  const next = { ...base, ...(saved || {}) };
  for (const key of Object.keys(base)) {
    if (Array.isArray(base[key]) && !Array.isArray(next[key])) next[key] = base[key];
    if (Array.isArray(base[key]) && Array.isArray(next[key])) {
      const defaultsById = new Map(base[key].filter((item) => item && item.id).map((item) => [item.id, item]));
      const existingIds = new Set(next[key].filter((item) => item && item.id).map((item) => item.id));
      next[key] = next[key].map((item) => {
        const fallback = item && item.id ? defaultsById.get(item.id) : null;
        return fallback ? { ...fallback, ...item } : item;
      });
      for (const item of base[key]) {
        if (item?.id && !existingIds.has(item.id)) next[key].push(structuredClone(item));
      }
    }
  }
  return next;
}

function loadDb() {
  try {
    if (!fs.existsSync(DATA_FILE)) return structuredClone(defaultDb);
    const saved = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    const normalized = mergeDefaults(defaultDb, saved);
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(normalized, null, 2));
    return normalized;
  } catch (error) {
    console.warn("[dejavu-api] Could not read local DB, using seed data:", error?.message || error);
    return structuredClone(defaultDb);
  }
}

function saveDb() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  const tempFile = `${DATA_FILE}.${process.pid}.${randomUUID()}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(db, null, 2));
  try {
    fs.renameSync(tempFile, DATA_FILE);
  } catch (error) {
    if (!["EEXIST", "EPERM", "EACCES"].includes(error?.code)) throw error;
    fs.copyFileSync(tempFile, DATA_FILE);
    fs.unlinkSync(tempFile);
  }
}

let db = loadDb();

if (STRICT_AUTH && !DATA_FILE_EXISTED && !ADMIN_BOOTSTRAP_PASSWORD) {
  throw new Error("DEJAVU_ADMIN_PASSWORD is required when creating a new production database.");
}

function addAudit(action, entity, entityId, actor = "System", details = {}) {
  db.audit.unshift({ id: id(), action, entity, entity_id: entityId, actor_name: actor, details, created_at: nowIso() });
  saveDb();
}

function addNotification(title, message, type = "info") {
  db.notifications.unshift({ id: id(), title, message, type, read_at: null, created_at: nowIso() });
  saveDb();
}

function json(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    let tooLarge = false;
    req.on("data", (chunk) => {
      if (tooLarge) return;
      raw += chunk;
      if (Buffer.byteLength(raw) > REQUEST_BODY_LIMIT) {
        tooLarge = true;
        reject(Object.assign(new Error("Request body is too large."), { statusCode: 413 }));
        req.resume();
      }
    });
    req.on("end", () => {
      if (tooLarge) return;
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch { reject(Object.assign(new Error("Invalid JSON request body."), { statusCode: 400 })); }
    });
    req.on("error", (error) => { if (!tooLarge) reject(error); });
  });
}

function publicProfile(profile) {
  if (!profile) return null;
  return {
    id: profile.id,
    display_name: profile.display_name,
    full_name: profile.full_name,
    email: profile.email,
    is_active: profile.is_active,
    avatar_url: profile.avatar_url || null,
    user_roles: profile.user_roles || [],
    user_programs: profile.user_programs || [],
  };
}

function unauthenticatedActor() {
  if (!STRICT_AUTH) return { profile: db.profiles.find((p) => p.id === "admin"), isAdmin: true, preview: true, authenticated: false };
  return { profile: null, isAdmin: false, preview: false, authenticated: false };
}

function currentActor(req) {
  const header = req.headers.authorization || "";
  const token = header.replace(/^Bearer\s+/i, "");
  if (!token || token.length > 300) return unauthenticatedActor();
  const session = db.sessions.find((s) => s.token === token && new Date(s.expires_at).getTime() > Date.now());
  if (!session) return unauthenticatedActor();
  const profile = profileFor(session.profile_id);
  if (!profile || !profile.is_active) return unauthenticatedActor();
  return { profile, isAdmin: roleSlugs(profile).includes("administrator"), preview: false, authenticated: true };
}

const loginAttempts = new Map();

function loginAttemptKey(req, email) {
  return `${req.socket.remoteAddress || "unknown"}|${email || "unknown"}`;
}

function loginWithEmail(req, body) {
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const attemptKey = loginAttemptKey(req, email);
  const now = Date.now();
  const previous = loginAttempts.get(attemptKey);
  const attempt = !previous || previous.resetAt <= now
    ? { count: 0, resetAt: now + LOGIN_WINDOW_MS }
    : previous;
  if (attempt.count >= LOGIN_MAX_ATTEMPTS) {
    const retryAfter = Math.max(1, Math.ceil((attempt.resetAt - now) / 1000));
    return { status: 429, body: { error: "Too many login attempts. Please try again later.", retryAfter } };
  }

  const matchingProfiles = db.profiles.filter((p) => p.email?.toLowerCase() === email);
  const profile =
    matchingProfiles.find((p) => p.id === "admin") ||
    matchingProfiles.find((p) => roleSlugs(p).includes("administrator")) ||
    matchingProfiles[0];
  if (!profile || !profile.is_active) {
    attempt.count += 1;
    loginAttempts.set(attemptKey, attempt);
    return { status: 401, body: { error: "Invalid email/password." } };
  }
  const allowed =
    (ALLOW_TEST_LOGIN && TEST_LOGIN_PASSWORD && password === TEST_LOGIN_PASSWORD) ||
    verifyPassword(password, profile.password_hash);
  if (!allowed) {
    attempt.count += 1;
    loginAttempts.set(attemptKey, attempt);
    return { status: 401, body: { error: "Invalid email/password." } };
  }
  loginAttempts.delete(attemptKey);
  db.sessions = db.sessions.filter((session) => new Date(session.expires_at).getTime() > Date.now());
  const token = `dv_${randomUUID()}`;
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * SESSION_HOURS).toISOString();
  db.sessions.unshift({ id: id(), token, profile_id: profile.id, email, expires_at: expiresAt, created_at: nowIso() });
  saveDb();
  addAudit("auth.login", "user", profile.id, profile.display_name, { email });
  return { status: 200, body: { token, tokenExpires: expiresAt, user: publicProfile(profile) } };
}

function requestOriginAllowed(req) {
  const origin = String(req.headers.origin || "").replace(/\/$/, "");
  if (!origin) return true;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const forwardedHost = String(req.headers["x-forwarded-host"] || "").split(",")[0].trim();
    const requestHost = forwardedHost || String(req.headers.host || "");
    return new URL(origin).host === requestHost;
  } catch {
    return false;
  }
}

function applyCors(req, res) {
  const origin = String(req.headers.origin || "").replace(/\/$/, "");
  if (origin && requestOriginAllowed(req)) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
}

function isPublicRoute(method, path) {
  if (method === "GET" && path === "/health") return true;
  if (method === "POST" && path === "/auth/email/login") return true;
  if (method === "POST" && path === "/contact") return true;
  if (method === "GET" && ["/studios", "/services", "/booking-types", "/artist-types"].includes(path)) return true;
  return false;
}

function isAdminRoute(method, path) {
  if (method === "OPTIONS") return false;
  if (path === "/auth/me") return false;
  if (path === "/bookings" && method === "POST") return false;
  if (method === "POST" && /^\/bookings\/[^/]+\/cancelled$/.test(path)) return false;
  if (path.startsWith("/wallet/")) return false;
  if (path.startsWith("/availability/") && method === "GET") return false;
  if (path === "/availability" && method === "POST") return false;
  if (/^\/availability\/[^/]+$/.test(path) && method === "DELETE") return false;
  const adminBases = [
    "/dashboard/overview",
    "/profiles",
    "/users",
    "/roles",
    "/programs",
    "/studios",
    "/services",
    "/booking-types",
    "/artist-types",
    "/opening-hours",
    "/availability",
    "/studio-hour-ledger",
    "/financial-agreements",
    "/additional-hours",
    "/notifications",
    "/audit-logs",
    "/settings",
    "/contact",
    "/agenda",
  ];
  if (adminBases.some((base) => path === base || path.startsWith(`${base}/`))) return true;
  if (path.startsWith("/bookings/")) return true;
  return false;
}

function decorateBooking(booking) {
  const artist = db.profiles.find((p) => p.id === booking.artist_id);
  const studio = db.studios.find((s) => s.id === booking.studio_id);
  const service = db.services.find((s) => s.id === booking.service_id);
  return {
    ...booking,
    artist: artist ? { display_name: artist.display_name, email: artist.email } : undefined,
    studio: studio ? { id: studio.id, name: studio.name } : undefined,
    booking_type: service ? { name: service.name } : undefined,
    status: statusObject(booking.status),
    required_staff_label: [booking.engineer_id, booking.beat_maker_id].filter(Boolean).map((staffId) => db.profiles.find((p) => p.id === staffId)?.display_name).filter(Boolean).join(" · ") || "—",
    financial_snapshot: booking.financial_snapshot || null,
  };
}

function decorateAvailability(record) {
  const profile = db.profiles.find((item) => item.id === record.profile_id);
  return {
    ...record,
    profile: profile ? { id: profile.id, display_name: profile.display_name, email: profile.email } : undefined,
  };
}

function statusObject(status) {
  const map = {
    pending: { name: "Pending", slug: "pending", color: "#E8D5A3" },
    confirmed: { name: "Confirmed", slug: "confirmed", color: "#38BDF8" },
    cancelled: { name: "Cancelled", slug: "cancelled", color: "#F87171" },
    completed: { name: "Completed", slug: "completed", color: "#4ADE80" },
    no_show: { name: "No show", slug: "no_show", color: "#FB923C" },
  };
  return map[status] || map.pending;
}

function settingValue(slug, fallback = "") {
  const row = db.settings?.find((setting) => setting.slug === slug);
  const value = row?.value;
  return value === undefined || value === null || value === "" ? fallback : String(value);
}

function mailSettings() {
  const host = settingValue("smtp_host", SMTP_HOST);
  const port = Number(settingValue("smtp_port", String(SMTP_PORT)));
  const user = settingValue("smtp_user", SMTP_USER);
  const pass = settingValue("smtp_pass", SMTP_PASS).replace(/\s+/g, "");
  const fromEmail = settingValue("from_email", FROM_EMAIL || user);
  const fromName = settingValue("from_name", FROM_NAME);
  const adminRecipients = settingValue("admin_recipients", ADMIN_EMAIL)
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
  return { host, port, user, pass, fromEmail, fromName, adminRecipients };
}

function publicSettings() {
  const configured = Boolean(mailSettings().pass);
  return db.settings.map((setting) => setting.slug === "smtp_pass"
    ? { ...setting, value: "", configured }
    : setting);
}

async function sendSmtpTestEmail() {
  const mail = mailSettings();
  if (!mail.user || !mail.pass) return { sent: false, reason: "SMTP username and app password are required." };
  if (!mail.adminRecipients.length) return { sent: false, reason: "At least one admin notification email is required." };
  try {
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: mail.host,
      port: mail.port,
      secure: mail.port === 465,
      auth: { user: mail.user, pass: mail.pass },
    });
    await transporter.sendMail({
      from: `"${mail.fromName}" <${mail.fromEmail}>`,
      to: mail.adminRecipients.join(","),
      subject: "Déjà Vu Studio SMTP test successful",
      text: "Your Déjà Vu Studio SMTP settings are working. Booking and contact notifications can now be delivered.",
      html: `<div style="font-family:Arial,sans-serif;background:#080808;color:#f0ede6;padding:28px"><div style="max-width:620px;margin:auto;border:1px solid #5b4a20;border-radius:18px;padding:28px;background:#111"><p style="letter-spacing:.35em;text-transform:uppercase;color:#C9A84C;font-size:11px">Déjà Vu Studio OS</p><h2>SMTP test successful</h2><p>Booking and contact notifications can now be delivered.</p></div></div>`,
    });
    return { sent: true, recipientCount: mail.adminRecipients.length };
  } catch (error) {
    console.error("[dejavu-api] SMTP test failed:", error?.message || error);
    return { sent: false, reason: error?.message || "SMTP test failed" };
  }
}

async function sendBookingEmail(booking, statusLabel = "pending") {
  const artist = db.profiles.find((p) => p.id === booking.artist_id);
  const studio = db.studios.find((s) => s.id === booking.studio_id);
  const service = db.services.find((s) => s.id === booking.service_id);
  const mail = mailSettings();
  const recipients = Array.from(new Set([artist?.email, ...mail.adminRecipients].filter(Boolean)));
  const subject = `Déjà Vu Studio booking ${statusLabel}: ${booking.reference}`;
  const html = `
    <div style="font-family:Arial,sans-serif;background:#080808;color:#f0ede6;padding:28px">
      <div style="max-width:620px;margin:auto;border:1px solid rgba(201,168,76,.35);border-radius:18px;padding:28px;background:#111">
        <p style="letter-spacing:.35em;text-transform:uppercase;color:#C9A84C;font-size:11px">Déjà Vu Studio OS</p>
        <h2 style="margin:8px 0 12px;color:#fff">Studio booking ${statusLabel}</h2>
        <p style="color:#cfc8b8">Your studio session details are below.</p>
        <table style="width:100%;margin-top:20px;border-collapse:collapse;color:#f0ede6">
          <tr><td style="padding:10px;border-bottom:1px solid #2a2619;color:#C9A84C">Reference</td><td style="padding:10px;border-bottom:1px solid #2a2619">${booking.reference}</td></tr>
          <tr><td style="padding:10px;border-bottom:1px solid #2a2619;color:#C9A84C">Artist</td><td style="padding:10px;border-bottom:1px solid #2a2619">${artist?.display_name || "—"}</td></tr>
          <tr><td style="padding:10px;border-bottom:1px solid #2a2619;color:#C9A84C">Studio</td><td style="padding:10px;border-bottom:1px solid #2a2619">${studio?.name || "—"}</td></tr>
          <tr><td style="padding:10px;border-bottom:1px solid #2a2619;color:#C9A84C">Service</td><td style="padding:10px;border-bottom:1px solid #2a2619">${service?.name || "—"}</td></tr>
          <tr><td style="padding:10px;border-bottom:1px solid #2a2619;color:#C9A84C">Date & time</td><td style="padding:10px;border-bottom:1px solid #2a2619">${booking.date} ${booking.start_time} - ${booking.end_time}</td></tr>
          <tr><td style="padding:10px;color:#C9A84C">Status</td><td style="padding:10px">${statusLabel}</td></tr>
        </table>
      </div>
    </div>`;

  if (!mail.user || !mail.pass) {
    console.warn("[dejavu-api] SMTP env missing; skipped email:", subject, recipients);
    return { sent: false, reason: "SMTP env missing" };
  }

  try {
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: mail.host,
      port: mail.port,
      secure: mail.port === 465,
      auth: { user: mail.user, pass: mail.pass },
    });
    await transporter.sendMail({
      from: `"${mail.fromName}" <${mail.fromEmail}>`,
      to: recipients.join(","),
      subject,
      text: `Booking ${statusLabel}: ${booking.reference} ${booking.date} ${booking.start_time}-${booking.end_time}`,
      html,
    });
    return { sent: true, to: recipients };
  } catch (error) {
    console.error("[dejavu-api] email failed:", error?.message || error);
    return { sent: false, reason: error?.message || "email failed" };
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendContactEmail(contact) {
  const mail = mailSettings();
  const recipients = Array.from(new Set([contact.email, ...mail.adminRecipients].filter(Boolean)));
  const subject = `Déjà Vu Studio contact request: ${contact.name || "Visitor"}`;
  if (!mail.user || !mail.pass) return { sent: false, reason: "SMTP credentials are not configured", to: recipients };
  try {
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: mail.host,
      port: mail.port,
      secure: mail.port === 465,
      auth: { user: mail.user, pass: mail.pass },
    });
    if (mail.adminRecipients.length) await transporter.sendMail({
      from: `"${mail.fromName}" <${mail.fromEmail}>`,
      to: mail.adminRecipients.join(","),
      replyTo: contact.email,
      subject,
      text: `Contact request from ${contact.name} (${contact.email})\n\n${contact.message}`,
      html: `<div style="font-family:Arial,sans-serif;background:#080808;color:#f0ede6;padding:28px"><div style="max-width:620px;margin:auto;border:1px solid #5b4a20;border-radius:18px;padding:28px;background:#111"><p style="letter-spacing:.35em;text-transform:uppercase;color:#C9A84C;font-size:11px">Déjà Vu Studio OS</p><h2>New contact request</h2><p><strong>Name:</strong> ${escapeHtml(contact.name)}</p><p><strong>Email:</strong> ${escapeHtml(contact.email)}</p><p style="white-space:pre-wrap">${escapeHtml(contact.message)}</p></div></div>`,
    });
    if (contact.email) await transporter.sendMail({
      from: `"${mail.fromName}" <${mail.fromEmail}>`,
      to: contact.email,
      subject: "We received your Déjà Vu Studio message",
      text: `Hi ${contact.name || "there"},\n\nWe received your message and will contact you shortly.\n\nDéjà Vu Studio`,
      html: `<div style="font-family:Arial,sans-serif;background:#080808;color:#f0ede6;padding:28px"><div style="max-width:620px;margin:auto;border:1px solid #5b4a20;border-radius:18px;padding:28px;background:#111"><p style="letter-spacing:.35em;text-transform:uppercase;color:#C9A84C;font-size:11px">Déjà Vu Studio</p><h2>Message received</h2><p>Hi ${escapeHtml(contact.name || "there")},</p><p>We received your message and will contact you shortly.</p></div></div>`,
    });
    return { sent: true, to: recipients };
  } catch (error) {
    console.error("[dejavu-api] contact email failed:", error?.message || error);
    return { sent: false, reason: error?.message || "email failed", to: recipients };
  }
}

function dateFromBody(body) {
  if (body.date) return body.date;
  if (body.start_at) return String(body.start_at).slice(0, 10);
  return "2026-09-04";
}

function timeFromBody(body, key, fallback) {
  if (body[key]) return String(body[key]).slice(0, 5);
  const isoKey = key === "start_time" ? "start_at" : "end_at";
  if (body[isoKey]) return new Date(body[isoKey]).toTimeString().slice(0, 5);
  return fallback;
}

function minutes(time) {
  const [h, m] = String(time || "00:00").slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

function monthKey(date) {
  return String(date).slice(0, 7);
}

function bookingDurationHours(booking) {
  return Number(booking.duration_hours || ((minutes(booking.end_time) - minutes(booking.start_time)) / 60));
}

function studioFor(idValue) {
  return db.studios.find((s) => s.id === idValue);
}

function serviceFor(idValue) {
  return db.services.find((s) => s.id === idValue);
}

function profileFor(idValue) {
  return db.profiles.find((p) => p.id === idValue);
}

function roleSlugs(profile) {
  return profile?.user_roles?.map((r) => r.role.slug) || [];
}

function agreementFor(profileId) {
  const profile = profileFor(profileId);
  return db.agreements.find((a) => a.artist_id === profileId || a.artist?.display_name === profile?.display_name || a.name === profile?.display_name);
}

function financialSnapshot(booking) {
  const agreement = agreementFor(booking.artist_id);
  if (!agreement) return { agreement_type: "Goldlective", rate: "Included program hours", captured_at: nowIso() };
  return {
    agreement_id: agreement.id,
    agreement_type: agreement.agreement_type || agreement.type || "Monthly",
    hourly_rate: agreement.hourly_rate || null,
    monthly_rate: agreement.monthly_rate || agreement.rate || null,
    included_hours: agreement.included_hours || null,
    effective_from: agreement.effective_from || null,
    captured_at: nowIso(),
  };
}

function checkStudioOpen(booking) {
  const studio = studioFor(booking.studio_id);
  const date = new Date(`${booking.date}T00:00:00`);
  const weekday = date.getDay();
  const belongsToStudio = (row) => !row.studio_id && !row.studio?.name || row.studio_id === studio?.id || row.studio?.name === studio?.name;
  const exception = db.openingHours.find((row) => row.date === booking.date && belongsToStudio(row));
  if (exception) {
    if (!exception.is_open) return { ok: false, error: "Studio is closed on this date." };
    return minutes(booking.start_time) >= minutes(exception.opens_at) && minutes(booking.end_time) <= minutes(exception.closes_at)
      ? { ok: true }
      : { ok: false, error: "Selected time is outside special opening hours." };
  }
  if (weekday === 0) return { ok: false, error: "Studio is closed on Sundays." };
  const weekdayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const recurring = db.openingHours.find((row) => {
    if (row.date || !belongsToStudio(row)) return false;
    if (Number.isInteger(Number(row.weekday)) && String(row.weekday).trim() !== "") return Number(row.weekday) === weekday;
    const label = String(row.weekday || "").toLowerCase();
    if (label.includes("monday - saturday")) return weekday >= 1 && weekday <= 6;
    return label === weekdayNames[weekday];
  });
  if (recurring?.is_open === false) return { ok: false, error: "Studio is closed during regular opening hours." };
  const opensAt = recurring?.opens_at || studio?.opens_at || "10:00";
  const closesAt = recurring?.closes_at || studio?.closes_at || "23:00";
  if (minutes(booking.start_time) < minutes(opensAt) || minutes(booking.end_time) > minutes(closesAt)) {
    return { ok: false, error: "Selected time is outside studio opening hours." };
  }
  return { ok: true };
}

function checkStaff(booking, profileId, requiredSlug) {
  if (!profileId) return { ok: false, error: `${requiredSlug} is required.` };
  const profile = profileFor(profileId);
  if (!roleSlugs(profile).includes(requiredSlug)) return { ok: false, error: `Selected staff member does not have the ${requiredSlug} role.` };
  const weekday = new Date(`${booking.date}T00:00:00`).getDay();
  const specific = db.availability.filter((a) => a.profile_id === profileId && a.date === booking.date);
  if (specific.length) {
    const specificAvailable = specific.some((a) =>
      a.is_available &&
      minutes(booking.start_time) >= minutes(a.start_time) &&
      minutes(booking.end_time) <= minutes(a.end_time)
    );
    if (!specificAvailable) return { ok: false, error: `${profile.display_name} is unavailable due to a specific-date exception.` };
  }
  const available = specific.length > 0 || db.availability.some((a) =>
    a.profile_id === profileId &&
    !a.date &&
    a.weekday === weekday &&
    a.is_available &&
    minutes(booking.start_time) >= minutes(a.start_time) &&
    minutes(booking.end_time) <= minutes(a.end_time)
  );
  if (!available) return { ok: false, error: `${profile.display_name} is not available at this time.` };
  const conflict = db.bookings.some((b) =>
    b.id !== booking.id &&
    b.status !== "cancelled" &&
    b.date === booking.date &&
    (b.engineer_id === profileId || b.beat_maker_id === profileId) &&
    booking.start_time < b.end_time &&
    booking.end_time > b.start_time
  );
  if (conflict) return { ok: false, error: `${profile.display_name} already has another booking at this time.` };
  return { ok: true };
}

function ledgerFor(booking) {
  const artist = profileFor(booking.artist_id);
  const key = monthKey(booking.date);
  let row = db.ledger.find((l) => l.month === key && l.user?.display_name === artist?.display_name);
  if (!row) {
    const programSlug = booking.artist_type_id || artist?.user_programs?.[0]?.program?.slug || "goldlective";
    const isHouseArtist = programSlug === "house-artist";
    const agreedHours = Number(agreementFor(booking.artist_id)?.included_hours || 0);
    const allocated = isHouseArtist ? agreedHours : 12;
    row = {
      id: `ledger-${key}-${id()}`,
      profile_id: artist?.id,
      user: { display_name: artist?.display_name || "Artist" },
      artist_type: { name: isHouseArtist ? "House Artist" : "Goldlective" },
      month: key,
      allocated_hours: allocated.toFixed(2),
      used_hours: "0.00",
      remaining_hours: allocated.toFixed(2),
      expired_hours: "0.00",
    };
    db.ledger.unshift(row);
  }
  return row;
}

function ensureMonthlyLedgers(targetMonth = monthKey(nowIso())) {
  for (const profile of db.profiles.filter((item) => roleSlugs(item).includes("artist"))) {
    if (db.ledger.some((row) => row.month === targetMonth && (row.profile_id === profile.id || row.user?.display_name === profile.display_name))) continue;
    ledgerFor({
      artist_id: profile.id,
      artist_type_id: profile.user_programs?.[0]?.program?.slug || "goldlective",
      date: `${targetMonth}-01`,
    });
  }
}

function expireLedgerMonth(targetMonth, actor = "System") {
  const rows = db.ledger.filter((row) => row.month === targetMonth && !row.expired_at);
  for (const row of rows) {
    const remaining = Number(row.remaining_hours || 0);
    row.expired_hours = (Number(row.expired_hours || 0) + remaining).toFixed(2);
    row.remaining_hours = "0.00";
    row.expired_at = nowIso();
  }
  if (rows.length) {
    addAudit("studio_hours.expired", "studio-hour-ledger", targetMonth, actor, { rows: rows.length });
    addNotification("Studio hours expired", `${rows.length} ledger row(s) expired for ${targetMonth}.`, "hours");
  }
  return rows;
}

function runStudioHoursMaintenance() {
  const currentMonth = monthKey(nowIso());
  const monthsToExpire = [...new Set(db.ledger.map((row) => row.month).filter((month) => month && month < currentMonth))];
  monthsToExpire.forEach((month) => expireLedgerMonth(month));
  ensureMonthlyLedgers(currentMonth);
  saveDb();
}

function hasHours(booking) {
  const row = ledgerFor(booking);
  const remaining = Number(row.remaining_hours || 0);
  const required = bookingDurationHours(booking);
  return remaining >= required ? { ok: true } : { ok: false, error: `Insufficient studio hours. Required ${required.toFixed(2)}, remaining ${remaining.toFixed(2)}.` };
}

function canCancel(booking, actor) {
  if (actor?.isAdmin) return { ok: true };
  if (booking.artist_id !== actor?.profile?.id) return { ok: false, error: "Users can cancel only their own booking." };
  const start = new Date(`${booking.date}T${booking.start_time}:00`);
  const hoursUntilStart = (start.getTime() - Date.now()) / 36e5;
  const configuredWindow = Math.max(0, Number(settingValue("cancellation_window_hours", "24")) || 0);
  return hoursUntilStart >= configuredWindow
    ? { ok: true }
    : { ok: false, error: `Bookings can be cancelled by users only at least ${configuredWindow} hours before start time.` };
}

function applyHours(booking, direction = 1) {
  if (booking.hours_applied) return;
  const row = ledgerFor(booking);
  const used = Math.max(0, Number(row.used_hours || 0) + direction * bookingDurationHours(booking));
  const allocated = Number(row.allocated_hours || 0);
  row.used_hours = used.toFixed(2);
  row.remaining_hours = Math.max(0, allocated - used).toFixed(2);
  booking.hours_applied = direction > 0;
}

function conflicts(next) {
  return db.bookings.some((b) =>
    b.id !== next.id &&
    b.studio_id === next.studio_id &&
    b.date === next.date &&
    b.status !== "cancelled" &&
    next.start_time < b.end_time &&
    next.end_time > b.start_time
  );
}

async function createBooking(body) {
  const serviceId = body.service_id || body.booking_type_id;
  const service = db.services.find((s) => s.id === serviceId);
  const studio = studioFor(body.studio_id);
  if (!profileFor(body.artist_id)) return { status: 400, body: { error: "A valid artist/user is required." } };
  if (!service) return { status: 400, body: { error: "A valid service is required." } };
  if (!studio) return { status: 400, body: { error: "A valid studio is required." } };
  if (!studio?.is_active || !studio?.is_bookable) return { status: 400, body: { error: "Studio is not active/bookable." } };
  if (service?.is_active === false || service?.is_bookable === false) return { status: 400, body: { error: "Service is not active/bookable." } };
  const needsEngineer = service.options?.some((o) => o.role.slug === "engineer" && o.is_required);
  if (needsEngineer && !body.engineer_id && !body.required_staff_ids?.length) {
    return { status: 400, body: { error: "Engineer is required for this service." } };
  }
  const booking = {
    id: id(),
    reference: `DV-${id()}`,
    artist_id: body.artist_id || "artist-aniket",
    studio_id: body.studio_id || "studio-gold",
    service_id: service.id,
    engineer_id: body.engineer_id || body.required_staff_ids?.[0] || "staff-engineer",
    beat_maker_id: body.beat_maker_id || null,
    artist_type_id: body.artist_type_id || "goldlective",
    date: dateFromBody(body),
    start_time: timeFromBody(body, "start_time", "15:00"),
    end_time: timeFromBody(body, "end_time", "17:00"),
    duration_hours: Number(body.duration_hours || 2),
    notes: body.notes || null,
    status: body.status || "pending",
    financial_snapshot: null,
    created_at: nowIso(),
  };
  if (minutes(booking.end_time) <= minutes(booking.start_time)) return { status: 400, body: { error: "End time must be after start time." } };
  booking.duration_hours = (minutes(booking.end_time) - minutes(booking.start_time)) / 60;
  const openCheck = checkStudioOpen(booking);
  if (!openCheck.ok) return { status: 400, body: { error: openCheck.error } };
  if (conflicts(booking)) return { status: 409, body: { error: "This studio already has a booking at the selected time." } };
  if (needsEngineer) {
    const staffCheck = checkStaff(booking, booking.engineer_id, "engineer");
    if (!staffCheck.ok) return { status: 400, body: { error: staffCheck.error } };
  }
  if (booking.beat_maker_id) {
    const beatMakerCheck = checkStaff(booking, booking.beat_maker_id, "beatmaker");
    if (!beatMakerCheck.ok) return { status: 400, body: { error: beatMakerCheck.error } };
  }
  const hourCheck = hasHours(booking);
  if (!hourCheck.ok) return { status: 400, body: { error: hourCheck.error } };
  booking.financial_snapshot = financialSnapshot(booking);
  db.bookings.unshift(booking);
  applyHours(booking, 1);
  addAudit("booking.created", "booking", booking.id, "Aniket Devworks", { reference: booking.reference, status: booking.status });
  addNotification("Studio booking pending", `Studio booking ${booking.reference} is now pending.`, "booking");
  const mail = await sendBookingEmail(booking, "pending");
  return { status: 201, body: { ...decorateBooking(booking), mail } };
}

async function updateBooking(idValue, body, actor = { isAdmin: true }) {
  const booking = db.bookings.find((b) => b.id === idValue || b.reference === idValue);
  if (!booking) return { status: 404, body: { error: "Booking not found" } };
  const previousStatus = booking.status;
  if (body.status === "cancelled") {
    const cancelCheck = canCancel(booking, actor);
    if (!cancelCheck.ok) return { status: 403, body: { error: cancelCheck.error } };
  }
  const candidate = { ...booking, ...body };
  const bookingFields = ["artist_id", "studio_id", "service_id", "engineer_id", "beat_maker_id", "artist_type_id", "date", "start_time", "end_time", "duration_hours"];
  const bookingChanged = bookingFields.some((key) => body[key] !== undefined && body[key] !== booking[key]);
  const detailsChanged = bookingChanged || (body.notes !== undefined && body.notes !== booking.notes);
  if (bookingChanged) {
    const service = serviceFor(candidate.service_id);
    const studio = studioFor(candidate.studio_id);
    if (!profileFor(candidate.artist_id)) return { status: 400, body: { error: "A valid artist/user is required." } };
    if (!service || service.is_active === false || service.is_bookable === false) return { status: 400, body: { error: "Service is not active/bookable." } };
    if (!studio?.is_active || !studio?.is_bookable) return { status: 400, body: { error: "Studio is not active/bookable." } };
    if (minutes(candidate.end_time) <= minutes(candidate.start_time)) return { status: 400, body: { error: "End time must be after start time." } };
    candidate.duration_hours = (minutes(candidate.end_time) - minutes(candidate.start_time)) / 60;
    const openCheck = checkStudioOpen(candidate);
    if (!openCheck.ok) return { status: 400, body: { error: openCheck.error } };
    if (conflicts(candidate)) return { status: 409, body: { error: "This studio already has a booking at the selected time." } };
    const needsEngineer = service.options?.some((option) => option.role.slug === "engineer" && option.is_required);
    if (needsEngineer) {
      const staffCheck = checkStaff(candidate, candidate.engineer_id, "engineer");
      if (!staffCheck.ok) return { status: 400, body: { error: staffCheck.error } };
    }
    if (candidate.beat_maker_id) {
      const beatMakerCheck = checkStaff(candidate, candidate.beat_maker_id, "beatmaker");
      if (!beatMakerCheck.ok) return { status: 400, body: { error: beatMakerCheck.error } };
    }
    if (booking.hours_applied) {
      const row = ledgerFor(booking);
      const oldDuration = bookingDurationHours(booking);
      const newDuration = bookingDurationHours(candidate);
      const availableForReplacement = Number(row.remaining_hours || 0) + oldDuration;
      if (availableForReplacement < newDuration) return { status: 400, body: { error: `Insufficient studio hours. Required ${newDuration.toFixed(2)}, available ${availableForReplacement.toFixed(2)} after replacing this booking.` } };
      row.used_hours = Math.max(0, Number(row.used_hours || 0) - oldDuration + newDuration).toFixed(2);
      row.remaining_hours = Math.max(0, Number(row.allocated_hours || 0) - Number(row.used_hours)).toFixed(2);
    }
  }
  Object.assign(booking, candidate);
  if (previousStatus !== "cancelled" && booking.status === "cancelled" && booking.hours_applied) {
    booking.hours_applied = false;
    const row = ledgerFor(booking);
    const used = Math.max(0, Number(row.used_hours || 0) - bookingDurationHours(booking));
    const allocated = Number(row.allocated_hours || 0);
    row.used_hours = used.toFixed(2);
    row.remaining_hours = Math.max(0, allocated - used).toFixed(2);
  }
  if (body.status) {
    addAudit(`booking.${body.status}`, "booking", booking.id, "Super Admin", { reference: booking.reference });
    addNotification(`Studio booking ${body.status}`, `Studio booking ${booking.reference} is now ${body.status}.`, "booking");
    booking.mail = await sendBookingEmail(booking, body.status);
  } else if (detailsChanged) {
    addAudit("booking.changed", "booking", booking.id, actor.profile?.display_name || "Super Admin", { reference: booking.reference, fields: Object.keys(body) });
    addNotification("Studio booking changed", `Studio booking ${booking.reference} was changed.`, "booking");
    booking.mail = await sendBookingEmail(booking, "changed");
  }
  saveDb();
  return { status: 200, body: decorateBooking(booking) };
}

function collectionForPath(path) {
  const map = {
    "/profiles": db.profiles,
    "/users": db.profiles,
    "/roles": db.roles,
    "/programs": db.programs,
    "/studios": db.studios,
    "/services": db.services,
    "/artist-types": db.artistTypes,
    "/opening-hours": db.openingHours,
    "/availability": db.availability,
    "/studio-hour-ledger": db.ledger,
    "/financial-agreements": db.agreements,
    "/additional-hours": db.extraHours,
    "/notifications": db.notifications,
    "/audit-logs": db.audit,
    "/contact": db.contacts,
    "/settings": db.settings,
  };
  return map[path];
}

function normalizeRecord(path, body = {}) {
  const record = { ...body };
  if (!record.id) record.id = id();
  if (record.name && !record.slug) record.slug = String(record.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (path === "/studios") {
    record.is_active = record.status !== "inactive";
    record.is_bookable = record.is_bookable === false || record.is_bookable === "false" ? false : true;
  }
  if (path === "/opening-hours") {
    record.weekday = record.weekday === "" || record.weekday === undefined ? undefined : Number(record.weekday);
    record.is_open = record.is_open === false || record.is_open === "false" ? false : true;
    const studio = studioFor(record.studio_id);
    if (studio) record.studio = { id: studio.id, name: studio.name };
    if (!record.date) delete record.date;
  }
  if (path === "/availability") {
    record.weekday = record.weekday === "" || record.weekday === undefined ? undefined : Number(record.weekday);
    record.is_available = record.is_available === false || record.is_available === "false" ? false : true;
    if (record.availability_type === "recurring") delete record.date;
  }
  if (path === "/services") {
    record.duration_minutes = Number(record.duration_minutes || record.duration || 120);
    record.is_active = record.status !== "inactive";
    record.is_bookable = record.is_bookable === false || record.is_bookable === "false" ? false : true;
    record.studio_required = record.studio_required === false || record.studio_required === "false" ? false : true;
    if (typeof record.available_durations === "string") {
      record.available_durations = record.available_durations.split(",").map((value) => Number(value.trim())).filter((value) => value > 0);
    }
    if (!Array.isArray(record.available_durations) || !record.available_durations.length) record.available_durations = [record.duration_minutes];
    const serviceOptions = [];
    if (record.engineer_required !== "no") {
      serviceOptions.push({ role_id: "engineer", is_required: true, is_optional: false, label: "Engineer", role: { name: "Engineer", slug: "engineer" } });
    }
    if (record.beat_maker_optional === "yes") {
      serviceOptions.push({ role_id: "beatmaker", is_required: false, is_optional: true, label: "Beat Maker", role: { name: "Beat Maker", slug: "beatmaker" } });
    }
    record.options = serviceOptions;
  }
  if (path === "/profiles" || path === "/users") {
    const roleMap = {
      administrator: { name: "Administrator", slug: "administrator" },
      artist: { name: "Artist", slug: "artist" },
      engineer: { name: "Engineer", slug: "engineer" },
      beatmaker: { name: "Beat Maker", slug: "beatmaker" },
      "beat-maker": { name: "Beat Maker", slug: "beatmaker" },
      "film-director-cameraman": { name: "Film Director / Cameraman", slug: "film-director-cameraman" },
    };
    const explicitRoles = [
      ...(Array.isArray(record.role_ids) ? record.role_ids : []),
      record.role_id,
      record.role,
      record.secondary_role_id,
    ].filter(Boolean);
    const requestedRoles = explicitRoles.length
      ? explicitRoles
      : (record.user_roles || []).map((entry) => entry?.role?.slug).filter(Boolean);
    const selectedRoles = Array.from(new Set(requestedRoles))
      .map((requestedRole) => roleMap[requestedRole])
      .filter(Boolean);
    if (!selectedRoles.length) selectedRoles.push(roleMap.artist);
    record.display_name = record.display_name || record.name;
    record.full_name = record.full_name || record.name;
    record.email = record.email || `${record.slug || record.id}@dejavustudio.local`;
    record.is_active = record.status !== "inactive";
    record.user_roles = selectedRoles.map((role) => ({ role }));
    record.user_programs = record.program
      ? [{ program: { name: record.program === "goldlective" ? "Goldlective" : record.program === "house-artist" ? "House Artist" : record.program, slug: record.program } }]
      : (record.user_programs || []);
    if (record.password) {
      record.password_hash = hashPassword(record.password);
      delete record.password;
    }
  }
  if (path === "/studio-hour-ledger") {
    record.user = record.user || { display_name: record.name || "User" };
    record.artist_type = record.artist_type?.name ? record.artist_type : { name: record.artist_type || "Goldlective" };
  }
  if (path === "/financial-agreements") {
    record.artist = record.artist || { display_name: record.name || "Artist" };
    record.history = record.history || [];
  }
  if (path === "/contact") {
    record.created_at = record.created_at || nowIso();
  }
  if (path === "/settings") {
    record.name = record.name || record.slug || "Setting";
    record.slug = record.slug || String(record.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    record.status = record.status || "active";
  }
  record.created_at = record.created_at || nowIso();
  return record;
}

function auditEntity(path) {
  const clean = path.replace(/^\//, "");
  const map = {
    profiles: "user",
    users: "user",
    roles: "permission",
    programs: "program",
    studios: "studio",
    services: "service",
    "artist-types": "artist_type",
    "opening-hours": "studio_hours",
    availability: "staff_availability",
    "studio-hour-ledger": "studio_hour_ledger",
    "financial-agreements": "financial_agreement",
    "additional-hours": "additional_hours",
    notifications: "notification",
    contact: "contact",
    settings: "setting",
  };
  return map[clean] || clean;
}

function auditAction(path, operation, previous, next) {
  if ((path === "/profiles" || path === "/users") && operation === "created") return "user.added";
  if ((path === "/profiles" || path === "/users") && operation === "updated") {
    const beforeRole = previous?.user_roles?.[0]?.role?.slug;
    const afterRole = next?.user_roles?.[0]?.role?.slug;
    if (beforeRole && afterRole && beforeRole !== afterRole) return "permission.changed";
    return "user.updated";
  }
  if ((path === "/profiles" || path === "/users") && operation === "deleted") return "user.deleted";
  if (path === "/roles") return operation === "updated" ? "permission.changed" : `permission.${operation}`;
  if (path === "/opening-hours" && operation === "updated" && previous?.is_open !== next?.is_open) return next?.is_open ? "studio.opened" : "studio.closed";
  if (path === "/opening-hours") return `opening_hours.${operation}`;
  if (path === "/studio-hour-ledger") return operation === "updated" ? "hours.adjusted" : `studio_hours.${operation}`;
  if (path === "/financial-agreements") return operation === "updated" ? "financial_agreement.changed" : `financial_agreement.${operation}`;
  if (path === "/settings") return `setting.${operation}`;
  return `${auditEntity(path)}.${operation}`;
}

function auditDetails(previous, next) {
  const changes = {};
  const keys = Array.from(new Set([...Object.keys(previous || {}), ...Object.keys(next || {})]));
  for (const key of keys) {
    if (["created_at", "updated_at"].includes(key)) continue;
    const before = previous?.[key];
    const after = next?.[key];
    const beforeValue = typeof before === "object" ? JSON.stringify(before) : before;
    const afterValue = typeof after === "object" ? JSON.stringify(after) : after;
    if (beforeValue !== afterValue) changes[key] = { before, after };
  }
  return {
    name: next?.name || next?.display_name || next?.title || previous?.name || previous?.display_name || previous?.title,
    changes,
  };
}

function createGeneric(path, body) {
  const collection = collectionForPath(path);
  if (!collection) return { status: 404, body: { error: `Collection not found: ${path}` } };
  const record = normalizeRecord(path, body);
  collection.unshift(record);
  addAudit(auditAction(path, "created", null, record), auditEntity(path), record.id, "Super Admin", auditDetails(null, record));
  return { status: 201, body: record };
}

function updateGeneric(path, idValue, body) {
  const collection = collectionForPath(path);
  if (!collection) return { status: 404, body: { error: `Collection not found: ${path}` } };
  const index = collection.findIndex((item) => item.id === idValue);
  if (index < 0) return { status: 404, body: { error: "Record not found" } };
  const previous = collection[index];
  const safeBody = path === "/settings" && previous.slug === "smtp_pass" && !String(body.value || "").trim()
    ? { ...body, value: previous.value }
    : body;
  const next = normalizeRecord(path, { ...previous, ...safeBody, id: previous.id, updated_at: nowIso() });
  if (path === "/financial-agreements") {
    next.history = [...(previous.history || []), { changed_at: nowIso(), previous }];
  }
  collection[index] = next;
  addAudit(auditAction(path, "updated", previous, next), auditEntity(path), next.id, "Super Admin", auditDetails(previous, next));
  return { status: 200, body: next };
}

function deleteGeneric(path, idValue) {
  const collection = collectionForPath(path);
  if (!collection) return { status: 404, body: { error: `Collection not found: ${path}` } };
  const index = collection.findIndex((item) => item.id === idValue);
  if (index < 0) return { status: 404, body: { error: "Record not found" } };
  const [removed] = collection.splice(index, 1);
  addAudit(auditAction(path, "deleted", removed, null), auditEntity(path), idValue, "Super Admin", { name: removed.name || removed.display_name || removed.title, removed });
  return { status: 200, body: { deleted: true, id: idValue } };
}

function approveExtraHours(body) {
  const booking = db.bookings.find((b) => b.id === body.booking_id || b.reference === body.booking_reference);
  if (!booking) return { status: 404, body: { error: "Booking is required before approving extra hours." } };
  if (booking.status === "cancelled") return { status: 400, body: { error: "Extra hours cannot be approved for a cancelled booking." } };
  const artist = profileFor(booking.artist_id);
  const programSlug = booking.artist_type_id || artist?.user_programs?.[0]?.program?.slug;
  if (programSlug !== "goldlective") return { status: 400, body: { error: "Additional hours are available only for Goldlective artists." } };
  const ledger = ledgerFor(booking);
  if (Number(ledger.remaining_hours || 0) > 0 || Number(ledger.used_hours || 0) < Number(ledger.allocated_hours || 0)) {
    return { status: 400, body: { error: "Regular Goldlective hours must be fully used before additional hours can be approved." } };
  }
  const openCheck = checkStudioOpen(booking);
  if (!openCheck.ok) return { status: 400, body: { error: openCheck.error } };
  const service = serviceFor(booking.service_id);
  if (service?.options?.some((option) => option.role.slug === "engineer" && option.is_required)) {
    const staffCheck = checkStaff(booking, booking.engineer_id, "engineer");
    if (!staffCheck.ok) return { status: 400, body: { error: staffCheck.error } };
  }
  if (booking.beat_maker_id) {
    const beatMakerCheck = checkStaff(booking, booking.beat_maker_id, "beatmaker");
    if (!beatMakerCheck.ok) return { status: 400, body: { error: beatMakerCheck.error } };
  }
  const hours = Number(body.hours || body.extra_hours || 0);
  if (!hours || hours <= 0) return { status: 400, body: { error: "Extra hours must be greater than 0." } };
  const record = {
    id: id(),
    booking_id: booking.id,
    booking_reference: booking.reference,
    artist: profileFor(booking.artist_id)?.display_name || "Artist",
    month: monthKey(booking.date),
    hours: hours.toFixed(2),
    reason: body.reason || "Approved additional Goldlective hours",
    status: "approved",
    created_at: nowIso(),
  };
  db.extraHours.unshift(record);
  const row = ledger;
  const used = Number(row.used_hours || 0) + hours;
  row.used_hours = used.toFixed(2);
  row.remaining_hours = Math.max(0, Number(row.allocated_hours || 0) - used).toFixed(2);
  booking.additional_hours_approved = (Number(booking.additional_hours_approved || 0) + hours).toFixed(2);
  addAudit("additional_hours.approved", "booking", booking.id, "Super Admin", { reference: booking.reference, hours });
  addNotification("Goldlective extra hours approved", `${hours.toFixed(2)} extra hours approved for ${booking.reference}.`, "hours");
  return { status: 201, body: record };
}

const server = http.createServer(async (req, res) => {
  applyCors(req, res);
  if (!requestOriginAllowed(req)) return json(res, 403, { error: "Origin is not allowed." });
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const path = url.pathname.replace(/^\/api\/v1/, "");
  const actor = currentActor(req);

  if (req.method === "OPTIONS") return json(res, 204, {});
  if (STRICT_AUTH && !isPublicRoute(req.method || "GET", path) && !actor.authenticated) {
    return json(res, 401, { error: "Authentication required." });
  }
  if (STRICT_AUTH && !isPublicRoute(req.method || "GET", path) && isAdminRoute(req.method || "GET", path) && !actor.isAdmin) {
    return json(res, 403, { error: "Administrator access required." });
  }

  try {
    if (req.method === "GET" && path === "/health") {
      return json(res, 200, { status: "ok", service: "dejavu-studio-api", time: nowIso() });
    }
    if (req.method === "POST" && path === "/auth/email/login") {
      const result = loginWithEmail(req, await readBody(req));
      return json(res, result.status, result.body);
    }
    if (req.method === "POST" && path === "/auth/logout") {
      const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
      db.sessions = db.sessions.filter((session) => session.token !== token);
      saveDb();
      return json(res, 200, { success: true });
    }
    if (req.method === "GET" && path === "/auth/me") {
      return json(res, 200, { user: publicProfile(actor.profile), isAdmin: actor.isAdmin });
    }
    if (req.method === "GET" && path === "/dashboard/overview") {
      return json(res, 200, { totalProfiles: db.profiles.length, totalBookings: db.bookings.length, recentBookings: db.bookings.map(decorateBooking), profiles: db.profiles });
    }
    if (req.method === "GET" && path === "/profiles") return json(res, 200, db.profiles);
    if (req.method === "GET" && path === "/users") return json(res, 200, db.profiles);
    if (req.method === "GET" && path === "/roles") return json(res, 200, db.roles);
    if (req.method === "GET" && path === "/programs") return json(res, 200, db.programs);
    if (req.method === "GET" && path === "/studios") return json(res, 200, db.studios);
    if (req.method === "GET" && path === "/services") return json(res, 200, db.services);
    if (req.method === "GET" && path === "/booking-types") return json(res, 200, db.services);
    if (req.method === "GET" && path === "/artist-types") return json(res, 200, db.artistTypes);
    if (req.method === "GET" && path === "/bookings") {
      const visible = actor.isAdmin ? db.bookings : db.bookings.filter((booking) => booking.artist_id === actor.profile?.id);
      return json(res, 200, visible.map(decorateBooking));
    }
    if (req.method === "GET" && path === "/agenda") {
      const studioId = url.searchParams.get("studio_id");
      const staffId = url.searchParams.get("staff_id");
      const dateFrom = url.searchParams.get("date_from");
      const dateTo = url.searchParams.get("date_to");
      const rows = db.bookings
        .filter((b) => !studioId || b.studio_id === studioId)
        .filter((b) => !staffId || b.engineer_id === staffId || b.beat_maker_id === staffId)
        .filter((b) => !dateFrom || b.date >= dateFrom)
        .filter((b) => !dateTo || b.date <= dateTo)
        .map(decorateBooking);
      return json(res, 200, rows);
    }
    if (req.method === "POST" && path === "/bookings") {
      const body = await readBody(req);
      if (STRICT_AUTH && !actor.isAdmin) body.artist_id = actor.profile?.id;
      const result = await createBooking(body);
      return json(res, result.status, result.body);
    }
    const bookingPatch = path.match(/^\/bookings\/([^/]+)$/);
    if (req.method === "PATCH" && bookingPatch) {
      const result = await updateBooking(bookingPatch[1], await readBody(req), actor);
      return json(res, result.status, result.body);
    }
    if (req.method === "DELETE" && bookingPatch) {
      const index = db.bookings.findIndex((b) => b.id === bookingPatch[1] || b.reference === bookingPatch[1]);
      if (index < 0) return json(res, 404, { error: "Booking not found" });
      const [removed] = db.bookings.splice(index, 1);
      addAudit("booking.deleted", "booking", removed.id, "Super Admin", { reference: removed.reference });
      addNotification("Studio booking deleted", `Studio booking ${removed.reference} was deleted.`, "booking");
      return json(res, 200, { deleted: true, id: removed.id });
    }
    const bookingAction = path.match(/^\/bookings\/([^/]+)\/(confirmed|cancelled|completed|no_show|pending)$/);
    if (req.method === "POST" && bookingAction) {
      const result = await updateBooking(bookingAction[1], { status: bookingAction[2] }, actor);
      return json(res, result.status, result.body);
    }
    const wallet = path.match(/^\/wallet\/([^/]+)$/);
    if (req.method === "GET" && wallet) {
      const requestedProfile = profileFor(wallet[1]);
      if (!requestedProfile) return json(res, 404, { error: "Profile not found" });
      if (!actor.isAdmin && actor.profile?.id !== requestedProfile.id) return json(res, 403, { error: "You can view only your own studio hours." });
      const rows = db.ledger.filter((row) =>
        row.profile_id === requestedProfile.id ||
        row.user_id === requestedProfile.id ||
        row.user?.display_name === requestedProfile.display_name ||
        row.name === requestedProfile.display_name
      );
      return json(res, 200, rows.map((row) => ({
        hours_total: Number(row.allocated_hours),
        hours_used: Number(row.used_hours),
        hours_remaining: Number(row.remaining_hours),
        split_used: Boolean(row.split_used),
        program: { name: row.artist_type?.name || row.program?.name || "Studio hours" },
      })));
    }
    const avail = path.match(/^\/availability\/([^/]+)$/);
    if (req.method === "GET" && avail) {
      if (!actor.isAdmin && actor.profile?.id !== avail[1]) return json(res, 403, { error: "You can view only your own availability." });
      return json(res, 200, db.availability.filter((a) => a.profile_id === avail[1]).map(decorateAvailability));
    }
    if (req.method === "POST" && path === "/availability" && !actor.isAdmin) {
      const staffRoles = ["engineer", "beatmaker", "film-director-cameraman"];
      if (!actor.profile || !roleSlugs(actor.profile).some((role) => staffRoles.includes(role))) {
        return json(res, 403, { error: "Only staff members can manage availability." });
      }
      const body = await readBody(req);
      if (body.profile_id !== actor.profile.id) return json(res, 403, { error: "You can manage only your own availability." });
      const record = normalizeRecord(path, body);
      db.availability.unshift(record);
      addAudit("staff_availability.created", "staff_availability", record.id, actor.profile.display_name, auditDetails(null, record));
      return json(res, 201, record);
    }
    if (req.method === "DELETE" && avail && !actor.isAdmin) {
      const staffRoles = ["engineer", "beatmaker", "film-director-cameraman"];
      const record = db.availability.find((item) => item.id === avail[1]);
      if (!record) return json(res, 404, { error: "Record not found" });
      if (!actor.profile || record.profile_id !== actor.profile.id || !roleSlugs(actor.profile).some((role) => staffRoles.includes(role))) {
        return json(res, 403, { error: "You can delete only your own availability." });
      }
      db.availability = db.availability.filter((item) => item.id !== record.id);
      addAudit("staff_availability.deleted", "staff_availability", record.id, actor.profile.display_name, { removed: record });
      return json(res, 200, { deleted: true, id: record.id });
    }
    if (req.method === "GET" && path === "/availability") return json(res, 200, db.availability.map(decorateAvailability));
    if (req.method === "GET" && path === "/opening-hours") return json(res, 200, db.openingHours);
    if (req.method === "GET" && path === "/studio-hour-ledger") return json(res, 200, db.ledger);
    if (req.method === "POST" && path === "/studio-hour-ledger/expire-month") {
      const body = await readBody(req);
      const targetMonth = body.month || monthKey(new Date().toISOString());
      const rows = expireLedgerMonth(targetMonth, actor.profile?.display_name || "System");
      return json(res, 200, { month: targetMonth, rows });
    }
    if (req.method === "GET" && path === "/financial-agreements") return json(res, 200, db.agreements);
    if (req.method === "GET" && path === "/additional-hours") return json(res, 200, db.extraHours);
    if (req.method === "POST" && path === "/additional-hours") {
      const result = approveExtraHours(await readBody(req));
      return json(res, result.status, result.body);
    }
    if (req.method === "GET" && path === "/notifications") return json(res, 200, db.notifications);
    const notificationRead = path.match(/^\/notifications\/([^/]+)\/(read|unread)$/);
    if (req.method === "PATCH" && notificationRead) {
      const notification = db.notifications.find((n) => n.id === notificationRead[1]);
      if (!notification) return json(res, 404, { error: "Notification not found" });
      notification.read_at = notificationRead[2] === "read" ? nowIso() : null;
      addAudit(`notification.${notificationRead[2]}`, "notification", notification.id, actor.profile?.display_name || "User", {});
      return json(res, 200, notification);
    }
    if (req.method === "GET" && path === "/audit-logs") return json(res, 200, db.audit);
    if (req.method === "GET" && path === "/settings") return json(res, 200, publicSettings());
    if (req.method === "POST" && path === "/settings/test-email") {
      const result = await sendSmtpTestEmail();
      addAudit("setting.smtp_test", "setting", "smtp", actor.profile?.display_name || "Super Admin", { sent: result.sent, recipientCount: result.recipientCount || 0 });
      return json(res, result.sent ? 200 : 400, result);
    }
    if (req.method === "GET" && path === "/contact") return json(res, 200, db.contacts);
    if (req.method === "POST" && path === "/contact") {
      const body = await readBody(req);
      if (!body.email || !body.message && !body.bericht) return json(res, 400, { error: "Email and message are required." });
      const contact = { id: id(), name: body.name || body.naam, email: body.email, message: body.message || body.bericht, created_at: nowIso() };
      db.contacts.unshift(contact);
      addAudit("contact.created", "contact", contact.id, contact.name, { email: contact.email });
      addNotification("New contact message", `${contact.name || "Visitor"} sent a message via the contact form.`, "contact");
      const mail = await sendContactEmail(contact);
      return json(res, 201, { data: contact, mail });
    }
    const genericMatch = path.match(/^(\/(?:profiles|users|roles|programs|studios|services|artist-types|opening-hours|availability|studio-hour-ledger|financial-agreements|additional-hours|notifications|audit-logs|contact|settings))(?:\/([^/]+))?$/);
    if (genericMatch) {
      const base = genericMatch[1];
      const recordId = genericMatch[2];
      if (req.method === "POST" && !recordId) {
        const result = createGeneric(base, await readBody(req));
        return json(res, result.status, result.body);
      }
      if (req.method === "PATCH" && recordId) {
        const result = updateGeneric(base, recordId, await readBody(req));
        return json(res, result.status, result.body);
      }
      if (req.method === "DELETE" && recordId) {
        const result = deleteGeneric(base, recordId);
        return json(res, result.status, result.body);
      }
    }
    return json(res, 404, { error: `Route not found: ${req.method} ${path}` });
  } catch (error) {
    console.error("[dejavu-api] request failed:", error);
    return json(res, Number(error?.statusCode || 500), { error: error?.message || "Server error" });
  }
});

runStudioHoursMaintenance();
const maintenanceTimer = setInterval(runStudioHoursMaintenance, 60 * 60 * 1000);
maintenanceTimer.unref();

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[dejavu-api] listening on http://127.0.0.1:${PORT}/api/v1`);
});
