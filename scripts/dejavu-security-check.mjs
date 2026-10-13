const API_BASE = process.env.DEJAVU_API_BASE || "http://127.0.0.1:3001/api/v1";
const ALLOWED_TEST_ORIGIN = process.env.DEJAVU_ALLOWED_TEST_ORIGIN || "http://127.0.0.1:5173";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(path, options = {}) {
  return fetch(`${API_BASE}${path}`, options);
}

const health = await request("/health");
assert(health.status === 200, `Expected health endpoint to return 200, got ${health.status}.`);
console.log("ok public health endpoint");

const unauthorized = await request("/profiles");
assert(unauthorized.status === 401, `Expected unauthenticated admin request to return 401, got ${unauthorized.status}.`);
console.log("ok strict authorization");

const rejectedOrigin = await request("/services", { headers: { Origin: "https://untrusted.invalid" } });
assert(rejectedOrigin.status === 403, `Expected untrusted origin to return 403, got ${rejectedOrigin.status}.`);
console.log("ok CORS origin rejection");

const allowedOrigin = await request("/services", {
  method: "OPTIONS",
  headers: { Origin: ALLOWED_TEST_ORIGIN },
});
assert(allowedOrigin.status === 204, `Expected local origin preflight to return 204, got ${allowedOrigin.status}.`);
assert(allowedOrigin.headers.get("access-control-allow-origin") === ALLOWED_TEST_ORIGIN, "Allowed origin was not echoed correctly.");
console.log("ok CORS allowed origin");

const malformed = await request("/auth/email/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: "{invalid",
});
assert(malformed.status === 400, `Expected malformed JSON to return 400, got ${malformed.status}.`);
console.log("ok malformed JSON rejection");

const securityHeaders = ["cache-control", "referrer-policy", "x-content-type-options", "x-frame-options"];
for (const header of securityHeaders) {
  assert(unauthorized.headers.has(header), `Missing security header: ${header}`);
}
console.log("ok API security headers");

const rateEmail = `rate-limit-${Date.now()}@invalid.local`;
let lastStatus = 0;
for (let attempt = 0; attempt < 6; attempt += 1) {
  const response = await request("/auth/email/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: rateEmail, password: "incorrect" }),
  });
  lastStatus = response.status;
}
assert(lastStatus === 429, `Expected login rate limit to return 429, got ${lastStatus}.`);
console.log("ok login rate limiting");

console.log("Déjà Vu Studio security check passed.");
