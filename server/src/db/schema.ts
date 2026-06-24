import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

export const roles = sqliteTable('roles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull().unique(),
})

export const squads = sqliteTable('squads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull(),
  tribo: text('tribo').notNull(),
  ativa: integer('ativa', { mode: 'boolean' }).notNull().default(true),
})

export const agilistas = sqliteTable('agilistas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull(),
  email: text('email').notNull().unique(),
  role_id: integer('role_id').references(() => roles.id).notNull(),
  squad_id: integer('squad_id').references(() => squads.id),
  status: text('status', { enum: ['ativo', 'inativo'] }).notNull().default('ativo'),
})

export const alocacoes = sqliteTable('alocacoes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  agilista_id: integer('agilista_id').references(() => agilistas.id).notNull(),
  squad_id: integer('squad_id').references(() => squads.id).notNull(),
  data_inicio: text('data_inicio').notNull(),
  data_fim: text('data_fim'),
})

export type Role = typeof roles.$inferSelect
export type Squad = typeof squads.$inferSelect
export type Agilista = typeof agilistas.$inferSelect
export type Alocacao = typeof alocacoes.$inferSelect
export type NewAgilista = typeof agilistas.$inferInsert
export type NewSquad = typeof squads.$inferInsert
export type NewAlocacao = typeof alocacoes.$inferInsert
