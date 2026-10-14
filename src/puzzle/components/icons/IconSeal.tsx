import type { SVGProps } from 'react';

export function IconSeal(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="9" r="5.5" />
      <path d="M9 13.5 7.5 21l4.5-2.4 4.5 2.4-1.5-7.5" />
    </svg>
  );
}
