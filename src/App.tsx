import { useState } from 'react'
import GlobeView from './GlobeView'
import NewsPanel from './NewsPanel'
import FlightToggle from './FlightToggle'
import DensityToggle from './DensityToggle'
import PlanetToggle from './PlanetToggle'
import TopicNewsSearch from './TopicNewsSearch'
import type { SelectedCountry } from './types'
import type { PlanetName } from './solarSystem'

type CountrySearchRequest = {
  token: number
  query: string
}

type CountrySearchStatus =
  | { kind: 'idle' }
  | { kind: 'searching'; query: string }
  | { kind: 'found'; name: string }
  | { kind: 'not-found'; query: string }

export default function App() {
  const [selected, setSelected] = useState<SelectedCountry | null>(null)
  const [showFlights, setShowFlights] = useState(false)
  const [showDensity, setShowDensity] = useState(false)
  const [lockedPlanet, setLockedPlanet] = useState<PlanetName | null>(null)
  const [searchRequest, setSearchRequest] = useState<CountrySearchRequest | null>(null)
  const [searchStatus, setSearchStatus] = useState<CountrySearchStatus>({ kind: 'idle' })

  function handleCountrySearch(query: string) {
    setSearchStatus({ kind: 'searching', query })
    setSearchRequest((prev) => ({
      token: (prev?.token ?? 0) + 1,
      query,
    }))
  }

  const panelOpen = selected !== null

  return (
    <>
      <TopicNewsSearch onSearchCountry={handleCountrySearch} searchStatus={searchStatus} />
      <GlobeView
        onCountryClick={setSelected}
        showDensity={showDensity}
        showFlights={showFlights}
        lockedPlanet={lockedPlanet}
        searchRequest={searchRequest}
        onSearchResolved={setSearchStatus}
      />

      <div className={`controls-panel${panelOpen ? ' controls-panel--shifted' : ''}`}>
        <FlightToggle enabled={showFlights} onToggle={setShowFlights} />
        <DensityToggle enabled={showDensity} onToggle={setShowDensity} />
        <PlanetToggle lockedPlanet={lockedPlanet} onLockPlanet={setLockedPlanet} />
      </div>

      <div
        className="app-hint"
        data-hidden={selected ? 'true' : 'false'}
        aria-hidden={!!selected}
      >
        <div className="app-hint-icon" aria-hidden>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
          </svg>
        </div>
        <div className="app-hint-text">
          <strong>Pick a country</strong>
          <span>Click land on the globe for headlines. Drag to rotate, scroll to zoom.</span>
        </div>
      </div>

      {selected && (
        <>
          <button
            type="button"
            className="panel-backdrop"
            onClick={() => setSelected(null)}
            aria-label="Close news panel"
          />
          <NewsPanel country={selected} onClose={() => setSelected(null)} />
        </>
      )}
    </>
  )
}
