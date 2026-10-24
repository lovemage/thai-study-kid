# Thai Sprout

An iPad-friendly Thai consonant introduction for ages 6–8. Eleven island chapters teach all 44 consonants in the ก→ฮ order used in Thai classrooms, four letters per island; the parent explorer also opens any letter directly. The home screen is an adventure map: each chapter is an island that starts grey and withered and comes alive with an animation once its four letters are done; the next island unlocks after the previous one. Each lesson follows Listen → Write → Play with large buttons, English or Traditional Chinese hints, animated vocabulary and finger/Pencil practice.

## OpenRouter teacher voice

Netlify Function `/api/voice` calls OpenRouter's speech endpoint using `google/gemini-3.8-flash-tts`, voice `Sulafat`. The teacher uses warm, relaxed delivery in Thai and English. This is AI-generated speech. Only the 138 fixed lesson scripts can be requested; no child recording, microphone, arbitrary text input or child data is sent.

Set `OPENROUTER_API_KEY` in the Netlify project environment variables. On the free plan, keep the default **all scopes / all contexts**; choosing individual scopes requires Pro. Do not put keys in dist, netlify.toml, Git or client JavaScript. Redeploy after changing variables. No paid Netlify upgrade is needed for the default setting. OpenRouter generation uses the account's credits.

Generated WAV files are cached in Netlify Blobs and at the CDN. The function accepts fixed clip IDs only, limits requests and enforces allowed browser origins. Cache hits avoid further generation. In-flight duplicate generation is coalesced within a function instance. Simultaneous cold requests across separate instances can still duplicate generation. Original NIU Thai letter-name recordings are the fallback if the API is unavailable; English hints remain readable. A failed word-only request falls back to the full letter-name recording.

## Run and deploy

`npm ci`, then `npx netlify dev` for the complete application. For the static interface, `python -m http.server 5173 --directory dist`; static previews use the production Netlify voice API. Deploy with `npx netlify deploy --prod --site c4a2b956-8f82-43d1-ac2f-fbd084ca5a39 --no-build --dir dist --functions netlify/functions`.

The public site requires no ChatGPT account. Tap a sound button to unlock audio on iPad Safari. Use Safari's Add to Home Screen if desired. Drawing supports Pointer Events, pointer capture, touch-action:none and high-DPI canvases. Progress is saved only in this browser. Drawings last for the visit and are never saved or exported. No handwriting grading is performed.

## Learning and sources

Consonant introduction; vowels and tone rules are outside these starter lessons. Letter-name words do not always start with the target letter. ฃ and ฅ are historical. Use the writing animation for direction; the pale tracing letter guides shape.

Thai letter-name recordings and writing models: NIU SEAsite, https://seasite.niu.edu/Thai/basic/alpha_cons_table.htm. The stroke-order GIFs were traced into vector stroke paths (dist/assets/writing.json, with each source URL); the same path drives the smooth writing demo, the pale tracing guide and the copy model. Starter illustrations are original SVG; additional explorer pictures use device emoji. Fonts: DM Sans and Noto Sans Thai Looped (looped letterforms, matching handwriting), with system fallbacks. No analytics.

## Verification

Run `node --test tests/voice.test.mjs` and `node check-assets.cjs`. Tests cover API request construction, PCM/WAV integrity, invalid input/origin rejection, missing credentials, provider failures, response size limits and all 44 lesson assets. Browser verification covers drawing, progression, matching feedback and language switching. Actual iPad Safari / Pencil hardware and a native speaker review of generated pronunciation remain separate checks.

API references: https://openrouter.ai/docs/guides/overview/multimodal/tts and https://ai.google.dev/gemini-api/docs/speech-generation.

## Letter reveal and illustrated writing modes

Each new letter starts with its card face down. Tap the card or Listen: the cover shows a waiting animation while audio downloads and decodes. Actual audio playback triggers a lifted 3D flip and short sparkle. Prefetching alone never reveals the card. Failed or cancelled playback leaves it covered; replay keeps an already revealed card open. Reduced-motion preferences show the result without the turn or sparkles.

Writing modes use illustrated buttons (dotted tracing, copying from a model, independent writing) with a selected check mark and accessible English/Chinese names. The coach hint and practice canvas change together. Run `node --test tests/reveal.test.mjs` for readiness, repeated taps, cancellation and failed audio checks.

## Matching game cards

Find my friend begins with all three choices covered. The question audio's playback-start event flips them in a short left-to-right sequence, then enables answering. Failed loading and unrelated hint/reward sounds never reveal answers. The answer labels are also hidden from accessibility names until the reveal. Replaying audio keeps the current question's positions stable.

Each new round samples two distinct distractors and shuffles all three choices. The previous full arrangement for that letter is saved in browser progress and cannot repeat immediately. Correct answers may naturally recur in the same column when the other choices change; there is no predictable left-middle-right cycle. Tests: `node --test tests/quiz-cards.test.mjs tests/reveal.test.mjs`.
