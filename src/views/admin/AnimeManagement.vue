<template>
  <div class="animate-fade-in">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold">Gestión de Animes</h1>
      <button @click="showForm = true; editingAnime = null" class="btn-primary">
        + Nuevo Anime
      </button>
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
                <th class="text-left p-4 text-dark-400 font-medium text-sm">Portada</th>
                <th class="text-left p-4 text-dark-400 font-medium text-sm">Título</th>
                <th class="text-left p-4 text-dark-400 font-medium text-sm hidden md:table-cell">Géneros</th>
                <th class="text-left p-4 text-dark-400 font-medium text-sm hidden sm:table-cell">Año</th>
                <th class="text-left p-4 text-dark-400 font-medium text-sm">Estado</th>
                <th class="text-left p-4 text-dark-400 font-medium text-sm hidden lg:table-cell">Rating</th>
                <th class="text-right p-4 text-dark-400 font-medium text-sm">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in animes" :key="a.id" class="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                <td class="p-4">
                  <img :src="a.cover_url || 'https://placehold.co/48x64/1a1a2e/white?text=N'" class="w-12 h-16 object-cover rounded-lg" />
                </td>
                <td class="p-4 font-medium text-white">{{ a.title }}</td>
                <td class="p-4 text-dark-400 text-sm hidden md:table-cell">
                  <div class="flex flex-wrap gap-1">
                    <span v-for="g in a.genre?.slice(0, 2)" :key="g" class="text-xs px-2 py-0.5 bg-dark-700 rounded">{{ g }}</span>
                    <span v-if="a.genre?.length > 2" class="text-xs text-dark-500">+{{ a.genre.length - 2 }}</span>
                  </div>
                </td>
                <td class="p-4 text-dark-400 hidden sm:table-cell">{{ a.year }}</td>
                <td class="p-4">
                  <span class="text-xs px-2 py-1 rounded" :class="a.status === 'En emisión' ? 'bg-green-500/10 text-green-400' : a.status === 'Finalizado' ? 'bg-blue-500/10 text-blue-400' : 'bg-yellow-500/10 text-yellow-400'">
                    {{ a.status }}
                  </span>
                </td>
                <td class="p-4 text-dark-400 hidden lg:table-cell">{{ a.rating }}</td>
                <td class="p-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <router-link :to="`/admin/episodios/${a.id}`" class="p-2 text-dark-400 hover:text-white transition-colors" title="Episodios">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                    </router-link>
                    <button @click="editAnime(a)" class="p-2 text-dark-400 hover:text-blue-400 transition-colors" title="Editar">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button @click="confirmDelete(a)" class="p-2 text-dark-400 hover:text-red-400 transition-colors" title="Eliminar">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!animes.length">
                <td colspan="7" class="p-8 text-center text-dark-400">No hay animes registrados</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="showForm" class="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-20 px-4 overflow-y-auto" @click.self="showForm = false">
        <div class="card p-6 w-full max-w-2xl animate-scale-in mb-20">
          <h2 class="text-2xl font-bold mb-6">{{ editingAnime ? 'Editar Anime' : 'Nuevo Anime' }}</h2>
          <form @submit.prevent="saveAnime" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm text-dark-400 mb-1">Título</label>
                <input v-model="form.title" required class="input-field" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm text-dark-400 mb-1">Descripción</label>
                <textarea v-model="form.description" rows="4" class="input-field resize-none" />
              </div>
              <div>
                <label class="block text-sm text-dark-400 mb-1">Géneros (separados por coma)</label>
                <input v-model="genreString" class="input-field" placeholder="Acción, Aventura, Fantasía" />
              </div>
              <div>
                <label class="block text-sm text-dark-400 mb-1">Año</label>
                <input v-model.number="form.year" type="number" class="input-field" />
              </div>
              <div>
                <label class="block text-sm text-dark-400 mb-1">Estado</label>
                <select v-model="form.status" class="input-field">
                  <option value="En emisión">En emisión</option>
                  <option value="Finalizado">Finalizado</option>
                  <option value="Próximamente">Próximamente</option>
                </select>
              </div>
              <div>
                <label class="block text-sm text-dark-400 mb-1">Rating</label>
                <input v-model.number="form.rating" type="number" step="0.1" min="0" max="10" class="input-field" />
              </div>
              <div>
                <label class="block text-sm text-dark-400 mb-1">URL de Portada</label>
                <input v-model="form.cover_url" class="input-field" />
              </div>
              <div>
                <label class="block text-sm text-dark-400 mb-1">URL de Banner</label>
                <input v-model="form.banner_url" class="input-field" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm text-dark-400 mb-2">O subir imágenes</label>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-dark-500 mb-1">Portada</p>
                    <input type="file" accept="image/*" @change="uploadCover" class="text-sm text-dark-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-dark-700 file:text-white hover:file:bg-dark-600" />
                  </div>
                  <div>
                    <p class="text-xs text-dark-500 mb-1">Banner</p>
                    <input type="file" accept="image/*" @change="uploadBanner" class="text-sm text-dark-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-dark-700 file:text-white hover:file:bg-dark-600" />
                  </div>
                </div>
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
          <h3 class="text-xl font-bold text-white mb-2">Eliminar Anime</h3>
          <p class="text-dark-400 mb-6">¿Estás seguro de eliminar "{{ deleteConfirm.title }}"? Esta acción no se puede deshacer.</p>
          <div class="flex gap-3 justify-end">
            <button @click="deleteConfirm = null" class="btn-secondary">Cancelar</button>
            <button @click="deleteAnime" :disabled="saving" class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all">{{ saving ? 'Eliminando...' : 'Eliminar' }}</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAnimeStore } from '@/stores/anime'
import { useAuthStore } from '@/stores/auth'

const animeStore = useAnimeStore()
const auth = useAuthStore()

const animes = ref([])
const loading = ref(true)
const showForm = ref(false)
const editingAnime = ref(null)
const saving = ref(false)
const formError = ref('')
const deleteConfirm = ref(null)

const form = ref({
  title: '',
  description: '',
  genre: [],
  year: new Date().getFullYear(),
  status: 'En emisión',
  rating: 0,
  cover_url: '',
  banner_url: '',
})

const genreString = ref('')

onMounted(async () => {
  await animeStore.fetchAnimes({ sort: 'newest' })
  animes.value = animeStore.animes
  loading.value = false
})

function resetForm() {
  form.value = { title: '', description: '', genre: [], year: new Date().getFullYear(), status: 'En emisión', rating: 0, cover_url: '', banner_url: '' }
  genreString.value = ''
  formError.value = ''
}

function editAnime(a) {
  editingAnime.value = a
  form.value = { ...a }
  genreString.value = a.genre?.join(', ') || ''
  showForm.value = true
}

function confirmDelete(a) {
  deleteConfirm.value = a
}

async function saveAnime() {
  saving.value = true
  formError.value = ''
  const data = {
    ...form.value,
    genre: genreString.value.split(',').map(g => g.trim()).filter(Boolean),
  }
  try {
    if (editingAnime.value) {
      await animeStore.updateAnime(editingAnime.value.id, data)
    } else {
      await animeStore.createAnime(data)
    }
    showForm.value = false
    resetForm()
    await animeStore.fetchAnimes({ sort: 'newest' })
    animes.value = animeStore.animes
  } catch (err) {
    formError.value = err.message || 'Error al guardar'
  }
  saving.value = false
}

async function deleteAnime() {
  if (!deleteConfirm.value) return
  saving.value = true
  try {
    await animeStore.deleteAnime(deleteConfirm.value.id)
    deleteConfirm.value = null
    await animeStore.fetchAnimes({ sort: 'newest' })
    animes.value = animeStore.animes
  } catch (err) {
    formError.value = err.message
  }
  saving.value = false
}

async function uploadCover(e) {
  const file = e.target.files[0]
  if (!file) return
  try {
    const url = await animeStore.uploadFile('covers', file, `covers/${Date.now()}_${file.name}`)
    form.value.cover_url = url
  } catch (err) {
    formError.value = err.message
  }
}

async function uploadBanner(e) {
  const file = e.target.files[0]
  if (!file) return
  try {
    const url = await animeStore.uploadFile('banners', file, `banners/${Date.now()}_${file.name}`)
    form.value.banner_url = url
  } catch (err) {
    formError.value = err.message
  }
}
</script>
