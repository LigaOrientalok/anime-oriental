<template>
  <section>
    <div class="flex items-center justify-between mb-4">
      <h2 class="section-title mb-0">{{ title }}</h2>
      <router-link v-if="seeAllLink" :to="seeAllLink" class="text-primary-500 hover:text-primary-400 text-sm font-semibold transition-colors">
        Ver todo
      </router-link>
    </div>
    <div class="relative">
      <button
        v-if="canScroll"
        @click="scroll(-300)"
        class="absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-dark-900 to-transparent flex items-center justify-start opacity-0 hover:opacity-100 transition-opacity"
      >
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      </button>
      <div
        ref="container"
        class="flex gap-4 overflow-x-auto scroll-smooth pb-2"
        style="scrollbar-width: none; -ms-overflow-style: none;"
        @scroll="updateScroll"
      >
        <slot />
      </div>
      <button
        v-if="canScroll"
        @click="scroll(300)"
        class="absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-dark-900 to-transparent flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity"
      >
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  title: { type: String, required: true },
  seeAllLink: { type: String, default: null }
})

const container = ref(null)
const canScroll = ref(false)

function scroll(amount) {
  if (container.value) {
    container.value.scrollBy({ left: amount, behavior: 'smooth' })
  }
}

function updateScroll() {
  if (container.value) {
    canScroll.value = container.value.scrollWidth > container.value.clientWidth
  }
}
</script>
