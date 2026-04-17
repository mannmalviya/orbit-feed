import { useEffect, useMemo, useRef, useState } from 'react'
import Globe, { type GlobeMethods } from 'react-globe.gl'

type CountryFeature = {
  type: 'Feature'
  properties: Record<string, unknown> & { NAME?: string; name?: string; ADMIN?: string }
  geometry: unknown
}

type CountriesGeoJSON = {
  type: 'FeatureCollection'
  features: CountryFeature[]
}

const COUNTRIES_URL =
  'https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson'

function countryName(f: CountryFeature): string {
  const p = f.properties
  return (p.ADMIN as string) ?? p.NAME ?? p.name ?? 'Unknown'
}

export default function GlobeView() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const [countries, setCountries] = useState<CountryFeature[]>([])
  const [hovered, setHovered] = useState<CountryFeature | null>(null)
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight })

  useEffect(() => {
    let cancelled = false
    fetch(COUNTRIES_URL)
      .then((r) => r.json() as Promise<CountriesGeoJSON>)
      .then((geo) => {
        if (!cancelled) setCountries(geo.features)
      })
      .catch((err) => console.error('Failed to load country polygons', err))
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const capColor = useMemo(
    () => (f: object) =>
      f === hovered ? 'rgba(120, 180, 255, 0.6)' : 'rgba(80, 120, 200, 0.25)',
    [hovered],
  )

  return (
    <Globe
      ref={globeRef}
      width={size.w}
      height={size.h}
      backgroundColor="#000010"
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
      polygonsData={countries}
      polygonAltitude={(f: object) => (f === hovered ? 0.02 : 0.006)}
      polygonCapColor={capColor}
      polygonSideColor={() => 'rgba(0, 80, 180, 0.15)'}
      polygonStrokeColor={() => '#111'}
      polygonLabel={(f: object) => {
        const name = countryName(f as CountryFeature)
        return `<div style="background:#111;padding:4px 8px;border-radius:4px;color:#eee;font-size:12px">${name}</div>`
      }}
      onPolygonHover={(f) => setHovered((f as CountryFeature) ?? null)}
      onPolygonClick={(f) => {
        const name = countryName(f as CountryFeature)
        console.log('Clicked country:', name)
      }}
    />
  )
}
