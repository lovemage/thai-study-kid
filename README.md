# Thai Sprout

An iPad-friendly Thai consonant introduction for ages 6–8. Four starter chapters introduce 16 common letters; the explorer covers all 44 consonants. English / Traditional Chinese hints, recorded Thai letter names, device-based English explanations, JavaScript-animated vocabulary, writing models, finger/Pencil practice and a matching game.

## Run locally

Requires Python 3. From this folder run:

```sh
python -m http.server 5173 --directory dist
```

Open http://localhost:5173. Serve through HTTP; opening index.html as a file does not load the writing metadata reliably. Hosting only needs the contents of dist/. No build or API key is required.

## iPad

Open the published URL in Safari. The hosted version is public and does not require a ChatGPT sign-in. Tap the audio buttons to start playback. Adjust media volume. Thai letter-name audio is bundled. Word-only Thai speech uses an available Thai device voice, falling back to the bundled full letter-name-and-word recording. English explanations require an English speech voice. Speech synthesis availability and voice quality vary by device.

Drawing uses Pointer Events, pointer capture, touch-action:none and device-pixel-ratio canvas scaling. It supports finger, mouse and Apple Pencil input, undo, clear and PNG export. Learning progress is in browser localStorage only; drawings stay in memory during the visit and clear on refresh. No handwriting accuracy grading is performed.

## Learning scope

This is an introduction to consonants, not a full primary-school Thai curriculum. Vowels, syllable-final consonants and tone rules are intentionally outside the first lessons. Romanization is approximate. Picture words name consonants and do not always begin with the target character. ฃ and ฅ are marked historical.

## Sources and credits

Thai letter-name recordings and writing animation models: Northern Illinois University SEAsite, https://seasite.niu.edu/Thai/basic/alpha_cons_table.htm. Source URLs for each writing model are preserved in dist/assets/writing.json. The original GIF frames are packaged as PNG sprite sheets and played by JavaScript with replay/pause/speed controls. Starter vocabulary illustrations are original SVGs; additional explorer pictures use device emoji.

Fonts: DM Sans and Noto Sans Thai from Google Fonts, with system fallbacks. The app has no trackers or analytics.

## Checks

JavaScript syntax checks and asset integrity validation were run. Browser checks covered small-screen and simulated landscape layout, drawing, stage controls, quiz feedback, navigation and language switching. Actual iPad Safari / Apple Pencil hardware and device voice quality require device verification.
