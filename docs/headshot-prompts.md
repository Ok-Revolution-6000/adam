# Adomeh headshots: image prompts

The four physicians are drawn as engraved plates in one house style. The style block stays word for word the same for all four. Only the subject block changes.

Palette, taken from the site's stylesheet (`app/globals.css`):
- Ink: #20242b
- Slate blue: #263b48
- Grey: #68727d
- Paper: #f3f4f4

## Style block (the same for all four)

```
Original portrait illustration in the style of a hand-engraved anatomical atlas plate:
fine-line ink engraving with cross-hatching and stipple shading, crisp contour lines,
no photographic texture. Monochrome deep blue-black ink (#20242b) with mid-tones in
slate blue (#263b48) and soft grey (#68727d), on cool off-white paper (#f3f4f4) with
a faint, even paper grain. Head and shoulders, three-quarter view, centred, calm
and dignified expression, eyes looking slightly past the viewer. Light from the upper
left, gentle shadows built only from hatching. Plain background fading to paper
at the edges, no frame, no text, no signature. Square format, generous margin
around the figure. Quiet, scholarly, timeless; like a plate from a 19th-century
medical atlas reimagined with modern precision.
```

## Things to exclude (if your tool has a negative prompt field)

```
photorealistic, photograph, 3D render, colour, sepia, gradient background, text,
watermark, frame, cartoon, anime
```

## Subject blocks

### Maimonides

Reference image: `~/Downloads/images (3).jpeg`. It is the traditional 19th-century likeness; no portrait from his lifetime survives.

```
Subject: Moses Maimonides (1138–1204), physician and philosopher of Córdoba and
Fustat. A man in his fifties with a full, rounded dark beard streaked with grey,
strong arched brows, deep-set thoughtful eyes and a straight nose. He wears a
voluminous wrapped white turban with soft folds, and a dark robe over a lighter
inner garment with a simple open collar. Keep the likeness recognisable from the
traditional portrait, but render it as a new engraving, not a copy.
```

### Hippocrates

Reference image: `~/Downloads/Hippocrates.jpg`, the bust seen from the front; it is clearer than the sepia version. The likeness comes from the Roman marble bust (Ostia type). The marble has blank eyes, so the prompt asks for living eyes; otherwise the result looks like a statue.

```
Subject: Hippocrates of Kos (c. 460–370 BC), the father of Greek medicine. An old
man of about seventy, bald on top with a fringe of short wavy hair at the sides
and back, a broad high forehead with deep horizontal lines, heavy brows over
deep-set, living eyes with clear pupils, a strong straight nose, and a full,
tightly curled beard and moustache. He wears a simple Greek himation draped over
one shoulder, plain folds, no jewellery. Render him as a living man, not as a
marble bust: skin, not stone; no plinth, no carved base. Keep the likeness
recognisable from the classical bust, but render it as a new engraving, not a copy.
```

### Galen

Reference image: `~/Downloads/images (4).jpeg`, the engraving in three-quarter view. It matches the house pose better than the profile lithograph. `Galenus.jpg` shows the same type and works as a second reference. No portrait from his lifetime survives; these follow the Renaissance type.

```
Subject: Galen of Pergamon (AD 129–c. 216), physician to Roman emperors. A man in
his late forties with short, thick, slightly curling dark hair, a broad brow, alert
intelligent eyes under straight brows, a strong nose, and a full, dense curly beard
and moustache. He wears a Roman tunic with fine vertical folds and a heavy cloak
gathered and knotted at one shoulder. Lively, attentive expression, as if about to
speak. Keep the likeness recognisable from the traditional engraved portrait, but
render it as a new engraving, not a copy.
```

### Avicenna

Reference image: `~/Downloads/Avicenna_Bust,_left_profile_(cropped).jpg`, the 20th-century Iranian painted portrait (signed, dated AH 1331 solar). It is the only accepted likeness and it is a left profile. To keep the four plates consistent, the prompt turns him to three-quarter view. If the face drifts too far, allow a near-profile instead. Use it as a reference only, never as a copy: the painting may still be under copyright.

```
Subject: Avicenna (Ibn Sina, 980–1037), Persian physician and philosopher, author
of the Canon of Medicine. A man in his forties with a short, neat dark beard and
moustache, strong dark brows, calm half-lowered eyes with a reflective look, a long
straight nose, and a high, smooth forehead. He wears a large wrapped turban of
pale cloth whose long end falls down over one shoulder and around the neck like a
scarf, over a plain dark robe with a lighter inner garment at the collar. Quiet,
inward expression. Keep the likeness recognisable from the traditional portrait,
but render it as a new engraving, not a copy.
```

## How to use

1. If your tool takes a reference image (Higgsfield, Midjourney with an image prompt and so on), upload the photo as the face reference at moderate strength, about 40–60%. That keeps the familiar features while the engraving style takes over. Too much strength copies the old portrait.
2. Paste the style block, then the subject block.
3. Once Maimonides looks right, keep its seed, or use it as the style reference, for Hippocrates, Galen and Avicenna. That way all four look like plates from the same atlas.
