export function normalizeUrl(url) {
  if (!url) return ''
  try {
    const hasProtocol = /^https?:\/\//i.test(url)
    const normalized = hasProtocol ? url : `https://${url}`
    return new URL(normalized).toString()
  } catch {
    return url
  }
}

export function getDomainFromUrl(url) {
  if (!url) return ''
  try {
    const u = new URL(normalizeUrl(url))
    return u.hostname
  } catch {
    return url
  }
}

export function truncateUrl(url, max = 40) {
  if (!url) return ''
  if (url.length <= max) return url
  return url.slice(0, max - 3) + '...'
}
