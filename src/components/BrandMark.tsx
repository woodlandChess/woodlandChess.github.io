/**
 * Brand mark: a trident, drawn as inline vector art on a 48 unit grid.
 * A central spear and two curved prongs meet on one shaft. Fixed viewBox plus
 * fixed CSS size means it can never be squeezed or substituted by a font.
 * Keep it in sync with public/icon.svg, which is the same drawing on a dark tile.
 */
export function BrandMark({ className = 'brand-mark' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" width="24" height="24" aria-hidden="true" focusable="false"
      fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      {/* shaft and collar */}
      <path d="M24 12V44.5M19.5 37h9" />
      {/* side prongs, joined in one curve */}
      <path d="M10 10v8.5C10 27 16.5 31 24 31s14-4 14-12.5V10" />
      {/* spear heads */}
      <path d="M24 2.5 29.5 12 24 9.8 18.5 12z" fill="currentColor" />
      <path d="M10 3.5 13.4 10 10 8.6 6.6 10z" fill="currentColor" />
      <path d="M38 3.5 41.4 10 38 8.6 34.6 10z" fill="currentColor" />
    </svg>
  )
}
