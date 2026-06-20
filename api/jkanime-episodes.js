export default async function handler(req, res) {
  const { url } = req.query
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' })
  }

  try {
    const animeRes = await fetch(url)
    const html = await animeRes.text()

    const csrfMatch = html.match(/name="csrf-token"\s+content="([^"]+)"/)
    const token = csrfMatch ? csrfMatch[1] : null

    const idMatch = html.match(/\/ajax\/episodes\/(\d+)/)
    const animeId = idMatch ? idMatch[1] : null

    if (!animeId || !token) {
      return res.status(400).json({ error: 'Could not extract anime info from page' })
    }

    const totalEpMatch = html.match(/paginationEps\((\d+)\)/)
    const totalEpisodes = totalEpMatch ? parseInt(totalEpMatch[1]) : null

    const episodes = []
    const perPage = 16
    const totalPages = totalEpisodes ? Math.ceil(totalEpisodes / perPage) : 1

    for (let page = 1; page <= totalPages; page++) {
      const epRes = await fetch(`https://jkanime.net/ajax/episodes/${animeId}/${page}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `_token=${encodeURIComponent(token)}`,
      })
      if (!epRes.ok) continue
      const epData = await epRes.json()
      if (epData.data) {
        for (const ep of epData.data) {
          episodes.push({
            number: ep.number,
            title: ep.title,
            date: ep.timestamp,
            url: `https://jkanime.net/${ep.slug}/${ep.number}/`,
          })
        }
      }
    }

    episodes.sort((a, b) => a.number - b.number)

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')
    res.status(200).json({ episodes, total: totalEpisodes })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
