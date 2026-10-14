import { IconComputer, IconOnline, IconPuzzle } from './ModeIcons'

export type ModeId = 'ai' | 'online' | 'puzzle'

const modeItems: { id: ModeId; label: string; Icon: typeof IconComputer }[] = [
  { id: 'ai',     label: 'Computer',    Icon: IconComputer },
  { id: 'online', label: 'Play online', Icon: IconOnline },
  { id: 'puzzle', label: 'Puzzles',     Icon: IconPuzzle },
]

/**
 * Primary mode navigation shared by every home-level screen
 * (Computer setup, Online menu, Puzzle menu). The current mode is marked
 * with aria-current; the others navigate.
 */
export function ModeNav({ current, onSelect }: { current: ModeId; onSelect: (m: ModeId) => void }) {
  return (
    <nav className="mode-nav" aria-label="Game mode">
      {modeItems.map(({ id, label, Icon }) => (
        <button key={id} type="button" className="mode-nav-btn"
          aria-current={id === current ? 'page' : undefined}
          onClick={() => { if (id !== current) onSelect(id) }}>
          <Icon className="mode-nav-icon" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
