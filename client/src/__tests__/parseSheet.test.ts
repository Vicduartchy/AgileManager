import { describe, it, expect } from 'vitest'
import { parseRawRows, validateRows } from '../lib/parseSheet'

describe('parseRawRows', () => {
  it('normalizes header row to lowercase keys', () => {
    const raw = [['Nome', 'Email', 'Role'], ['Ana', 'ana@x.com', 'SM']]
    const result = parseRawRows(raw)
    expect(result[0]).toEqual({ nome: 'Ana', email: 'ana@x.com', role: 'SM', squad: undefined })
  })

  it('skips rows with empty nome', () => {
    const raw = [['nome', 'email', 'role'], ['', 'x@x.com', 'SM']]
    const result = parseRawRows(raw)
    expect(result).toHaveLength(0)
  })
})

describe('validateRows', () => {
  it('returns errors for missing email', () => {
    const rows = [{ nome: 'Ana', email: '', role: 'SM' }]
    const errors = validateRows(rows)
    expect(errors[0]).toContain('email')
  })

  it('returns empty array for valid rows', () => {
    const rows = [{ nome: 'Ana', email: 'ana@x.com', role: 'SM' }]
    const errors = validateRows(rows)
    expect(errors).toHaveLength(0)
  })
})
