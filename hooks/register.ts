import type { Register } from 'claude-code'

import { EUPHEMISMS } from "./euphemisms"

const random = (): number => Math.floor(Math.random() * EUPHEMISMS.length)

// One phrase per main-loop turn, so the spinner and the line that closes the
// turn read as a pair. The spinner (keyed by agent id) and the closing line
// (keyed by its own id) share no instance id, so the turn is the link.
let turnPick: number | undefined

// Each closing line keeps the phrase it was first drawn with, so scrolling
// back through the transcript does not reshuffle earlier turns.
const closed = new Map<string, number>()

const current = (): number => (turnPick ??= random())

export const register: Register = on => {
  on('turn.start', ($, e, next) => {
    if (e.agentId === undefined) turnPick = random()
    return next(e)
  })

  on('ui.render', { component: 'Spinner' }, ($, e, next) => {
    // On the desktop the tool-use row names its step ("Creating notes.md");
    // keep that, and crude up the thinking/requesting/responding states.
    if (e.surface === 'desktop' && e.props.mode === 'tool-use') return next(e)
    const word = EUPHEMISMS[current()]?.[0] ?? e.props.word
    return next({ ...e, props: { ...e.props, word } })
  })

  on('ui.render', { component: 'TurnDuration' }, ($, e, next) => {
    let i = closed.get(e.requestId)
    if (i === undefined) {
      i = current()
      closed.set(e.requestId, i)
      if (closed.size > 500) closed.delete(closed.keys().next().value as string)
    }
    const word = EUPHEMISMS[i]?.[1] ?? e.props.word
    return next({ ...e, props: { ...e.props, word } })
  })
}
