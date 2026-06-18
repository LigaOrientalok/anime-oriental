<template>
  <div class="group cursor-pointer" @click="$router.push(`/ver/${episode.anime_id}/${episode.id}`)">
    <div class="relative aspect-video rounded-xl overflow-hidden card">
      <img
        :src="episode.animes?.cover_url || 'https://placehold.co/640x360/1a1a2e/white?text=Episodio'"
        :alt="episode.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div class="w-14 h-14 rounded-full bg-primary-600/90 flex items-center justify-center">
          <svg class="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
      <div class="absolute top-2 left-2 bg-dark-900/80 text-white text-xs font-bold px-2 py-1 rounded-md">
        EP {{ episode.episode_number }}
      </div>
    </div>
    <div class="mt-2.5">
      <h3 class="text-sm font-semibold text-white truncate group-hover:text-primary-500 transition-colors">{{ episode.title }}</h3>
      <p v-if="episode.animes?.title" class="text-xs text-dark-400 mt-0.5 truncate">{{ episode.animes.title }}</p>
      <p v-if="episode.duration" class="text-xs text-dark-500 mt-0.5">{{ Math.floor(episode.duration / 60) }} min</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  episode: { type: Object, required: true }
})
</script>
