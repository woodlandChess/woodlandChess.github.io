import { useRef, useState } from 'react'
import {
  applyBackup, createBackup, lastBackupAt, markBackedUp, MAX_BACKUP_BYTES, needsBackup, parseBackup, saveBackupFile,
  type Backup, type BackupSummary,
} from '../backup'
import type { PlayerProfileData } from './store'
import '../styles/databackup.css'

const when = (t: number) => (t ? new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '')

/**
 * "Your data": save a backup file and restore one. A phone deletes an installed web app's storage together with
 * the app, so this file, kept in Files or iCloud, is what lets analysis survive deleting and re-adding the app.
 */
export function DataBackup({ data, onRestored }: { data: PlayerProfileData; onRestored: (next: PlayerProfileData) => void }) {
  const [backedUpAt, setBackedUpAt] = useState(lastBackupAt)
  const [message, setMessage] = useState('')
  const [problem, setProblem] = useState('')
  const [pending, setPending] = useState<{ backup: Backup; summary: BackupSummary } | null>(null)
  const input = useRef<HTMLInputElement>(null)
  const unsaved = needsBackup(data, backedUpAt)

  async function save() {
    setProblem(''); setMessage('')
    try {
      const outcome = await saveBackupFile(createBackup())
      if (outcome === 'cancelled') return
      const now = Date.now()
      markBackedUp(now); setBackedUpAt(now)
      setMessage(outcome === 'shared' ? 'Backup ready. Keep the file in Files or iCloud Drive.' : 'Backup downloaded. Keep the file somewhere safe.')
    } catch { setProblem('The backup could not be saved. Try again.') }
  }

  async function choose(file: File | undefined) {
    setProblem(''); setMessage(''); setPending(null)
    if (input.current) input.current.value = ''             // lets the same file be chosen twice
    if (!file) return
    if (file.size > MAX_BACKUP_BYTES) { setProblem('That file is too large to be a Woodland Chess backup.'); return }
    try {
      const result = parseBackup(await file.text())
      if (!result.ok) { setProblem(result.reason); return }
      setPending({ backup: result.backup, summary: result.summary })
    } catch { setProblem('That file could not be read.') }
  }

  function restore() {
    if (!pending) return
    const r = applyBackup(pending.backup)
    onRestored(r.profile)
    setPending(null)
    const parts = [`${r.addedGames} ${r.addedGames === 1 ? 'game' : 'games'}`, `${r.addedReviews} ${r.addedReviews === 1 ? 'review' : 'reviews'}`]
    setMessage(`Restored ${parts.join(' and ')}.${r.puzzlesRestored ? ' Puzzle progress is back too.' : ''}`)
  }

  return (
    <section className="profile-section databackup" aria-labelledby="databackup-title">
      <div className="profile-section-head"><h3 id="databackup-title">Your data</h3><span>{backedUpAt ? `saved ${when(backedUpAt)}` : 'not saved yet'}</span></div>
      <p className="profile-note">
        Everything here lives only on this device. Deleting the app from your home screen deletes it too, and no website can prevent that.
        Save a backup file to Files or iCloud Drive, and restore it after you add the app again.
      </p>
      {unsaved && <p className="databackup-nudge" role="status">You have analysis that is not in a backup yet.</p>}
      <div className="confirm-actions">
        <button type="button" className="confirm-btn" onClick={save}>Save backup</button>
        <button type="button" className="confirm-btn" onClick={() => input.current?.click()}>Restore backup</button>
        <input ref={input} type="file" accept="application/json,.json" hidden onChange={e => void choose(e.target.files?.[0])} />
      </div>

      {pending && (
        <div className="databackup-confirm" role="alertdialog" aria-label="Restore this backup">
          <p>
            Backup from <strong>{when(pending.summary.createdAt) || 'an unknown date'}</strong>:
            {' '}{pending.summary.games} games, {pending.summary.reviews} analyzed{pending.summary.puzzles ? ', with puzzle progress' : ''}.
            It is added to what is already here, so nothing is lost.
          </p>
          <div className="confirm-actions">
            <button type="button" className="confirm-btn" onClick={() => setPending(null)}>Cancel</button>
            <button type="button" className="confirm-btn confirm-btn--primary" onClick={restore}>Restore</button>
          </div>
        </div>
      )}
      {message && <p className="databackup-ok" role="status">{message}</p>}
      {problem && <p className="profile-error" role="alert">{problem}</p>}
    </section>
  )
}
