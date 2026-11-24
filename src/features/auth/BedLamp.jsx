import { useEffect, useRef, useState } from 'react'

/** The sign-in "lamp": pull the cord to switch it on, which unlocks the form. */
export default function BedLamp({ lampOn, onToggle }) {
  const [pulling, setPulling] = useState(false)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])

  const pull = () => {
    if (pulling) return
    setPulling(true)
    timer.current = setTimeout(() => { setPulling(false); onToggle() }, 300)
  }
  const on = (a, b) => (lampOn ? a : b)

  return (
    <div className="lamp">
      <svg width="90" height="140" viewBox="0 0 90 140" aria-hidden="true">
        {lampOn && <ellipse cx="45" cy="95" rx="35" ry="14" fill="#FFF8E0" opacity="0.5" />}
        <rect x="42" y="88" width="6" height="42" rx="3" fill="#8B6A2A" />
        <rect x="38" y="126" width="14" height="6" rx="3" fill="#6B4E1A" />
        <polygon points="15,88 75,88 62,40 28,40" fill={on('#F5C842', '#9B9B8A')} stroke={on('#D4A820', '#777')} strokeWidth="1.5" />
        <ellipse cx="45" cy="88" rx="30" ry="5" fill={on('#E8B820', '#888')} />
        <ellipse cx="45" cy="40" rx="17" ry="4" fill={on('#D4A820', '#777')} />
        <circle cx="45" cy="40" r="5" fill={on('#FFF8C0', '#AAA')} />
        <line className="lamp__string" x1="45" y1="44" x2="45" y2={pulling ? 72 : 64} stroke="#CCC" strokeWidth="1.5" strokeDasharray="3,2" />
        <circle className="lamp__string" cx="45" cy={pulling ? 74 : 66} r="4" fill="#DDD" stroke="#BBB" strokeWidth="1" />
      </svg>
      <button type="button" className="lamp__toggle" aria-pressed={lampOn} disabled={pulling} onClick={pull}>
        {lampOn ? '● ON' : '○ OFF'}
      </button>
      <span className="lamp__caption" role="status">{lampOn ? 'System ready — log in below' : 'Pull to activate system'}</span>
    </div>
  )
}
