import { Router } from 'express'
import { eq, and } from 'drizzle-orm'
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from '../db/schema'
import { agilistas } from '../db/schema'

export function agilistaRouter(db: BetterSQLite3Database<typeof schema>) {
  const router = Router()

  router.get('/', (req, res) => {
    const { role_id, squad_id, status } = req.query
    const filters = []
    if (role_id) filters.push(eq(agilistas.role_id, Number(role_id)))
    if (squad_id) filters.push(eq(agilistas.squad_id, Number(squad_id)))
    if (status) filters.push(eq(agilistas.status, status as 'ativo' | 'inativo'))
    const result = filters.length
      ? db.select().from(agilistas).where(and(...filters)).all()
      : db.select().from(agilistas).all()
    res.json(result)
  })

  router.post('/bulk', (req, res) => {
    const rows: schema.NewAgilista[] = req.body
    if (!Array.isArray(rows)) return res.status(400).json({ error: 'Expected array' })
    let created = 0
    for (const row of rows) {
      try {
        db.insert(agilistas).values(row).run()
        created++
      } catch {
        // skip duplicates (unique email constraint)
      }
    }
    res.json({ created, updated: 0 })
  })

  router.post('/', (req, res) => {
    const { nome, email, role_id, squad_id, status } = req.body
    if (!nome || !email || !role_id) return res.status(400).json({ error: 'nome, email, role_id are required' })
    try {
      const [created] = db.insert(agilistas).values({
        nome,
        email,
        role_id,
        squad_id: squad_id ?? null,
        status: status ?? 'ativo',
      }).returning().all()
      res.status(201).json(created)
    } catch {
      res.status(409).json({ error: 'Email already exists' })
    }
  })

  router.patch('/:id', (req, res) => {
    const id = Number(req.params.id)
    const { nome, email, role_id, squad_id, status } = req.body
    const updates: Partial<schema.NewAgilista> = {}
    if (nome !== undefined) updates.nome = nome
    if (email !== undefined) updates.email = email
    if (role_id !== undefined) updates.role_id = role_id
    if (squad_id !== undefined) updates.squad_id = squad_id
    if (status !== undefined) updates.status = status
    const [updated] = db.update(agilistas).set(updates).where(eq(agilistas.id, id)).returning().all()
    if (!updated) return res.status(404).json({ error: 'Agilista not found' })
    res.json(updated)
  })

  return router
}
