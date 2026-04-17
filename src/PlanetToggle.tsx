import './PlanetToggle.css'
import { PLANET_NAMES, type PlanetName } from './solarSystem'

type Props = {
  lockedPlanet: PlanetName | null
  onLockPlanet: (planet: PlanetName | null) => void
}

export default function PlanetToggle({ lockedPlanet, onLockPlanet }: Props) {
  return (
    <div className={`planet-widget${lockedPlanet ? ' planet-widget--locked' : ''}`}>
      <div className="planet-header">
        <span className="planet-label">Planet View</span>
        {lockedPlanet && <span className="planet-lock-badge">Locked</span>}
      </div>

      <div className="planet-grid">
        {PLANET_NAMES.map((planet) => (
          <button
            key={planet}
            className={`planet-button${lockedPlanet === planet ? ' planet-button--active' : ''}`}
            onClick={() => onLockPlanet(lockedPlanet === planet ? null : planet)}
            title={`Lock view to ${planet}`}
            aria-pressed={lockedPlanet === planet}
          >
            {planet}
          </button>
        ))}
      </div>
    </div>
  )
}
