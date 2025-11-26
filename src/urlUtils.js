export function parseUrlInfo(rawUrl) {
  if (!rawUrl) return { domain: null, search: null, page: null }
  let url = rawUrl.trim()
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url
  }
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '')
    const params = u.searchParams
    let search = null
    const qKeys = ['q', 'query', 'search_query', 'text']
    for (const key of qKeys) {
      if (params.has(key)) {
        search = params.get(key).replace(/\+/g, ' ').trim()
        break
      }
    }
    let page = null
    if (!search) {
      const path = u.pathname || ''
      const segments = path.split('/').filter(Boolean)
      if (segments.length) {
        const last = segments[segments.length - 1]
        const cleaned = decodeURIComponent(last)
          .replace(/[-_]+/g, ' ')
          .replace(/\.html?$/i, '')
          .trim()
        if (cleaned) {
          page = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
        }
      }
    }
    return { domain: host || null, search: search || null, page: page || null }
  } catch {
    return { domain: null, search: null, page: null }
  }
}
