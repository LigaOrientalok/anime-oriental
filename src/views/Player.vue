<template>
  <div class="min-h-screen bg-black pt-16">
    <div v-if="loading" class="flex justify-center py-32">
      <div class="w-12 h-12 border-4 border-dark-600 border-t-primary-500 rounded-full animate-spin" />
    </div>
    <template v-else-if="episode">
      <div class="relative bg-black" ref="playerContainer">
        <video
          ref="video"
          class="w-full max-h-[85vh] mx-auto cursor-pointer"
          :src="episode.video_url"
          @timeupdate="onTimeUpdate"
          @loadedmetadata="onLoadedMetadata"
          @ended="onEnded"
          @click.prevent="togglePlay"
          @dblclick="toggleFullscreen"
          @keydown="handleKeydown"
          tabindex="0"
          playsinline
        />

        <div
          v-if="showControls"
          class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-16 transition-opacity duration-300"
          @mouseenter="showControls = true"
        >
          <div class="max-w-6xl mx-auto">
            <div class="mb-2">
              <input
                type="range"
                min="0"
                :max="duration"
                :value="currentTime"
                @input="seek"
                class="w-full h-1 appearance-none bg-dark-600 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <button @click="togglePlay" class="text-white hover:text-primary-500 transition-colors">
                  <svg v-if="!isPlaying" class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  <svg v-else class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
                </button>
                <span class="text-sm text-gray-400">
                  {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
                </span>
              </div>
              <div class="flex items-center gap-3">
                <div class="relative">
                  <button @click="showSpeedMenu = !showSpeedMenu" class="text-white hover:text-primary-500 text-sm font-medium transition-colors">
                    {{ playbackRate }}x
                  </button>
                  <div v-if="showSpeedMenu" class="absolute bottom-full right-0 mb-2 bg-dark-800 border border-dark-700 rounded-xl overflow-hidden shadow-xl">
                    <button v-for="rate in [0.5, 0.75, 1, 1.25, 1.5, 2]" :key="rate"
                      @click="setSpeed(rate)"
                      class="block w-full px-6 py-2 text-sm text-left hover:bg-dark-700 transition-colors"
                      :class="playbackRate === rate ? 'text-primary-500' : 'text-gray-300'"
                    >
                      {{ rate }}x
                    </button>
                  </div>
                </div>
                <button @click="toggleFullscreen" class="text-white hover:text-primary-500 transition-colors">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="!isFullscreen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="showOverlayPlay" class="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer" @click="togglePlay">
          <div class="w-20 h-20 rounded-full bg-primary-600/90 flex items-center justify-center">
            <svg class="w-10 h-10 text-white ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      </div>

      <div class="max-w-6xl mx-auto px-4 py-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h1 class="text-xl md:text-2xl font-bold text-white">{{ episode.title }}</h1>
            <p class="text-dark-400 mt-1">
              Episodio {{ episode.episode_number }}
              <span v-if="episode.animes"> • {{ episode.animes.title }}</span>
            </p>
          </div>
          <div class="flex gap-2">
            <button v-if="prevEpisode" @click="goToEpisode(prevEpisode.id)" class="btn-secondary text-sm flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              Anterior
            </button>
            <button v-if="nextEpisode" @click="goToEpisode(nextEpisode.id)" class="btn-primary text-sm flex items-center gap-1">
              Siguiente
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAnimeStore } from '@/stores/anime'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const animeStore = useAnimeStore()
const userStore = useUserStore()
const auth = useAuthStore()

const video = ref(null)
const playerContainer = ref(null)
const episode = ref(null)
const allEpisodes = ref([])
const loading = ref(true)
const isPlaying = ref(false)
const isFullscreen = ref(false)
const showControls = ref(true)
const showOverlayPlay = ref(true)
const showSpeedMenu = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const playbackRate = ref(1)
let controlsTimer = null

const prevEpisode = computed(() => {
  if (!episode.value) return null
  const idx = allEpisodes.value.findIndex(e => e.id === episode.value.id)
  return idx > 0 ? allEpisodes.value[idx - 1] : null
})

const nextEpisode = computed(() => {
  if (!episode.value) return null
  const idx = allEpisodes.value.findIndex(e => e.id === episode.value.id)
  return idx < allEpisodes.value.length - 1 ? allEpisodes.value[idx + 1] : null
})

onMounted(async () => {
  const { animeId, episodeId } = route.params
  episode.value = await animeStore.fetchEpisodeById(episodeId)

  if (episode.value) {
    allEpisodes.value = await animeStore.fetchEpisodes(animeId || episode.value.anime_id)

    if (auth.isAuthenticated) {
      const progress = await userStore.getProgress(auth.user.id, episodeId)
      await nextTick()
      if (video.value && progress > 0) {
        video.value.currentTime = progress
      }
    }
  }
  loading.value = false
})

onUnmounted(() => {
  clearTimeout(controlsTimer)
})

function onLoadedMetadata() {
  if (video.value) {
    duration.value = video.value.duration
    showOverlayPlay.value = true
  }
}

function onTimeUpdate() {
  if (video.value) {
    currentTime.value = video.value.currentTime
    updateControls()
  }
}

function togglePlay() {
  if (!video.value) return
  showOverlayPlay.value = false
  if (video.value.paused) {
    video.value.play()
    isPlaying.value = true
  } else {
    video.value.pause()
    isPlaying.value = false
  }
}

function seek(e) {
  if (video.value) {
    const time = parseFloat(e.target.value)
    video.value.currentTime = time
    currentTime.value = time
  }
}

function setSpeed(rate) {
  if (video.value) {
    video.value.playbackRate = rate
    playbackRate.value = rate
    showSpeedMenu.value = false
  }
}

function toggleFullscreen() {
  if (!playerContainer.value) return
  if (!document.fullscreenElement) {
    playerContainer.value.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

function formatTime(seconds) {
  if (!seconds) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

function updateControls() {
  showControls.value = true
  clearTimeout(controlsTimer)
  controlsTimer = setTimeout(() => {
    if (isPlaying.value) showControls.value = false
  }, 3000)
}

function handleKeydown(e) {
  if (e.key === ' ' || e.key === 'k') {
    e.preventDefault()
    togglePlay()
  }
  if (e.key === 'f') toggleFullscreen()
  if (e.key === 'ArrowLeft') {
    if (video.value) video.value.currentTime = Math.max(0, video.value.currentTime - 10)
  }
  if (e.key === 'ArrowRight') {
    if (video.value) video.value.currentTime = Math.min(duration.value, video.value.currentTime + 10)
  }
}

async function onEnded() {
  isPlaying.value = false
  showOverlayPlay.value = true
  if (auth.isAuthenticated && episode.value) {
    await userStore.updateHistory(auth.user.id, episode.value.id, duration.value, true)
  }
  if (nextEpisode.value) {
    setTimeout(() => goToEpisode(nextEpisode.value.id), 3000)
  }
}

function goToEpisode(episodeId) {
  if (auth.isAuthenticated && episode.value) {
    userStore.updateHistory(auth.user.id, episode.value.id, Math.floor(currentTime.value))
  }
  router.push(`/ver/${route.params.animeId}/${episodeId}`)
}
</script>
