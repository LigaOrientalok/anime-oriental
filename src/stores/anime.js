import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import { ref } from 'vue'

export const useAnimeStore = defineStore('anime', () => {
  const animes = ref([])
  const currentAnime = ref(null)
  const episodes = ref([])
  const loading = ref(false)
  const error = ref(null)
  const totalCount = ref(0)

  async function fetchAnimes({ genre, year, status, sort, page, limit } = {}) {
    loading.value = true
    error.value = null

    let query = supabase.from('animes').select('*', { count: 'exact' })

    if (genre) {
      query = query.contains('genre', [genre])
    }
    if (year) {
      query = query.eq('year', year)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const sortMap = {
      popular: { column: 'rating', order: 'desc' },
      newest: { column: 'created_at', order: 'desc' },
      oldest: { column: 'year', order: 'asc' },
      title: { column: 'title', order: 'asc' },
    }
    const sortOption = sortMap[sort] || { column: 'created_at', order: 'desc' }
    query = query.order(sortOption.column, { ascending: sortOption.order === 'asc' })

    if (page && limit) {
      const from = (page - 1) * limit
      query = query.range(from, from + limit - 1)
    }

    const { data, error: err, count } = await query
    if (err) {
      error.value = err.message
      loading.value = false
      return []
    }
    animes.value = data
    totalCount.value = count
    loading.value = false
    return data
  }

  async function fetchAnimeById(id) {
    loading.value = true
    const { data, error: err } = await supabase
      .from('animes')
      .select('*')
      .eq('id', id)
      .single()
    if (err) {
      error.value = err.message
      loading.value = false
      return null
    }
    currentAnime.value = data
    loading.value = false
    return data
  }

  async function fetchEpisodes(animeId) {
    const { data, error: err } = await supabase
      .from('episodes')
      .select('*')
      .eq('anime_id', animeId)
      .order('episode_number', { ascending: true })
    if (err) {
      error.value = err.message
      return []
    }
    episodes.value = data
    return data
  }

  async function fetchEpisodeById(episodeId) {
    const { data, error: err } = await supabase
      .from('episodes')
      .select('*, animes(*)')
      .eq('id', episodeId)
      .single()
    if (err) {
      error.value = err.message
      return null
    }
    return data
  }

  async function getPopularAnimes(limit = 10) {
    const { data, error: err } = await supabase
      .from('animes')
      .select('*')
      .order('rating', { ascending: false })
      .limit(limit)
    if (err) return []
    return data
  }

  async function getLatestEpisodes(limit = 12) {
    const { data, error: err } = await supabase
      .from('episodes')
      .select('*, animes(*)')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (err) return []
    return data
  }

  async function createAnime(animeData) {
    const { data, error: err } = await supabase
      .from('animes')
      .insert([animeData])
      .select()
      .single()
    if (err) throw err
    return data
  }

  async function updateAnime(id, animeData) {
    const { data, error: err } = await supabase
      .from('animes')
      .update(animeData)
      .eq('id', id)
      .select()
      .single()
    if (err) throw err
    return data
  }

  async function deleteAnime(id) {
    const { error: err } = await supabase
      .from('animes')
      .delete()
      .eq('id', id)
    if (err) throw err
    return true
  }

  async function createEpisode(episodeData) {
    const { data, error: err } = await supabase
      .from('episodes')
      .insert([episodeData])
      .select()
      .single()
    if (err) throw err
    return data
  }

  async function updateEpisode(id, episodeData) {
    const { data, error: err } = await supabase
      .from('episodes')
      .update(episodeData)
      .eq('id', id)
      .select()
      .single()
    if (err) throw err
    return data
  }

  async function deleteEpisode(id) {
    const { error: err } = await supabase
      .from('episodes')
      .delete()
      .eq('id', id)
    if (err) throw err
    return true
  }

  async function getGenres() {
    return ['Acción', 'Aventura', 'Comedia', 'Drama', 'Fantasía', 'Horror',
      'Mecha', 'Misterio', 'Romance', 'Sci-Fi', 'Slice of Life', 'Deportes',
      'Sobrenatural', 'Terror', 'Thriller', 'Isekai', 'Shounen', 'Seinen']
  }

  async function getYears() {
    const { data } = await supabase
      .from('animes')
      .select('year')
      .order('year', { ascending: false })
    if (!data) return []
    return [...new Set(data.map(a => a.year).filter(Boolean))]
  }

  async function getStats() {
    const animeCount = await supabase.from('animes').select('*', { count: 'exact', head: true })
    const episodeCount = await supabase.from('episodes').select('*', { count: 'exact', head: true })
    const userCount = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const favoriteCount = await supabase.from('favorites').select('*', { count: 'exact', head: true })

    return {
      animes: animeCount.count || 0,
      episodes: episodeCount.count || 0,
      users: userCount.count || 0,
      favorites: favoriteCount.count || 0,
    }
  }

  async function uploadFile(bucket, file, path) {
    const { error: err } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true })
    if (err) throw err
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    return publicUrl
  }

  return {
    animes, currentAnime, episodes, loading, error, totalCount,
    fetchAnimes, fetchAnimeById, fetchEpisodes, fetchEpisodeById,
    getPopularAnimes, getLatestEpisodes,
    createAnime, updateAnime, deleteAnime,
    createEpisode, updateEpisode, deleteEpisode,
    getGenres, getYears, getStats, uploadFile
  }
})
