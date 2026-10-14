import type { SVGProps } from 'react';

export function IconDroplet(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3c3.2 4.1 6 7.7 6 11a6 6 0 1 1-12 0c0-3.3 2.8-6.9 6-11z" />
      <path d="M9.5 15.2a2.5 2.5 0 0 0 2.3 2.3" opacity="0.6" />
    </svg>
  );
}
