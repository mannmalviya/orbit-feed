import { useEffect, useMemo, useRef, useState } from 'react'
import Globe, { type GlobeMethods } from 'react-globe.gl'
import * as THREE from 'three'
import type { Controls, SelectedCountry } from './types'

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
  controls: Controls
}

type OrbitControlsLike = { autoRotate: boolean; autoRotateSpeed: number }

const COUNTRIES_URL =
  'https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson'
const DAY_TEXTURE = '//unpkg.com/three-globe/example/img/earth-day.jpg'
const NIGHT_TEXTURE = '//unpkg.com/three-globe/example/img/earth-night.jpg'
const CLOUD_TEXTURE = '//unpkg.com/three-globe/example/img/earth-clouds.jpg'
// Globe radius used internally by three-globe
const GLOBE_RADIUS = 100

const vertexShader = /* glsl */ `
  uniform vec3 sunDirection;
  varying vec2 vUv;
  varying float vSunDot;
  void main() {
    vUv = uv;
    vSunDot = dot(normalize(normal), normalize(sunDirection));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D dayTexture;
  uniform sampler2D nightTexture;
  uniform float dayNightEnabled;
  varying vec2 vUv;
  varying float vSunDot;
  void main() {
    vec4 day   = texture2D(dayTexture,   vUv);
    vec4 night = texture2D(nightTexture, vUv);
    float t = dayNightEnabled > 0.5
      ? smoothstep(-0.08, 0.08, vSunDot)
      : 1.0;
    gl_FragColor = mix(night, day, t);
  }
`

function getDayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0)
  return Math.floor((d.getTime() - start.getTime()) / 86_400_000)
}

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

export default function GlobeView({ onCountryClick, controls }: Props) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const cleanupGlobe = useRef<(() => void) | null>(null)
  const cloudMeshRef = useRef<THREE.Mesh | null>(null)
  // Ref so drag-resume handler always sees current spin preference
  const autoSpinRef = useRef(controls.autoSpin)
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
          dayNightEnabled: { value: 1.0 },
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

  // ── Sync controls → scene ──────────────────────────────────────────────────

  useEffect(() => {
    autoSpinRef.current = controls.autoSpin
    const c = globeRef.current?.controls() as OrbitControlsLike | undefined
    if (c) {
      c.autoRotate = controls.autoSpin
      c.autoRotateSpeed = controls.spinSpeed
    }
  }, [controls.autoSpin, controls.spinSpeed])

  useEffect(() => {
    globeMaterial.uniforms.dayNightEnabled.value = controls.showDayNight ? 1.0 : 0.0
  }, [controls.showDayNight, globeMaterial])

  useEffect(() => {
    if (cloudMeshRef.current) cloudMeshRef.current.visible = controls.showClouds
  }, [controls.showClouds])

  // ── Globe ready: auto-rotate + cloud layer ─────────────────────────────────

  function handleGlobeReady() {
    const orbitControls = globeRef.current?.controls() as OrbitControlsLike | undefined
    const canvas = globeRef.current?.renderer()?.domElement
    const scene = globeRef.current?.scene()
    if (!orbitControls || !canvas || !scene) return

    // Auto-rotate
    orbitControls.autoRotate = controls.autoSpin
    orbitControls.autoRotateSpeed = controls.spinSpeed

    const pause = () => { orbitControls.autoRotate = false }
    const resume = () => { orbitControls.autoRotate = autoSpinRef.current }
    canvas.addEventListener('pointerdown', pause)
    canvas.addEventListener('pointerup', resume)
    canvas.addEventListener('pointercancel', resume)

    // Cloud layer — slightly larger sphere, semi-transparent
    const cloudGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.008, 75, 75)
    const cloudMat = new THREE.MeshPhongMaterial({
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    })
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat)
    cloudMesh.visible = controls.showClouds
    cloudMeshRef.current = cloudMesh
    scene.add(cloudMesh)

    new THREE.TextureLoader().load(CLOUD_TEXTURE, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      cloudMat.map = tex
      cloudMat.needsUpdate = true
    })

    // Animate cloud rotation independently of the globe
    let rafId: number
    const animateClouds = () => {
      cloudMesh.rotation.y += 0.0001
      rafId = requestAnimationFrame(animateClouds)
    }
    rafId = requestAnimationFrame(animateClouds)

    cleanupGlobe.current = () => {
      canvas.removeEventListener('pointerdown', pause)
      canvas.removeEventListener('pointerup', resume)
      canvas.removeEventListener('pointercancel', resume)
      cancelAnimationFrame(rafId)
      scene.remove(cloudMesh)
    }
  }

  useEffect(() => () => cleanupGlobe.current?.(), [])

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
      onGlobeReady={handleGlobeReady}
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
        const feature = f as CountryFeature
        const iso2 = (feature.properties.ISO_A2 as string | undefined) ?? ''
        onCountryClick({ name: countryName(feature), iso2 })
      }}
    />
  )
}
