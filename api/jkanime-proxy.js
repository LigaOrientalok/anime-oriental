function validateJKUrl(url) {
  try {
    const parsed = new URL(url)
    return parsed.hostname === 'jkanime.net' && parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export default async function handler(req, res) {
  const { url } = req.query
  if (!url || !validateJKUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL. Only https://jkanime.net/ is allowed.' })
  }

  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

  try {
    const response = await fetch(url, { headers: { 'User-Agent': ua, 'Referer': 'https://jkanime.net/' } })
    const html = await response.text()

    const servers = []
    const serverMatch = html.match(/var\s+servers\s*=\s*(\[[\s\S]*?\]);/)
    if (serverMatch) {
      let parsed
      try {
        const raw = serverMatch[1].replace(/\n/g, '').replace(/\s+/g, ' ')
        parsed = JSON.parse(raw)
      } catch {
        return res.status(502).json({ error: 'Failed to parse server data from JKAnime' })
      }
      for (const s of parsed) {
        if (!s.remote) continue
        try {
          const decodedUrl = Buffer.from(s.remote, 'base64').toString('utf-8')
          servers.push({
            server: s.server,
            url: decodedUrl,
            lang: s.lang,
            size: s.size || null,
          })
        } catch {
          // skip invalid base64
        }
      }
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')
    res.status(200).json({ servers })
  } catch (err) {
    res.status(502).json({ error: 'Error connecting to JKAnime' })
  }
}
