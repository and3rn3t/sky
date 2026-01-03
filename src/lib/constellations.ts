import { UserLocation } from './types'

export interface Star {
  id: string
  name?: string
  x: number
  y: number
  magnitude: number
  color?: string
}

export interface ConstellationLine {
  from: string
  to: string
}

export interface Constellation {
  id: string
  name: string
  abbr: string
  description: string
  mythology: string
  bestViewingMonths: number[]
  mainStars: Star[]
  lines: ConstellationLine[]
  notableObjects: NotableObject[]
  hemisphere: 'northern' | 'southern' | 'both'
  difficulty: 'easy' | 'moderate' | 'challenging'
}

export interface NotableObject {
  id: string
  name: string
  type: 'star' | 'nebula' | 'galaxy' | 'cluster' | 'planet'
  description: string
  x: number
  y: number
  magnitude?: number
  requiresTelescope: boolean
}

export const CONSTELLATIONS: Constellation[] = [
  {
    id: 'orion',
    name: 'Orion',
    abbr: 'Ori',
    description: 'The Hunter - One of the most recognizable constellations in the night sky, visible from virtually anywhere on Earth.',
    mythology: 'In Greek mythology, Orion was a giant huntsman whom Zeus placed among the stars. The constellation represents Orion wielding a club and shield, facing Taurus the Bull.',
    bestViewingMonths: [11, 12, 1, 2, 3],
    hemisphere: 'both',
    difficulty: 'easy',
    mainStars: [
      { id: 'betelgeuse', name: 'Betelgeuse', x: 200, y: 150, magnitude: 0.5, color: '#ff8c42' },
      { id: 'rigel', name: 'Rigel', x: 250, y: 400, magnitude: 0.1, color: '#9db4ff' },
      { id: 'bellatrix', name: 'Bellatrix', x: 300, y: 160, magnitude: 1.6, color: '#ffffff' },
      { id: 'alnilam', name: 'Alnilam', x: 250, y: 250, magnitude: 1.7, color: '#9db4ff' },
      { id: 'alnitak', name: 'Alnitak', x: 230, y: 260, magnitude: 1.8, color: '#9db4ff' },
      { id: 'mintaka', name: 'Mintaka', x: 270, y: 245, magnitude: 2.2, color: '#9db4ff' },
      { id: 'saiph', name: 'Saiph', x: 180, y: 390, magnitude: 2.1, color: '#9db4ff' },
    ],
    lines: [
      { from: 'betelgeuse', to: 'bellatrix' },
      { from: 'betelgeuse', to: 'alnilam' },
      { from: 'bellatrix', to: 'mintaka' },
      { from: 'mintaka', to: 'alnilam' },
      { from: 'alnilam', to: 'alnitak' },
      { from: 'alnitak', to: 'saiph' },
      { from: 'saiph', to: 'rigel' },
      { from: 'rigel', to: 'bellatrix' },
    ],
    notableObjects: [
      {
        id: 'orion-nebula',
        name: 'Orion Nebula (M42)',
        type: 'nebula',
        description: 'A stellar nursery where new stars are being born, visible to the naked eye as a fuzzy patch below the belt.',
        x: 250, 
        y: 310,
        magnitude: 4.0,
        requiresTelescope: false,
      },
      {
        id: 'horsehead',
        name: 'Horsehead Nebula',
        type: 'nebula',
        description: 'A dark nebula shaped like a horse\'s head, one of the most photographed objects in the sky.',
        x: 235,
        y: 265,
        magnitude: 6.8,
        requiresTelescope: true,
      },
    ],
  },
  {
    id: 'ursa-major',
    name: 'Ursa Major',
    abbr: 'UMa',
    description: 'The Great Bear - Contains the famous Big Dipper asterism, used for navigation and finding the North Star.',
    mythology: 'In Greek mythology, Ursa Major represents Callisto, a beautiful nymph who was transformed into a bear by Zeus\'s jealous wife Hera.',
    bestViewingMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    hemisphere: 'northern',
    difficulty: 'easy',
    mainStars: [
      { id: 'dubhe', name: 'Dubhe', x: 150, y: 100, magnitude: 1.8, color: '#ffcc6f' },
      { id: 'merak', name: 'Merak', x: 180, y: 140, magnitude: 2.4, color: '#ffffff' },
      { id: 'phecda', name: 'Phecda', x: 250, y: 160, magnitude: 2.4, color: '#ffffff' },
      { id: 'megrez', name: 'Megrez', x: 270, y: 120, magnitude: 3.3, color: '#ffffff' },
      { id: 'alioth', name: 'Alioth', x: 320, y: 130, magnitude: 1.8, color: '#ffffff' },
      { id: 'mizar', name: 'Mizar', x: 360, y: 150, magnitude: 2.2, color: '#ffffff' },
      { id: 'alkaid', name: 'Alkaid', x: 400, y: 180, magnitude: 1.9, color: '#9db4ff' },
    ],
    lines: [
      { from: 'dubhe', to: 'merak' },
      { from: 'merak', to: 'phecda' },
      { from: 'phecda', to: 'megrez' },
      { from: 'megrez', to: 'alioth' },
      { from: 'alioth', to: 'mizar' },
      { from: 'mizar', to: 'alkaid' },
      { from: 'megrez', to: 'dubhe' },
    ],
    notableObjects: [
      {
        id: 'mizar-alcor',
        name: 'Mizar & Alcor',
        type: 'star',
        description: 'A famous double star system visible to the naked eye, historically used as a test of visual acuity.',
        x: 360,
        y: 150,
        magnitude: 2.2,
        requiresTelescope: false,
      },
      {
        id: 'm81',
        name: 'Bode\'s Galaxy (M81)',
        type: 'galaxy',
        description: 'A spectacular spiral galaxy visible with binoculars or a small telescope.',
        x: 200,
        y: 80,
        magnitude: 6.9,
        requiresTelescope: true,
      },
    ],
  },
  {
    id: 'cassiopeia',
    name: 'Cassiopeia',
    abbr: 'Cas',
    description: 'The Queen - Easily recognizable by its distinctive W or M shape, visible year-round in northern latitudes.',
    mythology: 'Cassiopeia was a vain queen in Greek mythology who boasted about her beauty, angering the gods. As punishment, she was placed in the sky to circle the celestial pole forever.',
    bestViewingMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    hemisphere: 'northern',
    difficulty: 'easy',
    mainStars: [
      { id: 'schedar', name: 'Schedar', x: 150, y: 200, magnitude: 2.2, color: '#ffcc6f' },
      { id: 'caph', name: 'Caph', x: 220, y: 150, magnitude: 2.3, color: '#ffffff' },
      { id: 'gamma-cas', name: 'Gamma Cassiopeiae', x: 280, y: 200, magnitude: 2.5, color: '#9db4ff' },
      { id: 'ruchbah', name: 'Ruchbah', x: 340, y: 160, magnitude: 2.7, color: '#ffffff' },
      { id: 'segin', name: 'Segin', x: 400, y: 210, magnitude: 3.4, color: '#9db4ff' },
    ],
    lines: [
      { from: 'schedar', to: 'caph' },
      { from: 'caph', to: 'gamma-cas' },
      { from: 'gamma-cas', to: 'ruchbah' },
      { from: 'ruchbah', to: 'segin' },
    ],
    notableObjects: [
      {
        id: 'm52',
        name: 'M52',
        type: 'cluster',
        description: 'A rich open star cluster containing over 100 stars.',
        x: 380,
        y: 180,
        magnitude: 6.9,
        requiresTelescope: true,
      },
    ],
  },
  {
    id: 'leo',
    name: 'Leo',
    abbr: 'Leo',
    description: 'The Lion - A prominent constellation representing the Nemean Lion from Greek mythology, best seen in spring.',
    mythology: 'Leo represents the Nemean Lion, a fearsome beast slain by Hercules as the first of his twelve labors. The lion\'s impenetrable hide became Hercules\' famous cloak.',
    bestViewingMonths: [2, 3, 4, 5, 6],
    hemisphere: 'both',
    difficulty: 'moderate',
    mainStars: [
      { id: 'regulus', name: 'Regulus', x: 250, y: 300, magnitude: 1.4, color: '#9db4ff' },
      { id: 'denebola', name: 'Denebola', x: 400, y: 280, magnitude: 2.1, color: '#ffffff' },
      { id: 'algieba', name: 'Algieba', x: 220, y: 240, magnitude: 2.6, color: '#ffcc6f' },
      { id: 'zosma', name: 'Zosma', x: 350, y: 260, magnitude: 2.6, color: '#ffffff' },
      { id: 'chort', name: 'Chort', x: 300, y: 250, magnitude: 3.3, color: '#ffffff' },
    ],
    lines: [
      { from: 'regulus', to: 'algieba' },
      { from: 'algieba', to: 'chort' },
      { from: 'chort', to: 'zosma' },
      { from: 'zosma', to: 'denebola' },
      { from: 'denebola', to: 'regulus' },
    ],
    notableObjects: [
      {
        id: 'm65',
        name: 'Leo Triplet (M65, M66, NGC 3628)',
        type: 'galaxy',
        description: 'A group of three interacting spiral galaxies visible with a telescope.',
        x: 380,
        y: 300,
        magnitude: 9.3,
        requiresTelescope: true,
      },
    ],
  },
  {
    id: 'scorpius',
    name: 'Scorpius',
    abbr: 'Sco',
    description: 'The Scorpion - A striking constellation featuring the bright red star Antares, representing a scorpion from Greek mythology.',
    mythology: 'Scorpius represents the scorpion that killed Orion in Greek mythology. The gods placed them on opposite sides of the sky so they would never meet again.',
    bestViewingMonths: [6, 7, 8, 9],
    hemisphere: 'southern',
    difficulty: 'moderate',
    mainStars: [
      { id: 'antares', name: 'Antares', x: 200, y: 250, magnitude: 1.1, color: '#ff6347' },
      { id: 'shaula', name: 'Shaula', x: 350, y: 350, magnitude: 1.6, color: '#9db4ff' },
      { id: 'sargas', name: 'Sargas', x: 320, y: 310, magnitude: 1.9, color: '#ffffff' },
      { id: 'dschubba', name: 'Dschubba', x: 160, y: 200, magnitude: 2.3, color: '#9db4ff' },
      { id: 'lesath', name: 'Lesath', x: 360, y: 340, magnitude: 2.7, color: '#9db4ff' },
    ],
    lines: [
      { from: 'dschubba', to: 'antares' },
      { from: 'antares', to: 'sargas' },
      { from: 'sargas', to: 'shaula' },
      { from: 'shaula', to: 'lesath' },
    ],
    notableObjects: [
      {
        id: 'm4',
        name: 'M4',
        type: 'cluster',
        description: 'One of the closest globular clusters to Earth, visible with binoculars.',
        x: 210,
        y: 260,
        magnitude: 5.9,
        requiresTelescope: false,
      },
    ],
  },
  {
    id: 'cygnus',
    name: 'Cygnus',
    abbr: 'Cyg',
    description: 'The Swan - Also known as the Northern Cross, this constellation flies along the Milky Way in summer skies.',
    mythology: 'Cygnus represents several different swans from Greek mythology, most commonly Zeus transformed into a swan.',
    bestViewingMonths: [6, 7, 8, 9, 10],
    hemisphere: 'northern',
    difficulty: 'easy',
    mainStars: [
      { id: 'deneb', name: 'Deneb', x: 250, y: 100, magnitude: 1.3, color: '#ffffff' },
      { id: 'sadr', name: 'Sadr', x: 250, y: 250, magnitude: 2.2, color: '#ffffff' },
      { id: 'gienah', name: 'Gienah', x: 180, y: 280, magnitude: 2.5, color: '#ffcc6f' },
      { id: 'albireo', name: 'Albireo', x: 250, y: 380, magnitude: 3.1, color: '#ffcc6f' },
      { id: 'delta-cyg', name: 'Delta Cygni', x: 320, y: 280, magnitude: 2.9, color: '#9db4ff' },
    ],
    lines: [
      { from: 'deneb', to: 'sadr' },
      { from: 'sadr', to: 'albireo' },
      { from: 'gienah', to: 'sadr' },
      { from: 'sadr', to: 'delta-cyg' },
    ],
    notableObjects: [
      {
        id: 'albireo-double',
        name: 'Albireo',
        type: 'star',
        description: 'A beautiful double star with contrasting gold and blue colors, easily split with a small telescope.',
        x: 250,
        y: 380,
        magnitude: 3.1,
        requiresTelescope: true,
      },
      {
        id: 'north-america',
        name: 'North America Nebula',
        type: 'nebula',
        description: 'A large emission nebula shaped like the North American continent.',
        x: 270,
        y: 180,
        magnitude: 4.0,
        requiresTelescope: false,
      },
    ],
  },
]

export function getVisibleConstellations(location: UserLocation, month?: number): Constellation[] {
  const currentMonth = month ?? new Date().getMonth() + 1
  const isNorthern = location.latitude >= 0
  
  return CONSTELLATIONS.filter((constellation) => {
    const hemisphereMatch = 
      constellation.hemisphere === 'both' ||
      (constellation.hemisphere === 'northern' && isNorthern) ||
      (constellation.hemisphere === 'southern' && !isNorthern)
    
    const monthMatch = constellation.bestViewingMonths.includes(currentMonth)
    
    return hemisphereMatch && monthMatch
  })
}

export function getConstellationById(id: string): Constellation | undefined {
  return CONSTELLATIONS.find((c) => c.id === id)
}

export function searchConstellations(query: string): Constellation[] {
  const lowercaseQuery = query.toLowerCase()
  return CONSTELLATIONS.filter(
    (c) =>
      c.name.toLowerCase().includes(lowercaseQuery) ||
      c.description.toLowerCase().includes(lowercaseQuery) ||
      c.abbr.toLowerCase().includes(lowercaseQuery)
  )
}
