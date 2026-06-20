const EMBED_SERVERS = [
  'mega.nz/embed',
  'mega.nz/file',
  'sfastwish.com',
  'streamwish.com',
  'voe.sx',
  'vidhidevip.com',
  'mixdrop.top',
  'mixdrop.co',
  'mp4upload.com',
  'streamtape.com',
  'doodstream.com',
  'dsvplay.com',
  'dood.watch',
  'filemoon.sx',
  'embedsito.com',
]

export function isEmbedUrl(url) {
  if (!url) return false
  return EMBED_SERVERS.some(s => url.includes(s))
}

export function getEmbedSrc(url) {
  if (url.includes('mega.nz/file/')) {
    const match = url.match(/mega\.nz\/file\/([^#]+)#(.+)/)
    if (match) return `https://mega.nz/embed/${match[1]}#${match[2]}`
  }

  if (url.includes('streamtape.com')) {
    const id = url.split('/').pop()
    return `https://streamtape.com/e/${id}`
  }

  if (url.includes('doodstream.com') || url.includes('dood.watch') || url.includes('dsvplay.com')) {
    const id = url.split('/').pop()
    return `https://doodstream.com/e/${id}`
  }

  return url
}

export async function getJKAnimeServers(episodeUrl) {
  const proxyUrl = `/api/jkanime-proxy?url=${encodeURIComponent(episodeUrl)}`
  const res = await fetch(proxyUrl)
  if (!res.ok) throw new Error('Error al conectar con JKAnime')
  const data = await res.json()
  return data.servers || []
}
