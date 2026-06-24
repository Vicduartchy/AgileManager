import express from 'express'
import cors from 'cors'
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from './db/schema'
import { rolesRouter } from './routes/roles'
import { db as defaultDb } from './db/index'

export function createApp(db: BetterSQLite3Database<typeof schema> = defaultDb) {
  const app = express()
  app.use(cors())
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.use('/api/roles', rolesRouter(db))

  return app
}
