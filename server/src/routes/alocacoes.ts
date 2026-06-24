import { Router } from 'express'
import { eq, and, isNull } from 'drizzle-orm'
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from '../db/schema'
import { alocacoes, agilistas } from '../db/schema'

export function alocacoesRouter(db: BetterSQLite3Database<typeof schema>) {
  const router = Router()

  router.post('/', (req, res) => {
    const { agilista_id, squad_id } = req.body
    if (!agilista_id || !squad_id) {
      return res.status(400).json({ error: 'agilista_id and squad_id are required' })
    }

    const today = new Date().toISOString().slice(0, 10)

    // close previous open alocacao
    db.update(alocacoes)
      .set({ data_fim: today })
      .where(and(eq(alocacoes.agilista_id, agilista_id), isNull(alocacoes.data_fim)))
      .run()

    // create new alocacao
    const [created] = db.insert(alocacoes)
      .values({ agilista_id, squad_id, data_inicio: today, data_fim: null })
      .returning().all()

    // update agilista.squad_id
    db.update(agilistas).set({ squad_id }).where(eq(agilistas.id, agilista_id)).run()

    res.status(201).json(created)
  })

  router.get('/:agilista_id', (req, res) => {
    const result = db.select().from(alocacoes)
      .where(eq(alocacoes.agilista_id, Number(req.params.agilista_id)))
      .all()
    res.json(result)
  })

  return router
}
