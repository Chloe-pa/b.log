# b.log — somewhere

A full-bleed photographic journal: discover stories through objects in a surreal pool scene. Buildless HTML, CSS and JavaScript. No third-party runtime dependencies or tracking.

## Preview

Serve `dist/` using any static server, for example `python -m http.server 8000 --directory dist`.

## Editing posts

Edit `dist/posts.js`. Each post has a unique `id`, `title`, `category` (`journal`, `places`, `finds`, `notes`), ISO `date`, `excerpt`, and a `body` array of plain-text paragraphs. Set `sample: false` after replacing the illustrative copy. Text is escaped before rendering. Re-deploy after editing.

Direct links: `#archive`, `#about`, `#post/slow-day`. All content is public static content; never store secrets or unpublished sensitive drafts here.

## Interactions

- Blue knot: featured story.
- Orange: short note.
- Asterisk: archive with live search and category filters.
- Top-left wordmark: about.
- Slanted lower-right caption: places story.
- `/`: archive search. Escape: close. Native dialog provides keyboard focus trapping.
- Mobile: persistent archive shortcut; image hotspots follow the photograph's cover crop.
- Reduced-motion setting respected.

## Deployment

Deploy `dist/` to any static host. `.openai/hosting.json` identifies the ChatGPT Sites deployment. GitHub Actions workflow builds a GitHub Pages artifact; choose GitHub Actions as the Pages source in repository settings to activate that optional destination.

The hero image is AI-generated for this project. Supplied post copy is illustrative and visibly labeled SAMPLE.
