const BASE_URL = 'https://sensus-api-wd2o.onrender.com'

async function handleJson(response) {
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || response.statusText)
  }
  return response.json()
}

export async function getLatestSpectator() {
  const res = await fetch(`${BASE_URL}/spectator/latest`)
  return handleJson(res)
}

export async function sendSpectatorCommand(command) {
  const res = await fetch(`${BASE_URL}/spectator/command`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ command }),
  })
  return handleJson(res)
}

export async function loginWithEmailPassword(email, password) {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return { token: 'demo-token', email }
}
