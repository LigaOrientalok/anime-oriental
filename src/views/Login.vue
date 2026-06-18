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
</script>
