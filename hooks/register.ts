import type { Register } from 'claude-code'

import { EUPHEMISMS } from "./euphemisms"

// The engine samples one verb per turn; we pick one euphemism per sampled
// verb so the line does not change mid-turn. Keyed by instance + verb.
const picks = new Map<string, number>()

const pick = (key: string): number => {
  const had = picks.get(key)
  if (had !== undefined) return had
  const i = Math.floor(Math.random() * EUPHEMISMS.length)
  picks.set(key, i)
  if (picks.size > 500) picks.delete(picks.keys().next().value as string)
  return i
}

export const register: Register = on => {
  on('ui.render', { component: 'Spinner' }, ($, e, next) => {
    // On the desktop the tool-use row names its step ("Creating notes.md");
    // keep that, and crude up the thinking/requesting/responding states.
    if (e.surface === 'desktop' && e.props.mode === 'tool-use') return next(e)
    const i = pick(`${e.requestId}:${e.props.word}`)
    const word = EUPHEMISMS[i]?.[0] ?? e.props.word
    return next({ ...e, props: { ...e.props, word } })
  })

  on('ui.render', { component: 'TurnDuration' }, ($, e, next) => {
    const i = pick(`${e.requestId}:${e.props.word}`)
    const word = EUPHEMISMS[i]?.[1] ?? e.props.word
    return next({ ...e, props: { ...e.props, word } })
  })
}
