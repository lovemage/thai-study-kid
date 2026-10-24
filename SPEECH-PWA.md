# Speaking practice and PWA

Speaking practice uses the device's built-in dictation through the Web Speech API (`webkitSpeechRecognition`, language `th-TH`): on iPad this is the same engine as keyboard dictation. There is nothing to download and no API key or usage charge. Dictation is processed by Apple (or the browser vendor) and may be sent to its servers; Thai Sprout itself never uploads or stores recordings. On iPad, a grown-up enables Settings → General → Keyboard → Enable Dictation and allows the microphone for Safari.

The child taps the microphone, says the picture word and taps again (or waits; listening stops after 6 seconds). Dictation returns up to five guesses; if any of them is the word, the child is celebrated, otherwise they hear the teacher and are invited to try again. Matching keeps Thai tones and vowels (`dist/speech-core.mjs`), so a near word is a gentle retry, never a grade, and retries never block a lesson.

When dictation is missing, switched off, offline or refused by the service, the panel switches to record and compare: the child records up to 6 seconds, hears their own voice, then the teacher's word, with no judging. Navigating, cancelling, backgrounding or the teacher starting to talk stops listening and releases the microphone; late results are ignored.

The earlier on-device Whisper (whisper-base, q8) was removed: on the teacher's own clean recordings it recognised 2 of 9 words (for example ไก่ → กาย, เต่า → 包), and it needed a 110 MB download.

PWA: first-use install banner, iOS Safari illustrated manual instructions, Android deferred install prompt when available, standalone manifest and icons. The service worker precaches the whole release (fetched from the server, bypassing the HTTP cache) plus the 44 original Thai recordings, and caches fixed teacher clips as they are used. New workers wait for old windows to close, avoiding a mid-lesson reload. Bump `VERSION` in `dist/sw.js` with every release that changes `dist/`. Browser and Home Screen storage may differ, especially on iOS; progress is not cloud-synced.

Validation: `node --test tests/*.test.mjs`, `node check-assets.cjs`. Real iPad dictation of Thai, children's voices and the Home Screen app still need testing on the device.
