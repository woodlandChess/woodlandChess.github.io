import { useEffect, useState, type ReactElement } from 'react';
import type { Achievement } from '../types/chess';
import { IconCrown, IconDroplet, IconFlame, IconHourglass, IconScroll, IconSeal } from './icons';

export const ACHIEVEMENT_ICONS: Record<string, ReactElement> = {
  crown: <IconCrown />,
  droplet: <IconDroplet />,
  flame: <IconFlame />,
  hourglass: <IconHourglass />,
  scroll: <IconScroll />,
  seal: <IconSeal />,
};

interface AchievementToastProps {
  achievements: Achievement[];
}

const VISIBLE_MS = 6000;

/** Unlock banners: pinned under the header, centred, and gone after a few seconds (or on tap). */
export function AchievementToastStack({ achievements }: AchievementToastProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const key = achievements.map(a => a.id).join('|');

  useEffect(() => {
    if (!key) return;
    const timer = window.setTimeout(() => setDismissed(prev => new Set([...prev, ...key.split('|')])), VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [key]);

  const shown = achievements.filter(a => !dismissed.has(a.id));
  if (shown.length === 0) return null;
  return (
    <div className="achievement-stack" role="status" aria-live="polite">
      {shown.map((achievement) => (
        <button
          type="button"
          className={`achievement-toast tier-${achievement.tier}`}
          key={achievement.id}
          aria-label={`Achievement unlocked: ${achievement.title}. Dismiss`}
          onClick={() => setDismissed(prev => new Set([...prev, achievement.id]))}
        >
          <span className="achievement-toast-icon" aria-hidden="true">{ACHIEVEMENT_ICONS[achievement.icon]}</span>
          <span className="achievement-toast-text">
            <span className="achievement-toast-kicker">Achievement unlocked</span>
            <span className="achievement-toast-title">{achievement.title}</span>
            <span className="achievement-toast-desc">{achievement.description}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
