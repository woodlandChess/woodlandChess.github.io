import type { ReactElement } from 'react';
import type { Achievement } from '../types/chess';
import { IconCrown, IconDroplet, IconFlame, IconHourglass, IconScroll, IconSeal } from './icons';

const ICONS: Record<string, ReactElement> = {
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

export function AchievementToastStack({ achievements }: AchievementToastProps) {
  if (achievements.length === 0) return null;
  return (
    <>
      {achievements.map((achievement) => (
        <div className="achievement-toast" key={achievement.id} role="status">
          <div className="achievement-toast-icon">{ICONS[achievement.icon]}</div>
          <div>
            <div className="achievement-toast-title">{achievement.title}</div>
            <div className="achievement-toast-desc">{achievement.description}</div>
          </div>
        </div>
      ))}
    </>
  );
}
