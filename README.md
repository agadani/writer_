# writer_

A terminal-like, minimalish, customizable writing app with local storage and cloud sync.  Deployed at https://writer-kl2.pages.dev/

Inspired by writer.bighugelabs.com, which is amazing but lacked the offline features I wanted. 

The whole thing is one HTML file.

## What it does

- Lets you write 
- Saves automatically to IndexedDB.
- Lets you comment out text!  (%%comment%% by default)
- Syncs across devices (including mobile) via Google Drive.
- Each synced doc also shows up as an editable Google Doc, so you can edit there too.
- Works offline. Keeps writing, syncs when you're back online.
- Folders, version history, split-pane editing, import/export (.txt, .md, .docx).
- Customizable themes 
- Keypress sounds 

See [HISTORY.md](HISTORY.md) for the gory technical details.

## Running locally

```
npx wrangler pages dev public
```

## Deploying

```
npm run deploy
```

This pushes to the bare `writer-kl2.pages.dev` URL.  Note the `--branch production` flag in the script: the Cloudflare Pages project is configured with its "production branch" set to `production`, while this repo's default branch is `main`.  A plain `wrangler pages deploy` *without* the flag silently lands in the Preview environment and the bare URL keeps serving the previous build — easy to miss because the per-deploy hash URLs *do* update.  Either keep the `--branch production` in the deploy script, or change the project's production branch to `main` in the Cloudflare dashboard (Workers & Pages → writer → Settings → Builds & deployments → Production branch).

## Why?

Wordperfect was the last perfect editor.  This is an homage to what it could look like today.

