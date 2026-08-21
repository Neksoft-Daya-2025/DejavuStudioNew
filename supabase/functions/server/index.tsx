import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "npm:@supabase/supabase-js";

const app = new Hono();
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

// ── Clients ───────────────────────────────────────────────────────────────────

function adminDb() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

// ── Auth helpers ──────────────────────────────────────────────────────────────

async function getAuthUser(c: any) {
  const header = (c.req.header("Authorization") ?? "").replace("Bearer ", "").trim();
  if (!header) return null;
  const { data, error } = await adminDb().auth.getUser(header);
  if (error || !data?.user) return null;
  return { user: data.user, token: header };
}

async function getProfile(userId: string) {
  const { data } = await adminDb()
    .from("profiles")
    .select("*, user_roles(role:roles(name,slug))")
    .eq("auth_user_id", userId)
    .single();
  return data;
}

function isAdmin(profile: any) {
  return profile?.user_roles?.some((r: any) => r.role.slug === "administrator") ?? false;
}

function unauth(c: any) { return c.json({ error: "Niet ingelogd." }, 401); }

// ── Health ────────────────────────────────────────────────────────────────────

app.get("/:fn/health", (c) => c.json({ status: "ok", version: 2 }));

// ── Me ────────────────────────────────────────────────────────────────────────

app.get("/:fn/me", async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return unauth(c);
  const profile = await getProfile(auth.user.id);
  if (!profile) return c.json({ error: "Profiel niet gevonden." }, 404);
  return c.json(profile);
});

// ── Dashboard overview ────────────────────────────────────────────────────────

app.get("/:fn/dashboard/overview", async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return unauth(c);
  const client = adminDb();
  const [
    { count: totalProfiles },
    { count: totalBookings },
    { data: recentBookings },
    { data: profiles },
  ] = await Promise.all([
    client.from("profiles").select("*", { count: "exact", head: true }),
    client.from("bookings").select("*", { count: "exact", head: true }),
    client.from("bookings")
      .select(`id, date, start_time, end_time, duration_hours, notes,
        artist:profiles!bookings_artist_id_fkey(display_name),
        studio:studios(name),
        booking_type:services(name),
        status:booking_statuses(name, color, slug)`)
      .order("date", { ascending: false })
      .limit(10),
    client.from("profiles")
      .select(`id, display_name, full_name, email, is_active,
        user_roles(role:roles(name,slug))`),
  ]);
  return c.json({ totalProfiles, totalBookings, recentBookings, profiles });
});

// ── Profiles ──────────────────────────────────────────────────────────────────

app.get("/:fn/profiles", async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return unauth(c);
  const { data, error } = await adminDb()
    .from("profiles")
    .select(`*, user_roles(role:roles(name,slug))`)
    .order("display_name");
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// ── Bookings ──────────────────────────────────────────────────────────────────

app.get("/:fn/bookings", async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return unauth(c);
  const { data, error } = await adminDb()
    .from("bookings")
    .select(`*,
      artist:profiles!bookings_artist_id_fkey(id, display_name, full_name),
      engineer:profiles!bookings_engineer_id_fkey(id, display_name),
      studio:studios(id, name, slug),
      booking_type:services(id, name, slug),
      program:programs(id, name, slug),
      status:booking_statuses(id, name, color, slug)`)
    .order("date", { ascending: false });
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

app.post("/:fn/bookings", async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return unauth(c);
  const profile = await getProfile(auth.user.id);
  if (!profile) return c.json({ error: "Profiel niet gevonden." }, 404);

  const body = await c.req.json();
  const { service_id, studio_id, artist_id, engineer_id, beatmaker_id, program_id,
          date, start_time, end_time, duration_hours, notes, status_id } = body;
  const dur = parseFloat(duration_hours ?? "0");
  const client = adminDb();

  // Permission
  if (!isAdmin(profile) && profile.id !== artist_id) {
    return c.json({ error: "Geen toegang om voor deze artiest te boeken." }, 403);
  }

  // Studio opening hours
  if (studio_id) {
    const { data: studio } = await client.from("studios")
      .select("opens_at, closes_at, name").eq("id", studio_id).single();
    if (studio?.opens_at && studio?.closes_at) {
      const overnight = studio.closes_at < studio.opens_at;
      const ok = overnight
        ? start_time >= studio.opens_at || start_time < studio.closes_at
        : start_time >= studio.opens_at && start_time < studio.closes_at;
      if (!ok) return c.json({ error: `${studio.name} is open van ${studio.opens_at.slice(0,5)} tot ${studio.closes_at.slice(0,5)}.` }, 400);
    }
  }

  // Overlap check
  if (studio_id) {
    const { data: existing } = await client.from("bookings")
      .select("id, start_time, end_time, artist:profiles!bookings_artist_id_fkey(display_name)")
      .eq("studio_id", studio_id).eq("date", date)
      .neq("status_id", "60000000-0000-0000-0000-000000000003");
    const clash = (existing ?? []).find((b: any) => start_time < b.end_time && end_time > b.start_time);
    if (clash) return c.json({ error: `Tijdconflict: ${(clash as any).artist?.display_name ?? "iemand"} heeft al een sessie van ${(clash as any).start_time?.slice(0,5)} tot ${(clash as any).end_time?.slice(0,5)}.` }, 409);
  }

  // Wallet validation
  if (program_id && studio_id) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    let { data: wallet } = await client.from("studio_wallets").select("*")
      .eq("profile_id", artist_id).eq("program_id", program_id)
      .eq("period_month", month).eq("period_year", year).single();

    if (!wallet) {
      const { data: w } = await client.from("studio_wallets").insert({
        organization_id: profile.organization_id,
        profile_id: artist_id, program_id, period_month: month, period_year: year,
        hours_total: 12, hours_used: 0,
      }).select().single();
      wallet = w;
    }
    if (!wallet) return c.json({ error: "Wallet niet gevonden." }, 500);
    if (dur !== 4 && !(dur === 2 && !wallet.split_used)) {
      return c.json({ error: wallet.split_used
        ? "2-uurs splitsing al gebruikt. Alleen 4-uurssessies beschikbaar."
        : "Toegestane duur: 4u, of eenmalig 2u (splitsing)." }, 400);
    }
    if (wallet.hours_remaining < dur) {
      return c.json({ error: `Niet genoeg uren. Resterend: ${wallet.hours_remaining}u.` }, 400);
    }
  }

  // Create booking
  const { data: booking, error: bErr } = await client.from("bookings").insert({
    organization_id: profile.organization_id,
    artist_id, engineer_id: engineer_id || null,
    studio_id: studio_id || null,
    service_id: service_id || null,
    program_id: program_id || null,
    status_id: status_id ?? "60000000-0000-0000-0000-000000000001",
    date, start_time, end_time, duration_hours: dur,
    notes: notes || null, created_by: profile.id,
  }).select().single();
  if (bErr) return c.json({ error: bErr.message }, 500);

  // Debit wallet + transaction
  if (program_id && studio_id) {
    const now = new Date();
    const { data: wallet } = await client.from("studio_wallets").select("*")
      .eq("profile_id", artist_id).eq("program_id", program_id)
      .eq("period_month", now.getMonth() + 1).eq("period_year", now.getFullYear()).single();
    if (wallet) {
      await client.from("studio_wallets").update({
        hours_used: wallet.hours_used + dur,
        split_used: wallet.split_used || dur === 2,
        updated_at: new Date().toISOString(),
      }).eq("id", wallet.id);
      await client.from("wallet_transactions").insert({
        wallet_id: wallet.id, booking_id: booking.id,
        hours: -dur, transaction_type: "debit",
        reason: `Boeking ${date} ${start_time}–${end_time}`, created_by: profile.id,
      });
    }
  }

  // Booking resources
  const resources: any[] = [];
  if (studio_id) resources.push({ booking_id: booking.id, resource_type: "studio", studio_id });
  if (engineer_id) resources.push({ booking_id: booking.id, resource_type: "engineer", profile_id: engineer_id });
  if (beatmaker_id) resources.push({ booking_id: booking.id, resource_type: "beatmaker", profile_id: beatmaker_id });
  if (resources.length) await client.from("booking_resources").insert(resources);

  // Audit log
  await client.from("audit_logs").insert({
    organization_id: profile.organization_id,
    profile_id: profile.id, action: "bookings.create",
    entity_type: "booking", entity_id: booking.id, new_data: booking,
  });

  return c.json(booking, 201);
});

// ── Studios ───────────────────────────────────────────────────────────────────

app.get("/:fn/studios", async (c) => {
  const { data, error } = await adminDb().from("studios").select("*").order("name");
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// ── Services ──────────────────────────────────────────────────────────────────

app.get("/:fn/services", async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return unauth(c);
  const { data, error } = await adminDb()
    .from("services")
    .select("*, options:service_options(role_id, is_required, is_optional, label, role:roles(name,slug))")
    .eq("is_active", true).order("name");
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// ── Booking types (legacy) ────────────────────────────────────────────────────

app.get("/:fn/booking-types", async (c) => {
  const { data, error } = await adminDb().from("services").select("id, name, slug").order("name");
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// ── Programs ──────────────────────────────────────────────────────────────────

app.get("/:fn/programs", async (c) => {
  const { data, error } = await adminDb().from("programs").select("*").order("name");
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// ── Wallet ────────────────────────────────────────────────────────────────────

app.get("/:fn/wallet/:profileId", async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return unauth(c);
  const me = await getProfile(auth.user.id);
  const targetId = c.req.param("profileId");
  if (!isAdmin(me) && me?.id !== targetId) return c.json({ error: "Geen toegang." }, 403);
  const now = new Date();
  const { data, error } = await adminDb()
    .from("studio_wallets")
    .select("*, program:programs(name,slug)")
    .eq("profile_id", targetId)
    .eq("period_month", now.getMonth() + 1)
    .eq("period_year", now.getFullYear());
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// ── Availability ──────────────────────────────────────────────────────────────

app.get("/:fn/availability/:profileId", async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return unauth(c);
  const me = await getProfile(auth.user.id);
  const targetId = c.req.param("profileId");
  if (!isAdmin(me) && me?.id !== targetId) return c.json({ error: "Geen toegang." }, 403);
  const { data: slots } = await adminDb().from("availability").select("*").eq("profile_id", targetId).order("weekday");
  const { data: exceptions } = await adminDb().from("availability_exceptions").select("*").eq("profile_id", targetId).order("exception_date");
  return c.json({ slots: slots ?? [], exceptions: exceptions ?? [] });
});

app.post("/:fn/availability", async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return unauth(c);
  const profile = await getProfile(auth.user.id);
  if (!profile) return c.json({ error: "Profiel niet gevonden." }, 404);
  const body = await c.req.json();
  const { data, error } = await adminDb().from("availability").insert({
    ...body,
    organization_id: profile.organization_id,
  }).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

app.delete("/:fn/availability/:id", async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return unauth(c);
  const { error } = await adminDb().from("availability").delete().eq("id", c.req.param("id"));
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ ok: true });
});

// ── Audit logs ────────────────────────────────────────────────────────────────

app.get("/:fn/audit-logs", async (c) => {
  const auth = await getAuthUser(c);
  if (!auth) return unauth(c);
  const me = await getProfile(auth.user.id);
  if (!isAdmin(me)) return c.json({ error: "Geen toegang." }, 403);
  const { data, error } = await adminDb()
    .from("audit_logs")
    .select("*, profile:profiles(display_name)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

Deno.serve(app.fetch);
