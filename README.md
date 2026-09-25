# Adam

An interactive 3D anatomy companion for studying the classical physicians. Read Maimonides, Hippocrates, Galen and Avicenna with the structures they discuss lit up on the body, and see the modern description of each organ beside the classical understanding of it.

Adam is a fork of [Human Atlas](https://github.com/ashemag/human-atlas) (MIT), which renders the BodyParts3D adult male reference as **2,234 individually selectable meshes** with 15 system layers, search and exploded views. Adam adds a study layer on top of it.

## Accounts and Adam Membership

Adam is free to open. Reading any physician’s texts requires an account (Clerk) and **Adam Membership** (Stripe, $248 a year). The atlas, Library browsing and Structures are free. New subscriptions are annual only; existing subscriptions retain their billing schedule. Who may read what is decided in `shared/tiers.ts`; the hash routes `#/sign-in`, `#/sign-up` `#/membership` and `#/account` are the app's own pages, built on Clerk's hooks.

In production the corpus is served by `api/content.ts` from a private R2 bucket, never from the static build: the function verifies the session token, checks the work's tier, and streams the chapter. `api/checkout.ts` and `api/portal.ts` open Stripe's pages; `api/webhook.ts` writes the subscription state onto the Clerk user (`publicMetadata.plan`), which is all the app and the function ever consult.

Setup: copy `env.example` to `.env.local` (`clerk env pull` fills the Clerk keys), `npm run corpus:sync` to push `content/` to R2. Daily work is `npm run dev` with the local corpus and client-side membership checks; `npm run dev:vercel` runs the functions and reads from R2 like production, with `stripe listen --forward-to localhost:3030/api/webhook` for billing events.

## The study layer

- **Works and chapters.** A library of texts, each chapter loading in a reading pane beside the body. The library is **Maimonides**: the nine medical works of volume 1, chapter by chapter. Hippocrates, Galen and Avicenna appear as background information only; their corpora can be registered later (see below) but are not surfaced.
- **Lessons.** A chapter can be mapped to the anatomy it discusses. Opening it highlights the organ under discussion in **teal** and related structures in **amber**, sets the visible layers so nothing hides them, and shows a short note on what to look at. *On Asthma* is fully mapped: its introduction and thirteen chapters.
- **Live terms.** Every anatomical word in the text — lungs, windpipe, brain, stomach, liver, spleen, gall, bowels, testicles, skin, pores… — is a link. Tap it and the structure lights up, with a card that sets the modern anatomy beside the **classical view**: faculty, temperament and the Galenic account of what the organ does. The classical vocabulary is in `app/lexicon.ts`; the notes in `app/classical.ts`.
- **Juxtaposition everywhere.** Tapping a structure on the body opens the usual detail panel, now with the classical view added when one exists.

## Run locally

Requires Node.js 22.13 or newer.

```sh
npm ci
npm run dev        # http://localhost:3016
```

### Adding the texts

The texts are **not in this repository**. Adam reads them from `content/`, which is gitignored, and serves them only from the development server. Symlink or copy a corpus in:

```sh
mkdir -p content
ln -s ~/Maimonides-Medical-Works-Vol1 content/maimonides     # 84 chapter files, one per chapter
```

Maimonides is registered by hand in `app/study.ts` (chapter files, titles, page numbers, lessons). The production build ships the atlas but no texts; the reader says so when a chapter is missing.

Later, when the other physicians join the library: symlink `content/hippocrates`, `content/galen`, `content/avicenna` and run `npm run corpus`, which regenerates `app/corpus.ts` from each work's `00-index.md`. The generated list is validated but not shown until it is composed into the library in `app/page.tsx`.

Why this split: the Maimonides translation (Gerrit Bos, Brill 2021) is in copyright, so it stays on your machine. The Hippocrates and Galen texts come from Perseus and First1KGreek (CC-BY-SA-4.0), with machine translations from the Greek where no public-domain English exists; Avicenna from OpenITI (CC-BY-NC-SA-4.0).

## Validate

```sh
npm run check      # TypeScript
npm run validate   # atlas buffers, exploded layouts and interactions, then the study layer
```

The study validator checks that every atlas concept name referenced by lessons, the lexicon and the classical notes exists in `atlas.json`; that lesson and work ids are unique; that the term matcher prefers longer terms and respects word boundaries; that front matter and navigation lines are stripped; and, when a corpus is present, that every registered chapter file exists.

## How it works

- `app/study.ts` — authors, works, chapters and lessons. A lesson is `{work, file, focus:[{role, concepts}], systems, theme}`; concepts are atlas concept names resolved at runtime.
- `app/lexicon.ts` — classical term → concept names. `app/reader-text.ts` turns matches in the rendered chapter into buttons.
- `app/classical.ts` — the classical view of each organ, written for study, shown beside the modern description.
- `app/reader.tsx` — the reading pane; fetches `/content/<dir>/<file>`, renders markdown, links terms, keeps printed page numbers and CTS citation anchors as small labels, and follows the corpus's own relative links between chapters and versions.
- `app/scene.tsx` — the selection texture now carries a role channel; the shader mixes teal for the structure under discussion and amber for related anatomy.
- `vite.config.ts` — a development-only middleware that serves `content/` under `/content/`, refusing paths that escape it.
- `scripts/build-corpus-index.mjs` — generates `app/corpus.ts` from the Greek and Arabic corpora.
- `scripts/build-specimens.mjs` (`npm run specimens`) — cuts one small mesh per noted structure out of the atlas into `public/models/specimens/` and generates `app/specimens.ts`, for the Structures pages. Re-run after adding a note to `app/organ-notes.ts`.

## Roadmap

- Map the remaining Maimonides works: *On Hemorrhoids*, *On Coitus*, *On the Regimen of Health*, the *Medical Aphorisms* (organs, humours, pulse, urine…), the *Commentary on the Aphorisms*.
- Hippocratic lessons, starting from *On the Nature of Man* (the humours), *On the Sacred Disease* (the brain), *On the Heart*, *On Glands*, *On Anatomy*.
- Galen translations, then Avicenna's *Canon* Book I.
- A humours and faculties overlay: the four humours, the three pneumata and the principal organs as a layer on the body.

## Anatomy data and credits

Adam's application code is MIT, as is the Human Atlas it forks (© Chaz Shemag). The anatomy is **BodyParts3D 4.0**, © The Database Center for Life Science, licensed CC BY 4.0; full credits and adaptation notes are in [ATTRIBUTION.md](public/ATTRIBUTION.md). Preserve the attribution when redistributing the data.

The classical notes summarise Galenic physiology as the medieval physicians used it. They are historical explanations for study, not medical advice. This is an educational explorer, not a diagnostic or surgical tool.

## Institution inquiry form

`#/institutions` guides visitors through one question at a time, including work email and an optional mobile number, with a progress bar, Back navigation and an editable final review. It collects qualification details and posts to `/api/institution-inquiry`. The server sends a formatted HTML brief with a plain-text fallback to **menachem@renaissanceml.com**, with the visitor’s email as Reply-To. A second branded email confirms receipt to the submitter, signed by Menachem, with replies directed to menachem@renaissanceml.com. Both are submitted in one Resend batch with a shared idempotency key. It never accepts a destination from the client and does not save form submissions locally.

Set `RESEND_API_KEY` from the existing RenaissanceML Resend account and `INQUIRY_FROM_EMAIL="Adomeh <hello@adomeh.com>"` (using the verified Adomeh domain) in `.env.local` and the Vercel environment. `APP_ORIGIN` must match the production website origin. Restart Vite after changing environment variables. Plain Vite serves this endpoint locally; when `VITE_API_ORIGIN` is set, it uses the existing API proxy instead. Missing configuration returns an explicit failure, never a success message.

Validation, request-size limits, same-origin checks, a honeypot and per-instance email throttling guard the endpoint. Identical submissions use Resend idempotency keys to avoid duplicate mail on retries. The in-memory throttle is best effort across serverless instances; use platform rate limits if traffic warrants it.

Run `node --experimental-strip-types --test scripts/institution-inquiry.test.mjs` to verify validation and mail handling without sending emails. Provider reference: https://resend.com/docs/api-reference/emails/send-email
