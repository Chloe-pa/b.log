# b.log — server-gated photographic journal

The photograph and alphabet are public. A Cloudflare Worker validates codes and issues a 15-minute signed, Secure, HttpOnly, SameSite=Strict cookie. Every collection and article request checks the signature, expiration and exact collection grant. Closing the reading panel clears the cookie and browser content.

## Private content

`BLOG_CONTENT` (secret runtime JSON) holds an array of `{id, code, menu:{label,title,description,accent}, posts:[{id,title,category,categoryLabel,date,sample,excerpt,body:[]}]}`. IDs are random opaque strings. Each item holds only its own posts. A code contains 1–6 lowercase letters; the alphabet pads shorter codes with trailing `-`.

`BLOG_SESSION_SECRET` is a random secret with at least 32 characters. Configure both with Sites runtime secrets. Never commit actual content, actual codes, session keys or local environment files. There is no public menu discovery endpoint. After a correct code, the server returns an opaque collection ID; metadata and articles require the cookie. Neither browser globals nor hash changes grant access. These are shared-code controls, not per-person identity: anyone who knows/guesses a code can enter. Already disclosed files and Git history cannot be recalled.

To write or change posts, update the relevant entry in the secret `BLOG_CONTENT`, then redeploy the saved Site version so the new environment revision takes effect. No browser-side posts file is used.

## Build and test

`npm test` runs authorization tests using synthetic fixtures only. `npm run build` embeds an explicit public asset allowlist into the Worker and packages it. `npm run validate` checks the final ESM artifact. No dependencies required. The runtime handler is `server/handler.js`; public UI source is `public/`. Generated `worker/index.js` and `dist/` are ignored. Do not use static hosting or GitHub Pages for this version.

## Security scope

No-store headers protect API responses from shared caches. Same-origin POST checks protect unlock/lock operations. A best-effort per-IP, per-isolate 30-request/5-minute throttle limits casual guessing; it is not a globally durable distributed rate limiter. Use strong codes or individual authentication if determined guessing is a concern. Signed cookies are bearer grants and expire after 15 minutes; logout deletes the browser cookie, but does not revoke a previously copied grant server-side. Anything an authorized reader has viewed can be saved.

The previous static sample posts and code labels existed in public Git history; no real private journal content should be added there. The hero image is AI-generated, and existing copy is explicitly labeled SAMPLE.
