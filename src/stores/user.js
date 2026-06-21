import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const favorites = ref([])
  const history = ref([])
  const watchLater = ref([])
  const follows = ref([])
  const comments = ref([])
  const loading = ref(false)
  const error = ref(null)

  // ── Favorites ──
  async function fetchFavorites(userId) {
    const { data, error: err } = await supabase
      .from('favorites')
      .select('*, animes(*)')
      .eq('user_id', userId)
    if (err) {
      error.value = err.message
      return []
    }
    favorites.value = data
    return data
  }

  async function addFavorite(userId, animeId) {
    const { error: err } = await supabase
      .from('favorites')
      .insert([{ user_id: userId, anime_id: animeId }])
    if (err) {
      error.value = err.message
      return false
    }
    await fetchFavorites(userId)
    return true
  }

  async function removeFavorite(userId, animeId) {
    const { error: err } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('anime_id', animeId)
    if (err) {
      error.value = err.message
      return false
    }
    await fetchFavorites(userId)
    return true
  }

  async function isFavorite(userId, animeId) {
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('anime_id', animeId)
      .maybeSingle()
    return !!data
  }

  // ── History ──
  async function fetchHistory(userId) {
    const { data, error: err } = await supabase
      .from('history')
      .select('*, episodes(*, animes(*))')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    if (err) {
      error.value = err.message
      return []
    }
    history.value = data
    return data
  }

  /** Returns history grouped by anime, latest episode per anime */
  async function getContinueWatching(userId) {
    const all = await fetchHistory(userId)
    const map = new Map()
    for (const h of all) {
      const animeId = h.episodes?.anime_id
      if (!animeId) continue
      if (!map.has(animeId) || new Date(h.updated_at) > new Date(map.get(animeId).updated_at)) {
        map.set(animeId, h)
      }
    }
    return Array.from(map.values()).slice(0, 20)
  }

  async function updateHistory(userId, episodeId, progress, completed = false) {
    await supabase
      .from('history')
      .upsert(
        { user_id: userId, episode_id: episodeId, progress_seconds: progress, completed, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,episode_id' }
      )
  }

  async function getProgress(userId, episodeId) {
    const { data } = await supabase
      .from('history')
      .select('progress_seconds')
      .eq('user_id', userId)
      .eq('episode_id', episodeId)
      .maybeSingle()
    return data?.progress_seconds || 0
  }

  /** Returns progress grouped by anime for the profile page */
  async function getProgressByAnime(userId) {
    const all = await fetchHistory(userId)
    const map = new Map()
    for (const h of all) {
      const animeId = h.episodes?.anime_id
      if (!animeId) continue
      if (!map.has(animeId)) {
        map.set(animeId, {
          anime: h.episodes.animes,
          episodes: [],
          totalProgress: 0
        })
      }
      const entry = map.get(animeId)
      entry.episodes.push(h)
      if (h.completed) entry.totalProgress++
    }
    return Array.from(map.values())
  }

  // ── Watch Later ──
  async function fetchWatchLater(userId) {
    const { data, error: err } = await supabase
      .from('watch_later')
      .select('*, animes(*)')
      .eq('user_id', userId)
    if (err) {
      error.value = err.message
      return []
    }
    watchLater.value = data
    return data
  }

  async function addWatchLater(userId, animeId) {
    const { error: err } = await supabase
      .from('watch_later')
      .insert([{ user_id: userId, anime_id: animeId }])
    if (err) {
      error.value = err.message
      return false
    }
    await fetchWatchLater(userId)
    return true
  }

  async function removeWatchLater(userId, animeId) {
    const { error: err } = await supabase
      .from('watch_later')
      .delete()
      .eq('user_id', userId)
      .eq('anime_id', animeId)
    if (err) {
      error.value = err.message
      return false
    }
    await fetchWatchLater(userId)
    return true
  }

  async function isInWatchLater(userId, animeId) {
    const { data } = await supabase
      .from('watch_later')
      .select('id')
      .eq('user_id', userId)
      .eq('anime_id', animeId)
      .maybeSingle()
    return !!data
  }

  // ── Follows (Seguir) ──
  async function fetchFollows(userId) {
    const { data, error: err } = await supabase
      .from('follows')
      .select('*, animes(*)')
      .eq('user_id', userId)
    if (err) {
      error.value = err.message
      return []
    }
    follows.value = data
    return data
  }

  async function addFollow(userId, animeId) {
    const { error: err } = await supabase
      .from('follows')
      .insert([{ user_id: userId, anime_id: animeId }])
    if (err) {
      error.value = err.message
      return false
    }
    return true
  }

  async function removeFollow(userId, animeId) {
    const { error: err } = await supabase
      .from('follows')
      .delete()
      .eq('user_id', userId)
      .eq('anime_id', animeId)
    if (err) {
      error.value = err.message
      return false
    }
    return true
  }

  async function isFollowing(userId, animeId) {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('user_id', userId)
      .eq('anime_id', animeId)
      .maybeSingle()
    return !!data
  }

  // ── Comments ──
  async function fetchComments(episodeId) {
    const { data, error: err } = await supabase
      .from('comments')
      .select('*, profiles:user_id(id, username, avatar_url)')
      .eq('episode_id', episodeId)
      .order('created_at', { ascending: true })
    if (err) {
      error.value = err.message
      return []
    }
    comments.value = data
    return data
  }

  async function addComment(userId, episodeId, content) {
    const { error: err } = await supabase
      .from('comments')
      .insert([{ user_id: userId, episode_id: episodeId, content }])
    if (err) {
      error.value = err.message
      return false
    }
    return true
  }

  async function deleteComment(commentId) {
    const { error: err } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
    if (err) {
      error.value = err.message
      return false
    }
    return true
  }

  // ── Ratings ──
  async function fetchMyRating(userId, animeId) {
    const { data } = await supabase
      .from('ratings')
      .select('score')
      .eq('user_id', userId)
      .eq('anime_id', animeId)
      .maybeSingle()
    return data?.score || 0
  }

  async function rateAnime(userId, animeId, score) {
    const { error: err } = await supabase
      .from('ratings')
      .upsert(
        { user_id: userId, anime_id: animeId, score },
        { onConflict: 'user_id,anime_id' }
      )
    if (err) {
      error.value = err.message
      return false
    }
    return true
  }

  async function getAnimeRating(animeId) {
    const { data } = await supabase
      .from('ratings')
      .select('score')
      .eq('anime_id', animeId)
    if (!data || !data.length) return { average: 0, count: 0 }
    const avg = data.reduce((s, r) => s + r.score, 0) / data.length
    return { average: Math.round(avg * 10) / 10, count: data.length }
  }

  // ── Report Broken Link ──
  async function reportBrokenLink(userId, episodeId, message = '') {
    const { error: err } = await supabase
      .from('report_links')
      .insert([{ user_id: userId, episode_id: episodeId, message }])
    if (err) {
      error.value = err.message
      return false
    }
    return true
  }

  return {
    favorites, history, watchLater, follows, comments, loading, error,
    fetchFavorites, addFavorite, removeFavorite, isFavorite,
    fetchHistory, getContinueWatching, updateHistory, getProgress, getProgressByAnime,
    fetchWatchLater, addWatchLater, removeWatchLater, isInWatchLater,
    fetchFollows, addFollow, removeFollow, isFollowing,
    fetchComments, addComment, deleteComment,
    fetchMyRating, rateAnime, getAnimeRating,
    reportBrokenLink
  }
})
