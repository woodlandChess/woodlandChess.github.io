import { useSyncExternalStore } from 'react'
import { sound } from '../sound'
import { IconVolume } from './ModeIcons'
import '../styles/game.css'

/** Icon button that mutes / unmutes every sound in the app (shared preference). */
export function SoundToggle({ className = 'gm-icon-btn' }: { className?: string }) {
  const on = useSyncExternalStore(sound.subscribe, sound.isEnabled, () => true)
  return (
    <button type="button" className={className} aria-label={on ? 'Mute sounds' : 'Turn sounds on'}
      title={on ? 'Mute sounds' : 'Turn sounds on'} onClick={() => { void sound.unlock(); sound.setEnabled(!on) }}>
      <IconVolume muted={!on} />
    </button>
  )
}
