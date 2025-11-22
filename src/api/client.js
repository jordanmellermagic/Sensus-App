// src/api/client.js

const API_BASE = import.meta.env.VITE_API_BASE;

if (!API_BASE) {
  // This will show in the browser console if the env var is missing.
  // It won't break the build, but API calls will fail if not set.
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

// Helper: if GET fails, create a blank user record.
export async function createUserIfNotExists(userId) {
  try {
    return await getUser(userId);
  } catch (err) {
    // Assume "not found" and create a new user.
    return await postUser(userId, {
      first_name: "",
      last_name: "",
      phone_number: "",
      birthday: "",
      days_alive: 0,
      address: "",
      note_name: "",
      screenshot_base64: "",
      command: "",
    });
  }
}
