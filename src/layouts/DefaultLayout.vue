<template>
  <div class="min-h-screen bg-dark-900">
    <Navbar />
    <main class="pt-20">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
</script>
