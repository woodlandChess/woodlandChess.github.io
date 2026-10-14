import type { SVGProps } from 'react';

export function IconKey(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="7" cy="12" r="3.5" />
      <path d="M10 12h11" />
      <path d="M17.5 12v3" />
      <path d="M20.5 12v3" />
    </svg>
  );
}
