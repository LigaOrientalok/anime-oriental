<template>
  <div class="min-h-screen flex items-center justify-center pt-16">
    <div class="text-center animate-fade-in">
      <div class="w-16 h-16 border-4 border-dark-600 border-t-primary-500 rounded-full animate-spin mx-auto mb-6" />
      <h2 class="text-xl font-bold text-white">Completando autenticación...</h2>
      <p class="text-dark-400 mt-2">Redirigiendo al inicio</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

onMounted(async () => {
  const ok = await auth.handleAuthCallback()
  if (ok) {
    router.push('/')
  } else {
    router.push('/login')
  }
})
</script>
