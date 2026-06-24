export interface Role { id: number; nome: string }
export interface Squad { id: number; nome: string; tribo: string; ativa: number }
export interface SquadWithAgilistas extends Squad { agilistas: Agilista[] }
export interface Agilista { id: number; nome: string; email: string; role_id: number; squad_id: number | null; status: 'ativo' | 'inativo' }
export interface Alocacao { id: number; agilista_id: number; squad_id: number; data_inicio: string; data_fim: string | null }
export type NewAgilista = Omit<Agilista, 'id'>
