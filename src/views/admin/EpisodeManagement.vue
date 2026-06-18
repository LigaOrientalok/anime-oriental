<template>
  <div class="animate-fade-in">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold">Gestión de Episodios</h1>
        <p v-if="animeTitle" class="text-dark-400 mt-1">{{ animeTitle }}</p>
      </div>
      <button @click="showForm = true; editingEpisode = null" class="btn-primary">+ Nuevo Episodio</button>
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
