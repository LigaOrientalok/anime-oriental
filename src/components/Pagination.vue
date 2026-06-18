<template>
  <div class="flex items-center justify-center gap-2 mt-8">
    <button
      @click="$emit('page', currentPage - 1)"
      :disabled="currentPage <= 1"
      class="btn-secondary p-2 disabled:opacity-30"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
    </button>
    <button
      v-for="p in pages"
      :key="p"
      @click="$emit('page', p)"
      class="w-10 h-10 rounded-lg font-medium transition-all"
      :class="p === currentPage ? 'bg-primary-600 text-white' : 'bg-dark-800 text-dark-300 hover:bg-dark-700 hover:text-white'"
    >
      {{ p }}
    </button>
    <button
      @click="$emit('page', currentPage + 1)"
      :disabled="currentPage >= totalPages"
      class="btn-secondary p-2 disabled:opacity-30"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true }
})

defineEmits(['page'])

const pages = computed(() => {
  const start = Math.max(1, props.currentPage - 2)
  const end = Math.min(props.totalPages, props.currentPage + 2)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})
</script>
