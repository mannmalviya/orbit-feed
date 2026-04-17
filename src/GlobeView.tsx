import { useEffect, useMemo, useRef, useState } from 'react'
import Globe, { type GlobeMethods } from 'react-globe.gl'
import * as THREE from 'three'

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
const DAY_TEXTURE = '//unpkg.com/three-globe/example/img/earth-day.jpg'
const NIGHT_TEXTURE = '//unpkg.com/three-globe/example/img/earth-night.jpg'

const vertexShader = /* glsl */ `
  uniform vec3 sunDirection;
  varying vec2 vUv;
  varying float vSunDot;
  void main() {
    vUv = uv;
    // Compare surface normal in object space with sun direction (also in object space).
    // This keeps the terminator anchored to geography regardless of camera rotation.
    vSunDot = dot(normalize(normal), normalize(sunDirection));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D dayTexture;
  uniform sampler2D nightTexture;
  varying vec2 vUv;
  varying float vSunDot;
  void main() {
    vec4 day   = texture2D(dayTexture,   vUv);
    vec4 night = texture2D(nightTexture, vUv);
    // Soft terminator: fully night below -0.08, fully day above +0.08
    float blend = smoothstep(-0.08, 0.08, vSunDot);
    gl_FragColor = mix(night, day, blend);
  }
`

function getDayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0)
  return Math.floor((d.getTime() - start.getTime()) / 86_400_000)
}

/**
 * Returns the sun direction as a unit vector in three-globe's object space.
 *
 * Coordinate convention (three.js SphereGeometry with equirectangular texture):
 *   (lat=0, lng=0)   → (-1, 0, 0)   [prime meridian on the equator]
 *   (lat=90, lng=any) → (0, 1, 0)   [north pole]
 * The phi offset of +π accounts for the texture starting at lng=-180°.
 */
function getSunDirection(date: Date): THREE.Vector3 {
  const doy = getDayOfYear(date)
  const utcH = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600

  const decl = (-23.45 * Math.PI) / 180 * Math.cos((2 * Math.PI * (doy + 10)) / 365)
  const lngSun = (12 - utcH) * 15 // degrees
  const phi = (lngSun * Math.PI) / 180 + Math.PI // object-space offset
  const theta = Math.PI / 2 - decl // polar angle from Y axis

  return new THREE.Vector3(
    Math.sin(theta) * Math.cos(phi),
    Math.cos(theta),
    Math.sin(theta) * Math.sin(phi),
  ).normalize()
}

function countryName(f: CountryFeature): string {
  const p = f.properties
  return (p.ADMIN as string) ?? p.NAME ?? p.name ?? 'Unknown'
}

export default function GlobeView() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const [countries, setCountries] = useState<CountryFeature[]>([])
  const [hovered, setHovered] = useState<CountryFeature | null>(null)
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight })

  // ── Day/Night shader material ──────────────────────────────────────────────

  const globeMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          dayTexture: { value: null },
          nightTexture: { value: null },
          sunDirection: { value: new THREE.Vector3(1, 0, 0) },
        },
        vertexShader,
        fragmentShader,
      }),
    [],
  )

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load(DAY_TEXTURE, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      globeMaterial.uniforms.dayTexture.value = tex
    })
    loader.load(NIGHT_TEXTURE, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      globeMaterial.uniforms.nightTexture.value = tex
    })
  }, [globeMaterial])

  useEffect(() => {
    const update = () => {
      globeMaterial.uniforms.sunDirection.value = getSunDirection(new Date())
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [globeMaterial])

  // ── Country polygons ───────────────────────────────────────────────────────

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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Globe
      ref={globeRef}
      width={size.w}
      height={size.h}
      backgroundColor="#000010"
      globeMaterial={globeMaterial}
      atmosphereColor="lightskyblue"
      atmosphereAltitude={0.15}
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
