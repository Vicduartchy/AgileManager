interface Props {
  current: string
  onChange: (page: string) => void
}

const links = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'agilistas', label: 'Agilistas' },
  { id: 'squads', label: 'Squads' },
]

export default function Nav({ current, onChange }: Props) {
  return (
    <nav className="flex gap-1 border-b bg-white px-6">
      {links.map(l => (
        <button
          key={l.id}
          onClick={() => onChange(l.id)}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            current === l.id
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          {l.label}
        </button>
      ))}
    </nav>
  )
}
