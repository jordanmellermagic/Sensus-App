// src/urlUtils.js

function cleanHost(hostname) {
  return hostname.replace(/^www\./, '')
}

function decodeQueryValue(v) {
  if (!v) return null
  try {
    return decodeURIComponent(v.replace(/\+/g, ' ')).trim() || null
  } catch {
    return v.replace(/\+/g, ' ').trim() || null
  }
}

export function parseUrlInfo(rawUrl) {
  if (!rawUrl) return { domain: null, search: null, page: null }

  let url = rawUrl.trim()
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url
  }

  try {
    const u = new URL(url)
    const host = cleanHost(u.hostname)
    const params = u.searchParams
    const path = u.pathname || ''

    let search = null
    let page = null

    // COMMON SEARCH PARAM KEYS
    const searchKeys = [
      'q',
      'query',
      'search',
      'search_query',
      'text',
      'term',
      'keyword',
      'keywords',
      'p',
      'wd',
      'k',
    ]

    for (const key of searchKeys) {
      if (params.has(key)) {
        search = decodeQueryValue(params.get(key))
        if (search) break
      }
    }

    // YOUTUBE SPECIAL HANDLING
    if (/youtube\.com$|youtu\.be$/.test(host)) {
      if (!search && path.startsWith('/results') && params.has('search_query')) {
        search = decodeQueryValue(params.get('search_query'))
      }
      if (!search && path.startsWith('/watch')) {
        page = 'YouTube video'
      }
    }

    // GOOGLE SEARCH
    if (/google\./.test(host)) {
      if (!search && params.has('q')) {
        search = decodeQueryValue(params.get('q'))
      }
    }

    // DUCKDUCKGO
    if (/duckduckgo\.com$/.test(host)) {
      if (!search && params.has('q')) {
        search = decodeQueryValue(params.get('q'))
      }
    }

    // BING
    if (/bing\.com$/.test(host)) {
      if (!search && params.has('q')) {
        search = decodeQueryValue(params.get('q'))
      }
    }

    // If no search term, try to infer a page label from the URL path
    if (!search && !page) {
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

    return {
      domain: host || null,
      search: search || null,
      page: page || null,
    }
  } catch {
    return { domain: null, search: null, page: null }
  }
}
