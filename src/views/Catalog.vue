<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 animate-fade-in">
    <div class="mb-8">
      <h1 class="text-3xl md:text-4xl font-bold mb-2">Catálogo</h1>
      <p class="text-dark-400">Explora todos los animes disponibles</p>
    </div>

    <div class="flex flex-col lg:flex-row gap-8">
      <aside class="lg:w-64 flex-shrink-0">
        <div class="card p-5 space-y-5 sticky top-24">
          <h3 class="font-semibold text-white">Filtros</h3>

          <div>
            <label class="text-sm text-dark-400 block mb-2">Género</label>
            <select v-model="filters.genre" @change="applyFilters" class="input-field text-sm">
              <option value="">Todos</option>
              <option v-for="g in genres" :key="g" :value="g">{{ g }}</option>
            </select>
          </div>

          <div>
            <label class="text-sm text-dark-400 block mb-2">Año</label>
            <select v-model="filters.year" @change="applyFilters" class="input-field text-sm">
              <option value="">Todos</option>
              <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>

          <div>
            <label class="text-sm text-dark-400 block mb-2">Estado</label>
            <select v-model="filters.status" @change="applyFilters" class="input-field text-sm">
              <option value="">Todos</option>
              <option value="En emisión">En emisión</option>
              <option value="Finalizado">Finalizado</option>
              <option value="Próximamente">Próximamente</option>
            </select>
          </div>

          <div>
            <label class="text-sm text-dark-400 block mb-2">Ordenar</label>
            <select v-model="filters.sort" @change="applyFilters" class="input-field text-sm">
              <option value="popular">Más Populares</option>
              <option value="newest">Más Recientes</option>
              <option value="oldest">Más Antiguos</option>
              <option value="title">A-Z</option>
            </select>
          </div>

          <button @click="clearFilters" class="btn-ghost w-full text-sm">Limpiar Filtros</button>
        </div>
      </aside>

      <div class="flex-1">
        <div v-if="loading" class="flex justify-center py-20">
          <div class="w-10 h-10 border-4 border-dark-600 border-t-primary-500 rounded-full animate-spin" />
        </div>

        <div v-else-if="animes.length === 0" class="text-center py-20 text-dark-400">
          <p class="text-xl">No se encontraron animes</p>
        </div>

        <template v-else>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimeCard v-for="a in animes" :key="a.id" :anime="a" />
          </div>

          <Pagination
            v-if="totalPages > 1"
            :current-page="currentPage"
            :total-pages="totalPages"
            @page="goToPage"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAnimeStore } from '@/stores/anime'
import AnimeCard from '@/components/AnimeCard.vue'
import Pagination from '@/components/Pagination.vue'

const route = useRoute()
const router = useRouter()
const animeStore = useAnimeStore()

const genres = ref([])
const years = ref([])
const animes = ref([])
const loading = ref(false)
const currentPage = ref(1)
const totalCount = ref(0)
const perPage = 20

const totalPages = computed(() => Math.ceil(totalCount.value / perPage))

const filters = ref({
  genre: route.query.genero || '',
  year: route.query.anio || '',
  status: route.query.estado || '',
  sort: route.query.orden || 'popular',
})

onMounted(async () => {
  genres.value = await animeStore.getGenres()
  years.value = await animeStore.getYears()
  await loadAnimes()
})

async function loadAnimes() {
  loading.value = true
  const data = await animeStore.fetchAnimes({
    genre: filters.value.genre,
    year: filters.value.year ? parseInt(filters.value.year) : undefined,
    status: filters.value.status,
    sort: filters.value.sort,
    page: currentPage.value,
    limit: perPage,
  })
  animes.value = data
  totalCount.value = animeStore.totalCount
  loading.value = false
}

function applyFilters() {
  currentPage.value = 1
  router.replace({
    query: {
      genero: filters.value.genre || undefined,
      anio: filters.value.year || undefined,
      estado: filters.value.status || undefined,
      orden: filters.value.sort !== 'popular' ? filters.value.sort : undefined,
    }
  })
  loadAnimes()
}

function clearFilters() {
  filters.value = { genre: '', year: '', status: '', sort: 'popular' }
  applyFilters()
}

function goToPage(page) {
  currentPage.value = page
  loadAnimes()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
