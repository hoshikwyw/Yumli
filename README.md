# Yumli

Your cozy kitchen companion. A cute, pixel-art themed recipe app built for people who love cooking for themselves.

## Features

- Recipe collection with search, category filtering, and favorites
- Recipe detail pages with image gallery, ingredients, step-by-step instructions, and YouTube video tutorials
- Admin dashboard to add, edit, and delete recipes and categories
- Image upload (up to 3 per recipe), shrunk in the browser before sending
- Dark mode toggle
- i18n support (English + Myanmar)
- Mobile-first responsive design
- Cute pixel-art UI with pastel colors

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4, custom pixel-art theme
- **API:** Vercel functions in `api/`
- **Database:** Supabase (PostgreSQL, Storage, Row Level Security)
- **Routing:** React Router v7
- **i18n:** react-i18next

## How data flows

```
browser ──► /api/* (Vercel functions) ──► Supabase, schema `yumli`
```

The browser never talks to Supabase and holds no Supabase key. Yumli's data
lives in a private `yumli` schema inside a Supabase project it shares with
another app: the public anon key gets "permission denied" on it. Only the API
reaches it, signed in as a dedicated **service account** that the database
allows to touch Yumli's tables and images and nothing else in the project.

The admin login is checked by the API against environment variables and kept
in a signed, HttpOnly cookie. Writes without it are refused.

| Route | Who |
|---|---|
| `GET /api/recipes` (`?featured=1`, `?category=`, `?q=`, `?id=`) | anyone |
| `GET /api/categories` | anyone |
| `POST` / `PUT` / `DELETE` on `/api/recipes`, `/api/categories` | admin |
| `POST /api/images` (raw image body), `DELETE /api/images?url=` | admin |
| `GET` / `POST` / `DELETE /api/auth` | log in / out |

## Getting Started

### Prerequisites

- Node.js 20.6+ (for `--env-file`)
- Access to the shared Supabase project

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill it in. Every variable is server-only;
   none of them starts with `VITE_`, so none reaches the browser.

3. Start the dev server. It serves the pages **and** the `api/` routes:

   ```bash
   npm run dev
   ```

4. Before committing, run the checks:

   ```bash
   npm run lint    # code style and React rules
   npm test        # unit tests (Vitest)
   npm run build   # type-check and production build
   ```

### Database (one-time, in the shared Supabase project)

1. The project's own lock-down script must have run first (it creates
   `public.has_app_access()`).
2. Create the service account: **Authentication → Users → Add user**,
   `yumli-api@kayv.os`, a long random password, **Auto Confirm User** ticked.
3. Run `supabase/shared_project_setup.sql` in the SQL Editor.
4. **Project Settings → Data API → Exposed schemas**: add `yumli`.

`supabase/schema.sql` and `supabase/migration_images.sql` are the original,
open setup, kept for history: **do not run them**. `supabase/seed.sql` adds
sample recipes to an empty project.

### Moving data from the old project

`npm run migrate -- --dry-run` lists what would be copied;
`npm run migrate` copies categories, recipes (keeping their ids) and uploaded
images, and rewrites image links. Safe to run more than once.

### Deployment

Deployed on Vercel. Set the variables from `.env.example` (all but the
`OLD_` ones) under **Settings → Environment Variables**, then redeploy.
`vercel.json` sends every path except `/api/*` to the app.

## Project Structure

```
api/              # Vercel functions: recipes, categories, images, auth
  _lib/           # service-account client, session cookie, validation
src/                # imports use the "@/" alias, e.g. "@/components/ui"
  main.tsx, App.tsx # entry point; providers and routes
  pages/            # one file per route: Home, Recipes, RecipeDetail, About, NotFound
    admin/          # Login, Dashboard, RecipeForm
  features/         # code that belongs to one area of the app
    recipes/        # recipeService (calls /api), hooks, utils, and components:
                    #   RecipeCard, RecipeGrid, RecipeImage, RecipeMeta, FeaturedRecipe,
                    #   ImageGallery, Checklists, LoadError
    home/           # HeroSection, CategoryPicks
    admin/          # RecipeList, CategoryManager, ListEditor, PhotoPicker
    auth/           # AuthContext (useAuth), AuthProvider, authService
    favorites/      # FavoritesContext (useFavorites), FavoritesProvider
    theme/          # ThemeContext (useTheme), ThemeProvider
  components/       # shared by every feature
    ui/             # Button, Card, Badge, Chip, Input, Select, Skeleton, StateMessage,
                    #   PageHeader, Container, BackLink, Logo, icons
    ui/pixel-art/   # every food picture, category icon and sticker (sprites.ts), drawn by <PixelArt>
    layout/         # Header, BottomNav, Footer, PublicLayout, AdminLayout
    ErrorBoundary.tsx
  hooks/            # useDocumentTitle
  lib/              # small helpers with no app knowledge: errors, youtube
  i18n/             # setup + locales/ (en, mm)
  styles/index.css  # design tokens (colours, type scale, pixel boxes), light + dark
  types/            # Recipe, Category
scripts/
  migrate-from-old-project.mjs   # one-time data move
supabase/
  shared_project_setup.sql       # yumli schema, policies, image bucket
  seed.sql                       # sample recipes (optional)
  schema.sql, migration_images.sql   # superseded, do not run
```

## Admin Access

Navigate to `/admin` (hidden `+` button in footer). Log in with
`ADMIN_USERNAME` / `ADMIN_PASSWORD`.
