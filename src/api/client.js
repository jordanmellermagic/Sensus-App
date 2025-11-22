// src/api/client.js

const API_BASE = import.meta.env.VITE_API_BASE;

if (!API_BASE) {
  console.warn("VITE_API_BASE is not set; API calls will fail.");
}

export async function getUser(userId) {
  if (!userId) throw new Error("Missing userId");
  const res = await fetch(`${API_BASE}/user/${encodeURIComponent(userId)}`);
  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }
  return res.json();
}

// ⭐ MERGE-SAFE POST (fixes all consistency issues)
export async function postUser(userId, partialUpdate) {
  if (!userId) throw new Error("Missing userId");

  // Always start by getting the existing object
  const existing = await getUser(userId);

  // Merge old + new
  const merged = { ...existing, ...partialUpdate };

  // Send full merged object
  const res = await fetch(`${API_BASE}/user/${encodeURIComponent(userId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(merged)
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }

  return res.json();
}

export async function deleteUser(userId) {
  if (!userId) throw new Error("Missing userId");
  const res = await fetch(`${API_BASE}/user/${encodeURIComponent(userId)}`, {
    method: "DELETE"
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }
  return true;
}

// Auto-create blank record if missing
export async function createUserIfNotExists(userId) {
  try {
    return await getUser(userId);
  } catch {
    return await postUser(userId, {
      first_name: "",
      last_name: "",
      phone_number: "",
      birthday: "",
      days_alive: 0,
      address: "",
      note_name: "",
      screenshot_base64: "",
      command: ""
    });
  }
}
