<template>
  <div v-if="anime" class="relative h-[70vh] md:h-[85vh] min-h-[500px]">
    <div class="absolute inset-0">
      <img
        :src="anime.banner_url || anime.cover_url"
        :alt="anime.title"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-dark-900/60" />
      <div class="absolute inset-0 gradient-hero" />
    </div>
    <div class="relative z-10 h-full flex items-center">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div class="max-w-2xl animate-fade-in">
          <h1 class="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">{{ anime.title }}</h1>
          <p class="text-lg text-gray-300 mb-6 line-clamp-3">{{ anime.description }}</p>
          <div class="flex flex-wrap items-center gap-3 mb-8">
            <span v-for="g in anime.genre" :key="g" class="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm text-gray-200">{{ g }}</span>
            <span class="px-3 py-1 bg-primary-600/80 rounded-full text-sm">{{ anime.rating }}</span>
            <span class="text-sm text-gray-400">{{ anime.year }}</span>
            <span class="text-sm text-gray-400">{{ anime.status }}</span>
          </div>
          <div class="flex items-center gap-4">
            <button @click="$emit('play')" class="btn-primary text-lg px-8 py-3 flex items-center gap-2">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              Ver Ahora
            </button>
            <button @click="$emit('favorite')" class="btn-secondary p-3">
              <svg class="w-6 h-6" :class="isFavorite ? 'text-primary-500 fill-current' : 'text-white'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  anime: { type: Object, required: true },
  isFavorite: { type: Boolean, default: false }
})

defineEmits(['play', 'favorite'])
</script>
