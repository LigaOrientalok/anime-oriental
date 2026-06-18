<template>
  <div class="min-h-screen flex items-center justify-center px-4 pt-20">
    <div class="w-full max-w-md animate-fade-in">
      <div class="card p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold">Iniciar Sesión</h1>
          <p class="text-dark-400 mt-2">Bienvenido de nuevo a Anime Oriental</p>
        </div>
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input v-model="email" type="email" required class="input-field" placeholder="tu@email.com" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
            <input v-model="password" type="password" required class="input-field" placeholder="••••••••" />
          </div>
          <div v-if="authStore.error" class="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
            {{ authStore.error }}
          </div>
          <button type="submit" :disabled="authStore.loading" class="btn-primary w-full flex items-center justify-center gap-2">
            <svg v-if="authStore.loading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            {{ authStore.loading ? 'Iniciando...' : 'Iniciar Sesión' }}
          </button>
        </form>

        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-dark-700" />
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-3 bg-dark-800 text-dark-400">o continúa con</span>
          </div>
        </div>

        <button @click="handleGoogleLogin" :disabled="authStore.loading" class="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-dark-900 font-semibold py-3 px-6 rounded-lg transition-all duration-200">
          <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          {{ authStore.loading ? 'Conectando...' : 'Continuar con Google' }}
        </button>

        <div class="mt-6 text-center space-y-2">
          <router-link to="/recuperar-password" class="text-sm text-primary-500 hover:text-primary-400">¿Olvidaste tu contraseña?</router-link>
          <p class="text-sm text-dark-400">¿No tienes cuenta? <router-link to="/registro" class="text-primary-500 hover:text-primary-400 font-semibold">Regístrate</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')

async function handleLogin() {
  const success = await authStore.signIn(email.value, password.value)
  if (success) {
    router.push(route.query.redirect || '/')
  }
}

async function handleGoogleLogin() {
  await authStore.signInWithGoogle()
}
</script>
