const API_URL = window.BFN_CONFIG?.apiUrl || "https://brand-factory-production-b27f.up.railway.app";
const SUPABASE_URL = "https://wlxjekmxobhbviwmtvrm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndseGpla214b2JoYnZpd210dnJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNTYzMDAsImV4cCI6MjA5NTYzMjMwMH0.PgOCZE1hFQJkvBTT29IHoLJwnnh6wHMoJuhly_RtjiU";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function apiFetch(path, options = {}) {
  const { data: { session } } = await sb.auth.getSession();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }
  const res = await fetch(`${API_URL}${path}`, { headers, ...options });
  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try { const b = await res.json(); msg = b.detail || b.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

async function createOrder(data) {
  return apiFetch("/orders/create", { method: "POST", body: JSON.stringify(data) });
}

async function getOrder(orderId) {
  return apiFetch(`/orders/${orderId}`);
}

async function getMyOrders() {
  return apiFetch("/account/orders");
}

async function signUp(email, password) {
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

async function signIn(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

async function signOut() {
  await sb.auth.signOut();
}

async function getCurrentUser() {
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

async function getOAuthLoginUrl(platform) {
  const { auth_url } = await apiFetch(`/auth/${platform}/login`);
  return auth_url;
}

async function getOAuthStatus(platform) {
  return apiFetch(`/auth/${platform}/status`);
}

async function revokeOAuthToken(platform) {
  return apiFetch(`/auth/${platform}/revoke`, { method: "DELETE" });
}

window.BFN = {
  createOrder, getOrder, getMyOrders, signUp, signIn, signOut, getCurrentUser,
  getOAuthLoginUrl, getOAuthStatus, revokeOAuthToken,
  supabase: sb,
};
