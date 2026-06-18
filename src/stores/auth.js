import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.role === 'admin')

  async function fetchSession() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      user.value = session.user
      await fetchProfile()
    }
  }

  async function fetchProfile() {
    if (!user.value) return
    const { data, error: err } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()
    if (err) {
      console.error('Error fetching profile:', err)
      return
    }
    profile.value = data
  }

  async function signUp(email, password) {
    loading.value = true
    error.value = null
    const { data, error: err } = await supabase.auth.signUp({ email, password })
    if (err) {
      error.value = err.message
      loading.value = false
      return false
    }
    user.value = data.user
    loading.value = false
    return true
  }

  async function signIn(email, password) {
    loading.value = true
    error.value = null
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      error.value = err.message
      loading.value = false
      return false
    }
    user.value = data.user
    await fetchProfile()
    localStorage.setItem('anime-oriental-user', JSON.stringify(profile.value))
    loading.value = false
    return true
  }

  async function signInWithGoogle() {
    loading.value = true
    error.value = null
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    })
    if (err) {
      error.value = err.message
      loading.value = false
      return false
    }
    return true
  }

  async function handleAuthCallback() {
    const { data: { session }, error: err } = await supabase.auth.getSession()
    if (err) {
      error.value = err.message
      return false
    }
    if (session) {
      user.value = session.user
      await fetchProfile()
      localStorage.setItem('anime-oriental-user', JSON.stringify(profile.value))
      return true
    }
    return false
  }

  async function signOut() {
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
    localStorage.removeItem('anime-oriental-user')
  }

  async function resetPassword(email) {
    loading.value = true
    error.value = null
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })
    if (err) {
      error.value = err.message
      loading.value = false
      return false
    }
    loading.value = false
    return true
  }

  async function updateProfile(updates) {
    if (!user.value) return false
    const { error: err } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.value.id)
    if (err) {
      error.value = err.message
      return false
    }
    await fetchProfile()
    localStorage.setItem('anime-oriental-user', JSON.stringify(profile.value))
    return true
  }

  async function uploadAvatar(file) {
    if (!user.value) return null
    const fileExt = file.name.split('.').pop()
    const filePath = `avatars/${user.value.id}.${fileExt}`
    const { error: err } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })
    if (err) {
      error.value = err.message
      return null
    }
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)
    await updateProfile({ avatar_url: publicUrl })
    return publicUrl
  }

  return {
    user, profile, loading, error,
    isAuthenticated, isAdmin,
    fetchSession, fetchProfile,
    signUp, signIn, signInWithGoogle, handleAuthCallback, signOut,
    resetPassword, updateProfile, uploadAvatar
  }
})
