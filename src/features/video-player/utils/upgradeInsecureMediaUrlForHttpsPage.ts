/**
 * Browsers block `http://` media on `https://` pages (mixed content). When the app runs on
 * HTTPS, rewrite stream URLs to `https://` so a TLS-enabled origin can be used.
 */

const DEFAULT_KEEP_HTTP_STREAM_ORIGINS: ReadonlyArray<{ host: string; port: string }> = [
  { host: 'kldemo.dyndns.org', port: '28888' },
  { host: 'kldemo.dyndns.org', port: '28889' },
]

function parseStreamHttpAllowlistFromEnv(): Array<{ host: string; port: string }> {
  const raw =
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_STREAM_HTTP_ALLOWLIST?.trim()
      : undefined
  if (!raw) return []
  const out: Array<{ host: string; port: string }> = []
  for (const part of raw.split(',')) {
    const p = part.trim()
    if (!p) continue
    const idx = p.lastIndexOf(':')
    if (idx <= 0) continue
    const host = p.slice(0, idx).toLowerCase()
    const port = p.slice(idx + 1)
    if (host && port) out.push({ host, port })
  }
  return out
}

function isHttpStreamOriginAllowlisted(absoluteUrl: URL): boolean {
  if (absoluteUrl.protocol !== 'http:') return false
  const host = absoluteUrl.hostname.toLowerCase()
  const port = absoluteUrl.port || '80'
  const extra = parseStreamHttpAllowlistFromEnv()
  for (const e of [...DEFAULT_KEEP_HTTP_STREAM_ORIGINS, ...extra]) {
    if (e.host === host && e.port === port) return true
  }
  return false
}

export function upgradeInsecureMediaUrlForHttpsPage(url: string): string {
  const t = url.trim()
  if (!t) return t
  if (
    typeof process !== 'undefined' &&
    process.env.NEXT_PUBLIC_STREAM_KEEP_HTTP_ON_HTTPS === 'true'
  ) {
    return t
  }
  if (typeof window === 'undefined') {
    return t
  }
  if (window.location.protocol !== 'https:') {
    return t
  }
  if (t.startsWith('http://')) {
    try {
      const u = new URL(t)
      if (isHttpStreamOriginAllowlisted(u)) {
        return t
      }
    } catch {
      // Invalid URL: fall through to upgrade attempt
    }
    return `https://${t.slice('http://'.length)}`
  }
  return t
}
