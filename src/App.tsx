import { useState } from 'react'
import GlobeView from './GlobeView'
import NewsPanel from './NewsPanel'
import FlightToggle from './FlightToggle'
import DensityToggle from './DensityToggle'
import PlanetToggle from './PlanetToggle'
import type { SelectedCountry } from './types'
import type { PlanetName } from './solarSystem'

export default function App() {
  const [selected, setSelected] = useState<SelectedCountry | null>(null)
  const [showFlights, setShowFlights] = useState(false)
  const [showDensity, setShowDensity] = useState(false)
  const [lockedPlanet, setLockedPlanet] = useState<PlanetName | null>(null)

  const panelOpen = selected !== null

  return (
    <>
      <GlobeView
        onCountryClick={setSelected}
        showDensity={showDensity}
        showFlights={showFlights}
        lockedPlanet={lockedPlanet}
      />
      {selected && <NewsPanel country={selected} onClose={() => setSelected(null)} />}

      <div className={`controls-panel${panelOpen ? ' controls-panel--shifted' : ''}`}>
        <FlightToggle enabled={showFlights} onToggle={setShowFlights} />
        <DensityToggle enabled={showDensity} onToggle={setShowDensity} />
        <PlanetToggle lockedPlanet={lockedPlanet} onLockPlanet={setLockedPlanet} />
      </div>
    </>
  )
}
