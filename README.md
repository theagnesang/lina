# LinkedIn Draft Preview

A static mockup of LinkedIn's feed used to review Agnes's LinkedIn post drafts before publishing. Not a real LinkedIn integration — purely a visual review tool.

## How it works

- `data/drafts.json` holds all ideas and their draft variants (angle, post text, hashtags, CTA, visual suggestions).
- `index.html` + `js/app.js` render the JSON as LinkedIn-style feed cards, filterable by idea.
- Drafts within an idea are sorted newest-first; ideas are ordered by most recent draft activity.

## Adding new ideas/drafts

Append a new object to the `ideas` array in `data/drafts.json` following the existing shape. No code changes needed — the page reads the JSON at load time.

## Viewing locally

Open `index.html` in a browser, or serve the folder with any static file server (required for `fetch()` to load the JSON over `file://` in some browsers):

```
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Hosting on GitHub Pages

A workflow at `.github/workflows/deploy-pages.yml` deploys the site on every push to `main`. To activate it:

1. Merge this branch into `main`.
2. In the repo settings, go to **Settings → Pages → Source** and select **GitHub Actions**.
3. The site will be published at `https://<owner>.github.io/<repo>/`.
