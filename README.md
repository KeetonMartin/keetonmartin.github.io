# Keeton Martin Personal Site

Source for [keetonmartin.com](https://keetonmartin.com): a small React + Vite site with a quiet rail theme. Projects show up on a split-flap departure board, and work history is a route line that fills in as you scroll.

## Tech Stack

- React 19 and Vite
- Content in `src/data/site.json`
- Styles in `src/App.css` (Newsreader and IBM Plex Mono, from Google Fonts)
- All motion respects `prefers-reduced-motion`

## Local Development

Install dependencies:

```sh
npm install
```

Start the development server:

```sh
npm start
```

Run the test suite:

```sh
npm test
```

Build the production site:

```sh
npm run build
```

Vite builds the site for the domain root. Set `base` in `vite.config.js` explicitly before building if the generated assets need to assume a non-root base path.

## Content

Copy, links, projects, and work history live in `src/data/site.json`. The board shows the first six projects and hides the rest behind a "more departures" toggle. Each project's `status` is `Live`, `Source`, or `Retired`. The optional `image` is a screenshot in `public/images/projects/`, shown as a hover preview on desktop.

`public/llms.txt` is a plain-text summary for agents. Update it whenever the site content changes.

## Deployment

The app's package metadata points at the custom domain:

```json
"homepage": "https://keetonmartin.com"
```

Production assets are generated with `npm run build`. The `public/CNAME` file points the published site at the custom domain.
