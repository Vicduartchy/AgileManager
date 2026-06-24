import { useState, useRef } from 'react'
import { FileUp, AlertTriangle, CheckCircle, Info, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { useStore } from '../store'
import { parseSheet, type ParsedRow } from '../lib/parseSheet'
import { api } from '../api'
import type { NewAgilista } from '../types'

type Step = 1 | 2 | 3 | 4

const STEPS = [
  { n: 1, label: 'Upload' },
  { n: 2, label: 'Validação' },
  { n: 3, label: 'Confirmação' },
  { n: 4, label: 'Sucesso' },
]

export default function Upload() {
  const { roles, squads, fetchAll } = useStore()
  const [step, setStep] = useState<Step>(1)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [result, setResult] = useState<{ created: number; updated: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const processFile = async (file: File) => {
    const parsed = await parseSheet(file)
    setRows(parsed)
    const errs: string[] = []
    parsed.forEach((r, i) => {
      if (!r.nome) errs.push(`Linha ${i + 2}: Nome vazio`)
      if (!r.role) errs.push(`Linha ${i + 2}: Role vazia`)
      else {
        const exists = roles.some(ro => ro.nome.toLowerCase() === r.role.toLowerCase())
        if (!exists) errs.push(`Linha ${i + 2}: Role desconhecida "${r.role}"`)
      }
    })
    setErrors(errs)
    setStep(2)
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await processFile(file)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) await processFile(file)
  }

  const handleImport = async () => {
    setImporting(true)
    try {
      const mapped: NewAgilista[] = rows.map(r => {
        const role = roles.find(ro => ro.nome.toLowerCase() === r.role.toLowerCase())
        const squad = r.squad ? squads.find(s => s.nome.toLowerCase() === r.squad!.toLowerCase()) : undefined
        return {
          nome: r.nome,
          email: r.email,
          role_id: role?.id ?? 0,
          squad_id: squad?.id ?? null,
          status: 'ativo' as const,
        }
      })
      const res = await api.agilistas.bulk(mapped)
      setResult(res)
      await fetchAll()
      setStep(4)
    } finally {
      setImporting(false)
    }
  }

  const reset = () => {
    setStep(1)
    setRows([])
    setErrors([])
    setResult(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const stepClass = (n: number) => {
    const base = 'flex-1 text-center py-3 text-[12px] font-semibold border-b-[3px] transition-all'
    if (n < step) return `${base} border-navy text-navy`
    if (n === step) return `${base} border-brand-red text-brand-red`
    return `${base} border-[#E0E0E0] text-[#6b7280]`
  }

  const stepNumClass = (n: number) => {
    const base = 'inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-extrabold mb-1'
    if (n < step) return `${base} bg-navy text-white`
    if (n === step) return `${base} bg-brand-red text-white`
    return `${base} bg-[#E0E0E0] text-[#6b7280]`
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-navy">Upload de Planilha</h1>
        <p className="text-[13px] text-[#6b7280] mt-0.5">Importe ou atualize agilistas via arquivo .xlsx ou .csv</p>
      </div>

      {/* Stepper */}
      <div className="flex mb-7">
        {STEPS.map(s => (
          <div key={s.n} className={stepClass(s.n)}>
            <div className={stepNumClass(s.n)}>{s.n}</div>
            <br />{s.label}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="bg-white border border-[#E0E0E0] rounded-[10px] p-5" style={{ boxShadow: '0 2px 8px rgba(9,32,64,.08)' }}>
          <div
            className={`border-2 border-dashed rounded-xl py-16 px-10 text-center cursor-pointer transition-all ${
              dragging ? 'border-brand-red bg-[#fdf5f3]' : 'border-[#E0E0E0] hover:border-brand-red hover:bg-[#fdf5f3]'
            }`}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <div className="flex justify-center mb-4 text-salmon">
              <FileUp size={48} strokeWidth={1.2} />
            </div>
            <div className="text-[14px] text-[#6b7280]">
              Arraste um arquivo aqui ou <strong className="text-brand-red">clique para selecionar</strong>
            </div>
            <div className="text-[12px] text-[#6b7280] mt-1.5">Suporta .xlsx e .csv</div>
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,.csv" className="hidden" onChange={handleFile} />
          <div className="mt-4 p-3 bg-[#eff6ff] border border-[#93c5fd] rounded-lg flex items-start gap-2 text-[13px] text-[#1e40af]">
            <Info size={16} className="flex-shrink-0 mt-0.5" />
            <span>Colunas esperadas: <strong>nome</strong>, <strong>role</strong>, <strong>email</strong>, <strong>squad</strong> (opcional).</span>
          </div>
        </div>
      )}

      {/* Step 2: Validation */}
      {step === 2 && (
        <div className="bg-white border border-[#E0E0E0] rounded-[10px] p-5" style={{ boxShadow: '0 2px 8px rgba(9,32,64,.08)' }}>
          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-[#fefce8] border border-[#fde047] rounded-lg flex items-start gap-2 text-[13px] text-[#854d0e]">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <strong>{errors.length} problema(s) encontrado(s):</strong>
                <ul className="mt-1 space-y-0.5">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
              </div>
            </div>
          )}
          {errors.length === 0 && (
            <div className="mb-4 p-3 bg-[#f0fdf4] border border-[#86efac] rounded-lg flex items-center gap-2 text-[13px] text-[#166534]">
              <CheckCircle size={16} className="flex-shrink-0" />
              <span>Todos os {rows.length} registros estão válidos para importação.</span>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr>
                  {['Nome', 'Role', 'E-mail', 'Squad', 'Validação'].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-[11px] uppercase tracking-[0.5px] text-white/80" style={{ background: '#092040' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const rowErrs: string[] = []
                  if (!r.nome) rowErrs.push('Nome vazio')
                  if (!r.role) rowErrs.push('Role vazia')
                  const valid = rowErrs.length === 0
                  return (
                    <tr key={i} className={`border-b border-[#E0E0E0] ${valid ? 'bg-[#f0fdf4]' : 'bg-[#fef2f2]'}`}>
                      <td className="px-3 py-2">{r.nome || <span className="text-[#6b7280]">—</span>}</td>
                      <td className="px-3 py-2">{r.role || <span className="text-[#6b7280]">—</span>}</td>
                      <td className="px-3 py-2">{r.email || <span className="text-[#6b7280]">—</span>}</td>
                      <td className="px-3 py-2">{r.squad || <span className="text-[#6b7280]">—</span>}</td>
                      <td className="px-3 py-2">
                        {valid
                          ? <span className="text-[#166534] font-semibold">OK</span>
                          : <span className="text-[#dc2626] text-[11px]">{rowErrs.join(' · ')}</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2.5 justify-end mt-4">
            <button onClick={reset} className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-lg border border-[#E0E0E0] bg-white text-[#1a1a2e] hover:border-brand-red hover:text-brand-red transition-colors">
              <ChevronLeft size={14} /> Voltar
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={rows.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-lg bg-brand-red text-white hover:bg-[#a33a22] disabled:opacity-50 transition-colors"
            >
              Continuar <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div className="bg-white border border-[#E0E0E0] rounded-[10px] p-5" style={{ boxShadow: '0 2px 8px rgba(9,32,64,.08)' }}>
          <div className="mb-4 p-3 bg-[#eff6ff] border border-[#93c5fd] rounded-lg flex items-center gap-2 text-[13px] text-[#1e40af]">
            <Info size={16} className="flex-shrink-0" />
            <span>Pronto para importar <strong>{rows.length} registro(s)</strong>. Clique em "Importar" para confirmar.</span>
          </div>
          <div className="flex gap-2.5 justify-end">
            <button onClick={() => setStep(2)} className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-lg border border-[#E0E0E0] bg-white text-[#1a1a2e] hover:border-brand-red hover:text-brand-red transition-colors">
              <ChevronLeft size={14} /> Voltar
            </button>
            <button
              onClick={handleImport}
              disabled={importing}
              className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-lg bg-brand-red text-white hover:bg-[#a33a22] disabled:opacity-50 transition-colors"
            >
              {importing ? 'Importando...' : `Importar ${rows.length} registro(s)`}
              {!importing && <ChevronRight size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && result && (
        <div className="bg-white border border-[#E0E0E0] rounded-[10px] p-12 text-center" style={{ boxShadow: '0 2px 8px rgba(9,32,64,.08)' }}>
          <div className="flex justify-center mb-4 text-brand-red">
            <CheckCircle size={64} strokeWidth={1.2} />
          </div>
          <div className="text-[22px] font-extrabold text-navy mb-2">Importação concluída!</div>
          <div className="inline-flex items-center gap-2 mt-4 p-3 bg-[#f0fdf4] border border-[#86efac] rounded-lg text-[13px] text-[#166534]">
            <CheckCircle size={16} />
            <span>{result.created} criados &nbsp;·&nbsp; {result.updated} atualizados</span>
          </div>
          <div className="flex gap-2.5 justify-center mt-6">
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-lg border border-[#E0E0E0] bg-white text-[#1a1a2e] hover:border-brand-red hover:text-brand-red transition-colors"
            >
              <RefreshCw size={14} /> Importar outro arquivo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
