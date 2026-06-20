<template>
  <div class="animate-fade-in">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold">Gestión de Episodios</h1>
        <p v-if="animeTitle" class="text-dark-400 mt-1">{{ animeTitle }}</p>
      </div>
      <div class="flex gap-2">
        <button @click="showJKImport = true" class="btn-secondary flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
          Importar de JKAnime
        </button>
        <button @click="showBulkJKImport = true" class="btn-secondary flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
          Importar todos desde JKAnime
        </button>
        <button @click="showForm = true; editingEpisode = null" class="btn-primary">+ Nuevo Episodio</button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-dark-600 border-t-primary-500 rounded-full animate-spin" />
    </div>

    <template v-else>
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-dark-700">
                <th class="text-left p-4 text-dark-400 font-medium text-sm">#</th>
                <th class="text-left p-4 text-dark-400 font-medium text-sm">Título</th>
                <th class="text-left p-4 text-dark-400 font-medium text-sm hidden md:table-cell">Duración</th>
                <th class="text-left p-4 text-dark-400 font-medium text-sm hidden sm:table-cell">Video URL</th>
                <th class="text-right p-4 text-dark-400 font-medium text-sm">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ep in episodes" :key="ep.id" class="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                <td class="p-4 font-bold text-white">#{{ ep.episode_number }}</td>
                <td class="p-4 font-medium text-white">{{ ep.title }}</td>
                <td class="p-4 text-dark-400 hidden md:table-cell">{{ formatDuration(ep.duration) }}</td>
                <td class="p-4 text-dark-400 text-sm truncate max-w-[200px] hidden sm:table-cell">{{ ep.video_url }}</td>
                <td class="p-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button @click="editEpisode(ep)" class="p-2 text-dark-400 hover:text-blue-400 transition-colors" title="Editar">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button @click="confirmDelete(ep)" class="p-2 text-dark-400 hover:text-red-400 transition-colors" title="Eliminar">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!episodes.length">
                <td colspan="5" class="p-8 text-center text-dark-400">No hay episodios para este anime</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="showJKImport" class="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-20 px-4 overflow-y-auto" @click.self="showJKImport = false">
        <div class="card p-6 w-full max-w-lg animate-scale-in mb-20">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold">Importar desde JKAnime</h2>
            <button @click="showJKImport = false" class="text-dark-400 hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div class="flex gap-3 mb-4">
            <input
              v-model="jkUrl"
              @keydown.enter="fetchJKAnime"
              placeholder="URL del episodio en JKAnime..."
              class="input-field flex-1"
            />
            <button @click="fetchJKAnime" :disabled="jkLoading || !jkUrl.trim()" class="btn-primary">
              <svg v-if="jkLoading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </button>
          </div>

          <div v-if="jkError" class="bg-red-500/10 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">{{ jkError }}</div>

          <div v-if="jkServers.length" class="space-y-2">
            <p class="text-sm text-dark-400 mb-2">Servidores disponibles para este episodio:</p>
            <div
              v-for="(s, i) in jkServers"
              :key="i"
              @click="selectJkServer(s)"
              class="flex items-center justify-between p-3 rounded-lg bg-dark-800 hover:bg-dark-700 border border-dark-700 hover:border-primary-500/50 cursor-pointer transition-all"
            >
              <div>
                <span class="text-white font-medium">{{ s.server }}</span>
                <span v-if="s.size" class="text-dark-500 text-xs ml-2">({{ s.size }})</span>
              </div>
              <span class="text-xs px-2 py-0.5 rounded" :class="s.lang === 2 ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'">
                {{ s.lang === 2 ? 'Latino' : 'Sub' }}
              </span>
            </div>
          </div>

          <div v-else-if="jkSearched && !jkLoading" class="text-center py-8 text-dark-400">
            No se encontraron servidores. Verificá la URL.
          </div>
        </div>
      </div>

      <div v-if="showBulkJKImport" class="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-20 px-4 overflow-y-auto" @click.self="showBulkJKImport = false">
        <div class="card p-6 w-full max-w-2xl animate-scale-in mb-20">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold">Importar todos desde JKAnime</h2>
            <button @click="closeBulk" class="text-dark-400 hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div class="flex gap-3 mb-4">
            <input
              v-model="bulkJkUrl"
              @keydown.enter="fetchBulkJKList"
              placeholder="URL del anime en JKAnime (ej: https://jkanime.net/naruto/)"
              class="input-field flex-1"
            />
            <button @click="fetchBulkJKList" :disabled="bulkLoading || !bulkJkUrl.trim()" class="btn-primary">
              <svg v-if="bulkLoading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </button>
          </div>

          <div v-if="bulkError" class="bg-red-500/10 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">{{ bulkError }}</div>

          <div v-if="bulkEpisodeList.length" class="space-y-4">
            <div class="flex items-center justify-between">
              <p class="text-sm text-dark-400">
                Se encontraron <strong class="text-white">{{ bulkEpisodeList.length }}</strong> episodios en JKAnime.
                <strong class="text-white">{{ episodes.length }}</strong> coinciden con la base de datos.
              </p>
              <button
                v-if="!bulkImporting && !bulkScanning && !bulkSelectedServer"
                @click="scanAvailableServers"
                class="btn-primary"
                :disabled="bulkImportDone"
              >
                Importar todos
              </button>
            </div>

            <div v-if="bulkScanning" class="bg-dark-800 rounded-lg p-3">
              <div class="flex items-center gap-3 text-sm">
                <svg class="w-4 h-4 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                <span>Escaneando servidores disponibles...</span>
              </div>
            </div>

            <div v-if="bulkAvailableServers.length && !bulkImporting" class="bg-dark-800 rounded-lg p-4 space-y-2">
              <p class="text-sm text-dark-400">Elegí qué servidor usar para todos los episodios:</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="srv in bulkAvailableServers"
                  :key="srv.name"
                  @click="runBulkImport(srv.name)"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-all border"
                  :class="bulkSelectedServer === srv.name ? 'bg-primary-500 text-white border-primary-500' : 'bg-dark-700 text-dark-200 border-dark-600 hover:border-primary-500/50'"
                >
                  {{ srv.name }}
                  <span class="text-dark-400 text-xs ml-1">({{ srv.count }})</span>
                </button>
              </div>
            </div>

            <div v-if="bulkProgress" class="bg-dark-800 rounded-lg p-3">
              <div class="flex items-center gap-3 text-sm">
                <svg v-if="bulkImporting" class="w-4 h-4 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                <span>{{ bulkProgress }}</span>
              </div>
            </div>

            <div class="max-h-80 overflow-y-auto space-y-1">
              <div
                v-for="ep in bulkEpisodeList"
                :key="ep.number"
                class="flex items-center justify-between px-3 py-2 rounded-lg text-sm"
                :class="ep.status === 'done' ? 'bg-green-500/10' : ep.status === 'error' ? 'bg-red-500/10' : ep.status === 'skipped' ? 'bg-dark-800/50' : 'bg-dark-800/30'"
              >
                <div class="flex items-center gap-3">
                  <span class="text-dark-500 w-8">#{{ ep.number }}</span>
                  <span class="text-white truncate max-w-md">{{ ep.title }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span v-if="ep.status === 'done'" class="text-green-400 text-xs">OK</span>
                  <span v-else-if="ep.status === 'error'" class="text-red-400 text-xs" :title="ep.error">{{ ep.error }}</span>
                  <span v-else-if="ep.status === 'skipped'" class="text-dark-500 text-xs">Sin episodio en BD</span>
                  <span v-else class="text-dark-500 text-xs">Pendiente</span>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="bulkSearched && !bulkLoading && !bulkError" class="text-center py-8 text-dark-400">
            No se encontraron episodios. Verificá la URL del anime.
          </div>
        </div>
      </div>

      <div v-if="showForm" class="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-20 px-4 overflow-y-auto" @click.self="showForm = false">
        <div class="card p-6 w-full max-w-2xl animate-scale-in mb-20">
          <h2 class="text-2xl font-bold mb-6">{{ editingEpisode ? 'Editar Episodio' : 'Nuevo Episodio' }}</h2>
          <form @submit.prevent="saveEpisode" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-dark-400 mb-1">Número de Episodio</label>
                <input v-model.number="form.episode_number" type="number" required min="1" class="input-field" />
              </div>
              <div>
                <label class="block text-sm text-dark-400 mb-1">Duración (segundos)</label>
                <input v-model.number="form.duration" type="number" min="0" class="input-field" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm text-dark-400 mb-1">Título</label>
                <input v-model="form.title" required class="input-field" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm text-dark-400 mb-1">URL del Video (Supabase Storage o externa)</label>
                <input v-model="form.video_url" required class="input-field" placeholder="https://..." />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm text-dark-400 mb-2">O subir video</label>
                <input type="file" accept="video/*" @change="uploadVideo" class="text-sm text-dark-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-dark-700 file:text-white hover:file:bg-dark-600" />
              </div>
            </div>
            <div v-if="formError" class="bg-red-500/10 text-red-400 px-4 py-3 rounded-lg text-sm">{{ formError }}</div>
            <div class="flex gap-3 justify-end">
              <button type="button" @click="showForm = false" class="btn-secondary">Cancelar</button>
              <button type="submit" :disabled="saving" class="btn-primary">{{ saving ? 'Guardando...' : 'Guardar' }}</button>
            </div>
          </form>
        </div>
      </div>

      <div v-if="deleteConfirm" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4" @click.self="deleteConfirm = null">
        <div class="card p-6 w-full max-w-md animate-scale-in">
          <h3 class="text-xl font-bold text-white mb-2">Eliminar Episodio</h3>
          <p class="text-dark-400 mb-6">¿Estás seguro de eliminar "{{ deleteConfirm.title }}"?</p>
          <div class="flex gap-3 justify-end">
            <button @click="deleteConfirm = null" class="btn-secondary">Cancelar</button>
            <button @click="deleteEpisode" :disabled="saving" class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all">{{ saving ? 'Eliminando...' : 'Eliminar' }}</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAnimeStore } from '@/stores/anime'

const route = useRoute()
const animeStore = useAnimeStore()

const episodes = ref([])
const animeTitle = ref('')
const loading = ref(true)
const showForm = ref(false)
const editingEpisode = ref(null)
const saving = ref(false)
const formError = ref('')
const deleteConfirm = ref(null)

const showJKImport = ref(false)
const jkUrl = ref('')
const jkServers = ref([])
const jkLoading = ref(false)
const jkSearched = ref(false)
const jkError = ref('')

async function fetchJKAnime() {
  const url = jkUrl.value.trim()
  if (!url) return
  if (!url.includes('jkanime.net/')) {
    jkError.value = 'La URL no es de JKAnime.net'
    return
  }
  jkLoading.value = true
  jkError.value = ''
  jkSearched.value = false
  jkServers.value = []
  try {
    const { getJKAnimeServers } = await import('@/lib/jkanime')
    jkServers.value = await getJKAnimeServers(url)
    jkSearched.value = true
  } catch (err) {
    jkError.value = err.message || 'Error al conectar con JKAnime'
  }
  jkLoading.value = false
}

async function selectJkServer(s) {
  form.value.video_url = s.url
  showJKImport.value = false
  jkUrl.value = ''
  jkServers.value = []
  jkSearched.value = false
}

const showBulkJKImport = ref(false)
const bulkJkUrl = ref('')
const bulkEpisodeList = ref([])
const bulkLoading = ref(false)
const bulkSearched = ref(false)
const bulkError = ref('')
const bulkImporting = ref(false)
const bulkImportDone = ref(false)
const bulkProgress = ref('')
const bulkScanning = ref(false)
const bulkAvailableServers = ref([])
const bulkSelectedServer = ref('')

function closeBulk() {
  showBulkJKImport.value = false
  bulkJkUrl.value = ''
  bulkEpisodeList.value = []
  bulkSearched.value = false
  bulkError.value = ''
  bulkImporting.value = false
  bulkImportDone.value = false
  bulkProgress.value = ''
  bulkScanning.value = false
  bulkAvailableServers.value = []
  bulkSelectedServer.value = ''
}

async function fetchBulkJKList() {
  const url = bulkJkUrl.value.trim()
  if (!url) return
  if (!url.includes('jkanime.net/')) {
    bulkError.value = 'La URL no es de JKAnime.net'
    return
  }
  bulkLoading.value = true
  bulkError.value = ''
  bulkSearched.value = false
  bulkEpisodeList.value = []
  try {
    const { getJKAnimeEpisodeList } = await import('@/lib/jkanime')
    const data = await getJKAnimeEpisodeList(url)
    bulkEpisodeList.value = data.episodes.map(ep => ({
      ...ep,
      status: episodes.value.find(e => e.episode_number === ep.number) ? 'pending' : 'skipped',
      error: '',
    }))
    bulkSearched.value = true
  } catch (err) {
    bulkError.value = err.message || 'Error al obtener episodios de JKAnime'
  }
  bulkLoading.value = false
}

async function scanAvailableServers() {
  const pending = bulkEpisodeList.value.filter(ep => ep.status === 'pending')
  if (!pending.length) return
  bulkScanning.value = true
  bulkAvailableServers.value = []
  bulkSelectedServer.value = ''
  const { getJKAnimeServers } = await import('@/lib/jkanime')
  const serverCounts = {}
  const scanCount = Math.min(pending.length, 5)
  for (let i = 0; i < scanCount; i++) {
    bulkProgress.value = `Escaneando episodio ${pending[i].number}...`
    try {
      const servers = await getJKAnimeServers(pending[i].url)
      for (const s of servers) {
        const name = s.server
        if (!serverCounts[name]) serverCounts[name] = { name, count: 0, lang: s.lang }
        serverCounts[name].count++
      }
    } catch (_) {}
  }
  bulkScanning.value = false
  bulkProgress.value = ''
  const sorted = Object.values(serverCounts).sort((a, b) => b.count - a.count)
  bulkAvailableServers.value = sorted
  if (sorted.length === 1) {
    runBulkImport(sorted[0].name)
  }
}

async function runBulkImport(serverName) {
  const animeId = route.params.animeId
  const pending = bulkEpisodeList.value.filter(ep => ep.status === 'pending')
  if (!pending.length) return
  bulkSelectedServer.value = serverName
  bulkImporting.value = true
  bulkImportDone.value = false
  const { getJKAnimeServers } = await import('@/lib/jkanime')
  for (let i = 0; i < pending.length; i++) {
    const ep = pending[i]
    bulkProgress.value = `Episodio ${ep.number} (${i + 1}/${pending.length})...`
    try {
      const servers = await getJKAnimeServers(ep.url)
      if (servers.length) {
        const preferred = servers.find(s => s.server === serverName)
        const fallback = servers.find(s => s.lang === 1) || servers[0]
        const chosen = preferred || fallback
        const dbEp = episodes.value.find(e => e.episode_number === ep.number)
        if (dbEp) {
          await animeStore.updateEpisode(dbEp.id, { video_url: chosen.url })
          ep.status = 'done'
        }
      } else {
        ep.status = 'error'
        ep.error = 'Sin servidores'
      }
    } catch (err) {
      ep.status = 'error'
      ep.error = 'Error de conexión'
    }
  }
  bulkImporting.value = false
  bulkImportDone.value = true
  bulkProgress.value = `Importación completada. ${bulkEpisodeList.value.filter(e => e.status === 'done').length} episodios actualizados.`
  episodes.value = await animeStore.fetchEpisodes(animeId)
}

const form = ref({
  episode_number: 1,
  title: '',
  video_url: '',
  duration: 0,
})

onMounted(async () => {
  const animeId = route.params.animeId
  const anime = await animeStore.fetchAnimeById(animeId)
  if (anime) {
    animeTitle.value = anime.title
    episodes.value = await animeStore.fetchEpisodes(animeId)
  }
  loading.value = false
})

function resetForm() {
  form.value = { episode_number: episodes.value.length + 1, title: '', video_url: '', duration: 0 }
  formError.value = ''
}

function editEpisode(ep) {
  editingEpisode.value = ep
  form.value = { ...ep }
  showForm.value = true
}

function confirmDelete(ep) {
  deleteConfirm.value = ep
}

async function saveEpisode() {
  saving.value = true
  formError.value = ''
  const data = {
    ...form.value,
    anime_id: route.params.animeId,
  }
  try {
    if (editingEpisode.value) {
      await animeStore.updateEpisode(editingEpisode.value.id, data)
    } else {
      await animeStore.createEpisode(data)
    }
    showForm.value = false
    resetForm()
    episodes.value = await animeStore.fetchEpisodes(route.params.animeId)
  } catch (err) {
    formError.value = err.message || 'Error al guardar'
  }
  saving.value = false
}

async function deleteEpisode() {
  if (!deleteConfirm.value) return
  saving.value = true
  try {
    await animeStore.deleteEpisode(deleteConfirm.value.id)
    deleteConfirm.value = null
    episodes.value = await animeStore.fetchEpisodes(route.params.animeId)
  } catch (err) {
    formError.value = err.message
  }
  saving.value = false
}

async function uploadVideo(e) {
  const file = e.target.files[0]
  if (!file) return
  try {
    const url = await animeStore.uploadFile('videos', file, `videos/${route.params.animeId}/${Date.now()}_${file.name}`)
    form.value.video_url = url
  } catch (err) {
    formError.value = err.message
  }
}

function formatDuration(seconds) {
  if (!seconds) return 'N/A'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m} min`
}
</script>
