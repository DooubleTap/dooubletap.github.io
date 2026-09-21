# dooubletap.github.io

My portfolio, live at <https://dooubletap.github.io/>. Bilingual (French by default, English on
request), dark by default with a light theme, and legal pages written for Quebec's Law 25.

Static HTML, one stylesheet, one script. No build step, no framework, and **no external
requests**: system fonts, a self-hosted SVG icon sprite, a self-hosted avatar, and GitHub data
baked in as a snapshot. No cookies; `localStorage` keeps only the language, the theme and whether
the notice was closed.

## What's in here

| URL | File | What it is |
| --- | --- | --- |
| `/` | `index.html` | Home: hero, selected work, stack, GitHub stats, Claude Code, services, contact |
| `/privacy/` | `privacy/index.html` | Privacy policy (Law 25 / PIPEDA), FR + EN |
| `/terms/` | `terms/index.html` | Terms of use, FR + EN |
| `/cookies/` | `cookies/index.html` | Cookie policy, with a button to clear the stored settings |
| — | `404.html` | Not-found page (uses absolute `/assets/` paths) |
| — | `assets/site.css` | The whole design system; tokens for dark and light at the top |
| — | `assets/site.js` | Language, theme, menu, notice, GitHub charts and repo explorer, terminal replay |
| — | `assets/boot.js` | Applies the saved theme in `<head>` so it never flashes |
| — | `assets/icons.svg` | Icon sprite: [Simple Icons](https://simpleicons.org/) (CC0) + a few custom glyphs |
| — | `assets/github-data.js` | GitHub snapshot, generated. Don't edit by hand |
| — | `tools/update-github.py` | Regenerates the snapshot |

## Refresh the GitHub numbers

```bash
python tools/update-github.py
# optional, for a higher API rate limit:
GITHUB_TOKEN=ghp_xxx python tools/update-github.py
```

Standard library only. Commit the new `assets/github-data.js` and push.

## Translating

Markup is written in French. Any element with `data-en="…"` switches to that English text;
`data-en-label` and `data-en-ph` do the same for `aria-label` and `placeholder`. Legal pages use
two `<article data-lang>` blocks instead.

## Preview locally

The icon sprite is loaded with `<use href>`, which browsers block on `file://`. Serve the folder:

```bash
python -m http.server 8000
```

## Licence

Code under the [MIT licence](LICENSE.md). Text and avatar © DooubleTap. Brand logos belong to
their owners.
