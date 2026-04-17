import './DensityToggle.css'

type Props = {
  enabled: boolean
  onToggle: (v: boolean) => void
}

export default function DensityToggle({ enabled, onToggle }: Props) {
  return (
    <div className={`density-widget${enabled ? ' density-widget--on' : ''}`}>
      <label className="density-row">
        <span className="density-label">Population Density</span>
        <button
          role="switch"
          aria-checked={enabled}
          className="density-switch"
          onClick={() => onToggle(!enabled)}
          aria-label="Toggle population density overlay"
        >
          <span className="density-thumb" />
        </button>
      </label>

      <div className="density-legend" aria-hidden={!enabled}>
        <div className="density-legend-bar" />
        <div className="density-legend-endpoints">
          <span>sparse</span>
          <span>dense</span>
        </div>
        <div className="density-legend-values">
          <span>1 /km²</span>
          <span>100</span>
          <span>10 000+</span>
        </div>
      </div>
    </div>
  )
}
