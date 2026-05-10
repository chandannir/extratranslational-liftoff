# ExtraTranslational

A small web app for **learning and matching words to what your camera sees**. You can record yourself, teach “alien” sounds that map to objects, and build a personal word list — all in the browser, with a local server for login and storage.

---

## What you can do

| Area | In plain terms |
|------|----------------|
| **Live stream** | Turn on your webcam. The app draws boxes around things it recognizes (using COCO-style detection). |
| **Recording** | Record video + optional speech matching: say a word and the app tries to link it to a visible object. |
| **Translator** | Lock onto the main object, then **say the word in another language** or use **Sound match** to teach a noise that means that object. |
| **Notepad** | After you’ve taught sounds in Translator, speak here and the app **types the English object name** it thinks it heard. You can **play back your last capture** to double-check the mic. |
| **Vocabulary** | Your saved words and clips; play them back when the link is still valid (new saves are stored so they survive refresh). |
| **Recordings** | List of saved takes with optional match tags. |

**Tip:** For speech features, **Chrome or Edge** usually work best (they support the Web Speech API).

---

## What you need installed

- **Node.js** (LTS is fine), so `npm` works in a terminal  
- A **microphone and camera** if you use live or recording features  
- **HTTPS** is used locally — your browser will warn about a **self-signed certificate** the first time; that’s normal for development.

---

## Quick start

### 1. Get the code and install packages

```bash
git clone https://github.com/chandannir/extratranslational-liftoff.git
cd extratranslational-liftoff
npm install
```

### 2. Configure environment (optional but recommended)

Copy the example env file and edit paths to match your machine:

```bash
copy .env.example .env
```

On Windows you might use paths like:

- `DB_PATH` → folder for `vocab.db` (e.g. `.\database\vocab.db`)
- `UPLOADS_PATH` → folder for uploaded files

See `.env.example` for variable names.

### 3. TLS certificates

The server expects **`key.pem`** and **`cert.pem`** next to the project (or paths your `server` code uses).  
If you don’t have them yet, create self-signed files with OpenSSL or your preferred tool, then start the server.

### 4. Run the app

```bash
node server/index.js
```

You should see something like **VocabPi running (HTTPS)** and a **port** (often **3000**).

### 5. Open in the browser

Go to:

```text
https://localhost:3000
```

- Accept the **“unsafe” / self-signed** warning if prompted.  
- **Create an account** or log in — your word list and recordings are tied to your username on this machine.

---

## Sound matching & Notepad (short version)

1. Open **Translator**, switch to **Sound match (alien)**, point the camera at an object, lock it, then **Record sound** and save.  
2. Repeat with **Re-train mode** if you want several samples per object — recognition improves.  
3. Open **Notepad**, press **Listen** (or **Record one word**). Matching uses fingerprints + optional DTW-style comparison; adjust the **Match** slider if needed.  
4. Use the **Last capture** player to hear what was just analyzed.

---

## Troubleshooting

| Issue | What to try |
|--------|-------------|
| **Port in use** | Stop the other program on that port, or change `PORT` in `.env`. |
| **Mic not working** | Allow microphone in the browser; use HTTPS (this app does). Try Chrome/Edge. |
| **Play button on old words** | Very old saves used temporary `blob:` links. **Re-save or re-record** those entries so clips are stored in a durable form. |
| **“Person” in the box list** | Detection can hide the `person` class when that filter is enabled in the client code. |

---

## Project layout (helpful if you’re browsing the repo)

- `client/index.html` — Single-page UI (camera, detection, translator, notepad, vocabulary).  
- `server/` — Express + HTTPS API (auth, recordings, vocabulary, etc.).  
- `database/` — SQLite file location (when using default paths).  

There may be optional **Python** experiments (e.g. under `cam2/`) for desktop camera workflows; the main product described here is the **Node + browser** stack.

---

## License

See repository license if one is specified; otherwise treat usage per your team’s policy.

---

*Questions or rough edges: open an issue or improve this README with what confused you first — that’s the best test of “user friendly.”*
