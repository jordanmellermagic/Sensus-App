const API_BASE = import.meta.env.VITE_API_BASE;

if (!API_BASE) {
  // eslint-disable-next-line no-console
  console.warn("VITE_API_BASE is not set. API calls will fail.");
}

export async function getUser(userId) {
  if (!userId) throw new Error("Missing userId");
  const res = await fetch(`${API_BASE}/user/${encodeURIComponent(userId)}`);
  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }
  return res.json();
}

export async function postUser(userId, body) {
  if (!userId) throw new Error("Missing userId");
  const res = await fetch(`${API_BASE}/user/${encodeURIComponent(userId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }
  return res.json();
}

export async function deleteUser(userId) {
  if (!userId) throw new Error("Missing userId");
  const res = await fetch(`${API_BASE}/user/${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }
  return true;
}
