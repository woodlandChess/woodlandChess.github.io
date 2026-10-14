import type { SVGProps } from 'react';

export function IconScroll(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 4h11a2 2 0 0 1 2 2v13a1.5 1.5 0 0 1-3 0V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h9" />
      <path d="M6 8v9a2 2 0 0 0 2 2h9" />
    </svg>
  );
}
