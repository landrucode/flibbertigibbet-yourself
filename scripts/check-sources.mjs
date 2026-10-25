// Checks every phrase against published slang sources and regenerates
// hooks/sources.ts.
//
// 1. Urban Dictionary (live API): a definition whose headword is one of the
//    phrase's dictionary forms and whose text gives the intended meaning.
// 2. Wiktionary, for phrases Urban Dictionary lacks, with the same test.
// 3. Green's Dictionary of Slang for phrases still missing.
// 4. Live upvotes for the Urban Dictionary hits. The API and page HTML show
//    0 on every definition; the real counts come from /ui/votes, which the
//    page calls after loading (checked 2026-10-24).
//
// 5. Phrases the dictionaries miss but an exact-phrase web search confirmed
//    (WEB below, checked by hand 2026-10-24).
//
// Phrases found in no source are written to the review report.
//
// Usage: node scripts/check-sources.mjs <cache.json> <report.md>
// The cache holds raw definitions, so the meaning tests can change without
// refetching.

import { existsSync, readFileSync, writeFileSync } from "node:fs"

import { EUPHEMISMS } from "../hooks/euphemisms.ts"

const [CACHE = "sources-cache.json", REPORT = "unsourced.md"] = process.argv.slice(2)
const OUT = new URL("../hooks/sources.ts", import.meta.url)
const UA = { "user-agent": "flibbertigibbet-yourself source check (dev@landrucode.ai)" }

// The intended meaning: masturbation, or a trip to the loo. A phrase that
// exists only as slang for some other sex act does not count, so "Finding
// Nemo" is not sourced by its Urban Dictionary entry.
const SELF = /masturbat|masterbat|wank|\bfap|(jerk|jack|jill|toss|beat|whack|rub|crack)(ing|ed|s)? (it |one |yourself |himself |herself |themselves )?(off|out)|self.?pleasur|self.?gratif|onanis/i
const LOO = /urinat|defecat|toilet|lavatory|\bloo\b|bathroom|restroom|\bfart|flatul|break(ing)? wind|bowel movement|\bpee\b|\bpoo(p)?\b|take a (shit|dump|crap|piss|leak)|\bshit(ting)?\b|\bpiss(ing)?\b|piddl/i
const MEANS = text => SELF.test(text) || LOO.test(text)

const WEB = {
  "Hitchhiking to Heaven": "https://www.craigslist.org/about/best/sfo/9318178.html",
  "Watering the tulips": "https://www.elitedaily.com/women/women-invent-slang-terms-masturbation-video/1021129",
  "Greasing the weasel": "https://melmagazine.com/en-us/story/euphemisms-for-male-masturbation-are-an-endless-natural-resource",
}

const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, "utf8")) : {}
const save = () => writeFileSync(CACHE, JSON.stringify(cache))

const sleep = ms => new Promise(r => setTimeout(r, ms))

// Throttling shows up as 429s and dropped connections; waiting a minute
// clears it.
async function get(url, headers = {}) {
  let last
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      const res = await fetch(url, { redirect: "follow", headers: { ...UA, ...headers } })
      if (res.ok) return await res.text()
      if (res.status === 404) return null
      last = `HTTP ${res.status}`
      await sleep(res.status === 429 || res.status === 503 ? 60_000 : 5000 * 2 ** attempt)
    } catch (err) {
      last = err.cause?.code ?? err.message
      await sleep(5000 * 2 ** attempt)
    }
  }
  throw new Error(`gave up on ${url}: ${last}`)
}

async function pool(items, workers, fn) {
  const queue = [...items]
  let done = 0
  await Promise.all(
    Array.from({ length: workers }, async () => {
      while (queue.length) {
        await fn(queue.shift())
        if (++done % 200 === 0) {
          save()
          console.log(`  ${done}/${items.length}`)
        }
      }
    }),
  )
  save()
}

const norm = s => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()

// After these verbs the noun is the slang, so "Having a Sherman" is also
// looked up as "sherman". Other verbs keep their object: "bishop" alone
// sources the word, not "Polishing the bishop".
const LIGHT = new Set(["having", "doing", "playing", "seeing", "visiting", "going", "getting", "taking", "dating", "calling", "enjoying", "achieving", "feeling"])
const ARTICLE = /^(a|an|the|some|to|on|with|for|your) /

// "Spanking the monkey" -> spanking/spank/spanke the monkey. Wrong guesses
// match nothing.
function forms(phrase) {
  const words = norm(phrase.replace(/\bitself\b/gi, "yourself").replace(/\bits\b/gi, "your")).split(" ")
  const [first, ...rest] = words
  const firsts = new Set([first])
  if (first.endsWith("ing")) {
    const stem = first.slice(0, -3)
    firsts.add(stem)
    firsts.add(stem + "e")
    if (/([bcdfgklmnprstvz])\1$/.test(stem)) firsts.add(stem.slice(0, -1))
  }
  const out = [...firsts].map(f => [f, ...rest].join(" "))
  if (LIGHT.has(first)) {
    let noun = rest.join(" ")
    while (ARTICLE.test(noun)) noun = noun.replace(ARTICLE, "")
    if (noun && !out.includes(noun)) out.push(noun)
  }
  return out
}

const phrases = EUPHEMISMS.map(([now]) => now)

const allForms = [...new Set(phrases.flatMap(forms))]
console.log(`Urban Dictionary: ${allForms.length} forms`)
await pool(allForms.filter(f => !(`ud:${f}` in cache)), 6, async form => {
  const { list } = JSON.parse(await get(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(form)}`))
  cache[`ud:${form}`] = list.filter(e => norm(e.word) === form).map(e => ({ id: e.defid, text: `${e.definition} ${e.example}` }))
})
const udHits = form => cache[`ud:${form}`].filter(e => MEANS(e.text))
const onUD = p => forms(p).some(f => udHits(f).length > 0)

const wikiForms = [...new Set(phrases.filter(p => !onUD(p)).flatMap(forms))].filter(f => !(`wk:${f}` in cache))
console.log(`Wiktionary: ${wikiForms.length} forms`)
const wikiPages = []
for (let i = 0; i < wikiForms.length; i += 50) {
  const batch = wikiForms.slice(i, i + 50)
  const res = JSON.parse(await get(`https://en.wiktionary.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(batch.join("|"))}`))
  const exists = new Set(Object.values(res.query.pages).filter(p => !("missing" in p)).map(p => norm(p.title)))
  for (const f of batch) exists.has(f) ? wikiPages.push(f) : (cache[`wk:${f}`] = null)
}
await pool(wikiPages, 2, async form => {
  const res = JSON.parse(await get(`https://en.wiktionary.org/w/api.php?action=query&format=json&prop=extracts&explaintext=1&titles=${encodeURIComponent(form)}`))
  const text = Object.values(res.query.pages)[0]?.extract ?? ""
  // The English section only; other languages' senses do not apply.
  cache[`wk:${form}`] = text.split(/\n== /).find(s => s.replace(/^\n?== /, "").startsWith("English")) ?? ""
})
const wkHit = f => Boolean(cache[`wk:${f}`]) && MEANS(cache[`wk:${f}`])
const onWiktionary = p => forms(p).some(wkHit)

const greensForms = [...new Set(phrases.filter(p => !onUD(p) && !onWiktionary(p)).flatMap(forms))].filter(f => !(`gd:${f}` in cache))
console.log(`Green's: ${greensForms.length} forms`)
await pool(greensForms, 1, async form => {
  const html = await get(`https://greensdictofslang.com/search/basic?q=${encodeURIComponent(form)}`)
  cache[`gd:${form}`] = (html ?? "")
    .split('<article class="srentry">')
    .slice(1)
    .map(entry => ({
      head: norm(entry.match(/class="(?:sub)?hw">([^<]*)/)?.[1] ?? ""),
      sense: entry.match(/class="srdefinition">([\s\S]*?)<\/span>/)?.[1].replace(/<[^>]+>/g, "") ?? "",
    }))
    .filter(e => e.head === form)
  await sleep(500)
})
const gdHit = f => (cache[`gd:${f}`] ?? []).some(e => MEANS(e.sense))
const onGreens = p => forms(p).some(gdHit)

const defids = [...new Set(phrases.filter(onUD).flatMap(p => forms(p).flatMap(f => udHits(f).map(e => e.id))))]
const unvoted = defids.filter(id => !(`up:${id}` in cache))
console.log(`Votes: ${unvoted.length} definitions`)
const batches = []
for (let i = 0; i < unvoted.length; i += 20) batches.push(unvoted.slice(i, i + 20))
await pool(batches, 2, async batch => {
  // Answers with one vote widget per definition, as Unpoly fragments.
  const html = await get(`https://www.urbandictionary.com/ui/votes?defids=${batch.join(",")}`, {
    "x-up-version": "3.0.0",
    "x-up-target": batch.map(id => `#vote-buttons-${id}`).join(", "),
  })
  for (const id of batch) {
    const up = html?.split(`id="vote-buttons-${id}"`)[1]?.match(/aria-label="Upvote \((\d+)\)"/)?.[1]
    if (up === undefined) throw new Error(`no vote count for definition ${id}`)
    cache[`up:${id}`] = Number(up)
  }
})

const rows = []
const unsourced = []
for (const p of phrases) {
  if (onUD(p)) {
    const found = forms(p).filter(f => udHits(f).length > 0)
    const up = found.flatMap(udHits).reduce((n, e) => n + cache[`up:${e.id}`], 0)
    rows.push([p, up, `Urban Dictionary: ${found.join(", ")}`])
  } else if (onWiktionary(p)) {
    rows.push([p, 0, `Wiktionary: ${forms(p).filter(wkHit).join(", ")}`])
  } else if (onGreens(p)) {
    rows.push([p, 0, `Green's Dictionary of Slang: ${forms(p).filter(gdHit).join(", ")}`])
  } else if (p in WEB) {
    rows.push([p, 0, `web: ${WEB[p]}`])
  } else {
    unsourced.push(p)
  }
}

writeFileSync(
  OUT,
  `// Generated by scripts/check-sources.mjs on ${new Date().toISOString().slice(0, 10)}. Do not edit by hand.
// Each phrase found in a published slang source meaning masturbation or a
// trip to the loo, with its Urban Dictionary upvotes summed over those
// definitions. 0 means found on Wiktionary, in Green's Dictionary of Slang,
// or by web search only.
export const SOURCED: Readonly<Record<string, number>> = {
${rows.map(([p, up, src]) => `  ${JSON.stringify(p)}: ${up}, // ${src}`).join("\n")}
}
`,
)
writeFileSync(REPORT, `# Phrases found in none of Urban Dictionary, Wiktionary, Green's (${unsourced.length})\n\n${unsourced.map(p => `- ${p}`).join("\n")}\n`)
console.log(`${rows.length} sourced, ${unsourced.length} unsourced`)
