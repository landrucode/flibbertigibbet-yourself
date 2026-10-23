import { expect, test } from 'claude-code/testing'

import { EUPHEMISMS } from '../hooks/euphemisms'

const spinner = (requestId: string, word: string) => ({
  surface: 'terminal',
  component: 'Spinner',
  requestId,
  props: { word, message: null, suffix: '…', mode: 'thinking' },
}) as const

const closing = (requestId: string, word: string) => ({
  surface: 'terminal',
  component: 'TurnDuration',
  requestId,
  props: { word, durationMs: 3000 },
}) as const

test('the line that closes a turn is the past tense of its spinner phrase', async ($, on) => {
  // Stands for the engine: records the word the plugin handed it.
  const drawn: string[] = []
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    const word = (e.props as { word: string }).word
    drawn.push(word)
    return <Text>{word}</Text>
  })
  on('turn.start', (_, e) => ({ turnId: e.turnId }))

  const pastOf = (now: string) => EUPHEMISMS.find(([n]) => n === now)?.[1]

  for (const turn of ['t1', 't2', 't3']) {
    await $.turn.start({ text: 'hi', turnId: turn })
    await $.ui.render(spinner('main', 'Pondering'))
    await $.ui.render(spinner('main', 'Pondering'))
    await $.ui.render(closing(`line-${turn}`, 'Pondered'))

    const [during, again, after] = drawn.splice(0)
    expect(again).toBe(during)
    expect(after).toBe(pastOf(during!))
  }
})

test('an earlier closing line keeps its phrase when drawn again', async ($, on) => {
  const drawn: string[] = []
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    const word = (e.props as { word: string }).word
    drawn.push(word)
    return <Text>{word}</Text>
  })
  on('turn.start', (_, e) => ({ turnId: e.turnId }))

  await $.turn.start({ text: 'hi', turnId: 't1' })
  await $.ui.render(closing('line-1', 'Baked'))
  const first = drawn[0]

  // Enough later turns that one would very likely land on another phrase.
  for (let n = 2; n < 12; n++) await $.turn.start({ text: 'hi', turnId: `t${n}` })
  await $.ui.render(closing('line-1', 'Baked'))

  expect(drawn[1]).toBe(first)
})

test('a subagent starting a turn leaves the main turn phrase alone', async ($, on) => {
  const drawn: string[] = []
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    const word = (e.props as { word: string }).word
    drawn.push(word)
    return <Text>{word}</Text>
  })
  on('turn.start', (_, e) => ({ turnId: e.turnId }))

  await $.turn.start({ text: 'hi', turnId: 'main-1' })
  await $.ui.render(spinner('main', 'Pondering'))
  for (let n = 0; n < 10; n++) {
    await $.turn.start({ text: 'task', turnId: `sub-${n}`, agentId: `agent-${n}` })
  }
  await $.ui.render(spinner('main', 'Pondering'))

  expect(drawn[1]).toBe(drawn[0])
})
