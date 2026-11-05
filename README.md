# b.log — somewhere

A full-bleed photographic journal: discover stories through objects in a surreal pool scene. Buildless HTML, CSS and JavaScript. No third-party runtime dependencies or tracking.

## Preview

Serve `dist/` using any static server, for example `python -m http.server 8000 --directory dist`.

## Editing posts

Edit `dist/posts.js`. Each post has a unique `id`, `title`, `category` (`journal`, `places`, `finds`, `notes`), ISO `date`, `excerpt`, and a `body` array of plain-text paragraphs. Set `sample: false` after replacing the illustrative copy. Text is escaped before rendering. Re-deploy after editing.

Direct links: `#archive`, `#about`, `#post/slow-day`. All content is public static content; never store secrets or unpublished sensitive drafts here.

## Interactions

- The photograph carries six rows, each containing `a`–`z` and `-` on a single line. Select one letter per row. The selected letters also form a vertical word in the left rail.
- Completing `memory` opens the archive automatically. `-` clears a row. Reset clears all rows and cancels any pending opening; a hint can be toggled.
- Each row has one Tab stop. Arrow keys move across letters; up/down move between rows. Typing a letter selects it and advances a row. Backspace clears the current/previous row.
- Narrow viewports preserve one-line alphabets with horizontal scrolling and a fixed selected-letter rail.
- Top-left wordmark: about. `/`: archive search. Escape: close. Native dialog provides keyboard focus trapping. A keyboard skip link opens the archive directly.
- Reduced-motion setting respected.

## Deployment

Deploy `dist/` to any static host. `.openai/hosting.json` identifies the ChatGPT Sites deployment. GitHub Actions workflow builds a GitHub Pages artifact; choose GitHub Actions as the Pages source in repository settings to activate that optional destination.

The hero image is AI-generated for this project. Supplied post copy is illustrative and visibly labeled SAMPLE.
