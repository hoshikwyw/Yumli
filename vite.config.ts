import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Serves the `api/*.ts` routes during `npm run dev`, the way Vercel serves
 * them in production, so the whole app runs locally without the Vercel CLI.
 * The routes read their settings (Supabase, admin login) from `.env`; those
 * have no VITE_ prefix, so they never reach the browser bundle.
 */
function apiRoutes(): Plugin {
  return {
    name: 'yumli-api-routes',
    apply: 'serve',
    configureServer(server) {
      Object.assign(process.env, loadEnv(server.config.mode, server.config.root, ''))

      server.middlewares.use(async (req, res, next) => {
        const route = req.url?.match(/^\/api\/([a-z-]+)(?:\?|$)/)?.[1]
        if (!route) return next()

        const file = resolve(server.config.root, 'api', `${route}.ts`)
        if (!existsSync(file)) {
          res.statusCode = 404
          return res.end()
        }

        try {
          const handlers = await server.ssrLoadModule(file)
          const handler = handlers[req.method ?? 'GET']
          if (typeof handler !== 'function') {
            res.statusCode = 405
            return res.end()
          }

          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(chunk as Buffer)
          const headers = Object.entries(req.headers)
            .filter((entry): entry is [string, string] => typeof entry[1] === 'string')

          const response: Response = await handler(new Request(`http://${req.headers.host}${req.url}`, {
            method: req.method,
            headers,
            body: chunks.length ? Buffer.concat(chunks) : undefined,
          }))

          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    apiRoutes(),
  ],
})
