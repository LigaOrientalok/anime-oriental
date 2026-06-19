<template>
  <div>
    <HeroSection
      :anime="featuredAnime"
      :is-favorite="isFav"
      @play="playFeatured"
      @favorite="toggleFav"
    />

    <SearchBar v-if="!featuredAnime" class="max-w-2xl mx-auto px-4 mt-12" />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-16">
      <div v-if="latestEpisodes.length" class="mt-8">
        <HorizontalCarousel title="Últimos Episodios" seeAllLink="/catalogo">
          <EpisodeCard v-for="ep in latestEpisodes" :key="ep.id" :episode="ep" class="min-w-[240px] md:min-w-[280px]" />
        </HorizontalCarousel>
      </div>

      <div v-if="popularAnimes.length">
        <HorizontalCarousel title="Animes Populares" seeAllLink="/catalogo">
          <AnimeCard v-for="a in popularAnimes" :key="a.id" :anime="a" class="min-w-[160px] md:min-w-[200px]" />
        </HorizontalCarousel>
      </div>

      <div v-if="recentAnimes.length">
        <HorizontalCarousel title="Recién Agregados" seeAllLink="/catalogo">
          <AnimeCard v-for="a in recentAnimes" :key="a.id" :anime="a" class="min-w-[160px] md:min-w-[200px]" />
        </HorizontalCarousel>
      </div>

      <section v-if="genres.length">
        <h2 class="section-title">Explora por Género</h2>
        <div class="flex flex-wrap gap-3">
          <router-link
            v-for="g in genres"
            :key="g"
            :to="`/catalogo?genero=${g}`"
            class="px-5 py-2.5 bg-dark-800 border border-dark-700 rounded-full text-sm text-gray-300 hover:bg-dark-700 hover:text-white hover:border-primary-500/50 transition-all"
          >
            {{ g }}
          </router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAnimeStore } from '@/stores/anime'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import HeroSection from '@/components/HeroSection.vue'
import HorizontalCarousel from '@/components/HorizontalCarousel.vue'
import AnimeCard from '@/components/AnimeCard.vue'
import EpisodeCard from '@/components/EpisodeCard.vue'
import SearchBar from '@/components/SearchBar.vue'

const router = useRouter()
const animeStore = useAnimeStore()
const userStore = useUserStore()
const auth = useAuthStore()

const featuredAnime = ref(null)
const popularAnimes = ref([])
const recentAnimes = ref([])
const latestEpisodes = ref([])
const genres = ref([])
const isFav = ref(false)

onMounted(async () => {
  const popular = await animeStore.getPopularAnimes(20)
  popularAnimes.value = popular

  if (popular.length) {
    featuredAnime.value = popular[0]
  }

  const episodes = await animeStore.getLatestEpisodes(12)
  latestEpisodes.value = episodes

  const allAnimes = await animeStore.fetchAnimes({ sort: 'newest', limit: 20 })
  recentAnimes.value = animeStore.animes

  genres.value = await animeStore.getGenres()

  if (auth.isAuthenticated && featuredAnime.value) {
    isFav.value = await userStore.isFavorite(auth.user.id, featuredAnime.value.id)
  }
})

function playFeatured() {
  if (featuredAnime.value) {
    router.push(`/anime/${featuredAnime.value.id}`)
  }
}

async function toggleFav() {
  if (!auth.isAuthenticated) {
    router.push('/login')
    return
  }
  if (!featuredAnime.value) return
  if (isFav.value) {
    await userStore.removeFavorite(auth.user.id, featuredAnime.value.id)
    isFav.value = false
  } else {
    await userStore.addFavorite(auth.user.id, featuredAnime.value.id)
    isFav.value = true
  }
}
</script>
