/**
 * Brand knight as inline vector art (cburnett knight, CC BY-SA 3.0).
 * Replaces the old text glyph, whose width and shape depended on whichever
 * fallback font a phone picked. Fixed viewBox plus fixed CSS size means it
 * can never be squeezed or substituted.
 */
export function BrandMark({ className = 'brand-mark' }: { className?: string }) {
  return (
    <svg className={className} viewBox="4 5 36 36" width="24" height="24" aria-hidden="true" focusable="false" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10C32.5 11 38.5 18 38 39L15 39C15 30 25 32.5 23 18" fill="currentColor"/><path d="M24 18C24.38 20.91 18.45 25.37 16 27C13 29 13.18 31.34 11 31C9.958 30.06 12.41 27.96 11 28C10 28 11.19 29.23 10 30C9 30 5.997 31 6 26C6 24 12 14 12 14C12 14 13.89 12.1 14 10.5C13.27 9.506 13.5 8.5 13.5 7.5C14.5 6.5 16.5 10 16.5 10L18.5 10C18.5 10 19.28 8.008 21 7C22 7 22 10 22 10" fill="currentColor"/><path d="M9.5 25.5A.5.5 0 1 1 8.5 25.5A.5.5 0 1 1 9.5 25.5z" fill="#08090b" stroke="#08090b"/><path d="M15 15.5A.5 1.5 0 1 1 14 15.5A.5 1.5 0 1 1 15 15.5z" transform="matrix(.866 .5 -.5 .866 9.693 -5.173)" fill="#08090b" stroke="#08090b"/>
    </svg>
  )
}
