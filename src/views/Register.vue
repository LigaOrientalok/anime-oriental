<template>
  <div class="min-h-screen flex items-center justify-center px-4 pt-20">
    <div class="w-full max-w-md animate-fade-in">
      <div class="card p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold">Crear Cuenta</h1>
          <p class="text-dark-400 mt-2">Únete a Anime Oriental</p>
        </div>
        <form @submit.prevent="handleRegister" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input v-model="email" type="email" required class="input-field" placeholder="tu@email.com" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
            <input v-model="password" type="password" required minlength="6" class="input-field" placeholder="Mínimo 6 caracteres" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Confirmar Contraseña</label>
            <input v-model="confirmPassword" type="password" required class="input-field" placeholder="Repite la contraseña" />
          </div>
          <div v-if="error" class="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">{{ error }}</div>
          <div v-if="success" class="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">{{ success }}</div>
          <button type="submit" :disabled="loading" class="btn-primary w-full flex items-center justify-center gap-2">
            <svg v-if="loading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            {{ loading ? 'Registrando...' : 'Crear Cuenta' }}
          </button>
        </form>
        <p class="mt-6 text-center text-sm text-dark-400">¿Ya tienes cuenta? <router-link to="/login" class="text-primary-500 hover:text-primary-400 font-semibold">Inicia Sesión</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

async function handleRegister() {
  error.value = ''
  success.value = ''
  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden'
    return
  }
  loading.value = true
  const ok = await authStore.signUp(email.value, password.value)
  loading.value = false
  if (ok) {
    success.value = 'Cuenta creada. Revisa tu email para confirmar.'
  } else {
    error.value = authStore.error
  }
}
</script>
