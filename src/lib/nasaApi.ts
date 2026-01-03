import { CelestialEvent, UserLocation } from './types'

const NASA_API_KEY = 'DEMO_KEY'
const NASA_APOD_URL = 'https://api.nasa.gov/planetary/apod'
const NASA_DONKI_URL = 'https://api.nasa.gov/DONKI'

interface NASAEvent {
  activityID?: string
  catalog?: string
  startTime?: string
  link?: string
  linkedEvents?: any[]
}

interface AstronomyEvent {
  name: string
  date: string
  type: CelestialEvent['type']
  description: string
  educationalContent: string
  viewingTips: string
  bestViewingTime: string
  visibilityScore: number
  rarity: CelestialEvent['rarity']
  requiredEquipment?: string
}

export async function fetchNASAEvents(location: UserLocation): Promise<CelestialEvent[]> {
  const events: CelestialEvent[] = []
  
  try {
    const [solarEvents, moonPhases, visiblePlanets, meteorShowers] = await Promise.allSettled([
      fetchSolarEvents(),
      generateMoonPhases(),
      generateVisiblePlanets(location),
      generateMeteorShowers(),
    ])

    if (solarEvents.status === 'fulfilled') {
      events.push(...solarEvents.value)
    }
    
    if (moonPhases.status === 'fulfilled') {
      events.push(...moonPhases.value)
    }
    
    if (visiblePlanets.status === 'fulfilled') {
      events.push(...visiblePlanets.value)
    }
    
    if (meteorShowers.status === 'fulfilled') {
      events.push(...meteorShowers.value)
    }

    if (Math.abs(location.latitude) > 50) {
      events.push(...generateAuroraEvents(location))
    }

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  } catch (error) {
    console.error('Error fetching NASA events:', error)
    return []
  }
}

async function fetchSolarEvents(): Promise<CelestialEvent[]> {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)

    const response = await fetch(
      `${NASA_DONKI_URL}/CME?startDate=${formatNASADate(startDate)}&endDate=${formatNASADate(endDate)}&api_key=${NASA_API_KEY}`
    )

    if (!response.ok) return []

    const data = await response.json()
    
    const events: CelestialEvent[] = data.slice(0, 3).map((event: NASAEvent, index: number) => ({
      id: `solar-${event.activityID || index}`,
      name: 'Coronal Mass Ejection',
      type: 'aurora' as const,
      date: event.startTime || new Date().toISOString(),
      description: 'Solar activity detected that may enhance aurora visibility.',
      educationalContent: 'Coronal Mass Ejections (CMEs) are massive bursts of solar wind and magnetic fields rising above the solar corona or being released into space. When directed toward Earth, they can cause geomagnetic storms that produce stunning auroras. These spectacular light displays occur when charged particles from the Sun interact with gases in Earth\'s atmosphere, typically visible in polar regions but sometimes extending to lower latitudes during strong solar storms.',
      viewingTips: 'Aurora viewing is best in dark areas away from city lights, typically between 10 PM and 2 AM. Check aurora forecasts and look toward the northern horizon (or southern if in the southern hemisphere). They appear as dancing curtains of green, red, or purple light.',
      bestViewingTime: 'Late evening to early morning, 10 PM - 2 AM',
      visibilityScore: 40,
      isVisibleNow: false,
      nextVisibleIn: 'Tonight after 10 PM',
      rarity: 'uncommon',
      requiredEquipment: 'Naked eye',
    }))

    return events
  } catch (error) {
    console.error('Error fetching solar events:', error)
    return []
  }
}

function generateMoonPhases(): CelestialEvent[] {
  const events: CelestialEvent[] = []
  const today = new Date()
  
  const moonPhases = [
    { name: 'New Moon', days: 0, type: 'moon_phase' as const },
    { name: 'First Quarter', days: 7, type: 'moon_phase' as const },
    { name: 'Full Moon', days: 14, type: 'moon_phase' as const },
    { name: 'Last Quarter', days: 21, type: 'moon_phase' as const },
  ]

  const lunarCycle = 29.53
  const knownNewMoon = new Date('2024-01-11')
  const daysSinceKnownNew = Math.floor((today.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24))
  const currentPhaseDay = daysSinceKnownNew % lunarCycle

  moonPhases.forEach((phase) => {
    let daysUntilPhase = phase.days - currentPhaseDay
    if (daysUntilPhase < 0) {
      daysUntilPhase += lunarCycle
    }

    if (daysUntilPhase <= 30) {
      const phaseDate = new Date(today)
      phaseDate.setDate(phaseDate.getDate() + Math.round(daysUntilPhase))

      const isTonight = Math.round(daysUntilPhase) === 0
      const isVisibleNow = isTonight && new Date().getHours() >= 19

      events.push({
        id: `moon-${phase.name.toLowerCase().replace(' ', '-')}-${phaseDate.getTime()}`,
        name: phase.name,
        type: phase.type,
        date: phaseDate.toISOString(),
        description: `The Moon reaches its ${phase.name.toLowerCase()} phase.`,
        educationalContent: `The Moon orbits Earth every 29.5 days, and as it does, we see different portions of its illuminated surface - these are the lunar phases. ${phase.name === 'Full Moon' ? 'During a full moon, the entire face we see is illuminated by the Sun.' : phase.name === 'New Moon' ? 'During a new moon, the side facing Earth is not illuminated, making the Moon nearly invisible.' : 'Quarter moons show exactly half of the Moon\'s face illuminated.'} The Moon has no light of its own; it reflects sunlight. The changing phases have influenced human culture, calendars, and natural phenomena like tides for millennia.`,
        viewingTips: phase.name === 'New Moon' ? 'New moons are not visible, but they provide the darkest skies for viewing other celestial objects like stars and planets.' : 'The Moon is easily visible with the naked eye. Use binoculars or a telescope to see craters, mountains, and maria (dark plains). The best time to see details is along the terminator - the line between light and shadow.',
        bestViewingTime: phase.name === 'Full Moon' ? 'All night, rising at sunset' : phase.name === 'New Moon' ? 'Not visible' : phase.name === 'First Quarter' ? 'Evening, sets around midnight' : 'After midnight through morning',
        visibilityScore: phase.name === 'New Moon' ? 0 : phase.name === 'Full Moon' ? 100 : 85,
        isVisibleNow,
        nextVisibleIn: isTonight ? 'Tonight after sunset' : `In ${Math.round(daysUntilPhase)} days`,
        rarity: 'common',
        requiredEquipment: 'Naked eye',
      })
    }
  })

  return events
}

function generateVisiblePlanets(location: UserLocation): CelestialEvent[] {
  const today = new Date()
  const events: CelestialEvent[] = []

  const planets = [
    {
      name: 'Venus',
      bestMonths: [1, 2, 3, 4, 11, 12],
      timing: 'Evening',
      brightness: 95,
      description: 'The brightest planet in the sky, often called the Evening or Morning Star.',
      educationalContent: 'Venus is Earth\'s closest planetary neighbor and the second planet from the Sun. It\'s covered in thick clouds of sulfuric acid that reflect sunlight brilliantly, making it the third-brightest object in our sky after the Sun and Moon. Despite being named after the Roman goddess of love, Venus is a hellish world with surface temperatures hot enough to melt lead and atmospheric pressure 90 times that of Earth. Its dense atmosphere creates a runaway greenhouse effect, making it the hottest planet in our solar system.',
      viewingTips: 'Look for the brightest "star" in the western sky after sunset or eastern sky before sunrise. Venus shines with steady, bright white light. Even binoculars will reveal its phases, similar to the Moon.',
      equipment: 'Naked eye (binoculars show phases)',
    },
    {
      name: 'Jupiter',
      bestMonths: [1, 2, 3, 10, 11, 12],
      timing: 'Evening',
      brightness: 90,
      description: 'The largest planet in our solar system, visible as a bright steady light.',
      educationalContent: 'Jupiter is a gas giant and the fifth planet from the Sun. It\'s so massive that all other planets in the solar system could fit inside it. Jupiter is famous for its Great Red Spot, a massive storm larger than Earth that has been raging for at least 400 years. The planet has at least 95 known moons, including the four large Galilean moons discovered by Galileo in 1610. Jupiter\'s powerful magnetic field is 20,000 times stronger than Earth\'s.',
      viewingTips: 'Look for a very bright, cream-colored "star" that doesn\'t twinkle. With binoculars, you can see its four largest moons (Io, Europa, Ganymede, and Callisto) as tiny dots in a line. A telescope reveals cloud bands and the Great Red Spot.',
      equipment: 'Naked eye (binoculars reveal moons)',
    },
    {
      name: 'Saturn',
      bestMonths: [6, 7, 8, 9],
      timing: 'Late Evening',
      brightness: 75,
      description: 'The ringed planet is visible as a golden-hued point of light.',
      educationalContent: 'Saturn is the sixth planet from the Sun and the second-largest in our solar system. It\'s best known for its spectacular ring system, composed of billions of ice particles ranging from grain-sized to house-sized. Despite its enormous size, Saturn is the least dense planet - it would float in water! Saturn has 146 known moons, with Titan being the largest and possessing its own atmosphere. The planet\'s rapid rotation causes it to bulge at the equator, giving it an oblate shape.',
      viewingTips: 'Look for a bright, golden-yellow "star" that shines steadily. Even a small telescope at 25x magnification will reveal Saturn\'s magnificent rings. The best views come with telescopes at 100x or higher magnification.',
      equipment: 'Telescope recommended to see rings',
    },
    {
      name: 'Mars',
      bestMonths: [1, 2, 10, 11, 12],
      timing: 'Evening',
      brightness: 70,
      description: 'The Red Planet is visible with a distinctive reddish-orange color.',
      educationalContent: 'Mars is the fourth planet from the Sun and has long captured human imagination as a potential home for life. Its red color comes from iron oxide (rust) in its soil. Mars has the largest volcano in the solar system (Olympus Mons) and a canyon system (Valles Marineris) that dwarfs Earth\'s Grand Canyon. Evidence suggests Mars once had liquid water on its surface, and today water ice exists at its polar caps and underground. Multiple spacecraft and rovers continue to explore Mars, searching for signs of past or present life.',
      viewingTips: 'Look for a bright reddish-orange "star." Mars is distinctive due to its color. Through a telescope, you can sometimes see its polar ice caps and dark surface features, though details are best visible during Mars opposition events.',
      equipment: 'Naked eye (telescope shows surface features)',
    },
    {
      name: 'Mercury',
      bestMonths: [3, 4, 9, 10],
      timing: 'Dawn or Dusk',
      brightness: 60,
      description: 'The closest planet to the Sun, visible briefly after sunset or before sunrise.',
      educationalContent: 'Mercury is the smallest planet in our solar system and the closest to the Sun. It has no atmosphere to speak of, resulting in extreme temperature swings from 430°C during the day to -180°C at night. Mercury\'s surface is heavily cratered, resembling Earth\'s Moon. Despite being closest to the Sun, it\'s not the hottest planet (that\'s Venus). Mercury orbits the Sun every 88 days but rotates very slowly, making one day on Mercury equal to 59 Earth days.',
      viewingTips: 'Mercury is challenging to observe because it never strays far from the Sun. Look for it low on the horizon just after sunset or just before sunrise during favorable elongations. Binoculars can help, but never look near the Sun.',
      equipment: 'Naked eye (binoculars help, but avoid Sun)',
    },
  ]

  const currentMonth = today.getMonth() + 1
  
  planets.forEach((planet) => {
    if (planet.bestMonths.includes(currentMonth)) {
      const currentHour = today.getHours()
      const isVisibleNow = 
        (planet.timing === 'Evening' && currentHour >= 19 && currentHour <= 23) ||
        (planet.timing === 'Late Evening' && currentHour >= 21 && currentHour <= 23) ||
        (planet.timing === 'Dawn or Dusk' && (currentHour >= 5 && currentHour <= 7 || currentHour >= 18 && currentHour <= 20))

      events.push({
        id: `planet-${planet.name.toLowerCase()}-${today.getMonth()}`,
        name: planet.name,
        type: 'planet',
        date: today.toISOString(),
        description: planet.description,
        educationalContent: planet.educationalContent,
        viewingTips: planet.viewingTips,
        bestViewingTime: planet.timing === 'Dawn or Dusk' ? 'Just after sunset or before sunrise' : planet.timing,
        visibilityScore: planet.brightness,
        isVisibleNow,
        nextVisibleIn: isVisibleNow ? 'Visible now!' : 'Tonight after sunset',
        rarity: planet.name === 'Mercury' ? 'uncommon' : 'common',
        requiredEquipment: planet.equipment,
      })
    }
  })

  return events
}

function generateMeteorShowers(): CelestialEvent[] {
  const today = new Date()
  const events: CelestialEvent[] = []

  const meteorShowers = [
    { name: 'Quadrantids', peakDate: '2024-01-03', month: 1, zhr: 120 },
    { name: 'Lyrids', peakDate: '2024-04-22', month: 4, zhr: 18 },
    { name: 'Eta Aquariids', peakDate: '2024-05-06', month: 5, zhr: 50 },
    { name: 'Perseids', peakDate: '2024-08-12', month: 8, zhr: 100 },
    { name: 'Orionids', peakDate: '2024-10-21', month: 10, zhr: 20 },
    { name: 'Leonids', peakDate: '2024-11-17', month: 11, zhr: 15 },
    { name: 'Geminids', peakDate: '2024-12-14', month: 12, zhr: 120 },
  ]

  meteorShowers.forEach((shower) => {
    const year = today.getFullYear()
    const peakDate = new Date(`${year}-${shower.month.toString().padStart(2, '0')}-${shower.peakDate.split('-')[2]}`)
    
    if (peakDate < today) {
      peakDate.setFullYear(year + 1)
    }

    const daysUntil = Math.floor((peakDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntil <= 30 && daysUntil >= -2) {
      const isTonight = daysUntil === 0
      const currentHour = today.getHours()
      const isVisibleNow = isTonight && currentHour >= 22

      events.push({
        id: `meteor-${shower.name.toLowerCase()}-${year}`,
        name: `${shower.name} Meteor Shower`,
        type: 'meteor_shower',
        date: peakDate.toISOString(),
        peakTime: '02:00',
        description: `Annual meteor shower producing up to ${shower.zhr} meteors per hour at peak.`,
        educationalContent: `The ${shower.name} meteor shower occurs when Earth passes through the debris trail left by a comet. As tiny particles, most no bigger than grains of sand, enter Earth\'s atmosphere at tremendous speeds (up to 70 km/s), they burn up and create the streaks of light we call meteors or "shooting stars." This shower can produce up to ${shower.zhr} visible meteors per hour under ideal dark-sky conditions. The meteors appear to radiate from a specific point in the constellation, which is how meteor showers get their names.`,
        viewingTips: 'Find a dark location away from city lights. Let your eyes adjust to the dark for at least 20 minutes. Lie back and look up at the sky - don\'t focus on one spot. The best viewing is typically after midnight when Earth is rotating into the debris stream. No telescope needed; your eyes are the best tool!',
        bestViewingTime: 'After midnight, 2 AM - 4 AM is peak',
        visibilityScore: shower.zhr > 50 ? 90 : 70,
        isVisibleNow,
        nextVisibleIn: daysUntil === 0 ? 'Tonight after midnight' : `In ${daysUntil} days`,
        rarity: shower.zhr > 80 ? 'rare' : 'uncommon',
        requiredEquipment: 'Naked eye',
      })
    }
  })

  return events
}

function generateAuroraEvents(location: UserLocation): CelestialEvent[] {
  const today = new Date()
  const currentHour = today.getHours()
  const isVisibleNow = currentHour >= 21 && currentHour <= 4

  const latitude = Math.abs(location.latitude)
  let visibilityScore = 30
  
  if (latitude > 60) visibilityScore = 70
  else if (latitude > 55) visibilityScore = 50
  else if (latitude > 50) visibilityScore = 35

  return [
    {
      id: `aurora-potential-${today.toISOString().split('T')[0]}`,
      name: 'Aurora Borealis Potential',
      type: 'aurora',
      date: today.toISOString(),
      description: 'Based on your latitude, aurora may be visible during strong geomagnetic activity.',
      educationalContent: 'The Aurora Borealis (Northern Lights) and Aurora Australis (Southern Lights) are natural light displays caused by interactions between solar wind and Earth\'s magnetic field. Charged particles from the Sun collide with gases in our atmosphere, exciting oxygen and nitrogen atoms which then emit light as they return to their normal state. Oxygen produces green and red light, while nitrogen creates blue and purple hues. Auroras typically occur in oval-shaped zones around the magnetic poles, but during strong solar storms, they can be visible at much lower latitudes.',
      viewingTips: 'Aurora viewing requires dark skies away from light pollution. Check aurora forecasts (KP index) - higher numbers mean better chances at lower latitudes. Look toward the north (or south in the southern hemisphere). The best viewing is usually between 10 PM and 2 AM. Auroras appear as dancing curtains, arcs, or waves of colored light.',
      bestViewingTime: 'Late evening, 10 PM - 2 AM',
      visibilityScore,
      isVisibleNow,
      nextVisibleIn: isVisibleNow ? 'Potentially visible now' : 'Check tonight after 10 PM',
      rarity: latitude > 60 ? 'uncommon' : 'rare',
      requiredEquipment: 'Naked eye (camera captures more color)',
    },
  ]
}

function formatNASADate(date: Date): string {
  return date.toISOString().split('T')[0]
}
