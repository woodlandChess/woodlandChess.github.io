import type { SVGProps } from 'react'

/**
 * Game-mode icon set for the home screen.
 * One family: 24px grid, 1.2 stroke, round caps/joins, currentColor —
 * the same construction as the puzzle icon set so every mode reads as a
 * sibling. Colour is inherited from the surrounding control.
 */
const base: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
}

/** Computer — an engine chip. */
export function IconComputer(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="6.5" y="6.5" width="11" height="11" rx="1" />
      <rect x="10" y="10" width="4" height="4" rx="0.5" />
      <path d="M9.5 3.5v3M14.5 3.5v3M9.5 17.5v3M14.5 17.5v3M3.5 9.5h3M3.5 14.5h3M17.5 9.5h3M17.5 14.5h3" />
    </svg>
  )
}

/** Play online — a globe. */
export function IconOnline(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.4 2.5 3.6 5.3 3.6 8.5s-1.2 6-3.6 8.5c-2.4-2.5-3.6-5.3-3.6-8.5S9.6 6 12 3.5z" />
    </svg>
  )
}

/** Puzzles — a rook (replaces the old ♜ text glyph). */
export function IconPuzzle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M7 4.5h2v2h2v-2h2v2h2v-2h2v5l-2 1.5v5l2 2.5v1H7v-1l2-2.5v-5L7 9.5v-5z" />
      <path d="M9 11h6" />
    </svg>
  )
}
