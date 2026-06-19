<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

onMounted(async () => {
  if (!window.location.pathname.includes('/auth/callback')) {
    await auth.fetchSession()
  }
})
</script>
