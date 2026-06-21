<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 animate-fade-in">
    <div v-if="!auth.isAuthenticated" class="text-center py-20">
      <p class="text-2xl text-dark-400">Debes iniciar sesión</p>
      <router-link to="/login" class="btn-primary mt-4 inline-block">Iniciar Sesión</router-link>
    </div>
    <template v-else>
      <div class="flex items-center gap-6 mb-10">
        <div class="relative group">
          <div class="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
            <img v-if="auth.profile?.avatar_url" :src="auth.profile.avatar_url" class="w-full h-full object-cover" />
            <span v-else>{{ auth.profile?.email?.[0]?.toUpperCase() || 'U' }}</span>
          </div>
          <label class="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <input type="file" accept="image/*" class="hidden" @change="uploadAvatar" />
          </label>
        </div>
        <div>
          <h1 class="text-2xl font-bold">{{ auth.profile?.email }}</h1>
          <p class="text-dark-400">Miembro desde {{ formatDate(auth.profile?.created_at) }}</p>
          <span class="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded" :class="auth.isAdmin ? 'bg-primary-500/10 text-primary-400' : 'bg-dark-700 text-dark-300'">
            {{ auth.isAdmin ? 'Administrador' : 'Usuario' }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-8">
          <section v-if="progressByAnime.length">
            <h2 class="section-title">Progreso por Anime</h2>
            <div class="space-y-3">
              <div v-for="p in progressByAnime" :key="p.anime?.id" class="p-4 rounded-xl bg-dark-800/50 border border-dark-700">
                <div class="flex gap-4">
                  <router-link :to="`/anime/${p.anime?.id}`" class="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img :src="p.anime?.cover_url" class="w-full h-full object-cover" />
                  </router-link>
                  <div class="flex-1 min-w-0">
                    <router-link :to="`/anime/${p.anime?.id}`" class="text-white font-medium hover:text-primary-500 transition-colors">{{ p.anime?.title }}</router-link>
                    <p class="text-dark-400 text-sm mt-1">{{ p.totalProgress }} / {{ p.episodes.length }} episodios vistos</p>
                    <div class="w-full h-1.5 bg-dark-700 rounded-full overflow-hidden mt-2">
                      <div class="h-full bg-primary-500 rounded-full" :style="{ width: (p.episodes.length ? (p.totalProgress / p.episodes.length) * 100 : 0) + '%' }" />
                    </div>
                    <div class="flex gap-2 mt-2">
                      <router-link
                        v-for="ep in p.episodes.slice(0, 3)"
                        :key="ep.id"
                        :to="`/ver/${p.anime?.id}/${ep.episode_id}`"
                        class="text-xs px-2 py-0.5 rounded bg-dark-700 text-dark-300 hover:text-white hover:bg-dark-600 transition-colors"
                      >
                        Ep. {{ ep.episodes?.episode_number }}
                      </router-link>
                      <span v-if="p.episodes.length > 3" class="text-xs text-dark-500 self-center">+{{ p.episodes.length - 3 }} más</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section v-if="favorites.length">
            <h2 class="section-title">Favoritos</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <AnimeCard v-for="fav in favorites" :key="fav.id" :anime="fav.animes" />
            </div>
          </section>

          <section v-if="watchLater.length">
            <h2 class="section-title">Ver Más Tarde</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <AnimeCard v-for="wl in watchLater" :key="wl.id" :anime="wl.animes" />
            </div>
          </section>

          <section v-if="historyItems.length">
            <h2 class="section-title">Historial</h2>
            <div class="space-y-3">
              <router-link
                v-for="h in historyItems"
                :key="h.id"
                :to="`/ver/${h.episodes?.anime_id}/${h.episode_id}`"
                class="flex items-center gap-4 p-3 rounded-xl bg-dark-800/50 hover:bg-dark-800 border border-dark-700 hover:border-dark-500 transition-all"
              >
                <div class="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0">
                  <img :src="h.episodes?.animes?.cover_url" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-white font-medium truncate">{{ h.episodes?.animes?.title }}</p>
                  <p class="text-dark-400 text-sm">Episodio {{ h.episodes?.episode_number }}: {{ h.episodes?.title }}</p>
                </div>
                <div class="text-right">
                  <div class="w-24 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                    <div class="h-full bg-primary-500 rounded-full" :style="{ width: progressPercent(h) + '%' }" />
                  </div>
                  <p class="text-xs text-dark-500 mt-1">{{ progressPercent(h) }}%</p>
                </div>
              </router-link>
            </div>
          </section>

          <p v-if="!favorites.length && !watchLater.length && !historyItems.length" class="text-dark-400 text-center py-12">
            No tienes actividad aún. ¡Explora el catálogo!
          </p>
        </div>

        <div>
          <div class="card p-6 sticky top-24">
            <h3 class="font-semibold text-white mb-4">Datos Personales</h3>
            <form @submit.prevent="updateProfile" class="space-y-4">
              <div>
                <label class="block text-sm text-dark-400 mb-1">Username</label>
                <input v-model="username" class="input-field" placeholder="Tu nombre de usuario" />
              </div>
              <div>
                <label class="block text-sm text-dark-400 mb-1">Email</label>
                <input :value="auth.profile?.email" disabled class="input-field opacity-50" />
              </div>
              <div v-if="updateMessage" class="text-sm" :class="updateError ? 'text-red-400' : 'text-green-400'">
                {{ updateMessage }}
              </div>
              <button type="submit" :disabled="auth.loading" class="btn-primary w-full">
                {{ auth.loading ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
            </form>
            <hr class="border-dark-700 my-6" />
            <button @click="handleLogout" class="btn-ghost w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import AnimeCard from '@/components/AnimeCard.vue'

const router = useRouter()
const auth = useAuthStore()
const userStore = useUserStore()

const favorites = ref([])
const watchLater = ref([])
const historyItems = ref([])
const progressByAnime = ref([])
const username = ref('')
const updateMessage = ref('')
const updateError = ref(false)

onMounted(async () => {
  if (!auth.isAuthenticated) return
  username.value = auth.profile?.username || ''
  favorites.value = await userStore.fetchFavorites(auth.user.id)
  watchLater.value = await userStore.fetchWatchLater(auth.user.id)
  historyItems.value = await userStore.fetchHistory(auth.user.id)
  progressByAnime.value = await userStore.getProgressByAnime(auth.user.id)
})

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })
}

function progressPercent(h) {
  if (!h.episodes?.duration) return 0
  return Math.min(100, Math.round((h.progress_seconds / h.episodes.duration) * 100))
}

async function updateProfile() {
  const ok = await auth.updateProfile({ username: username.value })
  if (ok) {
    updateMessage.value = 'Perfil actualizado'
    updateError.value = false
  } else {
    updateMessage.value = auth.error || 'Error al actualizar'
    updateError.value = true
  }
}

async function uploadAvatar(e) {
  const file = e.target.files[0]
  if (file) await auth.uploadAvatar(file)
}

async function handleLogout() {
  await auth.signOut()
  router.push('/')
}
</script>
