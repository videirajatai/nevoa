import { parseChord } from './transpose'

const SCALE_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const SCALE_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

// intervalo (semitons a partir da fundamental) por família
const INTERVALS = {
  maj: [0, 4, 7],
  m: [0, 3, 7],
  '5': [0, 7],
  '6': [0, 4, 7, 9],
  m6: [0, 3, 7, 9],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  '7': [0, 4, 7, 10],
  m7: [0, 3, 7, 10],
  maj7: [0, 4, 7, 11],
  '7sus4': [0, 5, 7, 10],
  dim: [0, 3, 6],
  dim7: [0, 3, 6, 9],
  m7b5: [0, 3, 6, 10],
  aug: [0, 4, 8],
  '9': [0, 4, 7, 10, 14],
  m9: [0, 3, 7, 10, 14],
  maj9: [0, 4, 7, 11, 14],
  add9: [0, 4, 7, 14],
  '11': [0, 4, 7, 10, 14, 17],
  '13': [0, 4, 7, 10, 14, 17, 21]
}

// famílias com digitação desenhável (padrões em forma de E e de A)
// Índices = cordas de grave (0) para agudo (5); -1 = corda abafada.
const SHAPES = {
  maj: { E: [0, 2, 2, 1, 0, 0], A: [-1, 0, 2, 2, 2, 0] },
  m: { E: [0, 2, 2, 0, 0, 0], A: [-1, 0, 2, 2, 1, 0] },
  '7': { E: [0, 2, 0, 1, 0, 0], A: [-1, 0, 2, 0, 2, 0] },
  m7: { E: [0, 2, 0, 0, 0, 0], A: [-1, 0, 2, 0, 1, 0] },
  maj7: { E: [0, 2, 1, 1, 0, 0], A: [-1, 0, 2, 1, 2, 0] },
  sus4: { E: [0, 2, 2, 2, 0, 0], A: [-1, 0, 2, 2, 3, 0] },
  sus2: { A: [-1, 0, 2, 4, 2, 0] },
  '6': { E: [0, 2, 2, 1, 2, 0], A: [-1, 0, 2, 2, 2, 2] },
  m6: { E: [0, 2, 2, 0, 2, 0], A: [-1, 0, 2, 3, 2, 2] }
}

export function classifyFamily(quality) {
  const q = String(quality || '').replace(/[()\[\]]/g, '')
  if (!q) return 'maj'
  const t = q
  if (/m7b5|m7-5|ø7|Ø7|m7\(b5\)/.test(t)) return 'm7b5'
  if (/dim|°/.test(t)) return /7/.test(t) ? 'dim7' : 'dim'
  if (/maj7|7maj|7M|M7|Δ7|7\^/.test(t)) return 'maj7'
  if (/maj9/.test(t)) return 'maj9'
  if (/maj|M/.test(t)) return 'maj'
  if (/aug|\+/.test(t)) return 'aug'
  if (/add9|add/.test(t)) return 'add9'
  if (/7sus4|7sus/.test(t)) return '7sus4'
  if (/sus2/.test(t)) return 'sus2'
  if (/sus4|sus/.test(t)) return 'sus4'
  if (/m6/.test(t)) return 'm6'
  if (/m9/.test(t)) return 'm9'
  if (/^m$/.test(t)) return 'm'
  if (/13/.test(t)) return '13'
  if (/11/.test(t)) return '11'
  if (/^6\/?9$|^69$/.test(t)) return '9'
  if (/^6$/.test(t)) return '6'
  if (/m7|m[0-9]/.test(t)) return 'm7'
  if (/^5$/.test(t)) return '5'
  if (/9/.test(t)) return '9'
  if (/7/.test(t)) return '7'
  return null
}

export function chordNotes(chordName) {
  const c = parseChord(chordName)
  if (!c) return null
  const family = classifyFamily(c.quality)
  const intervals = INTERVALS[family] || (family === null ? null : [0, 4, 7])
  if (!intervals) return null
  return intervals.map((s) => (c.semitone + s) % 12)
}

export function spellNote(semi, flavor) {
  return (flavor ? SCALE_FLAT : SCALE_SHARP)[((semi % 12) + 12) % 12]
}

// cordas abertas na afinação padrão (de grave para agudo) e drop D
const OPEN_SEMIS = {
  'E A D G B E': [4, 9, 2, 7, 11, 4],
  'E A D G C F': [4, 9, 2, 7, 0, 5],
  'D A D G B E': [2, 9, 2, 7, 11, 4],
  'D G C F A D': [2, 7, 0, 5, 9, 2]
}

export function tuningFrom(label) {
  return OPEN_SEMIS[label] || OPEN_SEMIS['E A D G B E']
}

// Gera a melhor digitação para o acorde nas 6 cordas.
export function guitarVoicing(chordName) {
  const c = parseChord(chordName)
  if (!c) return null
  const family = classifyFamily(c.quality)
  const patterns = SHAPES[family]
  if (!patterns) return null

  const rootOpen = { E: 4, A: 9 } // nota (semitom) da corda solta da fundamental
  const candidates = []
  for (const key of ['E', 'A']) {
    const pattern = patterns[key]
    if (!pattern) continue
    const lowIsMuted = pattern[0] === -1
    if (key === 'E' && lowIsMuted) continue
    if (key === 'A' && !lowIsMuted) continue
    const r = (((c.semitone - rootOpen[key]) % 12) + 12) % 12
    const abs = pattern.map((o) => (o === -1 ? -1 : r + o))
    if (abs.every((f) => f === -1 || f <= 15)) {
      const sum = abs.reduce((a, f) => a + (f === -1 ? 0 : f), 0)
      candidates.push({ frets: abs, r, form: key, sum })
    }
  }
  if (!candidates.length) return null
  candidates.sort((a, b) => a.sum - b.sum || a.r - b.r)
  return candidates[0]
}
