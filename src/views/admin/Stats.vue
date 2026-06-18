<template>
  <div class="animate-fade-in">
    <h1 class="text-3xl font-bold mb-8">Estadísticas</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <div class="card p-6" v-for="stat in statCards" :key="stat.label">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl" :class="stat.bgClass" style="display: flex; align-items: center; justify-content: center;">
            <svg class="w-6 h-6" :class="stat.colorClass" fill="none" stroke="currentColor" v-html="stat.icon" />
          </div>
          <div>
            <p class="text-2xl font-bold text-white">{{ stat.value }}</p>
            <p class="text-dark-400 text-sm">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card p-6">
        <h2 class="text-lg font-bold text-white mb-4">Distribución por Estado</h2>
        <div class="space-y-3">
          <div v-for="item in statusDistribution" :key="item.status" class="flex items-center justify-between">
            <span class="text-gray-300">{{ item.status }}</span>
            <div class="flex items-center gap-3">
              <div class="w-32 h-2 bg-dark-700 rounded-full overflow-hidden">
                <div class="h-full rounded-full" :class="item.barClass" :style="{ width: item.percent + '%' }" />
              </div>
              <span class="text-sm text-dark-400 w-8 text-right">{{ item.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <h2 class="text-lg font-bold text-white mb-4">Distribución por Géneros</h2>
        <div class="space-y-3">
          <div v-for="item in genreDistribution" :key="item.genre" class="flex items-center justify-between">
            <span class="text-gray-300">{{ item.genre }}</span>
            <div class="flex items-center gap-3">
              <div class="w-32 h-2 bg-dark-700 rounded-full overflow-hidden">
                <div class="h-full bg-primary-500 rounded-full" :style="{ width: item.percent + '%' }" />
              </div>
              <span class="text-sm text-dark-400 w-8 text-right">{{ item.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAnimeStore } from '@/stores/anime'
import { supabase } from '@/lib/supabase'

const animeStore = useAnimeStore()
const stats = ref({ animes: 0, episodes: 0, users: 0, favorites: 0 })
const statusDistribution = ref([])
const genreDistribution = ref([])

const statCards = ref([])

onMounted(async () => {
  stats.value = await animeStore.getStats()

  const { data: animes } = await supabase.from('animes').select('status, genre')
  if (animes) {
    const statusMap = {}
    const genreMap = {}
    animes.forEach(a => {
      statusMap[a.status] = (statusMap[a.status] || 0) + 1
      a.genre?.forEach(g => {
        genreMap[g] = (genreMap[g] || 0) + 1
      })
    })
    const total = animes.length
    statusDistribution.value = Object.entries(statusMap).map(([status, count]) => ({
      status,
      count,
      percent: total ? Math.round((count / total) * 100) : 0,
      barClass: status === 'En emisión' ? 'bg-green-500' : status === 'Finalizado' ? 'bg-blue-500' : 'bg-yellow-500',
    }))
    genreDistribution.value = Object.entries(genreMap)
      .map(([genre, count]) => ({ genre, count, percent: total ? Math.round((count / total) * 100) : 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  statCards.value = [
    { label: 'Animes', value: stats.value.animes, bgClass: 'bg-primary-500/20', colorClass: 'text-primary-500', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/>' },
    { label: 'Episodios', value: stats.value.episodes, bgClass: 'bg-blue-500/20', colorClass: 'text-blue-500', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>' },
    { label: 'Usuarios', value: stats.value.users, bgClass: 'bg-green-500/20', colorClass: 'text-green-500', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>' },
    { label: 'Favoritos', value: stats.value.favorites, bgClass: 'bg-yellow-500/20', colorClass: 'text-yellow-500', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>' },
  ]
})
</script>
