#!/usr/bin/env python3
"""Guard the small, two-character bedtime-story contract."""

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

# Both editions follow the same calm plot: familiar home, a small loss, a
# cooperative choice, shared warmth, a brief shown moral, then home and sleep.
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

print("Verified character continuity and the bedtime-story red thread.")
