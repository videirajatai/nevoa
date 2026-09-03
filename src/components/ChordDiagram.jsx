import { guitarVoicing, chordNotes, spellNote } from '../lib/chords'
import { parseChord } from '../lib/transpose'

function PianoDiagram({ notes, root, chord }) {
  const rootSemi = root
  const base = (Math.floor(rootSemi / 12)) * 12
  const W = 20
  const BLACK_W = 13
  const whiteKeys = []
  const lit = new Set(notes)
  for (let oct = 0; oct < 2; oct++) {
    for (const off of [0, 2, 4, 5, 7, 9, 11]) {
      whiteKeys.push({ semi: base + oct * 12 + off })
    }
  }
  const naturalLetters = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
  const blackMap = { 1: 0, 3: 1, 6: 3, 8: 4, 10: 5 }
  const octaveH = 86
  return (
    <svg viewBox={`0 0 ${W * 14 + 4} ${octaveH + 14}`} width="100%" role="img" aria-label={`Teclado com acorde ${chord}`}>
      {whiteKeys.map((k, i) => {
        const oct = Math.floor(i / 7)
        const inOct = i % 7
        const x = oct * 7 * W + inOct * W + 2
        const on = lit.has(((k.semi % 12) + 12) % 12)
        return (
          <g key={i}>
            <rect x={x} y={6} width={W - 1} height={octaveH} rx={2}
              fill={on ? '#9dff57' : '#e6e8ee'} stroke="#20222a" />
            <text x={x + (W - 1) / 2} y={octaveH - 6} textAnchor="middle" fontSize={8}
              fill={on ? '#0b0e14' : '#8a8fa3'}>{naturalLetters[inOct]}</text>
          </g>
        )
      })}
      {[0, 12].flatMap((oct) => [1, 3, 6, 8, 10].map((b) => ({ oct, b }))).map(({ oct, b }, i) => {
        const octX = oct * 7 * W
        const x = octX + blackMap[b] * W + 2 - BLACK_W / 2
        const on = lit.has((base + oct * 12 + b) % 12)
        return (
          <rect key={i} x={x} y={6} width={BLACK_W} height={octaveH * 0.62} rx={1.5}
            fill={on ? '#c9ff8a' : '#15171e'} stroke="#0b0d12" />
        )
      })}
    </svg>
  )
}

function GuitarDiagram({ chord, notes }) {
  const v = guitarVoicing(chord)
  if (!v) {
    return (
      <div className="chord-fallback">
        <span className="chord-fallback-title">{chord}</span>
        <div className="chord-fallback-notes">
          {notes.map((n, i) => (
            <span key={i}>{spellNote(n, false)}</span>
          ))}
        </div>
      </div>
    )
  }
  const frets = v.frets
  const positives = frets.filter((f) => f !== -1)
  const hasOpen = positives.some((f) => f === 0)
  const minPos = Math.min(...positives)
  const base = hasOpen || minPos < 4 ? 1 : minPos
  const maxCell = Math.max(...frets.map((f) => (f === -1 ? 0 : f - base)))
  const cells = Math.max(2, Math.min(4, maxCell)) + 1
  const strings = frets.length
  const sw = 17
  const sh = 15
  const topPad = 22
  const W = sw * (strings - 1) + 36
  const H = topPad + cells * sh + 12
  const x0 = 26

  // barra (barre) simples: quando há pelo menos 3 casas iguais no mesmo traste
  const barreFret = base === v.r && v.r > 0 ? v.r : null
  const barreCells = frets.filter((f) => f === barreFret).length
  const drawBarre = barreFret !== null && barreCells >= 3

  const xOf = (si) => x0 + si * sw
  const yOfFretLine = (li) => topPad + li * sh
  const dotY = (cell) => topPad + cell * sh + sh / 2

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Diagrama de ${chord}`}>
      {base > 1 && (
        <text x={x0 - 6} y={topPad + 4} textAnchor="end" fontSize={10} fill="#8a8fa3">{base}</text>
      )}
      {drawBarre && (
        <rect x={x0 - 2} y={topPad + (barreFret - base) * sh + 1} width={sw * (strings - 1) + 4}
          height={sh - 2} rx={3} fill="#7c5cff" />
      )}
      {Array.from({ length: cells + 1 }).map((_, li) => {
        const isNut = base === 1 && li === 0
        return (
          <line key={li} x1={x0 - 2} y1={yOfFretLine(li)} x2={x0 + sw * (strings - 1) + 2} y2={yOfFretLine(li)}
            stroke={isNut ? '#e6e8ee' : '#6f7489'} strokeWidth={isNut ? 3 : 1} />
        )
      })}
      {frets.map((f, si) => {
        const x = xOf(si)
        const labelY = yOfFretLine(0) - 7
        return (
          <g key={si}>
            <line x1={x} y1={yOfFretLine(0)} x2={x} y2={yOfFretLine(cells)} stroke="#6f7489" />
            <text x={x} y={labelY} textAnchor="middle" fontSize={11} fill="#e6e8ee">
              {f === -1 ? 'x' : f === 0 ? 'O' : ''}
            </text>
            {f > 0 && !(drawBarre && f === barreFret) && (
              <circle cx={x} cy={dotY(f - base)} r={5.4} fill="#9dff57" />
            )}
          </g>
        )
      })}
      <text x={0} y={H - 3} fontSize={9} fill="#6f7489">
        {notes.map((n) => spellNote(n, false)).join(' · ')}
      </text>
    </svg>
  )
}

export default function ChordDiagram({ chord, instrument }) {
  const parsed = parseChord(chord)
  if (!parsed) return <div className="chord-fallback">{chord}</div>
  const root = parsed.semitone
  const displayName = chord.split('/')[0]
  const notes = chordNotes(displayName)

  return (
    <div className="diagram">
      <div className="diagram-title">{chord}</div>
      {instrument === 'teclado' && notes ? (
        <PianoDiagram notes={notes} root={root} chord={chord} />
      ) : (
        <GuitarDiagram chord={displayName} notes={notes || []} />
      )}
      {instrument === 'teclado' && notes && (
        <div className="diagram-notes">
          Notas: {notes.map((n) => spellNote(n, parsed.flavor)).join(' · ')}
        </div>
      )}
    </div>
  )
}
