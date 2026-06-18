<template>
  <div class="animate-fade-in">
    <h1 class="text-3xl font-bold mb-8">Dashboard</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <div class="card p-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
            <svg class="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/></svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-white">{{ stats.animes }}</p>
            <p class="text-dark-400 text-sm">Animes</p>
          </div>
        </div>
      </div>
      <div class="card p-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-white">{{ stats.episodes }}</p>
            <p class="text-dark-400 text-sm">Episodios</p>
          </div>
        </div>
      </div>
      <div class="card p-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
            <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/></svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-white">{{ stats.users }}</p>
            <p class="text-dark-400 text-sm">Usuarios</p>
          </div>
        </div>
      </div>
      <div class="card p-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <svg class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-white">{{ stats.favorites }}</p>
            <p class="text-dark-400 text-sm">Favoritos</p>
          </div>
        </div>
      </div>
    </div>

    <div class="card p-6">
      <h2 class="text-xl font-bold text-white mb-4">Acciones Rápidas</h2>
      <div class="flex flex-wrap gap-4">
        <router-link to="/admin/animes/nuevo" class="btn-primary">Agregar Nuevo Anime</router-link>
        <router-link to="/admin/animes" class="btn-secondary">Gestionar Animes</router-link>
        <router-link to="/catalogo" class="btn-ghost">Ver Catálogo</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAnimeStore } from '@/stores/anime'

const animeStore = useAnimeStore()
const stats = ref({ animes: 0, episodes: 0, users: 0, favorites: 0 })

onMounted(async () => {
  stats.value = await animeStore.getStats()
})
</script>
