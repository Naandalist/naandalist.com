// Serves dist/client with gzip, like Vercel does, so Lighthouse measures what visitors get. Used by CI only.
// Usage: bun scripts/serve-dist.ts [port] [dir]
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

const port = Number(process.argv[2] ?? 4400)
const root = path.resolve(process.argv[3] ?? 'dist/client')
const types: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.ico': 'image/x-icon' }

http
  .createServer((req, res) => {
    let file = path.join(root, decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname))
    if (file.endsWith('/')) file += 'index.html'
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, '404.html')
    if (!fs.existsSync(file)) return res.writeHead(404).end()
    const ext = path.extname(file)
    const headers = { 'Content-Type': types[ext] ?? 'application/octet-stream' }
    const body = fs.readFileSync(file)
    if (/\bgzip\b/.test(req.headers['accept-encoding'] ?? '') && /\.(html|js|css|json|xml|svg|txt)$/.test(file)) {
      res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip' })
      return res.end(zlib.gzipSync(body))
    }
    res.writeHead(200, headers)
    res.end(body)
  })
  .listen(port, () => console.log(`serving ${root} on http://localhost:${port}`))
