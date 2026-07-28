#!/usr/bin/env python3
"""Guard the two standalone, two-character bedtime-story contracts."""

from pathlib import Path
import re


root = Path(__file__).parents[1]
story = root.joinpath("index.html").read_text(encoding="utf-8")
lore = root.joinpath("LORE.md").read_text(encoding="utf-8")

# The published bible makes the inventory and the introduce-before-use rule
# explicit, while this first story intentionally has only its child and dragon.
assert "## Figurer och kontinuitet" in lore
assert "**Kontinuitetsregel:**" in lore
assert "| Barnet |" in lore
assert "| Den lilla draken |" in lore
assert "Ugglan" not in story
assert not re.search(r"\bHo\b", story)

# The prose tale retains its own complete red thread: familiar home, a small
# loss, a cooperative choice, shared warmth, then home and sleep.
for required in (
    "När kvällen blev blå",
    "glöd har rullat ner i mossan",
    "Vi gör en varm kupa",
    "Tillsammans",
    "När man hjälps åt kan en liten värme räcka långt.",
    "Hemma under täcket",
    "God natt, lilla glöd.",
):
    assert required in story, required

# The rhyme edition is a different complete tale: the dragon's missing final
# note returns when the child chooses to wait, listen and hum together. It must
# not quietly revert to the prose tale's ember-and-snack events.
rhyme_blocks = re.findall(
    r'<div data-edition-copy="rhyme" hidden>(.*?)</div>', story, re.DOTALL
)
assert rhyme_blocks, "Missing rhyme edition"
rhyme = "\n".join(rhyme_blocks)
for required in (
    "En liten ton är borta ur min sång.",
    "Barnet nynnade sakta; draken sjöng med.",
    "När vi lyssnar en stund",
    "God natt, lilla drake, sov så sött.",
):
    assert required in rhyme, required
for prose_only in ("glöd", "kvällsmacka", "varm kupa"):
    assert prose_only not in rhyme, prose_only

print("Verified character continuity and two distinct, calm bedtime-story red threads.")
