export default async function handler(req, res) {
  const { url } = req.query
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' })
  }

  try {
    const response = await fetch(url)
    const html = await response.text()

    const servers = []
    const serverMatch = html.match(/var\s+servers\s*=\s*(\[[\s\S]*?\]);/)
    if (serverMatch) {
      try {
        const raw = serverMatch[1]
          .replace(/\n/g, '')
          .replace(/\s+/g, ' ')
        const parsed = JSON.parse(raw)
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
      } catch {
        // parse error
      }
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')
    res.status(200).json({ servers })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
