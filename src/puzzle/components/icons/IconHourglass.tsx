import type { SVGProps } from 'react';

export function IconHourglass(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 3h12" />
      <path d="M6 21h12" />
      <path d="M7 3c0 4 3.2 6 5 8-1.8 2-5 4-5 8" />
      <path d="M17 3c0 4-3.2 6-5 8 1.8 2 5 4 5 8" />
    </svg>
  );
}
