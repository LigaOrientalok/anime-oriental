const BASE_URL = 'https://api.jikan.moe/v4'

function mapStatus(malStatus) {
  const map = {
    'Currently Airing': 'En emisión',
    'Finished Airing': 'Finalizado',
    'Not yet aired': 'Próximamente',
  }
  return map[malStatus] || 'Finalizado'
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url)
    if (res.ok) return res.json()
    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get('Retry-After')) || 2
      await new Promise(r => setTimeout(r, retryAfter * 1000))
      continue
    }
    throw new Error(`Jikan API error: ${res.status}`)
  }
  throw new Error('Rate limited. Try again later.')
}

export async function searchAnime(query) {
  const data = await fetchWithRetry(`${BASE_URL}/anime?q=${encodeURIComponent(query)}&sfw&limit=18`)
  return data.data || []
}

export async function getAnimeFull(malId) {
  const data = await fetchWithRetry(`${BASE_URL}/anime/${malId}/full`)
  return data.data || null
}

export async function getAnimeEpisodes(malId) {
  const allEpisodes = []
  let page = 1
  let hasNext = true

  while (hasNext) {
    const data = await fetchWithRetry(`${BASE_URL}/anime/${malId}/episodes?page=${page}`)
    if (data.data) allEpisodes.push(...data.data)
    hasNext = data.pagination?.has_next_page ?? false
    page++
  }

  return allEpisodes
}

export function mapAnimeData(malAnime) {
  const genres = malAnime.genres?.map(g => g.name) || []
  if (malAnime.themes) genres.push(...malAnime.themes.map(t => t.name))
  if (malAnime.demographics) genres.push(...malAnime.demographics.map(d => d.name))

  return {
    title: malAnime.title_english || malAnime.title,
    description: malAnime.synopsis || '',
    genre: [...new Set(genres)],
    year: malAnime.year || malAnime.aired?.from?.slice(0, 4) || null,
    status: mapStatus(malAnime.status),
    rating: malAnime.score || 0,
    cover_url: malAnime.images?.jpg?.large_image_url || '',
    banner_url: malAnime.images?.jpg?.image_url || '',
  }
}

export function mapEpisodeData(malEpisodes) {
  return malEpisodes.map((ep, idx) => ({
    episode_number: ep.mal_id || idx + 1,
    title: ep.title || `Episodio ${idx + 1}`,
    video_url: '',
    duration: parseInt(ep.duration) || 0,
  }))
}
