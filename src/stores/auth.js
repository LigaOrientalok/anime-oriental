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

  let authListener = null

  function initAuthListener() {
    if (authListener) return
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') && session) {
        user.value = session.user
        fetchProfileSilent().catch(() => {})
      } else if (event === 'SIGNED_OUT') {
        user.value = null
        profile.value = null
        localStorage.removeItem('anime-oriental-user')
      }
    })
    authListener = data.subscription
  }

  function destroyAuthListener() {
    if (authListener) {
      authListener.unsubscribe()
      authListener = null
    }
  }

  async function fetchSession() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      user.value = session.user
      await fetchProfile()
    }
  }

  async function fetchProfile() {
    if (!user.value) return
    let { data, error: err } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()

    if (err && err.code === 'PGRST116') {
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({
          id: user.value.id,
          email: user.value.email,
          role: 'user',
        })
        .select()
        .single()
        .catch(() => {})
      if (newProfile) {
        data = newProfile
        err = null
      }
    }

    if (err) return
    profile.value = data
    localStorage.setItem('anime-oriental-user', JSON.stringify(profile.value))
  }

  async function fetchProfileSilent() {
    if (!user.value) return
    let { data, error: err } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()

    if (err && err.code === 'PGRST116') {
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({
          id: user.value.id,
          email: user.value.email,
          role: 'user',
        })
        .select()
        .single()
      if (newProfile) {
        data = newProfile
        err = null
      }
    }

    if (!err && data) {
      profile.value = data
      localStorage.setItem('anime-oriental-user', JSON.stringify(profile.value))
    }
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
    loading.value = false
    return true
  }

  async function signInWithGoogle() {
    loading.value = true
    error.value = null
    const { data, error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'online',
          prompt: 'select_account',
        },
      }
    })
    if (err) {
      error.value = err.message
      loading.value = false
      return false
    }
    loading.value = false
    return true
  }

  async function handleAuthCallback() {
    initAuthListener()

    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')

    if (code) {
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (data?.session) {
          user.value = data.session.user
          await fetchProfile()
          return true
        }
      } catch (e) {
        // fallback to polling
      }
    }

    for (let i = 0; i < 20; i++) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        user.value = session.user
        await fetchProfile()
        return true
      }
      await new Promise(r => setTimeout(r, 500))
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
    if (updates.role && updates.role !== 'user') {
      return false
    }
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
    if (file.size > 2 * 1024 * 1024) {
      error.value = 'La imagen no puede superar los 2MB'
      return null
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      error.value = 'Tipo de archivo no permitido. Usá JPG, PNG, WebP o GIF.'
      return null
    }
    const fileExt = file.type.split('/')[1] || 'png'
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

  initAuthListener()

  return {
    user, profile, loading, error,
    isAuthenticated, isAdmin,
    fetchSession, fetchProfile,
    signUp, signIn, signInWithGoogle, handleAuthCallback, signOut,
    resetPassword, updateProfile, uploadAvatar,
    initAuthListener, destroyAuthListener
  }
})
