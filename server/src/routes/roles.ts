import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from '../db/schema'
import { roles } from '../db/schema'

export function rolesRouter(db: BetterSQLite3Database<typeof schema>) {
  const router = Router()

  router.get('/', (_req, res) => {
    const result = db.select().from(roles).all()
    res.json(result)
  })

  router.post('/', (req, res) => {
    const { nome } = req.body
    if (!nome || typeof nome !== 'string') {
      return res.status(400).json({ error: 'nome is required' })
    }
    const [created] = db.insert(roles).values({ nome }).returning().all()
    res.status(201).json(created)
  })

  router.delete('/:id', (req, res) => {
    db.delete(roles).where(eq(roles.id, Number(req.params.id))).run()
    res.status(204).send()
  })

  return router
}
