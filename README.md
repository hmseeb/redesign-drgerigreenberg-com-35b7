# Greenberg Acupuncture Chiropractic

Website for Dr. Geri Greenberg — One Doctor | 5 Healing Methods | Over 25 Years Experience.

Vanilla HTML, CSS and JavaScript. No build step, no dependencies: serve the
repository root as a static site.

## Pages

| Route            | File                      |
| ---------------- | ------------------------- |
| `/`              | `index.html`              |
| `/about/`        | `about/index.html`        |
| `/acucalm/`      | `acucalm/index.html`      |
| `/testimonials/` | `testimonials/index.html` |
| `/contact/`      | `contact/index.html`      |

`/review` is provided by the hosting platform and is intentionally not built here.

## Structure

```
assets/css/styles.css   design system + all page styles
assets/js/main.js       mobile nav, scroll reveal, form handling
images/source/          photography carried over from the previous site
favicon.svg             site icon
```

## Forms

Both forms (Contact, AcuCalm booking) POST to the LeadrVision endpoint and
work with or without JavaScript:

- `method="POST"` to `https://vision.leadrai.com/api/forms/b78ef18f1285d5ef5211ee31410e65e0`
- hidden `_form` (form name), `_page` (set to `window.location.href` on load),
  and `_gotcha` honeypot fields
- with JS, submissions are sent via `fetch()` as JSON to the same URL and the
  confirmation is shown inline
- without JS, the browser posts normally and returns to the page with
  `?submitted=1`, which renders the same confirmation

## Local preview

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.
