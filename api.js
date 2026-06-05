const API_URL = window.BFN_CONFIG?.apiUrl || "https://brand-factory-production-b27f.up.railway.app";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
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

window.BFN = { createOrder, getOrder };
