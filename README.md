# Greenberg Acupuncture Chiropractic

Website for Dr. Geri Greenberg — One doctor. Five healing methods. One calm office.
Five treatments, one holistic approach, over 25 years of experience.

Vanilla HTML, CSS and JavaScript. No build step, no dependencies: serve the
repository root as a static site.

## Pages

| Route            | File                      |
| ---------------- | ------------------------- |
| `/`              | `index.html`              |
| `/about/`        | `about/index.html`        |
| `/acucalm/`      | `acucalm/index.html`      |
| `/health-library/` | `health-library/index.html` |
| `/testimonials/` | `testimonials/index.html` |
| `/contact/`      | `contact/index.html`      |

Review links point straight to the Google listing; there is no in-repo `/review` page.

## Structure

```
assets/css/styles.css   design system (jade + rust) + all page styles
assets/js/main.js       mobile nav, scroll reveal, form handling, background
                        music toggle, health-library category filter
audio/                  canyon-trilogy.mp3 — background music
images/source/          photography carried over from the previous site
favicon.svg             site icon
```

## Forms

Both forms (Contact, AcuCalm appointment) POST to the LeadrVision endpoint and
work with or without JavaScript:

- `method="POST"` to `https://vision.leadrai.com/api/forms/b78ef18f1285d5ef5211ee31410e65e0`
- hidden `_form` (form name), `_page` (set to `window.location.href` on load),
  and `_gotcha` honeypot fields
- with JS, submissions are sent via `fetch()` as JSON to the same URL and the
  confirmation is shown inline
- without JS, the browser posts normally and returns to the page with
  `?submitted=1`, which renders the same confirmation

## Background music

`audio/canyon-trilogy.mp3` loops quietly (volume `0.25`) on every page. Autoplay
is attempted on load and is blocked by most browsers — that is expected. A small
fixed rust button in the bottom corner always lets visitors play or pause, and
the choice is stored in `localStorage` under `gg-music` so it carries across
pages. If playback was wanted but blocked, it starts on the first interaction.

## Health library

`health-library/index.html` holds the article cards inline. Each card carries
`data-category`; the category filter buttons are wired up in
`assets/js/main.js`. Without JavaScript every card is visible
and each "Read" still expands, since the extracts use `<details>`. The page also
accepts a `?category=` deep link, e.g. `/health-library/?category=seasonal`.

## Local preview

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.
