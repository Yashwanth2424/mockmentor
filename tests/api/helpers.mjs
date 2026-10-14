import { addDays, getZonedParts, zonedTimeToUtc } from "../../src/lib/time.js";

export const API_URL = process.env.API_URL || "http://localhost:3000";

export async function api(path, { method = "GET", body, cookie } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (cookie) headers.Cookie = cookie;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });

  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}

export async function signup(name) {
  const id = `${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;
  const email = `test.${id}@example.com`;
  const password = "test12345";

  const res = await api("/api/auth/signup", {
    method: "POST",
    body: { name, email, password },
  });

  if (res.status !== 201) {
    throw new Error(`Signup failed (${res.status}): ${JSON.stringify(res.json)}`);
  }

  return { email, password };
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const cookie = res.headers.getSetCookie().find((c) => c.startsWith("token="));

  if (!res.ok || !cookie) {
    throw new Error(`Login failed (${res.status})`);
  }

  return cookie.split(";")[0];
}

export async function newStudent(name) {
  const { email, password } = await signup(name);
  return login(email, password);
}

export async function findMentor(cookie, name = "Akshay") {
  const res = await api("/api/mentor", { cookie });
  const mentor = res.json?.data?.find((m) => m.name === name);

  if (!mentor) {
    throw new Error(`Mentor "${name}" not found. Did the seed run?`);
  }

  return mentor;
}

export function randomWeekdayDate() {
  const today = getZonedParts(new Date()).dateString;
  let day = addDays(today, 2 + Math.floor(Math.random() * 300));

  while ([0, 6].includes(getZonedParts(zonedTimeToUtc(day, "12:00")).weekday)) {
    day = addDays(day, 1);
  }

  return day;
}

export function berlinSlot(day, time) {
  return zonedTimeToUtc(day, time).toISOString();
}
