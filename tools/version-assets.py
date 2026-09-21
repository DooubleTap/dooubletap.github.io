#!/usr/bin/env python3
"""Stamp asset URLs with a content hash so browsers never keep a stale copy.

GitHub Pages lets browsers cache files for 10 minutes. After an update, a cached
icons.svg or site.css can show a missing icon or an old style. This script
rewrites every reference to the files below as `file?v=<hash>` (in the HTML
pages, and the icon sprite version inside site.js), so a changed file gets a
new URL. Run it before committing whenever something in assets/ changes:

    python tools/version-assets.py
"""
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ["site.css", "site.js", "boot.js", "github-data.js", "icons.svg"]
PAGES = ["index.html", "404.html", "privacy/index.html", "terms/index.html", "cookies/index.html"]


def short_hash(name):
    return hashlib.sha256((ROOT / "assets" / name).read_bytes()).hexdigest()[:8]


def main():
    # site.js builds icon URLs itself; stamp its sprite version first, since that
    # changes site.js and therefore its own hash.
    js = ROOT / "assets" / "site.js"
    src = js.read_text(encoding="utf-8")
    src = re.sub(r"var ICONS_V = '[^']*';", f"var ICONS_V = '{short_hash('icons.svg')}';", src)
    js.write_text(src, encoding="utf-8", newline="\n")

    hashes = {name: short_hash(name) for name in ASSETS}
    for page in PAGES:
        path = ROOT / page
        html = path.read_text(encoding="utf-8")
        for name, h in hashes.items():
            html = re.sub(rf"assets/{re.escape(name)}(\?v=[0-9a-f]+)?", f"assets/{name}?v={h}", html)
        path.write_text(html, encoding="utf-8", newline="\n")
    for name, h in hashes.items():
        print(f"{name:16} {h}")


if __name__ == "__main__":
    main()
