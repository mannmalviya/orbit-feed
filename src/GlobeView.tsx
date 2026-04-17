import { useEffect, useMemo, useRef, useState } from 'react'
import Globe, { type GlobeMethods } from 'react-globe.gl'
import * as THREE from 'three'
import type { SelectedCountry } from './types'
import type { PlanetName } from './solarSystem'
import { densityColor, densityAltitude } from './populationData'
import { AIRPORTS, ROUTES } from './flightData'
import { createSolarSystem, type SolarSystemHandle } from './solarSystem'

type CountryFeature = {
  type: 'Feature'
  properties: Record<string, unknown> & {
    NAME?: string
    name?: string
    ADMIN?: string
    ISO_A2?: string
  }
  geometry: unknown
}

type CountriesGeoJSON = {
  type: 'FeatureCollection'
  features: CountryFeature[]
}

type Props = {
  onCountryClick: (country: SelectedCountry) => void
  showDensity: boolean
  showFlights: boolean
  lockedPlanet: PlanetName | null
}

type ArcDatum = {
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  /** ms for one full dash cycle — varies per route for visual variety */
  animateTime: number
  /** [0,1] offset so dashes start staggered, not all at origin simultaneously */
  initialGap: number
}

type RingDatum = {
  lat: number
  lng: number
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

  const decl = ((-23.45 * Math.PI) / 180) * Math.cos((2 * Math.PI * (doy + 10)) / 365)
  const lngSun = (12 - utcH) * 15
  const phi = (lngSun * Math.PI) / 180 + Math.PI
  const theta = Math.PI / 2 - decl

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

type OrbitControlsLike = {
  autoRotate: boolean
  autoRotateSpeed: number
  maxDistance: number
  minDistance: number
  target: THREE.Vector3
  update(): void
}

// Arc colour: medium cyan → near-white, giving a "comet trail" gradient
const ARC_COLORS: [string, string] = [
  'rgba(80, 210, 255, 0.75)',
  'rgba(220, 245, 255, 0.95)',
]

// Ring colour function: bright cyan fading to transparent as ring expands
const ringColor = () => (t: number) => `rgba(80, 220, 255, ${Math.max(0, 1 - t * 1.4)})`

export default function GlobeView({ onCountryClick, showDensity, showFlights, lockedPlanet }: Props) {
  const globeRef        = useRef<GlobeMethods | undefined>(undefined)
  const cleanupRotate   = useRef<(() => void) | null>(null)
  const solarSystemRef  = useRef<SolarSystemHandle | null>(null)
  const [globeReady, setGlobeReady] = useState(false)
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
    () => (f: object) => {
      const feature = f as CountryFeature
      const iso2 = (feature.properties.ISO_A2 as string | undefined) ?? ''
      if (showDensity) {
        return f === hovered
          ? densityColor(iso2, 1.0)
          : densityColor(iso2, 0.78)
      }
      return f === hovered ? 'rgba(120, 180, 255, 0.6)' : 'rgba(80, 120, 200, 0.25)'
    },
    [hovered, showDensity],
  )

  const polygonAlt = useMemo(
    () => (f: object) => {
      const feature = f as CountryFeature
      const iso2 = (feature.properties.ISO_A2 as string | undefined) ?? ''
      const base = showDensity ? densityAltitude(iso2) : 0.006
      return f === hovered ? base + 0.02 : base
    },
    [hovered, showDensity],
  )

  // ── Flight arcs & airport rings ───────────────────────────────────────────

  const arcObjects = useMemo((): ArcDatum[] => {
    if (!showFlights) return []
    const total = ROUTES.length
    return ROUTES
      .filter(([from, to]) => AIRPORTS[from] && AIRPORTS[to])
      .map(([from, to], i) => ({
        startLat: AIRPORTS[from].lat,
        startLng: AIRPORTS[from].lng,
        endLat:   AIRPORTS[to].lat,
        endLng:   AIRPORTS[to].lng,
        // Spread animation times 3 500–7 000 ms so routes don't all move in sync
        animateTime: 3_500 + (i % 8) * 500,
        // Stagger starting position across [0, 1] so dashes aren't all at origin
        initialGap: i / total,
      }))
  }, [showFlights])

  const ringObjects = useMemo((): RingDatum[] => {
    if (!showFlights) return []
    // One ring per unique airport that appears in at least one active route
    const used = new Set(ROUTES.flat())
    return Object.entries(AIRPORTS)
      .filter(([code]) => used.has(code))
      .map(([, { lat, lng }]) => ({ lat, lng }))
  }, [showFlights])

  // ── Auto-rotate ───────────────────────────────────────────────────────────

  function handleGlobeReady() {
    const controls = globeRef.current?.controls() as OrbitControlsLike | undefined
    const canvas   = globeRef.current?.renderer()?.domElement
    const camera   = globeRef.current?.camera() as THREE.PerspectiveCamera | undefined

    // ── Extend camera frustum for solar system distances ──────────────────
    if (camera) {
      // Neptune geocentric max ≈ 32 AU × 2 348 500 = ~75 M units; far = 100 M is safe
      camera.near = 0.5
      camera.far  = 100_000_000
      camera.updateProjectionMatrix()
    }

    if (controls) {
      controls.autoRotate      = true
      controls.autoRotateSpeed = 0.4
      // Allow zooming from inside Earth's atmosphere to just beyond Neptune's orbit
      controls.minDistance = 101
      controls.maxDistance = 80_000_000
    }

    if (canvas && controls) {
      const pause  = () => { controls.autoRotate = false }
      const resume = () => { controls.autoRotate = true }
      canvas.addEventListener('pointerdown',  pause)
      canvas.addEventListener('pointerup',    resume)
      canvas.addEventListener('pointercancel', resume)
      cleanupRotate.current = () => {
        canvas.removeEventListener('pointerdown',   pause)
        canvas.removeEventListener('pointerup',     resume)
        canvas.removeEventListener('pointercancel', resume)
      }
    }

    setGlobeReady(true)
  }

  useEffect(() => () => cleanupRotate.current?.(), [])

  // ── Solar system ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!globeReady) return
    const scene = globeRef.current?.scene()
    if (!scene) return

    const ss = createSolarSystem(scene)
    solarSystemRef.current = ss

    // Update planet positions once per second (orbital motion is slow but keeps
    // positions accurate across long sessions and day-changes)
    const id = setInterval(() => ss.update(new Date()), 1_000)

    return () => {
      clearInterval(id)
      ss.dispose()
      solarSystemRef.current = null
    }
  }, [globeReady])

  // ── Planet locking ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!lockedPlanet || !globeRef.current || !solarSystemRef.current) return

    const maybeControls = globeRef.current.controls() as OrbitControlsLike | undefined
    const maybeCamera = globeRef.current.camera() as THREE.PerspectiveCamera | undefined

    if (!maybeControls || !maybeCamera) return

    const controls = maybeControls as OrbitControlsLike
    const camera = maybeCamera as THREE.PerspectiveCamera

    function updateCameraForPlanet() {
      const planetPos = solarSystemRef.current!.getPlanetPosition(lockedPlanet!)
      if (!planetPos) return

      // Fixed camera distance that shows the solar system well
      const cameraDistance = 50000 // Far enough to see planets clearly

      // Position camera at a fixed distance from origin, looking toward the planet
      const cameraPos = new THREE.Vector3(0, 0, cameraDistance)
      
      // Look at the planet
      controls.target.copy(planetPos)
      camera.position.copy(cameraPos)
      controls.update()
    }

    // Update camera every frame
    const id = setInterval(updateCameraForPlanet, 16)

    // Disable auto-rotate and re-enable zoom
    const wasAutoRotating = controls.autoRotate
    const wasMinDistance = controls.minDistance
    const wasMaxDistance = controls.maxDistance
    controls.autoRotate = false
    controls.minDistance = 1 // Allow very close zoom
    controls.maxDistance = 100_000_000 // Allow very far zoom

    return () => {
      clearInterval(id)
      controls.autoRotate = wasAutoRotating
      controls.minDistance = wasMinDistance
      controls.maxDistance = wasMaxDistance
    }
  }, [lockedPlanet])

  // ── Reset view when unlocking planet ───────────────────────────────────────
  useEffect(() => {
    if (lockedPlanet !== null || !globeRef.current) return

    const maybeControls = globeRef.current.controls() as OrbitControlsLike | undefined
    const maybeCamera = globeRef.current.camera() as THREE.PerspectiveCamera | undefined

    if (!maybeControls || !maybeCamera) return

    // Reset to Earth-centered view with auto-rotate re-enabled
    const controls = maybeControls as OrbitControlsLike
    const camera = maybeCamera as THREE.PerspectiveCamera
    
    controls.target.set(0, 0, 0)
    camera.position.set(0, 0, 150)
    controls.autoRotate = true
    controls.update()
  }, [lockedPlanet])

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Globe
      ref={globeRef}
      width={size.w}
      height={size.h}
      onGlobeReady={handleGlobeReady}
      backgroundColor="#000010"
      globeMaterial={globeMaterial}
      atmosphereColor="lightskyblue"
      atmosphereAltitude={0.15}
      polygonsData={countries}
      polygonAltitude={polygonAlt}
      polygonCapColor={capColor}
      polygonSideColor={() => 'rgba(0, 80, 180, 0.15)'}
      polygonStrokeColor={() => '#111'}
      polygonLabel={(f: object) => {
        const name = countryName(f as CountryFeature)
        return `<div style="background:#111;padding:4px 8px;border-radius:4px;color:#eee;font-size:12px">${name}</div>`
      }}
      onPolygonHover={(f) => setHovered((f as CountryFeature) ?? null)}
      onPolygonClick={(f) => {
        const feature = f as CountryFeature
        const iso2 = (feature.properties.ISO_A2 as string | undefined) ?? ''
        onCountryClick({ name: countryName(feature), iso2 })
      }}
      // ── Flight arcs ──────────────────────────────────────────────────────
      arcsData={arcObjects}
      arcStartLat={(d) => (d as ArcDatum).startLat}
      arcStartLng={(d) => (d as ArcDatum).startLng}
      arcEndLat={(d)   => (d as ArcDatum).endLat}
      arcEndLng={(d)   => (d as ArcDatum).endLng}
      arcColor={() => ARC_COLORS}
      arcAltitudeAutoScale={0.28}
      arcStroke={0.4}
      arcDashLength={0.28}
      arcDashGap={0.72}
      arcDashInitialGap={(d) => (d as ArcDatum).initialGap}
      arcDashAnimateTime={(d) => (d as ArcDatum).animateTime}
      // ── Airport rings ─────────────────────────────────────────────────────
      ringsData={ringObjects}
      ringLat={(d) => (d as RingDatum).lat}
      ringLng={(d) => (d as RingDatum).lng}
      ringColor={ringColor}
      ringMaxRadius={2.5}
      ringPropagationSpeed={2.5}
      ringRepeatPeriod={900}
    />
  )
}
