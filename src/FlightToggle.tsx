import './FlightToggle.css'

type Props = {
  enabled: boolean
  onToggle: (v: boolean) => void
}

export default function FlightToggle({ enabled, onToggle }: Props) {
  return (
    <div className={`flight-widget${enabled ? ' flight-widget--on' : ''}`}>
      <label className="flight-row">
        <span className="flight-label-group">
          <span className="flight-label">Air Traffic</span>
          {enabled && <span className="flight-live-badge"><span className="flight-live-dot" />Live</span>}
        </span>
        <button
          role="switch"
          aria-checked={enabled}
          className="flight-switch"
          onClick={() => onToggle(!enabled)}
          aria-label="Toggle live air traffic overlay"
        >
          <span className="flight-thumb" />
        </button>
      </label>

      <div className="flight-legend" aria-hidden={!enabled}>
        <div className="flight-legend-row">
          <span className="flight-legend-arc" />
          <span className="flight-legend-text">Active flight routes</span>
        </div>
        <div className="flight-legend-row">
          <span className="flight-legend-ring" />
          <span className="flight-legend-text">Major airports</span>
        </div>
      </div>
    </div>
  )
}
