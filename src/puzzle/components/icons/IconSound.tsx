import type { SVGProps } from 'react';

interface IconSoundProps extends SVGProps<SVGSVGElement> {
  muted?: boolean;
}

export function IconSound({ muted, ...props }: IconSoundProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 10v4h3.5L12 17.5v-11L7.5 10H4z" />
      {muted ? (
        <path d="M16 9l4.5 6M20.5 9 16 15" />
      ) : (
        <path d="M15.5 9a4 4 0 0 1 0 6M18 7a7.5 7.5 0 0 1 0 10" />
      )}
    </svg>
  );
}
