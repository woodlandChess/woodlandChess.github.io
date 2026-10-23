/**
 * Small controls shared by the menu screens (Computer setup, My style).
 * Kept in one place so every screen uses the same markup and the same CSS.
 */

/** A labelled 0-10 bar in the school colours (Attack / Focus / Defend). */
export function WeightBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="weight-bar-row">
      <span className="weight-label">{label}</span>
      <div className="weight-track">
        <div className="weight-fill" style={{ width: `${Math.max(0, Math.min(10, value)) * 10}%`, background: color }} />
      </div>
      <span className="weight-value">{value}</span>
    </div>
  )
}

export type SegOption<T extends string> = { value: T; label: string; swatch?: 'w' | 'b' | 'r' }

/** Segmented control (native radios: free arrow-key + screen-reader support). */
export function Segmented<T extends string>({ legend, name, value, options, onChange, disabled }: {
  legend: string; name: string; value: T; options: SegOption<T>[]
  onChange: (v: T) => void; disabled?: boolean
}) {
  return (
    <fieldset className="field" disabled={disabled}>
      <legend className="field-label">{legend}</legend>
      <div className="seg" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map(o => (
          <label key={o.value} className="seg-opt">
            <input type="radio" name={name} value={o.value} checked={o.value === value}
              onChange={() => onChange(o.value)} />
            <span className="seg-face">
              {o.swatch && <i className={`seg-swatch seg-swatch--${o.swatch}`} aria-hidden="true" />}
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
