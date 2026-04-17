/**
 * Solar system scene layer.
 *
 * Scale: 1 three.js unit = 63.71 km  →  Earth radius = 100 units (matches the globe).
 * All heliocentric distances are therefore:
 *   1 AU = 149 600 000 km / 63.71 = 2 348 500 units
 *
 * Planet radii are exaggerated 5–25× so they're visible at interplanetary distances.
 * Everything is placed in an ecliptic-tilted THREE.Group whose origin coincides with
 * Earth's centre (scene origin), so the existing globe requires no changes.
 */

import * as THREE from 'three'

// ── Constants ──────────────────────────────────────────────────────────────────

export const EARTH_RADIUS_UNITS = 100     // must match three-globe's default globe radius
export const KM_PER_UNIT        = 6_371 / EARTH_RADIUS_UNITS   // 63.71 km / unit
export const AU_UNITS            = 149_600_000 / KM_PER_UNIT    // ≈ 2 348 500 units/AU

const DEG = Math.PI / 180
const ECLIPTIC_TILT = 23.436 * DEG   // tilt of ecliptic vs. Earth's equatorial plane

// ── Orbital elements (simplified circular orbits) ──────────────────────────────
// L0 = mean longitude at J2000 (deg), period = sidereal period (days)

type BodyDef = {
  name: string
  a: number          // semi-major axis, AU
  period: number     // days
  L0: number         // mean longitude at J2000, deg
  displayR: number   // scene-space radius (exaggerated for visibility)
  color: number      // hex
  emissiveFactor: number
  rings?: { inner: number; outer: number; color: number; opacity: number }
}

const BODIES: BodyDef[] = [
  {
    name: 'Mercury', a: 0.387, period: 87.969,   L0: 252.25,
    displayR: 120,  color: 0xa0a0a0, emissiveFactor: 0.1,
  },
  {
    name: 'Venus',   a: 0.723, period: 224.701,  L0: 181.98,
    displayR: 220,  color: 0xe8d080, emissiveFactor: 0.12,
  },
  {
    name: 'Mars',    a: 1.524, period: 686.971,  L0: 355.43,
    displayR: 170,  color: 0xbb3808, emissiveFactor: 0.12,
  },
  {
    name: 'Jupiter', a: 5.204, period: 4331.57,  L0:  34.40,
    displayR: 1400, color: 0xc8904a, emissiveFactor: 0.1,
  },
  {
    name: 'Saturn',  a: 9.582, period: 10759.22, L0:  50.08,
    displayR: 1180, color: 0xead890, emissiveFactor: 0.1,
    rings: { inner: 1500, outer: 2700, color: 0xd4b86a, opacity: 0.55 },
  },
  {
    name: 'Uranus',  a: 19.22, period: 30688.5,  L0: 314.06,
    displayR: 600,  color: 0x72d8e0, emissiveFactor: 0.1,
  },
  {
    name: 'Neptune', a: 30.05, period: 60195.0,  L0: 304.35,
    displayR: 570,  color: 0x3d60cc, emissiveFactor: 0.1,
  },
]

// Earth orbital elements (needed to convert heliocentric → geocentric)
const EARTH_A   = 1.000
const EARTH_T   = 365.256
const EARTH_L0  = 100.464

// Moon
const MOON_L0     = 218.316   // mean longitude at J2000, deg
const MOON_PERIOD = 27.321    // days
// True mean distance = 384 400 km → 6 034 units.
// That puts the Moon clearly outside the 100-unit globe AND inside the inner planets.
const MOON_DIST   = 6_034     // units  ← true to scale
const MOON_R      = 50        // exaggerated (true ≈ 27 units) for visibility

// Sun display radius (true = 109 × Earth = 10 900 units; we use a bit less for aesthetics)
const SUN_R       = 8_000

// ── Utility ────────────────────────────────────────────────────────────────────

/** Days elapsed since J2000.0 = 2000-01-01 12:00 UTC */
function daysJ2000(date: Date): number {
  return (date.getTime() - 946_728_000_000) / 86_400_000
}

/** Mean longitude at date, returned in [0, 360) */
function meanL(L0: number, period: number, d: number): number {
  return ((L0 + (360 / period) * d) % 360 + 360) % 360
}

/** Heliocentric ecliptic position [x, z] in scene units (y = 0 in ecliptic plane) */
function helioXZ(a: number, L_deg: number): [number, number] {
  const θ = L_deg * DEG
  return [a * AU_UNITS * Math.cos(θ), a * AU_UNITS * Math.sin(θ)]
}

// ── Scene construction helpers ─────────────────────────────────────────────────

function makeOrbitLine(a_AU: number): THREE.Line {
  const N = 360
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= N; i++) {
    const θ = (i / N) * Math.PI * 2
    pts.push(new THREE.Vector3(a_AU * AU_UNITS * Math.cos(θ), 0, a_AU * AU_UNITS * Math.sin(θ)))
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts)
  const mat = new THREE.LineBasicMaterial({ color: 0x1a2a3a, transparent: true, opacity: 0.35 })
  return new THREE.Line(geo, mat)
}

function makeMoonOrbitLine(): THREE.Line {
  const N = 128
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= N; i++) {
    const θ = (i / N) * Math.PI * 2
    pts.push(new THREE.Vector3(MOON_DIST * Math.cos(θ), 0, MOON_DIST * Math.sin(θ)))
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts)
  const mat = new THREE.LineBasicMaterial({ color: 0x1a2a3a, transparent: true, opacity: 0.25 })
  return new THREE.Line(geo, mat)
}

function makeSunGlowSprite(): THREE.Sprite {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size; canvas.height = size
  const ctx = canvas.getContext('2d')!
  const cx = size / 2
  const g = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx)
  g.addColorStop(0.00, 'rgba(255, 252, 200, 1.0)')
  g.addColorStop(0.08, 'rgba(255, 230, 100, 0.9)')
  g.addColorStop(0.25, 'rgba(255, 160,  30, 0.5)')
  g.addColorStop(0.55, 'rgba(255, 100,   0, 0.15)')
  g.addColorStop(1.00, 'rgba(255,  80,   0, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  const mat = new THREE.SpriteMaterial({
    map: tex,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
  })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.set(SUN_R * 5.5, SUN_R * 5.5, 1)
  return sprite
}

function makeStarfield(): THREE.Points {
  const N = 3_000
  const pos = new Float32Array(N * 3)
  // Distribute on a sphere at ~1.6 AU radius so stars are always "behind" planets
  const R = AU_UNITS * 1.6
  for (let i = 0; i < N; i++) {
    const θ = Math.random() * Math.PI * 2
    const φ = Math.acos(2 * Math.random() - 1)
    pos[i * 3]     = R * Math.sin(φ) * Math.cos(θ)
    pos[i * 3 + 1] = R * Math.sin(φ) * Math.sin(θ)
    pos[i * 3 + 2] = R * Math.cos(φ)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1,
    sizeAttenuation: false,
    transparent: true,
    opacity: 0.85,
  })
  return new THREE.Points(geo, mat)
}

// ── Public API ─────────────────────────────────────────────────────────────────

export type SolarSystemHandle = {
  update: (date: Date) => void
  dispose: () => void
  getPlanetPosition: (planetName: string) => THREE.Vector3 | null
}

export const PLANET_NAMES = BODIES.map(b => b.name)
export type PlanetName = typeof BODIES[number]['name']

export function createSolarSystem(scene: THREE.Scene): SolarSystemHandle {
  // Tilted group — all orbits live in the ecliptic plane (XZ of this group)
  const root = new THREE.Group()
  root.rotation.x = -ECLIPTIC_TILT
  scene.add(root)

  // Starfield sits in root so it tilts with everything
  root.add(makeStarfield())

  // Subtle ambient so planet night-sides aren't fully black
  root.add(new THREE.AmbientLight(0xffffff, 0.06))

  // ── Sun ──────────────────────────────────────────────────────────────────
  const sunMesh = new THREE.Mesh(
    new THREE.SphereGeometry(SUN_R, 40, 40),
    new THREE.MeshBasicMaterial({ color: 0xffee99 }),
  )
  root.add(sunMesh)
  sunMesh.add(makeSunGlowSprite())

  // Point light emanates from sun; distance=0 means infinite range, decay=0.8
  const sunLight = new THREE.PointLight(0xfff5e0, 3.0, 0, 0.8)
  sunMesh.add(sunLight)

  // ── Orbit lines ──────────────────────────────────────────────────────────
  BODIES.forEach(b => root.add(makeOrbitLine(b.a)))
  root.add(makeMoonOrbitLine())

  // ── Planet meshes ─────────────────────────────────────────────────────────
  const planetMeshes = BODIES.map(b => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(b.displayR, 32, 32),
      new THREE.MeshPhongMaterial({
        color: b.color,
        emissive: b.color,
        emissiveIntensity: b.emissiveFactor * 2, // Make brighter
        shininess: 15,
      }),
    )
    if (b.rings) {
      const rGeo = new THREE.RingGeometry(b.rings.inner, b.rings.outer, 128)
      // RingGeometry faces up (+Y); rotate to lie in orbital plane (XZ)
      rGeo.rotateX(Math.PI / 2)
      const rMat = new THREE.MeshBasicMaterial({
        color: b.rings.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: b.rings.opacity,
      })
      mesh.add(new THREE.Mesh(rGeo, rMat))
      // Tilt Saturn's rings ~27° for visual realism
      mesh.rotation.z = 27 * DEG
    }
    root.add(mesh)
    return mesh
  })

  // ── Moon ─────────────────────────────────────────────────────────────────
  const moonMesh = new THREE.Mesh(
    new THREE.SphereGeometry(MOON_R, 20, 20),
    new THREE.MeshPhongMaterial({ color: 0xb0b0b0, emissive: 0x303030, shininess: 5 }),
  )
  root.add(moonMesh)

  // ── Update positions ──────────────────────────────────────────────────────

  function update(date: Date) {
    const d = daysJ2000(date)

    // Earth heliocentric → gives us the geocentric offset for everything
    const earthL = meanL(EARTH_L0, EARTH_T, d)
    const [ex, ez] = helioXZ(EARTH_A, earthL)

    // Sun geocentric = -Earth heliocentric
    sunMesh.position.set(-ex, 0, -ez)

    // Planets
    BODIES.forEach((b, i) => {
      const L = meanL(b.L0, b.period, d)
      const [px, pz] = helioXZ(b.a, L)
      planetMeshes[i].position.set(px - ex, 0, pz - ez)
    })

    // Moon (orbits Earth which is at origin)
    const moonL = meanL(MOON_L0, MOON_PERIOD, d)
    const θ = moonL * DEG
    moonMesh.position.set(MOON_DIST * Math.cos(θ), 0, MOON_DIST * Math.sin(θ))
  }

  update(new Date())

  function dispose() {
    scene.remove(root)
  }

  function getPlanetPosition(planetName: string): THREE.Vector3 | null {
    const idx = BODIES.findIndex(b => b.name === planetName)
    if (idx === -1) return null
    // Get world position (accounts for parent group's rotation)
    const worldPos = new THREE.Vector3()
    planetMeshes[idx].getWorldPosition(worldPos)
    return worldPos
  }

  return { update, dispose, getPlanetPosition }
}
