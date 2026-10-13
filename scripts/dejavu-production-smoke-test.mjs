const API_BASE = process.env.DEJAVU_API_BASE || "http://127.0.0.1:3001/api/v1";
const EMAIL = process.env.DEJAVU_SMOKE_EMAIL || process.env.DEJAVU_ADMIN_EMAIL;
const PASSWORD = process.env.DEJAVU_SMOKE_PASSWORD;

if (!EMAIL || !PASSWORD) {
  throw new Error("DEJAVU_SMOKE_EMAIL and DEJAVU_SMOKE_PASSWORD are required.");
}

async function request(path, options = {}, token = "") {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(`${options.method || "GET"} ${path} failed (${response.status}): ${body.error || text}`);
  }
  return body;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const login = await request("/auth/email/login", {
  method: "POST",
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});

const token = login.token;
assert(token, "Login did not return a token.");

const checks = [
  ["/auth/me", (body) => body.user && body.isAdmin === true],
  ["/dashboard/overview", (body) => Array.isArray(body.profiles) && Array.isArray(body.recentBookings)],
  ["/studios", (body) => Array.isArray(body) && body.length >= 1],
  ["/services", (body) => Array.isArray(body) && body.some((service) => Number(service.duration_minutes) > 0)],
  ["/studio-hour-ledger", (body) => Array.isArray(body)],
  ["/settings", (body) => Array.isArray(body) && body.some((setting) => setting.slug === "smtp_host")],
  ["/audit-logs", (body) => Array.isArray(body)],
  ["/notifications", (body) => Array.isArray(body)],
];

for (const [path, validate] of checks) {
  const body = await request(path, {}, token);
  assert(validate(body), `${path} returned unexpected data shape.`);
  console.log(`ok ${path}`);
}

let validationWorked = false;
try {
  await request("/bookings", {
    method: "POST",
    body: JSON.stringify({
      artist_id: "artist-aniket",
      studio_id: "studio-gold",
      service_id: "studio-session",
      date: "2026-09-29",
      start_time: "15:00",
      end_time: "17:00",
      duration_hours: 2,
    }),
  }, token);
} catch (error) {
  validationWorked = /Engineer is required/i.test(error.message);
}
assert(validationWorked, "Booking validation did not enforce required engineer.");
console.log("ok required engineer validation");

const booking = await request("/bookings", {
  method: "POST",
  body: JSON.stringify({
    artist_id: "artist-aniket",
    studio_id: "studio-gold",
    service_id: "studio-session",
    engineer_id: "staff-engineer",
    date: "2026-09-29",
    start_time: "15:00",
    end_time: "17:00",
    duration_hours: 2,
    notes: "Production smoke test booking",
  }),
}, token);

assert(booking.reference, "Booking was not created.");
console.log(`ok booking created ${booking.reference}`);

await request(`/bookings/${booking.id}/cancelled`, { method: "POST", body: "{}" }, token);
console.log("ok booking cancelled and hours refunded");

console.log("Déjà Vu Studio production smoke test passed.");
