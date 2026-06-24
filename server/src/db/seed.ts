import { db } from './index'
import { runMigrations } from './migrate'
import { roles, squads, agilistas } from './schema'
import { eq } from 'drizzle-orm'

runMigrations()

db.insert(roles).values([
  { nome: 'Scrum Master' },
  { nome: 'Agile Coach' },
  { nome: 'PMO' },
  { nome: 'RTE' },
]).run()

db.insert(squads).values([
  { nome: 'Payments', tribo: 'Fintech', ativa: true },
  { nome: 'Onboarding', tribo: 'Growth', ativa: true },
]).run()

const [sm] = db.select().from(roles).where(eq(roles.nome, 'Scrum Master')).all()

db.insert(agilistas).values([
  { nome: 'Ana Lima', email: 'ana@example.com', role_id: sm?.id ?? 1, squad_id: 1, status: 'ativo' },
  { nome: 'Carlos Melo', email: 'carlos@example.com', role_id: 2, squad_id: null, status: 'ativo' },
]).run()

console.log('Seed complete')
