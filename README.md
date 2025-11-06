# Rule Dashboard

A responsive dashboard for browsing, editing, and adding rule definitions in English and Hebrew.

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
