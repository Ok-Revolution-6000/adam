# Source texts for new translations: Maimonides and Avicenna

Research of 23 September 2026, three agents, everything marked *verified* was opened and inspected that day. Purpose: find complete, unabridged, digitised originals (Arabic, Judeo-Arabic, medieval Hebrew) that Adomeh may translate afresh and sell in the Reader plan. Legal points are analysis, not advice; get counsel to sign off before paywalling.

## The picture in one paragraph

**Avicenna is solved.** The University of Würzburg's *Arabic and Latin Corpus* (ALCorpus, ed. D. N. Hasse) publishes the complete Arabic *Canon* (all five books, ~698,000 words), the *Urjūza* and *On Cardiac Drugs* as TEI-XML under **CC BY-SA 4.0**, which permits commercial use. The OpenITI copy we hold is this very text re-wrapped under a non-commercial licence; take it from Würzburg instead. **Maimonides is a patchwork.** One work has a clean permissive Arabic text (Commentary on Hippocrates' Aphorisms, Manchester, CC BY 4.0). Four short works have public-domain Arabic editions by Kroner (1906–1928), scans only. Two have public-domain Hebrew printings (Regimen of Health 1885; Medical Aphorisms 1888), scans only. The rest (Asthma, Poisons, and the Arabic of Medical Aphorisms) exist only in manuscripts, several of them freely served as public-domain images (Gallica, Munich BSB, NLI KTIV). Nothing machine-readable and open exists in Hebrew at all. Two works cannot be done "complete" from any original: *Extracts from Galen* (only fragments survive) and the *Glossary of Drug Names* (Arabic only, Meyerhof 1940, copyright status to confirm).

## Avicenna (Ibn Sīnā, d. 1037)

| Work | Source | Format | Complete | Licence | Sell? |
|---|---|---|---|---|---|
| al-Qānūn fī al-ṭibb, 5 books | ALCorpus Würzburg, `Avic_Canon_ar.xml` | TEI-XML, 8.1 MB, 2,316 page breaks | yes | CC BY-SA 4.0 | **yes** |
| same | OpenITI `0428IbnSina.QanunFiTibb.ALCorpus00024` (+3 other versions) | mARkdown | yes | CC BY-NC-SA | no |
| same | Shamela book 10706 (Ḍannāwī, DKI 1999) | web text | yes | no-redistribution terms | no |
| same | Arabic Wikisource | text | Books I and III only | CC BY-SA | partial |
| same | Būlāq 1294/1877, 3 vols, Bibliotheca Alexandrina scans on archive.org (`AAlexandrina-141245`, `-144267`, `-145445`) | scans, OCR garbled | yes | public domain | yes, if re-OCR'd |
| same | Rome 1593 Typographia Medicea (`archive.org/details/QanunAvicennae`) | scans | yes | public domain | yes, if re-OCR'd |
| al-Urjūza fī al-ṭibb | ALCorpus `Avic_Cantica_ar.xml` (from al-Bābā, Aleppo 1984) | TEI | yes (ends with later appended verses, not Avicenna's) | CC BY-SA | yes |
| al-Adwiya al-qalbiyya | ALCorpus `Avic_VirCord_ar.xml` | TEI | yes, 16 chapters + drug list | CC BY-SA | yes |
| Dafʿ al-maḍārr, Qūlanj, Sikanjubīn, the minor treatises | no machine text; al-Bābā 1984 scan (`archive.org/details/waq115772`), Ḥammāmī 1983 | scans | — | editions in copyright; texts PD | transcribe |

Index: `https://www.arabic-latin-corpus.philosophie.uni-wuerzburg.de/text/Avic_Canon_ar.index.xhtml`; the TEI files are downloaded in the session scratchpad. ALCorpus's base is the New Delhi 1981–89 (Jamia Hamdard) printing; its relation to Būlāq is unverified. Provenance step worth doing: spot-collate chapter openings and Books II and V against the Būlāq scans (40–80 h for a classical-Arabic reader).

English translations for comparison: Gruner 1930 (Book I) entered the US public domain on 1 January 2026, still in copyright in the UK; Shah 1966 and Bakhtiar (Kazi) in copyright; Gerard of Cremona's Latin is public domain and ALCorpus has it as TEI.

Licence note on ShareAlike: a faithful transcription of a public-domain text carries no new copyright in the US (Feist), so a translation made from the ALCorpus Arabic derives from Avicenna, not from Würzburg, and SA should not attach to the English. The cautious European view (German §70 UrhG edition right, database right) argues for prominent attribution and counsel's sign-off. Do not build on the OpenITI or Shamela copies regardless: their terms are contractual.

## Maimonides (d. 1204): Arabic and Judeo-Arabic

| Work | Survives in Arabic? | Best permissive or PD source | Format | Licence | State |
|---|---|---|---|---|---|
| Commentary on Hippocrates' Aphorisms | mostly (no complete Arabic MS; Hebrew fills Books I–II) | Manchester ERC "Arabic Commentaries on the Hippocratic Aphorisms", DOI 10.3927/53356462; OpenITI copy `0601MusaIbnMaymun.SharhFusulAbuqrat…completed`; Schliwski's Cologne edition open at kups.ub.uni-koeln.de/2171 | TEI / mARkdown / PDF | **CC BY 4.0** (Manchester; cite this, not OpenITI's NC) | **ready**: all 7 books, 1,153 headings |
| On Hemorrhoids | yes | Kroner, *Janus* 16 (1911), Judeo-Arabic + German, `archive.org/details/BIUSante_130862x1911`; MS Paris Hébreu 1202 fols 121v–135 (Gallica, PD) | scans, partial Hebrew-letter OCR | PD (Kroner d. 1930) | transcribe, ~short |
| On Coitus | yes (two versions) | Kroner, *Janus* 21 (1916), Arabic script from the Granada MS (defective), `…x1916`; only complete witness JTS 2729 (JA) | scans | PD | transcribe; collate |
| On the Regimen of Health | yes | Kroner, *Janus* 27–29 (1923–25), Arabic script, `…x1923/x1924/x1925`; MS Paris Hébreu 1202 fols 80v–121r (Gallica); Bodleian Hunt. 427 fols 62a–80a | scans | PD | transcribe; Kroner's base MS is corrupt, collate with Hébreu 1202 |
| Elucidation of Some Symptoms | yes | Kroner, *Janus* 32 (1928), `…x1928`; Hunt. 427 fols 80b–91b; Paris Hébreu 1211 (Gallica) | scans | PD | transcribe |
| On Asthma | yes | no edition before Bos 2002. MS Paris Hébreu 1211 (JA, all six short treatises, "horribly misbound"), Gallica `btv1b105461875`, PD | MS images | PD | transcribe from manuscript; single-witness risk |
| On Poisons | yes | no PD edition. Hunt. 427 fols 92b–106b (Arabic; digitisation unverified), Hébreu 1211 (Gallica). **The OpenITI `KitabSumum` file is uncorrected OCR of Bos's 2009 edition; do not use it** | MS images | PD | transcribe from manuscript |
| Medical Aphorisms (25 treatises) | yes, complete in Gotha orient. A 1937, Leiden Or. 128, Escorial 868–869 | no PD Arabic edition at all. Paris Hébreu 1210 (JA, partial: I–IX, XXIV–XXV), Gallica `btv1b10546186q`, PD; Gotha digitisations are CC0 when they exist (unverified) | MS images | PD | the hard case: request Gotha images, transcribe ~470 pp., or licence Bos's text from Brill |
| Extracts from Galen | partially, Judeo-Arabic epitomes only | Paris Hébreu 1203 (Gallica `btv1b10550800m`) | MS images | PD | cannot be complete; Bos excluded it too |
| Glossary of Drug Names | yes, unique Istanbul MS | Meyerhof, Cairo IFAO 1940, `archive.org/details/b31362679` (69 Arabic pp., no usable OCR) | scan | Meyerhof d. 1945: PD in life+70 countries; US status probably PD (Egyptian term expired before 1996), **confirm** | re-OCR the Arabic pages |

Key manuscripts, digitised and public domain: Paris BnF Hébreu 1202, 1203, 1210, 1211 (Gallica, "domaine public"). Bodleian Hunt. 427 (Arabic script, 14th c., collated against the author's original; the best witness for four works): digitisation unverified. Kroner's editions are flawed (one or two MSS each), so every Kroner-based text should be collated against a Gallica witness; Bos's editions may be consulted for readings but not reproduced.

## Maimonides: medieval Hebrew translations

No open machine-readable Hebrew text exists anywhere (Sefaria, Hebrew Wikisource, Ben-Yehuda, Daat all checked). The Academy of the Hebrew Language's Maagarim corpus has ibn Tibbon's *Regimen* as text, research-only, commercial use by written permission.

| Work | Medieval translator(s) | Best PD source | Format | State |
|---|---|---|---|---|
| Regimen of Health | Moses ibn Tibbon 1244; anonymous; Zeraḥyah Ḥen | Jerusalem 1885 print (Luncz, from Saphir's MS), 54 pp., hebrewbooks.org/31937, verified complete through ch. 4 to "משה בן מימון הספרדי"; MS Munich Cod.hebr. 111 f. 84ff (BSB IIIF, PD Mark 1.0) | scans | key from print, proof against MS |
| Medical Aphorisms | Nathan ha-Meʾati 1279; Zeraḥyah 1277 | Vilna 1888 print (repr. Lemberg 1834), 120 pp., hebrewbooks.org/46982; MS Munich Cod.hebr. 287 (Nathan, Spain 1315, 144 fols; KTIV "Public Domain, including commercial use"; BSB IIIF) | scans | print's completeness vs 25 treatises unverified; MS complete |
| On Poisons | Moses ibn Tibbon 1257; Zeraḥyah | Munich Cod.hebr. 111 f. 93b ff (IIIF, PD Mark) | MS images | transcribe |
| On Hemorrhoids | anonymous | Munich Cod.hebr. 111 f. 103b ff, 7 chapters | MS images | transcribe |
| On Coitus | Zeraḥyah; anonymous | Kroner 1906 (`archive.org/details/einbeitragzurge00krongoog`, prints Zeraḥyah's Hebrew from Cod.hebr. 111); the MS itself | scan; IIIF | transcribe |
| Elucidation of Symptoms | anonymous | 2 MSS in the NLI catalogue (c. 1300; 15th c.), online; Kroner 1928 | images | identify MSS, transcribe |
| On Asthma | Benveniste 1320; Shatibi 1379; anonymous | Parma Cod. Parm. 2643 (Benveniste, early 14th c.) and Berlin Or. Qu. 836 (Shatibi), both on KTIV | images | transcribe |
| Commentary on Hippocrates | Moses ibn Tibbon 1257; anonymous | 7 MSS in the NLI catalogue, several online; no PD print | images | Arabic route is better (above) |
| Extracts from Galen | none exists | — | — | — |
| Glossary of Drug Names | none medieval (Muntner's Hebrew is modern, copyright) | — | — | — |

Munich Cod.hebr. 111 alone carries five works (Aphorisms beginning defective, Regimen, Poisons, Coitus, Hemorrhoids), one 14th-century Italian hand, served as IIIF under Public Domain Mark: `https://api.digitale-sammlungen.de/iiif/presentation/v2/bsb00084240/manifest`.

Copyright: the medieval translations and all pre-1900 prints are public domain; Kroner (d. 1930) is public domain everywhere. Muntner (d. 1973) is protected in Israel until 2044, and his emendations, divisions and apparatus are his; consult, do not copy. Bos/Brill 2002–2021: copyright, plus European edition rights; consult only.

## Recommended order of work

1. **Avicenna, now.** Import the three ALCorpus TEI files, attribute "Arabic and Latin Corpus, ed. D. N. Hasse, University of Würzburg, CC BY-SA 4.0" on the source pages, translate. Zero transcription. This is the same shape as the Hippocrates work already done.
2. **Maimonides, Commentary on Hippocrates' Aphorisms.** Manchester CC BY text; say plainly where Books I–II rest on the Hebrew. Second clean win.
3. **Regimen of Health and Medical Aphorisms from the Hebrew prints** (1885, 1888): Hebrew OCR plus human proofing against Cod.hebr. 111 / 287. Two complete, cleanly licensed Hebrew texts within weeks. The Arabic *Regimen* (Kroner 1923–25) can be added as a parallel witness.
4. **The four short works from Kroner's Arabic** (Hemorrhoids, Coitus, Regimen, Elucidation), each collated against a Gallica witness; a Judeo-Arabic transcriber for a few weeks.
5. **Asthma and Poisons**: transcription from Hébreu 1211 (and Hunt. 427 if the Bodleian supplies images), or from the Hebrew (Parma 2643; Cod.hebr. 111).
6. **Medical Aphorisms in Arabic**: request Gotha orient. A 1937 images (CC0) and budget a long transcription, or negotiate Bos's Arabic text with Brill. Decide after 1–5.
7. **Glossary**: re-OCR Meyerhof's 69 Arabic pages once a lawyer confirms its status.
8. Drop *Extracts from Galen* from any "complete" claim.

Two things to check with counsel before the paid tier: the ShareAlike question for translations from ALCorpus, and Meyerhof 1940's US status.

## Files kept from the research

Session scratchpad (`/private/tmp/claude-501/…/scratchpad/`): `Avic_Canon_ar.xml`, `Avic_Cantica_ar.xml`, `Avic_VirCord_ar.xml` (Würzburg TEI); `sharh.txt` (OpenITI Sharḥ fuṣūl Abuqrāṭ); `janus_*.txt`, `kroner1906.pdf/.txt`, `meyerhof.txt`, `schliwski1/2.pdf`, `stein1895.txt` (Steinschneider's Munich catalogue), `gallica_sru*.xml`, `nli_*.md`, `sefaria_index.json`, page images of the 1885 and 1888 prints. Copy anything worth keeping into `content/` before the scratchpad is cleared.

## Decisions (23 September 2026)

- **Avicenna: the *Canon* only, for now.** Translate it from the Würzburg Arabic (CC BY-SA 4.0), starting with Book I. The *Urjūza*, *On Cardiac Drugs*, the minor treatises and the philosophical works (OpenITI, non-commercial) are out of scope until asked for. Open question for counsel: whether ShareAlike attaches to a translation made from the Würzburg text.
- **Maimonides: license first, translate later.** The owner would rather pay a fee than translate now, and wants the texts shown in the live product so Brill sees the value. The own-translation pipeline (Regimen first, then the four Kroner works and the Commentary from Manchester) is **paused, not cancelled**; the sources are in this file. The Bos text is Brill's 2021 English edition (copyright line names Gerrit Bos); Brill's own product is the subscription platform Maimonides' Medical Works Online (scholarlyeditions.brill.com/mmwo). No third-party licensing programme is published; the route is a custom request to rights@degruyterbrill.com. Draft in `docs/brill-request-draft.md`.
- **Open:** whether the Bos text stays public on adomeh.com or moves behind an invite-only tier until Brill answers.

## Update (23 September 2026, later): the Arabic *Medical Aphorisms* are reachable and clean

Checked with Firecrawl (tools/firecrawl-api) against the holding libraries' own pages.

- **Gotha, Ms. orient. A 1937 — digitised, Public Domain Mark 1.0.** "al-Fuṣūl fī ʾl-ṭibb", Maimonides, Arabic, paper, **278 leaves, 571 images**, DFG project "Orientalia digital". Record: https://dhb.thulb.uni-jena.de/receive/ufb_cbu_00005208 ; IIIF manifest: https://dhb.thulb.uni-jena.de/api/iiif/presentation/v2/ufb_derivate_00004475/manifest (image URLs `…/api/iiif/image/v2/ufb_derivate_00004475%2FMs-orient-A-01937_NNN.tif/full/1000,/0/default.jpg`). Bos took this manuscript as the **base text** of his Arabic edition (review of vol. 1, MEAH Hebreo), so it is the best complete witness. Images are sharp colour; the hand on the pages sampled is a plain cursive naskh. **Completeness survey (23 Sep 2026): a whole-work copy, physically disordered, one gap; confidence medium.** Done image by image by another tool (outputs in `research/Gotha-A1937/`: `survey_report.md`, `page_census.csv`, `treatise_census.csv`, `human_review.csv`); I spot-checked images 146, 147 and 557 and they match. Layout: ff. 1r–5r (images 5–13) are later added recipes and medical notes in other hands (the "urine sediments" excerpt at 4r is one of them); the Arabic title page *Kitāb al-fuṣūl fī 'l-ṭibb* is 6r (image 23, per the survey); the author's preface is 6v–9r, the contents list (to 25) 9r–10v; **treatise 1 opens at 11r (image 33)**. All 25 treatises are represented and 24 openings were read. **Treatise 7's opening was not found**: its body and ending survive at 97r–115v (images 205–242), so the end of 6 and the start of 7 may be lost. **A block is bound out of order:** the end of 21 (67v, image 146) and treatises 22, 23 and the first part of 24 (68r–96v, images 147–204) sit right after the opening of 6, while 21 opens at 231r (image 473) and 24 ends at 239r (image 489). The joins are not verified word for word. Treatise 25 ends on a torn leaf, 273r (image 557), with an explicit completion note ("the twenty-fifth treatise is complete, and with it the *Fuṣūl* that the master Mūsā the Israelite of Córdoba compiled on medicine") and a copyist's note about his exemplar (names not securely read). 274r (image 559) and unlabelled images 561–562 carry more added recipes and a calendar table, so 561–571 are not all binding (my earlier claim was wrong). **Size:** about 147 words a page × 525 body pages ≈ 75–80k Arabic words; my first estimate (~55k) was too low, and 77k Arabic against ~135k English in our corpus is a normal ratio, so the "only half the work" worry is withdrawn. Still open: word-for-word collation of the joins; the lost 6/7 stretch (fill from Paris héb. 1210, Hebrew, which holds treatises I–IX); the damaged preface (6v–7r) and last leaf. Do not call the manuscript "certified complete".
- **Leiden Or. 128 — not online.** Collective volume, Maghribi script, ff. 1–139 = Fuṣūl fī ʿilm al-ṭibb (Witkam, *Inventory of the Oriental manuscripts*, vol. 1; CCO 1344). Nothing found in Leiden's Digital Collections (which is mid-migration, so not conclusive).
- **Escorial 868 and 869 — not online.** The Escorial's digital library states its digitised Arabic manuscripts are **Árabe 1–115, 898 and 1340** only (rbme.patrimonionacional.es).
- **Bos's ten witnesses** for the Aphorisms: Gotha 1937 (base), Leiden Or. 128, Paris BnF héb. 1210, Escorial 868 and 869, three Oxford Bodleian manuscripts (Uri 412 = Poc. 319; Hunt. Donat 33 = Uri 423; a third under Neubauer 2115), Göttingen 99 (Deussing's copy of 1635), Istanbul Velieddin 2525; the Cairo manuscript is not among them.

**Effect on the plan:** Medical Aphorisms (51% of the Maimonides volume) has a commercially clean route in the **original Arabic** (Gotha: all 25 treatises present, disordered, one gap near 6/7) as well as the Hebrew one (Munich Cod.hebr. 287). Prefer the Arabic; use the Hebrew as a control, and Paris héb. 1210 to fill the 6/7 gap. Handwriting recognition on 548 pages is the real cost; pilot a few pages before committing.

**NLI licence wording** (read on nli.org.il): *free use* = "all uses permitted, including commercial"; *non-commercial* = depositor's terms, and the NLI cannot license, so permission must come from the holding library (BnF, National Library of Russia, Cambridge…), not from the NLI.
