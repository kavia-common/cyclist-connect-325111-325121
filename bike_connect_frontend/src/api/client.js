/**
 * Minimal API client for Bike Connect frontend.
 * Uses REACT_APP_API_BASE_URL env var when provided, otherwise defaults to same-origin.
 */

const DEFAULT_BASE_URL = "";

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Returns the configured API base URL for the backend. */
  return (process.env.REACT_APP_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
}

function getToken() {
  return localStorage.getItem("bc_token");
}

function setToken(token) {
  if (!token) localStorage.removeItem("bc_token");
  else localStorage.setItem("bc_token", token);
}

// PUBLIC_INTERFACE
export function authStore() {
  /** Simple auth token store. */
  return {
    getToken,
    setToken,
    clear: () => setToken(null),
  };
}

async function safeParseJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { raw: text };
  }
}

async function request(path, { method = "GET", body, headers } = {}) {
  const base = getApiBaseUrl();
  const url = `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const token = getToken();
  const res = await fetch(url, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await safeParseJson(res);
  if (!res.ok) {
    const message =
      (data && (data.detail || data.message)) ||
      `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// --------- Feature-level API helpers ----------

// PUBLIC_INTERFACE
export const api = {
  /**
   * Authentication endpoints (expected):
   * - POST /auth/register {email,password,display_name}
   * - POST /auth/login {email,password} -> {access_token}
   * - GET /me
   */
  auth: {
    async login({ email, password }) {
      const data = await request("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      if (data?.access_token) setToken(data.access_token);
      return data;
    },
    async register({ email, password, displayName }) {
      return request("/auth/register", {
        method: "POST",
        body: { email, password, display_name: displayName },
      });
    },
    async me() {
      return request("/me");
    },
    logout() {
      setToken(null);
    },
  },

  /**
   * Profiles (expected):
   * - GET /profiles/:id
   * - PUT /profiles/me
   */
  profiles: {
    async getProfile(userId) {
      return request(`/profiles/${encodeURIComponent(userId)}`);
    },
    async updateMe(profile) {
      return request("/profiles/me", { method: "PUT", body: profile });
    },
  },

  /**
   * Nearby search (expected):
   * - GET /nearby?lat=..&lng=..&radius_km=..
   */
  nearby: {
    async search({ lat, lng, radiusKm }) {
      const params = new URLSearchParams({
        lat: String(lat),
        lng: String(lng),
        radius_km: String(radiusKm ?? 5),
      });
      return request(`/nearby?${params.toString()}`);
    },
  },

  /**
   * Messaging (expected):
   * - GET /conversations
   * - GET /conversations/:id/messages
   * - POST /conversations/:id/messages {text}
   */
  messaging: {
    async listConversations() {
      return request("/conversations");
    },
    async getMessages(conversationId) {
      return request(`/conversations/${encodeURIComponent(conversationId)}/messages`);
    },
    async sendMessage(conversationId, { text }) {
      return request(`/conversations/${encodeURIComponent(conversationId)}/messages`, {
        method: "POST",
        body: { text },
      });
    },
  },

  /**
   * Group rides / events (expected):
   * - GET /rides
   * - POST /rides
   * - GET /rides/:id
   */
  rides: {
    async list() {
      return request("/rides");
    },
    async create(ride) {
      return request("/rides", { method: "POST", body: ride });
    },
    async get(rideId) {
      return request(`/rides/${encodeURIComponent(rideId)}`);
    },
  },
};
