import { useState } from 'react'
import GlobeView from './GlobeView'
import NewsPanel from './NewsPanel'
import type { SelectedCountry } from './types'

export default function App() {
  const [selected, setSelected] = useState<SelectedCountry | null>(null)

  return (
    <>
      <GlobeView onCountryClick={setSelected} />
      {selected && <NewsPanel country={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
