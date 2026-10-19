import { createServer } from 'node:http'

const port = Number(process.env.PORT ?? 3001)

// Server-side logic (validations, exports, privileged operations) lives here.
// Secrets such as SUPABASE_SERVICE_ROLE_KEY are read from the environment and
// must never reach the client bundle.
const server = createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true }))
    return
  }
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'not_found' }))
})

server.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
})
