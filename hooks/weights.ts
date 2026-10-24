import { EUPHEMISMS } from "./euphemisms"
import { SOURCED } from "./sources"

// Picked by hand; between them they take a quarter of all draws.
export const FAVOURITES: ReadonlyArray<string> = ["Spanking the monkey", "Bashing the bishop", "Choking the chicken"]
const FAVOURITE_SHARE = 0.25

// The rest come up in proportion to 1 + log2(1 + Urban Dictionary upvotes),
// so the best-loved phrases are about fifteen times as likely as ones with
// no votes, and none is crowded out.
const rest = EUPHEMISMS.map(([now]) => (FAVOURITES.includes(now) ? 0 : 1 + Math.log2(1 + (SOURCED[now] ?? 0))))
const restTotal = rest.reduce((a, b) => a + b, 0)
const favourite = (restTotal * FAVOURITE_SHARE) / (1 - FAVOURITE_SHARE) / FAVOURITES.length

export const WEIGHTS: ReadonlyArray<number> = EUPHEMISMS.map(([now], i) => (FAVOURITES.includes(now) ? favourite : rest[i]!))

const cumulative: number[] = []
WEIGHTS.reduce((sum, w) => (cumulative.push(sum + w), sum + w), 0)

// Index into EUPHEMISMS, drawn by weight.
export const pick = (): number => {
  const r = Math.random() * cumulative[cumulative.length - 1]!
  let lo = 0
  let hi = cumulative.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (cumulative[mid]! > r) hi = mid
    else lo = mid + 1
  }
  return lo
}
