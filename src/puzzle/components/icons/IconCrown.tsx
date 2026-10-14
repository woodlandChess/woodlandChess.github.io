import type { SVGProps } from 'react';

export function IconCrown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 18h18" />
      <path d="M4 18l-1-9 5 4 4-7 4 7 5-4-1 9" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="3" cy="8" r="1" />
      <circle cx="21" cy="8" r="1" />
    </svg>
  );
}
