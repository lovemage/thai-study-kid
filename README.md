# Thai Sprout

An iPad-friendly Thai consonant introduction for ages 6–8. Four chapters introduce 16 letters; the parent explorer contains all 44. Each lesson follows Listen → Write → Play with large buttons, English or Traditional Chinese hints, animated vocabulary and finger/Pencil practice.

## OpenRouter teacher voice

Netlify Function `/api/voice` calls OpenRouter's speech endpoint using `google/gemini-3.8-flash-tts`, voice `Sulafat`. The teacher uses warm, relaxed delivery in Thai and English. This is AI-generated speech. Only the 138 fixed lesson scripts can be requested; no child recording, microphone, arbitrary text input or child data is sent.

Set `OPENROUTER_API_KEY` in the Netlify project environment variables. On the free plan, keep the default **all scopes / all contexts**; choosing individual scopes requires Pro. Do not put keys in dist, netlify.toml, Git or client JavaScript. Redeploy after changing variables. No paid Netlify upgrade is needed for the default setting. OpenRouter generation uses the account's credits.

Generated WAV files are cached in Netlify Blobs and at the CDN. The function accepts fixed clip IDs only, limits requests and enforces allowed browser origins. Cache hits avoid further generation. In-flight duplicate generation is coalesced within a function instance. Simultaneous cold requests across separate instances can still duplicate generation. Original NIU Thai letter-name recordings are the fallback if the API is unavailable; English hints remain readable. A failed word-only request falls back to the full letter-name recording.

## Run and deploy

`npm ci`, then `npx netlify dev` for the complete application. For the static interface, `python -m http.server 5173 --directory dist`; static previews use the production Netlify voice API. Deploy with `npx netlify deploy --prod --site c4a2b956-8f82-43d1-ac2f-fbd084ca5a39 --no-build --dir dist --functions netlify/functions`.

The public site requires no ChatGPT account. Tap a sound button to unlock audio on iPad Safari. Use Safari's Add to Home Screen if desired. Drawing supports Pointer Events, pointer capture, touch-action:none and high-DPI canvases. Progress is saved only in this browser. Drawings last for the visit; export PNG to keep them. No handwriting grading is performed.

## Learning and sources

Consonant introduction; vowels and tone rules are outside these starter lessons. Letter-name words do not always start with the target letter. ฃ and ฅ are historical. Use the writing animation for direction; the pale tracing letter guides shape.

Thai letter-name recordings and writing models: NIU SEAsite, https://seasite.niu.edu/Thai/basic/alpha_cons_table.htm. Source URLs are in dist/assets/writing.json. Original GIF frames are PNG sprite sheets played by JavaScript. Starter illustrations are original SVG; additional explorer pictures use device emoji. Fonts: DM Sans and Noto Sans Thai, with system fallbacks. No analytics.

## Verification

Run `node --test tests/voice.test.mjs` and `node check-assets.cjs`. Tests cover API request construction, PCM/WAV integrity, invalid input/origin rejection, missing credentials, provider failures, response size limits and all 44 lesson assets. Browser verification covers drawing, progression, matching feedback and language switching. Actual iPad Safari / Pencil hardware and a native speaker review of generated pronunciation remain separate checks.

API references: https://openrouter.ai/docs/guides/overview/multimodal/tts and https://ai.google.dev/gemini-api/docs/speech-generation.
