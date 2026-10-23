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
      <path d="M7.8 4.5H9.4V6.8H11.2V4.5H12.8V6.8H14.6V4.5H16.2V8.6L15.2 9.9V15.5L16.8 17.4V19.5H7.2V17.4L8.8 15.5V9.9L7.8 8.6Z" />
      <path d="M8.8 9.9H15.2M7.2 17.4H16.8" />
    </svg>
  )
}

/** Player profile / style: a pawn, the piece that stands for "the player". */
export function IconProfile(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="7.2" r="2.7" />
      <path d="M9.4 11.6h5.2" />
      <path d="M10.3 11.6c-.1 2.4-.6 4.6-1.7 6.4h6.8c-1.1-1.8-1.6-4-1.7-6.4" />
      <path d="M7.4 18h9.2v2.3H7.4z" />
    </svg>
  )
}

/** Calendar — daily challenge. */
export function IconCalendar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="5.5" width="16" height="14" rx="1" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
      <path d="M9 14.5h2M13 14.5h2" />
    </svg>
  )
}

/** Clock — time controls. */
export function IconClock(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}

/** Shield — privacy / trust. */
export function IconShield(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5l7 2.5v5.5c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6l7-2.5z" />
      <path d="M9 12l2.2 2.2L15.2 10" />
    </svg>
  )
}

/** Sound on / muted — shared with the home screens. */
export function IconVolume({ muted, ...props }: SVGProps<SVGSVGElement> & { muted?: boolean }) {
  return (
    <svg {...base} {...props}>
      <path d="M4 9.5h3l4.5-3.5v12L7 14.5H4v-5z" />
      {muted ? <path d="M15.5 9.5l5 5M20.5 9.5l-5 5" /> : <path d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11" />}
    </svg>
  )
}

/** Bullet — a round, for the fastest games. */
export function IconBullet(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M9 20.5v-9c0-3 1.3-5.6 3-7.5 1.7 1.9 3 4.5 3 7.5v9H9z" />
      <path d="M9 15.5h6" />
    </svg>
  )
}

/** Blitz — a lightning bolt. */
export function IconBlitz(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M13.5 3.5L6.5 13.5H11l-.5 7 7-10H13l.5-7z" />
    </svg>
  )
}

/** Rapid — a stopwatch. */
export function IconRapid(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="13.5" r="7" />
      <path d="M10 3.5h4M12 3.5v3M12 10v3.5l2 1.2M18.2 7.3l1.1-1.1" />
    </svg>
  )
}

/** Classical — a sandglass. */
export function IconClassical(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M7 4h10M7 20h10" />
      <path d="M8 4c0 4 4 5 4 8s-4 4-4 8M16 4c0 4-4 5-4 8s4 4 4 8" />
    </svg>
  )
}
