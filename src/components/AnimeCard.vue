<template>
  <div class="group cursor-pointer" @click="$router.push(`/anime/${anime.id}`)">
    <div class="relative aspect-[2/3] rounded-xl overflow-hidden card">
      <img
        :src="anime.cover_url || 'https://placehold.co/400x600/1a1a2e/white?text=Anime'"
        :alt="anime.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div class="absolute top-2 right-2 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-md">
        {{ anime.rating || 'N/A' }}
      </div>
      <div class="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <span class="text-xs text-dark-300">{{ anime.year }}</span>
      </div>
    </div>
    <div class="mt-2.5">
      <h3 class="text-sm font-semibold text-white truncate group-hover:text-primary-500 transition-colors">{{ anime.title }}</h3>
      <div class="flex items-center gap-2 mt-1">
        <span class="text-xs text-dark-400">{{ anime.status }}</span>
        <span class="text-xs text-dark-600">•</span>
        <span v-if="anime.episode_count" class="text-xs text-dark-400">{{ anime.episode_count }} eps</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  anime: { type: Object, required: true }
})
</script>
