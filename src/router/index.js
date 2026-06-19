import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      { path: '', name: 'Home', component: () => import('@/views/Home.vue'), meta: { title: 'Inicio' } },
      { path: 'catalogo', name: 'Catalog', component: () => import('@/views/Catalog.vue'), meta: { title: 'Catálogo' } },
      { path: 'anime/:id', name: 'AnimeDetail', component: () => import('@/views/AnimeDetail.vue'), meta: { title: 'Anime' } },
      { path: 'ver/:animeId/:episodeId', name: 'Player', component: () => import('@/views/Player.vue'), meta: { title: 'Reproductor' } },
      { path: 'perfil', name: 'Profile', component: () => import('@/views/Profile.vue'), meta: { title: 'Mi Perfil', requiresAuth: true } },
      { path: 'login', name: 'Login', component: () => import('@/views/Login.vue'), meta: { title: 'Iniciar Sesión', guest: true } },
      { path: 'registro', name: 'Register', component: () => import('@/views/Register.vue'), meta: { title: 'Registro', guest: true } },
      { path: 'auth/callback', name: 'AuthCallback', component: () => import('@/views/AuthCallback.vue'), meta: { title: 'Autenticando...' } },
      { path: 'recuperar-password', name: 'ForgotPassword', component: () => import('@/views/ForgotPassword.vue'), meta: { title: 'Recuperar Contraseña', guest: true } },
      {
        path: 'admin',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { title: 'Admin', requiresAuth: true, requiresAdmin: true },
        children: [
          { path: '', name: 'AdminDashboard', component: () => import('@/views/admin/AdminHome.vue') },
          { path: 'animes', name: 'AdminAnimes', component: () => import('@/views/admin/AnimeManagement.vue') },
          { path: 'animes/nuevo', name: 'AdminAnimeNew', component: () => import('@/views/admin/AnimeManagement.vue') },
          { path: 'animes/:id', name: 'AdminAnimeEdit', component: () => import('@/views/admin/AnimeManagement.vue') },
          { path: 'episodios/:animeId', name: 'AdminEpisodes', component: () => import('@/views/admin/EpisodeManagement.vue') },
          { path: 'estadisticas', name: 'AdminStats', component: () => import('@/views/admin/Stats.vue') },
        ]
      },
      { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/Home.vue') },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach(async (to, from, next) => {
  document.title = `${to.meta.title || 'Anime Oriental'} | Anime Oriental`

  const { useAuthStore } = await import('@/stores/auth')
  const auth = useAuthStore()

  if (to.name !== 'AuthCallback' && !auth.user) {
    await auth.fetchSession()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.meta.guest && auth.isAuthenticated) {
    next({ name: 'Home' })
  } else if (to.meta.requiresAdmin && !auth.isAdmin) {
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router
