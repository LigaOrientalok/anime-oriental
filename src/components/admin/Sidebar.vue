<template>
  <aside class="hidden lg:flex fixed left-0 top-16 bottom-0 w-64 bg-dark-800 border-r border-dark-700 flex-col p-4 overflow-y-auto z-30">
    <nav class="space-y-1">
      <router-link to="/admin" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors" :class="isActive('/admin') ? 'bg-primary-600/20 text-primary-500' : 'text-gray-300 hover:bg-dark-700 hover:text-white'">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
        Dashboard
      </router-link>
      <router-link to="/admin/animes" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors" :class="isActive('/admin/animes') ? 'bg-primary-600/20 text-primary-500' : 'text-gray-300 hover:bg-dark-700 hover:text-white'">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/></svg>
        Animes
      </router-link>
      <router-link to="/admin/estadisticas" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors" :class="isActive('/admin/estadisticas') ? 'bg-primary-600/20 text-primary-500' : 'text-gray-300 hover:bg-dark-700 hover:text-white'">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
        Estadísticas
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

function isActive(path) {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}
</script>
