# Keeton Martin Personal Site

Source for [keetonmartin.com](https://keetonmartin.com), a React-based personal site with sections for background, resume, projects, and contact information.

This repository no longer uses the old `react-nice-resume` package or the `particles-bg` library. The app is a custom Create React App project that renders content from `public/resumeData.json`.

## Tech Stack

- React 17
- Create React App / `react-scripts`
- Static JSON content in `public/resumeData.json`
- CSS in `src/App.css`, `src/index.css`, and legacy public CSS/font assets

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

The npm scripts use `scripts/run-react-scripts.js`, which adds the OpenSSL legacy provider flag on newer Node versions. Set `PUBLIC_URL` explicitly before building if the generated assets need to assume a non-root base path.

## Content

Most site copy, links, resume entries, skills, and portfolio items live in:

```text
public/resumeData.json
```

Portfolio images are stored in:

```text
public/images/portfolio/
```

General site images and icons are stored under:

```text
public/images/
public/
```

## Deployment

The app's package metadata points at the custom domain:

```json
"homepage": "https://keetonmartin.com"
```

Production assets are generated with `npm run build`. The `public/CNAME` file points the published site at the custom domain.
