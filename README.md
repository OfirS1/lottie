# Rule Dashboard

A responsive dashboard for browsing, editing, and adding rule definitions in English and Hebrew.

## Data privacy & persistence

The dashboard runs entirely in the browser. All edits are saved to `localStorage` on the device that
opened the page—no data is transmitted to a server. Use the **Download JSON** button to export the
current rule set or the **Reset to defaults** button to restore the original data.

To avoid any background calls, the UI relies only on system fonts and bundled assets. You can load
the page, disconnect from the internet, and continue editing without losing your work.

## Local development

```bash
npm install
npm run dev
```

This uses the Vercel CLI to serve the static site locally so the experience matches production as closely as possible.

## Deploying to Vercel

1. Authenticate with Vercel:
   ```bash
   npx vercel login
   ```
2. Link the project (one-time setup):
   ```bash
   npx vercel link
   ```
3. Deploy a preview build:
   ```bash
   npm run deploy
   ```
4. Promote to production when ready:
   ```bash
   npx vercel --prod
   ```

The included `vercel.json` configuration ensures the static assets are served correctly with long-term caching enabled for the CDN.
