# Flibbertigibbet Yourself

Replaces Claude's thinking verbs with risqué euphemisms. Not for kids.

Pondering becomes Choking the chicken. When the turn ends, the closing line follows suit: Choked the chicken for 12s.

Not one for a shared screen at work.

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
| Desktop app | Spinner while thinking, requesting and responding; tool steps keep their own wording | Not shown |

The spinner shows a phrase while Claude works and the closing line puts it in the past tense.

### What it does on your machine

- **Changes one word on screen.** It replaces the spinner's verb and the past-tense verb on the line that closes a turn. Nothing else is drawn or changed.
- **Reads nothing from the conversation.** It sees only the word Claude Code was about to draw and the turn's identifier.
- **Makes no network requests,** starts no programs, reads or writes no files, and stores no data.

### Licence

MIT.
