# VEYORA — One profile. Infinite states.

Static site. No build step, no dependencies. Works on GitHub Pages.

    index.html  style.css  script.js
    content/profiles.txt  content/channels.txt  content/posts.txt

## Run it
Serve the folder over http (opening index.html straight from disk blocks `fetch`, and VEYORA falls back to a tiny built-in origin):

    python3 -m http.server   →   http://localhost:8000

On GitHub Pages: push these files, enable Pages, done.

## Add content (never touch HTML)
- **Post**: add a `(- POST -)` block to `content/posts.txt`. First block = post 1, last = newest. Numbers and links are automatic.
- **Profile**: add a `(- PROFILE -)` block to `content/profiles.txt`.
- **Channel**: add a `(- CHANNEL -)` block to `content/channels.txt`.
- Media: put a link on its own line. Images, video, audio, files, YouTube and Shorts are detected from the link.
- Lines starting with `// ` are comments. A damaged block is skipped, the rest still loads.

## URLs
    ?profile=veyora              a profile (any handle works, see below)
    ?profile=veyora&at=-40       the profile's stream, positioned at post -40
    ?post=<id>                   one post; resolved directly, no scrolling needed
    ?search=alpha&kind=channel   search (kind: profile | channel, optional)

Written posts get an id derived from their text (`x1k3…`). Generated posts use `handle.number`,
e.g. `?post=veyora.-12` is written `veyora.n12`. Any `name_xyz` handle (or `name-xyz` for negative positions) is a real profile.

## How the infinity works
- Every integer is a position, in both directions (BigInt, no ceiling). Profile *k* and post *n* of profile *k* are generated from seeded hashes, so the same position always gives the same result.
- Handles encode their position, so a link is resolved by decoding it, not by searching.
- Only the items near the viewport exist in the DOM; far items are removed and rebuilt on return. Scroll compensation keeps upward scrolling steady.
- Search scans outward from the origin in 9 ms slices and only as far as the scroll position needs. Nothing is capped.
- Written profiles and posts from `content/` sit at the centre (profiles 1…n, posts 1…n); generated "echoes" continue on both sides.
