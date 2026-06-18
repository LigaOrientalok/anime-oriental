import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const favorites = ref([])
  const history = ref([])
  const watchLater = ref([])
  const loading = ref(false)
  const error = ref(null)

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

  async function updateHistory(userId, episodeId, progress, completed = false) {
    const { data: existing } = await supabase
      .from('history')
      .select('id')
      .eq('user_id', userId)
      .eq('episode_id', episodeId)
      .maybeSingle()

    if (existing) {
      await supabase
        .from('history')
        .update({ progress_seconds: progress, completed, updated_at: new Date() })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('history')
        .insert([{ user_id: userId, episode_id: episodeId, progress_seconds: progress, completed }])
    }
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

  return {
    favorites, history, watchLater, loading, error,
    fetchFavorites, addFavorite, removeFavorite, isFavorite,
    fetchHistory, updateHistory, getProgress,
    fetchWatchLater, addWatchLater, removeWatchLater, isInWatchLater
  }
})
