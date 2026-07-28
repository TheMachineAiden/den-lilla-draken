#!/usr/bin/env python3
"""Keep the optional edition in index.html as adjacent exact-rhyme couplets."""

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


# These exact phonetic pairs were checked with rim/scripts/compare_rim.py
# against the bundled Swedish SLR29 pronunciation lexicon. Keeping the
# expected endings here makes an accidental non-rhyming edit fail locally
# without requiring the 5 MB lexicon in this small static-site repository.
EXPECTED_PAIRS = [
    ("blå", "då"), ("grå", "blå"), ("röst", "tröst"),
    ("glad", "blad"), ("så", "gå"), ("nej", "mig"),
    ("därpå", "två"), ("pling", "ring"), ("blad", "glad"),
    ("fin", "min"), ("glöd", "bröd"), ("hand", "land"),
    ("draken", "saken"), ("glöd", "bröd"), ("skatt", "natt"),
    ("grå", "så"), ("igen", "igen"), ("rum", "ljum"), ("prick", "gick"),
    ("natt", "skatt"),
]


parser = RhymeEditionParser()
parser.feed(Path(__file__).parents[1].joinpath("index.html").read_text(encoding="utf-8"))
assert len(parser.lines) == len(EXPECTED_PAIRS) * 2, parser.lines
actual_pairs = list(zip(parser.lines[::2], parser.lines[1::2]))
actual_endings = [(ending(first), ending(second)) for first, second in actual_pairs]
assert actual_endings == EXPECTED_PAIRS, actual_endings
print(f"Verified {len(actual_pairs)} adjacent exact-rhyme couplets.")
