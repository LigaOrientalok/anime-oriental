<template>
  <div class="flex">
    <Sidebar />
    <main class="flex-1 lg:ml-64 p-8">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Sidebar from '@/components/admin/Sidebar.vue'
</script>
