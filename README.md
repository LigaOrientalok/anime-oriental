<div align="center">
  <h1>Anime Oriental</h1>
  <p>Plataforma de streaming de anime</p>
  <p>
    <a href="https://anime-oriental.vercel.app" target="_blank">🌐 Ver demo</a>
  </p>
</div>

## Stack

- **Frontend:** Vue 3 + Vite + Tailwind CSS
- **Estado:** Pinia
- **Router:** Vue Router
- **Backend:** Supabase (Auth, Database, Storage)
- **Despliegue:** Vercel

## Funcionalidades

- Autenticación (registro, login, recuperar contraseña)
- Roles: Administrador y Usuario
- Catálogo con filtros (género, año, estado, popularidad)
- Reproductor de video con control de velocidad, fullscreen, teclado
- Historial de reproducción con progreso
- Favoritos y "Ver más tarde"
- Perfil de usuario con avatar
- Panel administrador (CRUD animes, episodios, estadísticas)
- Dark mode, responsive mobile-first
- Búsqueda instantánea

## Instalación local

```bash
git clone https://github.com/LigaOrientalok/anime-oriental.git
cd anime-oriental
npm install
```

Crear archivo `.env`:

```env
VITE_SUPABASE_URL=https://tfethynmceqbbaitrxfy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

```bash
npm run dev
```

## Base de datos

Los scripts SQL están en `supabase/`:
- `schema.sql` — creación de tablas
- `rls.sql` — políticas de seguridad

## Despliegue

Conecta el repo a Vercel con las variables de entorno y despliega automáticamente.

---

<div align="center">Hecho con ❤️</div>
