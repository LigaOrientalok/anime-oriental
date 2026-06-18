<template>
  <footer class="bg-dark-950 border-t border-dark-800 mt-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="col-span-1 md:col-span-2">
          <span class="text-2xl font-bold">
            <span class="text-primary-500">Anime</span>
            <span class="text-white">Oriental</span>
          </span>
          <p class="text-dark-400 mt-3 max-w-md">
            La mejor plataforma de streaming de anime. Disfruta de tus series favoritas en HD, sin anuncios y con la mejor experiencia.
          </p>
        </div>
        <div>
          <h3 class="text-white font-semibold mb-4">Navegación</h3>
          <ul class="space-y-2">
            <li><router-link to="/" class="text-dark-400 hover:text-white transition-colors">Inicio</router-link></li>
            <li><router-link to="/catalogo" class="text-dark-400 hover:text-white transition-colors">Catálogo</router-link></li>
          </ul>
        </div>
        <div>
          <h3 class="text-white font-semibold mb-4">Soporte</h3>
          <ul class="space-y-2">
            <li><a href="#" class="text-dark-400 hover:text-white transition-colors">Términos y Condiciones</a></li>
            <li><a href="#" class="text-dark-400 hover:text-white transition-colors">Política de Privacidad</a></li>
            <li><a href="#" class="text-dark-400 hover:text-white transition-colors">Contacto</a></li>
          </ul>
        </div>
      </div>
      <div class="border-t border-dark-800 mt-8 pt-8 text-center">
        <p class="text-dark-500 text-sm">&copy; {{ new Date().getFullYear() }} Anime Oriental. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
</template>
