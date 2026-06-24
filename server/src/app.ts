import express from 'express'
import cors from 'cors'
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from './db/schema'

export function createApp(_db?: BetterSQLite3Database<typeof schema>) {
  const app = express()
  app.use(cors())
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  return app
}
