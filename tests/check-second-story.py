#!/usr/bin/env python3
"""Guard the second, standalone bedtime-story contract."""
from pathlib import Path
root = Path(__file__).parents[1]
story = root.joinpath("sagan-om-den-viskande-stenen.html").read_text(encoding="utf-8")
for required in ("Den lilla draken och den viskande stenen", "Bara barnet kunde se den.", "Vi lyssnar först.", "Tillsammans lyfte de lövet", "Hemma under täcket", "God natt, lilla löv.", "whisper-cover.svg", "whisper-listen.svg", "whisper-home.svg"):
    assert required in story, required
assert "Ugglan" not in story
assert story.count("reader-page") == 5
script = root.joinpath("script.js").read_text(encoding="utf-8")
assert "editionText.length ? editionText" in script
print("Verified the standalone second bedtime story and its original art.")
