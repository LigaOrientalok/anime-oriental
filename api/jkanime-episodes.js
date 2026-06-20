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
    const animeRes = await fetch(url, { headers: { 'User-Agent': ua } })
    const html = await animeRes.text()

    const csrfMatch = html.match(/name="csrf-token"\s+content="([^"]+)"/)
    const token = csrfMatch ? csrfMatch[1] : null

    const idMatch = html.match(/\/ajax\/episodes\/(\d+)/)
    const animeId = idMatch ? idMatch[1] : null

    if (!animeId || !token) {
      return res.status(400).json({ error: 'Could not extract anime info from page' })
    }

    const slugMatch = url.match(/jkanime\.net\/([^/]+)/)
    const slug = slugMatch ? slugMatch[1] : null

    const epTotalMatch = html.match(/Episodios:<\/span>\s*(\d+)/i)
    const totalEpisodes = epTotalMatch ? parseInt(epTotalMatch[1]) : null

    const cookies = []
    for (const [key, val] of animeRes.headers.entries()) {
      if (key.toLowerCase() === 'set-cookie') {
        cookies.push(val.split(';')[0])
      }
    }
    const cookieStr = cookies.join('; ')

    const episodes = []
    const perPage = 16
    const maxPages = totalEpisodes ? Math.ceil(totalEpisodes / perPage) + 1 : 100

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': ua,
      'Referer': url,
      'X-Requested-With': 'XMLHttpRequest',
    }
    if (cookieStr) headers.Cookie = cookieStr

    for (let page = 1; page <= maxPages; page++) {
      const epRes = await fetch(`https://jkanime.net/ajax/episodes/${animeId}/${page}`, {
        method: 'POST',
        headers,
        body: `_token=${encodeURIComponent(token)}`,
      })
      if (!epRes.ok) {
        const text = await epRes.text()
        if (text.includes('Page Expired')) break
        continue
      }
      const epData = await epRes.json()
      if (!epData.data || !epData.data.length) break
      for (const ep of epData.data) {
        episodes.push({
          number: parseInt(ep.number),
          title: ep.title,
          date: ep.timestamp,
          url: `https://jkanime.net/${slug}/${ep.number}/`,
        })
      }
      if (epData.data.length < perPage) break
    }

    episodes.sort((a, b) => a.number - b.number)

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')
    res.status(200).json({ episodes, total: totalEpisodes })
  } catch (err) {
    res.status(502).json({ error: 'Error connecting to JKAnime' })
  }
}
