import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from '../db/schema'
import { squads, agilistas } from '../db/schema'

export function squadsRouter(db: BetterSQLite3Database<typeof schema>) {
  const router = Router()

  router.get('/', (_req, res) => {
    const allSquads = db.select().from(squads).all()
    const result = allSquads.map(squad => ({
      ...squad,
      agilistas: db.select().from(agilistas).where(eq(agilistas.squad_id, squad.id)).all(),
    }))
    res.json(result)
  })

  router.post('/', (req, res) => {
    const { nome, tribo } = req.body
    if (!nome || !tribo) {
      return res.status(400).json({ error: 'nome and tribo are required' })
    }
    const [created] = db.insert(squads).values({ nome, tribo, ativa: true }).returning().all()
    res.status(201).json(created)
  })

  router.patch('/:id', (req, res) => {
    const id = Number(req.params.id)
    const { nome, tribo, ativa } = req.body
    const updates: Partial<typeof squads.$inferInsert> = {}
    if (nome !== undefined) updates.nome = nome
    if (tribo !== undefined) updates.tribo = tribo
    if (ativa !== undefined) updates.ativa = ativa
    const [updated] = db.update(squads).set(updates).where(eq(squads.id, id)).returning().all()
    if (!updated) return res.status(404).json({ error: 'Squad not found' })
    res.json(updated)
  })

  return router
}
