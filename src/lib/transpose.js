const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

// Mapas de enarmonia para interpretar qualquer grafia da raiz.
const SPELLINGS = {
  C: 0, 'B#': 0,
  'C#': 1, Db: 1,
  D: 2,
  'D#': 3, Eb: 3,
  E: 4, Fb: 4,
  F: 5, 'E#': 5,
  'F#': 6, Gb: 6,
  G: 7,
  'G#': 8, Ab: 8,
  A: 9,
  'A#': 10, Bb: 10,
  B: 11, Cb: 11
}

const ROOT_RE = /^([A-Ga-g])([#b]?)(.*)$/

export function parseChord(name) {
  const m = String(name || '').trim().match(ROOT_RE)
  if (!m) return null
  let semitone = SPELLINGS[m[1].toUpperCase() + m[2]]
  if (semitone === undefined) return null
  const flavor = m[2].toLowerCase() === 'b'
  let rest = m[3]
  let slash = null
  const sl = rest.match(/^(.*?)\s*\/\s*(.*)$/)
  if (sl) {
    rest = sl[1]
    const bass = parseChord(sl[2])
    slash = bass ? bass.semitone : null
  }
  return { semitone, quality: rest || '', flavor, slash }
}

function spell(noteIndex, flavor) {
  const scale = flavor ? FLAT : SHARP
  return scale[(((noteIndex % 12) + 12) % 12)]
}

export function transposeChord(name, semitones) {
  const c = parseChord(name)
  if (!c) return name
  const root = spell(c.semitone + semitones, c.flavor)
  let out = root + c.quality
  if (c.slash !== null) {
    out += '/' + spell(c.slash + semitones, c.flavor)
  }
  return out
}

export function noteName(semitone) {
  return SHARP[(((semitone % 12) + 12) % 12)]
}
