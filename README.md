# Flibbertigibbet Yourself

Swaps the verbs shown while Claude thinks for British euphemisms for self-pleasure, plus a few lavatorial ones.

Claude was Pondering. Now it is Polishing the pearl, Choking the chicken or Buying more tissues, and when the turn ends it tells you it Bashed the bishop for 12s. Nearly 1,800 phrases, so it rarely repeats itself.

Contains crude sexual slang. Not one for a shared screen at work.

## Install

At the prompt of a Claude Code terminal session:

```text
/plugin install flibbertigibbet-yourself --marketplace landrucode/flibbertigibbet-yourself
```

Answer `y` to add the marketplace, then choose a scope.

From a shell:

```bash
claude plugin install flibbertigibbet-yourself --marketplace landrucode/flibbertigibbet-yourself
```

In the desktop app: click + next to the prompt box, then Plugins, Add marketplace with `landrucode/flibbertigibbet-yourself`, then Add plugin.

## Boring Stuff

### Where it shows

| Surface | While Claude works | When the turn ends |
| --- | --- | --- |
| Terminal | Spinner line | The "for 12s" line under the reply |
| Desktop app | Spinner while thinking, requesting and responding; tool steps keep their own wording | Not shown: the desktop draws its own footer |

Each turn picks one phrase and keeps it until the turn ends, so the line does not change mid-sentence.

### What it does on your machine

- **Changes one word on screen.** It replaces the spinner's verb and the past-tense verb on the line that closes a turn. Nothing else is drawn or changed.
- **Reads nothing from the conversation.** The only input it sees is the spinner word Claude Code was about to draw and the turn's identifier, used to keep one phrase per turn.
- **Makes no network requests,** starts no programs, reads or writes no files, and stores no data.

### Licence

MIT.
