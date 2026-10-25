// Each entry is [while the turn runs, after it ends].
export type Pair = readonly [string, string]

// Every phrase here is recorded in a slang source; hooks/sources.ts says
// which. scripts/check-sources.mjs checks them.
export const EUPHEMISMS: ReadonlyArray<Pair> = [
  // --- the hand's work, classic ---
  ["Spanking the monkey", "Spanked the monkey"],
  ["Choking the chicken", "Choked the chicken"],
  ["Bashing the bishop", "Bashed the bishop"],
  ["Burping the worm", "Burped the worm"],
  ["Jerking the gherkin", "Jerked the gherkin"],
  ["Slapping the salami", "Slapped the salami"],
  ["Wrestling the one-eyed monster", "Wrestled the one-eyed monster"],
  ["Having a J. Arthur", "Had a J. Arthur"],
  ["Having a Sherman", "Had a Sherman"],
  ["Having a Barclays", "Had a Barclays"],
  ["Having a Tommy Tank", "Had a Tommy Tank"],
  ["Having a ham shank", "Had a ham shank"],
  ["Rubbing one out", "Rubbed one out"],
  ["Knocking one out", "Knocked one out"],
  ["Cracking one off", "Cracked one off"],
  ["Pulling one off", "Pulled one off"],
  ["Buffing the banana", "Buffed the banana"],
  ["Loving itself", "Loved itself"],
  ["Priming the pump", "Primed the pump"],
  ["Playing pocket billiards", "Played pocket billiards"],
  ["Shucking the corn", "Shucked the corn"],
  ["Charming the snake", "Charmed the snake"],
  ["Kneading the dough", "Kneaded the dough"],
  ["Cleaning the pipes", "Cleaned the pipes"],
  ["Visiting Palm Springs", "Visited Palm Springs"],
  ["Having a party for one", "Had a party for one"],
  ["Having a fiddle", "Had a fiddle"],
  ["Getting it out of its system", "Got it out of its system"],
  // --- for the ladies ---
  ["Flicking the bean", "Flicked the bean"],
  ["Buttering the muffin", "Buttered the muffin"],
  ["Having a menage a moi", "Had a menage a moi"],
  ["Hitchhiking to Heaven", "Hitchhiked to Heaven"],
  ["Doing a two-finger salute", "Did a two-finger salute"],
  // --- lavatorial, to keep the old guard happy ---
  ["Spending a penny", "Spent a penny"],
  ["Dropping the kids off at the pool", "Dropped the kids off at the pool"],
  ["Answering the call of nature", "Answered the call of nature"],
  ["Visiting the throne room", "Visited the throne room"],
  ["Going for a Captain's log", "Went for a Captain's log"],
  ["Letting one go", "Let one go"],
  // --- verb and object, as recorded ---
  ["Buffing the bishop", "Buffed the bishop"],
  ["Waxing the weasel", "Waxed the weasel"],
  ["Stroking the one-eyed snake", "Stroked the one-eyed snake"],
  ["Stroking the salami", "Stroked the salami"],
  ["Stroking the sausage", "Stroked the sausage"],
  ["Tickling the pickle", "Tickled the pickle"],
  ["Bashing the bratwurst", "Bashed the bratwurst"],
]
