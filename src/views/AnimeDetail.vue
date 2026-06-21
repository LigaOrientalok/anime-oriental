<template>
  <div class="pt-16 animate-fade-in">
    <div v-if="loading" class="flex justify-center py-32">
      <div class="w-12 h-12 border-4 border-dark-600 border-t-primary-500 rounded-full animate-spin" />
    </div>
    <template v-else-if="anime">
      <div class="relative">
        <div class="relative h-[50vh] md:h-[60vh] min-h-[400px]">
          <img :src="anime.banner_url || anime.cover_url" :alt="anime.title" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/60 to-transparent" />
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40 relative z-10">
        <div class="flex flex-col md:flex-row gap-8">
          <div class="md:w-72 flex-shrink-0">
            <img
              :src="anime.cover_url"
              :alt="anime.title"
              class="w-full aspect-[2/3] object-cover rounded-2xl shadow-2xl shadow-black/50"
            />
            <div class="flex gap-3 mt-4">
              <button @click="playFirstEpisode" class="btn-primary flex-1 flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                Ver Ahora
              </button>
              <button @click="toggleFavorite" class="btn-secondary p-3">
                <svg class="w-5 h-5" :class="isFavorite ? 'text-primary-500 fill-current' : 'text-white'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button @click="toggleFollow" class="btn-secondary p-3" :title="isFollowing ? 'Dejar de seguir' : 'Seguir anime'">
                <svg class="w-5 h-5" :class="isFollowing ? 'fill-current text-primary-500' : 'text-white'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
            <div class="flex gap-1 mt-2">
              <button
                v-for="star in 5" :key="star"
                @click="setRating(star)"
                class="text-2xl transition-colors"
                :class="star <= (hoverRating || userRating) ? 'text-yellow-400' : 'text-dark-600'"
                @mouseenter="hoverRating = star"
                @mouseleave="hoverRating = 0"
              >
                <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              </button>
              <span class="text-sm text-dark-400 ml-1 self-center">
                {{ animeRating.average > 0 ? animeRating.average : '' }}{{ animeRating.count > 0 ? ` (${animeRating.count})` : '' }}
              </span>
            </div>
          </div>

          <div class="flex-1 space-y-6">
            <div>
              <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">{{ anime.title }}</h1>
              <div class="flex flex-wrap items-center gap-3 text-sm">
                <span class="flex items-center gap-1 text-yellow-400">
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  {{ anime.rating }}
                </span>
                <span class="text-dark-400">{{ anime.year }}</span>
                <span class="text-dark-400">•</span>
                <span :class="statusClass">{{ anime.status }}</span>
              </div>
            </div>

            <p class="text-gray-300 leading-relaxed">{{ anime.description }}</p>

            <div class="flex flex-wrap gap-2">
              <router-link
                v-for="g in anime.genre"
                :key="g"
                :to="`/catalogo?genero=${g}`"
                class="px-4 py-1.5 bg-dark-800 border border-dark-700 rounded-full text-sm text-gray-300 hover:border-primary-500/50 transition-colors"
              >
                {{ g }}
              </router-link>
            </div>

            <div v-if="episodes.length">
              <h2 class="text-xl font-bold text-white mb-4">Episodios ({{ episodes.length }})</h2>
              <div class="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                <router-link
                  v-for="ep in episodes"
                  :key="ep.id"
                  :to="`/ver/${anime.id}/${ep.id}`"
                  class="flex items-center gap-4 p-3 rounded-xl bg-dark-800/50 hover:bg-dark-800 border border-dark-700 hover:border-dark-500 transition-all group"
                >
                  <div class="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-sm font-bold text-dark-300 group-hover:bg-primary-600 group-hover:text-white transition-all">
                    {{ ep.episode_number }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-white font-medium truncate">{{ ep.title }}</p>
                    <p v-if="ep.duration" class="text-dark-500 text-sm">{{ Math.floor(ep.duration / 60) }} min</p>
                  </div>
                  <svg class="w-5 h-5 text-dark-500 group-hover:text-primary-500 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </router-link>
              </div>
            </div>
            <p v-else class="text-dark-400 italic">No hay episodios disponibles aún.</p>
          </div>
        </div>

        <div v-if="recommendations.length" class="mt-16">
          <h2 class="section-title">Recomendaciones</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
            <AnimeCard v-for="rec in recommendations" :key="rec.id" :anime="rec" />
          </div>
        </div>
      </div>
    </template>
    <div v-else class="text-center py-32 text-dark-400">
      <p class="text-2xl">Anime no encontrado</p>
      <router-link to="/catalogo" class="text-primary-500 mt-4 inline-block">Volver al catálogo</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAnimeStore } from '@/stores/anime'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import AnimeCard from '@/components/AnimeCard.vue'

const route = useRoute()
const router = useRouter()
const animeStore = useAnimeStore()
const userStore = useUserStore()
const auth = useAuthStore()

const anime = ref(null)
const episodes = ref([])
const recommendations = ref([])
const loading = ref(true)
const isFavorite = ref(false)
const isFollowing = ref(false)
const userRating = ref(0)
const hoverRating = ref(0)
const animeRating = ref({ average: 0, count: 0 })

const statusClass = computed(() => {
  const map = {
    'En emisión': 'text-green-400 bg-green-500/10 px-2 py-0.5 rounded',
    'Finalizado': 'text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded',
    'Próximamente': 'text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded',
  }
  return map[anime.value?.status] || 'text-dark-400'
})

onMounted(async () => {
  try {
    const id = route.params.id
    anime.value = await animeStore.fetchAnimeById(id)
    if (anime.value) {
      episodes.value = await animeStore.fetchEpisodes(id)

      const popular = await animeStore.getPopularAnimes(12)
      recommendations.value = popular.filter(a => a.id !== id).slice(0, 6)

      if (auth.isAuthenticated) {
        isFavorite.value = await userStore.isFavorite(auth.user.id, id)
        isFollowing.value = await userStore.isFollowing(auth.user.id, id)
        userRating.value = await userStore.fetchMyRating(auth.user.id, id)
      }
      animeRating.value = await userStore.getAnimeRating(id)
    }
  } catch (e) {
    anime.value = null
  }
  loading.value = false
})

function playFirstEpisode() {
  if (episodes.value.length) {
    router.push(`/ver/${anime.value.id}/${episodes.value[0].id}`)
  }
}

async function toggleFavorite() {
  if (!auth.isAuthenticated) { router.push('/login'); return }
  const wasFav = isFavorite.value
  isFavorite.value = !wasFav
  const ok = wasFav
    ? await userStore.removeFavorite(auth.user.id, anime.value.id)
    : await userStore.addFavorite(auth.user.id, anime.value.id)
  if (!ok) isFavorite.value = wasFav
}

async function toggleFollow() {
  if (!auth.isAuthenticated) { router.push('/login'); return }
  const was = isFollowing.value
  isFollowing.value = !was
  const ok = was
    ? await userStore.removeFollow(auth.user.id, anime.value.id)
    : await userStore.addFollow(auth.user.id, anime.value.id)
  if (!ok) isFollowing.value = was
}

async function setRating(score) {
  if (!auth.isAuthenticated) { router.push('/login'); return }
  const was = userRating.value
  if (was === score) {
    userRating.value = 0
  } else {
    userRating.value = score
  }
  const ok = await userStore.rateAnime(auth.user.id, anime.value.id, userRating.value)
  if (!ok) userRating.value = was
  animeRating.value = await userStore.getAnimeRating(anime.value.id)
}
</script>
