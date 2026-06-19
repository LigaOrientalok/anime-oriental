<template>
  <nav class="glass fixed top-0 left-0 right-0 z-50" @mouseleave="navHover = false">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div
        class="flex items-center justify-between h-16"
        @mouseenter="navHover = true"
      >
        <router-link to="/" class="flex items-center space-x-2">
          <span class="text-2xl font-bold">
            <span class="text-primary-500">Anime</span>
            <span class="text-white">Oriental</span>
          </span>
        </router-link>

        <div class="hidden md:flex items-center space-x-6">
          <router-link to="/" class="text-gray-300 hover:text-white transition-colors" exact-active-class="text-primary-500">
            Inicio
          </router-link>
          <router-link to="/catalogo" class="text-gray-300 hover:text-white transition-colors" active-class="text-primary-500">
            Catálogo
          </router-link>
          <router-link v-if="auth.isAdmin" to="/admin" class="text-gray-300 hover:text-white transition-colors" active-class="text-primary-500">
            Admin
          </router-link>
        </div>

        <div class="hidden md:flex items-center space-x-4">
          <router-link v-if="!auth.isAuthenticated" to="/login" class="btn-ghost text-sm">
            Iniciar Sesión
          </router-link>
          <router-link v-if="!auth.isAuthenticated" to="/registro" class="btn-primary text-sm">
            Registrarse
          </router-link>
          <router-link v-if="auth.isAuthenticated" to="/perfil" class="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
            <div class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold">
              {{ auth.profile?.email?.[0]?.toUpperCase() || 'U' }}
            </div>
          </router-link>
        </div>

        <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden text-white p-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Nav links dropdown on hover -->
    <div
      v-if="navHover"
      class="hidden md:block border-t border-dark-700 animate-slide-down"
      @mouseenter="navHover = true"
      @mouseleave="navHover = false"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-6">
        <router-link @click="navHover = false" to="/" class="text-gray-300 hover:text-white transition-colors text-sm font-medium">Inicio</router-link>
        <router-link @click="navHover = false" to="/catalogo" class="text-gray-300 hover:text-white transition-colors text-sm font-medium">Catálogo</router-link>
        <router-link v-if="auth.isAdmin" @click="navHover = false" to="/admin" class="text-gray-300 hover:text-white transition-colors text-sm font-medium">Admin</router-link>
      </div>
    </div>

    <div v-if="mobileMenuOpen" class="md:hidden border-t border-dark-700 animate-slide-down">
      <div class="px-4 py-3 space-y-3">
        <router-link @click="mobileMenuOpen = false" to="/" class="block text-gray-300 hover:text-white py-2">Inicio</router-link>
        <router-link @click="mobileMenuOpen = false" to="/catalogo" class="block text-gray-300 hover:text-white py-2">Catálogo</router-link>
        <router-link v-if="auth.isAdmin" @click="mobileMenuOpen = false" to="/admin" class="block text-gray-300 hover:text-white py-2">Admin</router-link>
        <hr class="border-dark-700" />
        <router-link v-if="!auth.isAuthenticated" @click="mobileMenuOpen = false" to="/login" class="block text-gray-300 hover:text-white py-2">Iniciar Sesión</router-link>
        <router-link v-if="!auth.isAuthenticated" @click="mobileMenuOpen = false" to="/registro" class="block text-primary-500 font-semibold py-2">Registrarse</router-link>
        <router-link v-if="auth.isAuthenticated" @click="mobileMenuOpen = false" to="/perfil" class="block text-gray-300 hover:text-white py-2">Mi Perfil</router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const mobileMenuOpen = ref(false)
const navHover = ref(false)
</script>
