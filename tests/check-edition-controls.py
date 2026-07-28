#!/usr/bin/env python3
"""Check that the three reading editions remain independently reachable."""

from pathlib import Path


root = Path(__file__).parents[1]
html = root.joinpath("index.html").read_text(encoding="utf-8")
script = root.joinpath("script.js").read_text(encoding="utf-8")

for edition in ("prose", "rhyme", "spanish"):
    assert f'name="edition" value="{edition}"' in html
    assert f'data-edition-copy="{edition}"' in html
    assert f"edition === '{edition}'" in script or f"editionText !== edition" in script

assert "es-ES" in script
assert "document.documentElement.lang" in script
assert "showPage(currentPage)" in script
assert "pointerup" in script and "ArrowRight" in script

print("Verified Swedish prose, Swedish rhyme, and Spanish prose controls.")
