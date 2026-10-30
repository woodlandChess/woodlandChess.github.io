import { ModeNav } from './ModeNav'
import type { ModeId } from '../routes'

/**
 * Suspense fallback for a lazy screen: an empty void with the tab bar already
 * in place, so tapping a tab never blanks the navigation while its code loads.
 */
export function MenuFallback({ mode, onNavigate }: { mode: ModeId; onNavigate: (m: ModeId) => void }) {
  return (
    <main className="setup-shell setup-shell--home" aria-busy="true" aria-label="Loading">
      <ModeNav current={mode} onSelect={onNavigate} />
    </main>
  )
}
