import { useState } from 'react'
import GlobeView from './GlobeView'
import NewsPanel from './NewsPanel'
import ControlPanel from './ControlPanel'
import type { SelectedCountry, Controls } from './types'

const DEFAULT_CONTROLS: Controls = {
  autoSpin: true,
  spinSpeed: 0.4,
  showDayNight: true,
  showClouds: false,
}

export default function App() {
  const [selected, setSelected] = useState<SelectedCountry | null>(null)
  const [controls, setControls] = useState<Controls>(DEFAULT_CONTROLS)

  function patchControls(patch: Partial<Controls>) {
    setControls((prev) => ({ ...prev, ...patch }))
  }

  return (
    <>
      <GlobeView onCountryClick={setSelected} controls={controls} />
      <ControlPanel controls={controls} onChange={patchControls} />
      {selected && <NewsPanel country={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
