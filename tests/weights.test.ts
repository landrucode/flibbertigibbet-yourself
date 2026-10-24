import { expect, test } from 'claude-code/testing'

import { EUPHEMISMS } from '../hooks/euphemisms'
import { SOURCED } from '../hooks/sources'
import { FAVOURITES, WEIGHTS, pick } from '../hooks/weights'

const phrases = EUPHEMISMS.map(([now]) => now)

test('every phrase has a recorded source, and every source a phrase', async () => {
  expect(phrases.filter(p => !(p in SOURCED))).toEqual([])
  expect(Object.keys(SOURCED).filter(p => !phrases.includes(p))).toEqual([])
})

test('the favourites take a quarter of the weight between them', async () => {
  for (const f of FAVOURITES) expect(phrases).toContain(f)
  const total = WEIGHTS.reduce((a, b) => a + b, 0)
  const favourites = phrases.reduce((n, p, i) => (FAVOURITES.includes(p) ? n + WEIGHTS[i]! : n), 0)
  expect(Math.abs(favourites / total - 0.25)).toBeLessThan(1e-9)
})

test('more upvotes means more weight', async () => {
  const of = (p: string) => WEIGHTS[phrases.indexOf(p)]!
  const others = phrases.filter(p => !FAVOURITES.includes(p)).sort((a, b) => SOURCED[a]! - SOURCED[b]!)
  for (let i = 1; i < others.length; i++) expect(of(others[i]!)).toBeGreaterThanOrEqual(of(others[i - 1]!))
})

test('draws land on the favourites about a quarter of the time', async () => {
  const draws = 40_000
  let hits = 0
  for (let n = 0; n < draws; n++) if (FAVOURITES.includes(phrases[pick()]!)) hits++
  // Four standard deviations either side of 0.25 at this sample size.
  expect(Math.abs(hits / draws - 0.25)).toBeLessThan(0.009)
})
