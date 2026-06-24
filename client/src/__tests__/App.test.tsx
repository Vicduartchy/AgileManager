import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from '../App'

vi.mock('../store', () => ({
  useStore: () => ({ roles: [], squads: [], agilistas: [], loading: false, fetchAll: vi.fn(), moveAgilista: vi.fn(), updateAgilista: vi.fn() })
}))

describe('App', () => {
  it('renders header', () => {
    render(<App />)
    expect(screen.getByText('AgileManager')).toBeInTheDocument()
  })
})
