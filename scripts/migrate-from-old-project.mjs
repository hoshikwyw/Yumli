// Copy Yumli's data from its old Supabase project into the shared one.
//
//   npm run migrate -- --dry-run   show what would be copied, change nothing
//   npm run migrate                copy it
//
// Reads the old project with its public anon key (its tables and images were
// readable by anyone) and writes to the shared project as Yumli's service
// account. Categories and recipes keep their ids, so links to a recipe keep
// working. Images in the old `recipe-images` bucket are copied to the same
// path in the new one and the recipes' links are rewritten; links to other
// sites (Unsplash and so on) are left as they are.
//
// Safe to run more than once: rows are upserted by id and images overwritten
// in place. Settings come from .env (see .env.example).

import { createClient } from '@supabase/supabase-js'

const DRY_RUN = process.argv.includes('--dry-run')
const BUCKET = 'recipe-images'

const need = (name) => {
  const value = process.env[name]
  if (!value) {
    console.error(`Missing ${name} in .env (see .env.example)`)
    process.exit(1)
  }
  return value
}

const oldUrl = need('OLD_SUPABASE_URL').replace(/\/$/, '')
const newUrl = need('SUPABASE_URL').replace(/\/$/, '')
if (oldUrl === newUrl) {
  console.error('OLD_SUPABASE_URL and SUPABASE_URL are the same project. Nothing to move.')
  process.exit(1)
}

const oldDb = createClient(oldUrl, need('OLD_SUPABASE_ANON_KEY'), { auth: { persistSession: false } })
const newDb = createClient(newUrl, need('SUPABASE_ANON_KEY'), {
  db: { schema: 'yumli' },
  auth: { persistSession: false, autoRefreshToken: false },
})

const oldPrefix = `${oldUrl}/storage/v1/object/public/${BUCKET}/`
const newPrefix = `${newUrl}/storage/v1/object/public/${BUCKET}/`

const fail = (step, error) => {
  console.error(`\n${step} failed: ${error.message ?? error}`)
  process.exit(1)
}

// 1. Read everything from the old project.
const { data: categories, error: catError } = await oldDb.from('categories').select('*').order('created_at')
if (catError) fail('Reading old categories', catError)
const { data: recipes, error: recError } = await oldDb.from('recipes').select('*').order('created_at')
if (recError) fail('Reading old recipes', recError)

const imageUrls = [...new Set(recipes.flatMap((r) => [r.image, ...(r.images ?? [])]).filter(Boolean))]
const ownImages = imageUrls.filter((url) => url.startsWith(oldPrefix))

console.log(`Old project: ${categories.length} categories, ${recipes.length} recipes, ${ownImages.length} uploaded images`
  + ` (+ ${imageUrls.length - ownImages.length} links to other sites, kept as they are)`)

if (DRY_RUN) {
  for (const c of categories) console.log(`  category  ${c.name}`)
  for (const r of recipes) console.log(`  recipe    ${r.title}  (${(r.images ?? []).length || 1} image${(r.images ?? []).length === 1 ? '' : 's'})`)
  console.log('\nDry run: nothing was changed. Run without --dry-run to copy.')
  process.exit(0)
}

// 2. Sign in to the shared project as the service account.
const { error: signInError } = await newDb.auth.signInWithPassword({
  email: need('YUMLI_SERVICE_EMAIL'),
  password: need('YUMLI_SERVICE_PASSWORD'),
})
if (signInError) fail('Signing in as the service account', signInError)

// 3. Copy the images.
let copied = 0
for (const url of ownImages) {
  const path = decodeURIComponent(url.slice(oldPrefix.length))
  const response = await fetch(url)
  if (!response.ok) {
    console.warn(`  skipped ${path}: the old project answered ${response.status}`)
    continue
  }
  const body = await response.arrayBuffer()
  const { error } = await newDb.storage.from(BUCKET).upload(path, body, {
    contentType: response.headers.get('content-type') ?? 'image/jpeg',
    cacheControl: '86400',
    upsert: true,
  })
  if (error) fail(`Uploading ${path}`, error)
  copied += 1
  process.stdout.write(`\r  images ${copied}/${ownImages.length}`)
}
if (ownImages.length) process.stdout.write('\n')

// 4. Copy the rows, pointing image links at the new bucket.
const moveLink = (url) => (url?.startsWith(oldPrefix) ? newPrefix + url.slice(oldPrefix.length) : url)

if (categories.length) {
  const { error } = await newDb.from('categories').upsert(
    categories.map(({ id, name, slug, icon, created_at }) => ({ id, name, slug, icon, created_at })),
    { onConflict: 'id' },
  )
  if (error) fail('Copying categories', error)
}

if (recipes.length) {
  const rows = recipes.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    image: moveLink(r.image),
    images: (r.images ?? []).map(moveLink),
    prep_time: r.prep_time,
    cook_time: r.cook_time,
    servings: r.servings,
    difficulty: r.difficulty,
    ingredients: r.ingredients ?? [],
    instructions: r.instructions ?? [],
    category_id: r.category_id,
    is_featured: r.is_featured ?? false,
    youtube_link: r.youtube_link ?? null,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }))
  const { error } = await newDb.from('recipes').upsert(rows, { onConflict: 'id' })
  if (error) fail('Copying recipes', error)
}

// 5. Check.
const { count: catCount } = await newDb.from('categories').select('*', { count: 'exact', head: true })
const { count: recCount } = await newDb.from('recipes').select('*', { count: 'exact', head: true })
console.log(`\nDone. The shared project now has ${catCount} categories and ${recCount} recipes; ${copied} images copied.`)
