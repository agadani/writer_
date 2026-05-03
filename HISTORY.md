# writer-cf

Distraction-free writing app. Single HTML file, no build step, deploys to Cloudflare Pages.

## Layout

```
public/
  index.html        everything (CSS + JS inlined, ~2600 lines)
  sw.js             service worker
  manifest.json     PWA manifest
  icon.svg
functions/
  api/oauth/token.js   token exchange for Google/OneDrive (needs client_secret)
```

## Deploying

```
npx wrangler pages deploy public --project-name writer
```

Google OAuth needs a secret set once:
```
npx wrangler pages secret put GOOGLE_CLIENT_SECRET --project-name writer
```

Client IDs go in the CONFIG block at the top of index.html (~line 14).

## How it works

All state lives in IndexedDB (`writer-cf`, v1). Six object stores: documents, folders, revisions, sessions, settings, clouds.

Thin DB wrapper: `W.dbPut`, `W.dbGet`, `W.dbAll`, `W.dbDel`, `W.dbIdx`.

### Theming

Five CSS vars on `:root`: `--bg`, `--text`, `--acc`, `--acc2`, `--cm`. Everything uses `color-mix()` for opacity. `applySettings()` sets them. Custom themes stored as JSON in settings.

### Editor

Textarea with invisible text + overlay div for syntax highlighting (comment markers). Same approach as CodeMirror. Scroll positions synced between the two. Split pane has its own pair.

### Sync

Single `writer-sync.json` manifest in Google Drive. Contains all docs, folders, metadata, and a `gdriveFiles` map (doc ID -> Drive file ID). Each doc also pushed as an editable Google Doc in a "Writer Backups" folder.

Pull: download manifest, check if any Google Docs were edited after manifest timestamp (user edited in GDocs), merge by doc ID. Last-write-wins, loser saved as "pre-sync backup" revision.

Push: upload changed docs as Google Docs, then upload manifest.

`syncAll()` does pull-then-push. Holds `isSyncing` for the whole cycle. Delete does push-only (no pull, to avoid re-importing the deleted doc).

Auto-push fires 30s after last edit. Auto-pull on page load. Offline: queues sync, fires on reconnect.

### OAuth

Google/OneDrive: PKCE in browser, but these providers still need `client_secret` for web apps, so the code exchange goes through `functions/api/oauth/token.js`. Dropbox: pure PKCE, no server needed.

Verifier in `localStorage` (survives mobile tab switches). Random state param.

### Audio

Web Audio API synthesis, no audio files. Four modes. Mobile needs `input` events (not `keydown`) because Android doesn't treat virtual keyboard events as user gestures. Audio context unlocked on first touch.

### Docx

Import: unzip in JS, decompress via `DecompressionStream`, parse `word/document.xml` with DOMParser, extract `w:t` text nodes.

Export: build minimal Office XML, zip it with a store-only zip writer.

## Known issues

- Deleting on device A doesn't propagate to device B. B still has the doc locally, and its next push puts it back. Needs a `deletedIds` array in the manifest.
- S3 push has no request signing. Only works with public-write buckets.
- Same doc open in both split panes: saves sync between them but there's a 1s debounce, so very fast simultaneous typing could race.
- OneDrive/S3 pull not implemented (push only).

## Shortcuts

Ctrl+B sidebar, Ctrl+N new doc, Ctrl+S save, Ctrl+\ split, F11 fullscreen, Esc close modal.
