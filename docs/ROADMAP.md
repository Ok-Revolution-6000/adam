# Adomeh roadmap

## Onboarding (research, 2026-10-14)

Not started. As a reference, the full Astra AI sign-up and first-run flow is in `docs/onboarding-research-2026-10-14/`: 31 screens in order, plus the patterns worth taking.

## R&D: realistic specimens (parked 2026-10-14)

**Decision:** the atlas and the Structures specimens stay as they are. Everything below is for later.

**What started it:** the Astra AI *Human Body Atlas* (app.astra-ai.co/en-US/lab/human-body-3d) shows a brain, lungs and heart that look like real, wet tissue. The audit is in `docs/atlas-audit-2026-10-14/report.html`, with its `evidence/` folder.

### What was tried

Branch `specimen-detail`, committed locally only. It is not pushed, merged or deployed.
- **Full-detail brain.** `scripts/build-specimens.mjs` can write a second, unsimplified file for the structures listed in `DETAIL`. For the brain, `brain-detail.bin` has 141k triangles instead of 16k. It is 2.5 MB raw and 1.2 MB gzipped. The brain's page shows the small file first, then swaps in the full one. The index tiles are unchanged.
- **Atlas-style lighting** in `app/specimen.ts`:
  - RoomEnvironment
  - ACES tone mapping at exposure 0.82
  - roughness 0.68, envMapIntensity 0.55
- **Result:**
  - The shape is clearly better: real gyri, cerebellar folia, a smooth brainstem.
  - The look is still far from Astra's.
  - ACES turns the system yellow paler, towards cream.

### Why our models can't look like Astra's

1. **Geometry.** BodyParts3D was traced from scans and smoothed, so its sulci are shallow. Lighting cannot deepen them. Astra's models are sculpted, with deep, sharp folds.
2. **Textures.** Astra's models have painted surface maps:
   - colour (mottling, surface vessels, coronary arteries, fat)
   - normal (fine relief)
   - roughness (wet gloss)

   Ours have one flat colour per body system and no UVs.
3. **Staging.** Astra uses a dark backdrop with a vignette, a warm key light, a strong rim light and wet highlights. This is the only part we could copy directly.

### Open research, if this is taken up

- **Sources** for a brain, heart and lungs:
  - CC BY models on Sketchfab
  - TurboSquid or CGTrader, with a real-time licence
  - the NIH Human Reference Atlas (CC BY 4.0, but untextured; its brain is a mirrored hemisphere)
  - the UCSF sulci-and-gyri brain (1.1M triangles, left hemisphere only)
  - a commissioned medical illustrator
  - AI 3D generators (Meshy, Tripo, Rodin): fast and glossy, but the anatomy needs independent review
- **Licence.** A GLB loaded in a browser can be downloaded by anyone, so the licence must allow redistribution on the web.
- **Selection.** A single textured shell loses the brain's 59 selectable parts. Keep the atlas parts for selecting and for the reader links. Use the realistic model only for viewing, with its own manifest (author, source, licence, concept mapping, version).
- **Design.** Realistic flesh on a dark stage is a different look from Adomeh's light paper and engraving. Decide whether it gets a dark specimen stage of its own.
- **Phone test.** Before shipping, test on a real phone: at least 30 fps while orbiting, a single-digit-megabyte download, a capped pixel ratio, and a fallback.
- **Cheapest next step.** A shader-only prototype on the current full-detail brain: flesh colours, a wet clearcoat, darkened folds (baked cavity shading) and a dark stage. Expected to get about a third of the way. No research is needed for it.
