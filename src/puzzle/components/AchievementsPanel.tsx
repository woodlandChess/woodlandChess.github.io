import { useEffect, useRef, useState } from 'react';
import { ACHIEVEMENTS } from '../core/AchievementService';
import { storageService } from '../core/StorageService';
import { ACHIEVEMENT_ICONS } from './AchievementToast';

const TIER_LABEL = { bronze: 'Bronze', silver: 'Silver', gold: 'Gold' } as const;

function AchievementsDialog({ unlocked, onClose }: { unlocked: Set<string>; onClose: () => void }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus({ preventScroll: true });
    return () => { document.body.style.overflow = overflow; previous?.focus?.({ preventScroll: true }); };
  }, []);
  return (
    <div className="ach-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <section
        ref={ref} tabIndex={-1} className="ach-dialog" role="dialog" aria-modal="true" aria-labelledby="ach-title"
        onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } }}
      >
        <header className="ach-dialog-head">
          <div>
            <span className="setup-kicker">Puzzles</span>
            <h2 id="ach-title">Achievements</h2>
          </div>
          <span className="ach-count">{unlocked.size} / {ACHIEVEMENTS.length}</span>
          <button type="button" className="ach-close" onClick={onClose} aria-label="Close achievements">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </header>
        <ul className="ach-list">
          {ACHIEVEMENTS.map(a => {
            const got = unlocked.has(a.id);
            return (
              <li key={a.id} className={`ach-item tier-${a.tier}${got ? ' is-unlocked' : ''}`}>
                <span className="ach-icon" aria-hidden="true">{ACHIEVEMENT_ICONS[a.icon]}</span>
                <span className="ach-text">
                  <strong>{a.title}</strong>
                  <span>{a.description}</span>
                </span>
                <span className="ach-state">{got ? TIER_LABEL[a.tier] : 'Locked'}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

/** Home-screen strip: your six badges at a glance; tap for the full list. */
export function AchievementsPanel() {
  const [open, setOpen] = useState(false);
  const unlocked = new Set(storageService.load().unlockedAchievements);
  return (
    <>
      <button type="button" className="ach-strip" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <span className="ach-strip-head">
          <span className="ach-strip-title">Achievements</span>
          <span className="ach-strip-count">{unlocked.size} / {ACHIEVEMENTS.length}</span>
        </span>
        <span className="ach-strip-badges" aria-hidden="true">
          {ACHIEVEMENTS.map(a => (
            <span key={a.id} className={`ach-badge tier-${a.tier}${unlocked.has(a.id) ? ' is-unlocked' : ''}`}>{ACHIEVEMENT_ICONS[a.icon]}</span>
          ))}
        </span>
      </button>
      {open && <AchievementsDialog unlocked={unlocked} onClose={() => setOpen(false)} />}
    </>
  );
}
