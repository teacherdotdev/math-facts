# Math Facts Drill

A single-page drill for multiplication facts and signed-integer arithmetic. One app file, no framework, no server, no database.

## How a session works

1. Student enters a first name and chooses **Multiplication facts** or **Signed integer operations**.
2. For multiplication, the student taps the set they're practicing (A–V, then AA–RR). The app builds **36 questions**: each new fact in the chosen set appears **4 times**, and the remaining slots are filled with review facts drawn only from *earlier* sets — never a fact outside the sequence. A standard 4-fact set is 16 new + 20 review.
3. For signed integers, the student can multiply with factors through ±12, or choose addition, subtraction, or mixed practice with answers within ±10 or ±20. The app balances all four positive/negative operand combinations. Negative second operands are parenthesized, so subtraction is shown clearly: `5 − (−3)`.
4. Questions are mixed so no fact ever lands next to itself.
5. Correct → a short encouraging reply. Incorrect → the fact in a full sentence ("Ten times six is sixty." or "Five minus negative three is eight."), a prompt to say it three times, then practice **resumes three questions back**. One correction per wrong answer.
6. Typing `done` (or pressing **Finish session**) ends the drill and prints a session line the student copies:

   `Session ID: T931, Name: Matt, Set: F, Questions: 36`

   Signed-integer sessions name the selected practice instead:

   `Session ID: T931, Name: Matt, Practice: Mixed ±10, Questions: 36`

Typing `debug` in the answer box shows the multiplication set's new facts or the signed round's operation balance. It's unlisted — there's no button and nothing on screen mentions it.

No mastery, no scoring, no progress tracking — the app only facilitates the timed practice.

## Student data

None is collected. The name and answers live in the browser tab only; nothing is written to a server, a database, or even browser storage. Closing the tab erases the session, so no PINs or logins are needed.

## Hosting

Open `index.html` directly, or serve it anywhere static — Vercel, Netlify, GitHub Pages.

On Vercel, `vercel.json` already sets the build command (`node build.js`) and output directory (`dist`), so importing the repo is enough. The build step exists only to inject analytics; with no token set it copies the site through unchanged.

## Analytics

Cloudflare Web Analytics is wired up through one environment variable:

| Variable | Where | Value |
| --- | --- | --- |
| `CF_BEACON_TOKEN` | Vercel → Settings → Environment Variables | The token from Cloudflare → Web Analytics → your site → "Manage site" |

`build.js` injects the beacon at deploy time. **If the variable isn't set, no beacon is injected at all** — so local files, GitHub Pages, and preview deploys stay analytics-free unless you opt them in. A token that isn't alphanumeric is rejected rather than written into the page.

The token isn't a secret (it ships in the page source of any site using Cloudflare analytics), so the env variable is for configuration, not secrecy. Cloudflare Web Analytics is cookieless and doesn't fingerprint or identify visitors, which keeps the app's no-student-data posture intact — it counts page views, not people.

## Editing the fact sequence

The sets live in the `SETS` array near the top of the `<script>` in `index.html`, written as `"3x4"` strings in sequence order. Add or reorder entries there; review facts are computed from whatever precedes each set.

## Session composition, exactly

Most sets have 2–4 new facts, so the arithmetic is simply *facts × 4 new slots*, with review filling the rest. Three situations need a rule:

| Situation | Sets | What happens |
| --- | --- | --- |
| More new facts than four copies can fit | K (12 facts) | Copies drop to the largest number that still leaves 12 review slots — Set K runs 24 new + 12 review from Sets A–J |
| No earlier sets to review from | A | All 36 questions come from Set A itself, each of its 15 facts 2–3 times |
| Review pool smaller than the slots to fill | B (15 available, 24 needed), C (18 available, 20 needed) | The pool is reshuffled and reused rather than reaching outside the sequence |

Every new fact in the chosen set is guaranteed to appear, and no question is ever drawn from a later set.

## Checking changes

Run `node test.js` to check every multiplication set and repeatedly verify the signed-question ranges, answers, operation balance, and sign-pattern balance. Run `node build.js` to produce the deployable `dist/` copy.
