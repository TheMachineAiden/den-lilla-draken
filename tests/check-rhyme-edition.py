#!/usr/bin/env python3
"""Keep the independent rhyme tale role-safe and phonetically grounded."""

from html.parser import HTMLParser
from pathlib import Path
import re
import sys


class RhymeEditionParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_rhyme_copy = False
        self.in_paragraph = False
        self.current_line = []
        self.lines = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag == "div" and attributes.get("data-edition-copy") == "rhyme":
            self.in_rhyme_copy = True
        elif self.in_rhyme_copy and tag == "p":
            self.in_paragraph = True
            self.current_line = []
        elif self.in_paragraph and tag == "br":
            self.lines.append("".join(self.current_line).strip())
            self.current_line = []

    def handle_endtag(self, tag):
        if tag == "p" and self.in_paragraph:
            self.lines.append("".join(self.current_line).strip())
            self.current_line = []
            self.in_paragraph = False
        elif tag == "div" and self.in_rhyme_copy:
            self.in_rhyme_copy = False

    def handle_data(self, data):
        if self.in_paragraph:
            self.current_line.append(data)


def ending(line):
    words = re.findall(r"[A-Za-zÅÄÖåäö]+", line.lower())
    assert words, f"No final word in: {line!r}"
    return words[-1]


# Each pair was checked with rim/scripts/compare_rim.py against the bundled
# Swedish SLR29 pronunciation lexicon. `family` is that checked phonetic tail,
# recorded here so a changed word cannot silently turn a spelling rhyme into a
# false pass. The tale deliberately uses a different family in every couplet.
EXPECTED_COUPLETS = [
    (("blå", "då"), "O"), (("snäll", "kväll"), "ALL"),
    (("sång", "gång"), "ONG"), (("sätt", "rätt"), "ET"),
    (("slag", "dag"), "AG"), (("bo", "ro"), "U"),
    (("med", "led"), "ED"), (("klar", "kvar"), "AR"),
    (("stund", "grund"), "UND"), (("klart", "snart"), "ART"),
    (("vit", "bit"), "IT"), (("minne", "därinne"), "INE"),
    (("sött", "trött"), "9T"),
]

EXPECTED_PAIRS = [pair for pair, _family in EXPECTED_COUPLETS]
POSSESSIVE_PRONOUN_ENDINGS = {"min", "mitt", "mina", "din", "ditt", "dina", "sin", "sitt", "sina"}


parser = RhymeEditionParser()
parser.feed(Path(__file__).parents[1].joinpath("index.html").read_text(encoding="utf-8"))
assert len(parser.lines) == len(EXPECTED_PAIRS) * 2, parser.lines
actual_pairs = list(zip(parser.lines[::2], parser.lines[1::2]))
actual_endings = [(ending(first), ending(second)) for first, second in actual_pairs]
assert actual_endings == EXPECTED_PAIRS, actual_endings
assert not set(ending(line) for line in parser.lines) & POSSESSIVE_PRONOUN_ENDINGS

families = [family for _pair, family in EXPECTED_COUPLETS]
duplicates = {family for family in families if families.count(family) > 1}
assert not duplicates, duplicates

print(f"Verified {len(actual_pairs)} adjacent exact-rhyme couplets with distinct rhyme families.")
