import * as XLSX from 'xlsx'

export interface ParsedRow { nome: string; email: string; role: string; squad?: string }

export function parseRawRows(rows: unknown[][]): ParsedRow[] {
  if (rows.length < 2) return []
  const headers = (rows[0] as string[]).map(h => h.toLowerCase().trim())
  return rows.slice(1).map(row => {
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => { obj[h] = String((row as unknown[])[i] ?? '').trim() })
    return { nome: obj['nome'] ?? '', email: obj['email'] ?? '', role: obj['role'] ?? '', squad: obj['squad'] }
  }).filter(r => r.nome !== '')
}

export function validateRows(rows: ParsedRow[]): string[] {
  const errors: string[] = []
  rows.forEach((r, i) => {
    if (!r.email) errors.push(`Linha ${i + 2}: email obrigatório`)
    if (!r.role) errors.push(`Linha ${i + 2}: role obrigatório`)
  })
  return errors
}

export async function parseSheet(file: File): Promise<ParsedRow[]> {
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer)
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 })
  return parseRawRows(rows)
}
