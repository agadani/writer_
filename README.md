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

## Why?

Wordperfect was the last perfect editor.  This is an homage to what it could look like today.

