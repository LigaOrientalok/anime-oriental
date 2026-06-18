<template>
  <div class="relative w-full max-w-2xl">
    <div class="relative">
      <input
        v-model="query"
        type="text"
        :placeholder="placeholder"
        class="input-field pl-12 pr-10"
        @input="onInput"
        @focus="isOpen = true"
        @blur="closeWithDelay"
      />
      <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <button v-if="query" @click="query = ''; results = []" class="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
    <div v-if="isOpen && results.length > 0" class="absolute top-full mt-2 left-0 right-0 bg-dark-800 border border-dark-700 rounded-xl overflow-hidden shadow-2xl z-50 animate-scale-in">
      <router-link
        v-for="item in results"
        :key="item.id"
        :to="`/anime/${item.id}`"
        class="flex items-center gap-3 px-4 py-3 hover:bg-dark-700 transition-colors"
        @mousedown.prevent
      >
        <img :src="item.cover_url || 'https://placehold.co/48x64/1a1a2e/white?text=N'" class="w-12 h-16 object-cover rounded-lg" />
        <div class="flex-1 min-w-0">
          <p class="text-white font-medium truncate">{{ item.title }}</p>
          <p class="text-dark-400 text-sm">{{ item.year }} • {{ item.rating }}</p>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

defineProps({
  placeholder: { type: String, default: 'Buscar anime...' }
})

const query = ref('')
const results = ref([])
const isOpen = ref(false)
let debounceTimer = null

function onInput() {
  clearTimeout(debounceTimer)
  if (query.value.length < 2) {
    results.value = []
    return
  }
  debounceTimer = setTimeout(async () => {
    const { data } = await supabase
      .from('animes')
      .select('id, title, cover_url, year, rating')
      .ilike('title', `%${query.value}%`)
      .limit(8)
    results.value = data || []
  }, 300)
}

function closeWithDelay() {
  setTimeout(() => { isOpen.value = false }, 200)
}
</script>
