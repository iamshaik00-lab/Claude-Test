---
name: ten-styles-shorts
description: Make faceless shorts in one of the 10 code-drawn animation styles (8-Bit, Chalk, Neon, Low-poly, Comic, Flat, Blueprint, Cinematic 3D, Bricks, Soft 3D) or the 10-style showcase.
---

# Ten Styles Shorts

A style pack for Fiz's faceless shorts channel (wtfclips / What the F Clips). Ten visual styles, all drawn in code (canvas in headless Chrome → ffmpeg). No AI images, no credits for visuals. Works alongside faceless-shorts, directing-stickman-videos, cinematic-film and Remotion: this skill gives the LOOK; the normal channel pipeline (plan → approval → build → thumbnail → deliver) still applies.

Source style sheet: Google Doc "STYLE-SHEET — 10 Claude Animation Styles" (id 1Lhd6nzLOTgmvhs8mLn24PRn3sSARPSN9c4g3n5kevQo). Read it if the showcase format is requested. `10_styles_sample_sheet.jpg` shows all 10 looks.

## Engine (`engine/` next to this file)
- `scene.js` helpers: rng, poly, rr, chalkLine (rough multi-pass chalk), ellipsePts, glow (double shadowBlur), tri + shade (flat-shaded low-poly), halftone, brick (stud highlights), rain. Also the 10 fixed-scene renderers for the showcase.
- `videos.js` 10 worked examples v1…v10, one per style (Easter egg, 60 minutes, brain energy, cartridges, octopus, honey, paper plane, lightning, phantom jam, sloth). Pattern: `function vN(ctx, W, H, t)` draws the frame at time t (1080×1920); `vN.caps = [[start, end, 'text with *orange word'], …]`.
- `player.html` overlay (style tag + caption pills), `window.frame(i, t)` → JPEG data URL.
- `vrender.mjs` render loop: 30 fps frames piped into ffmpeg with the audio track. `vf2.mjs "i:t,i:t"` = QA stills.
- `showcase.html` the 53 s phone-template showcase (`render.mjs`).
- Needs Node 22+, `npm i playwright-core`, Chrome (set `executablePath` in the .mjs files), ffmpeg.
Copy the engine into a project folder, write a new `vN` function for the video, render. Keep it deterministic (seeded rng, no Math.random).

## The 10 styles
| # | Style | Look rules | Best topics |
|---|---|---|---|
| 01 | 8-Bit Quest | Draw at 1/8 resolution then upscale with smoothing OFF. Dark navy/purple, bright yellow hero, chunky pixel text (DejaVu Sans Mono bold), scanlines, flash-to-white reveal, colour-cycling secret moments | gaming, retro, internet history |
| 02 | Chalk Doodle | Board #1B4D3E with faint smudges, wooden ledge. Everything is chalkLine (jittered multi-pass, seeded so it doesn't wobble), drawn on progressively; handwriting in Comic Relief; yellow/peach chalk accents, green ticks | explainers, maths, history lessons |
| 03 | Golden Neon | Near-black, white thin line art + gold/orange glowing lines (shadowBlur), warm radial haze, minimal shapes, thin Inter Light labels | body/brain facts, deep thoughts, motivation |
| 04 | Retro Console | PS1-era low-poly: jittered triangle-grid backgrounds, objects as flat-shaded faces (box3 = front/top/side), muted colours, no outlines, chunky Archivo Black labels | tech myths, nostalgia, gadgets |
| 05 | Pop Comic | Stacked panels with thick black ink borders, halftone dots, speed lines, Archivo Black SFX (black stroke + yellow fill), white speech bubbles, panels slide in | funny animal facts, comedy, Before Common Sense gags |
| 06 | Flat Poster | Solid unshaded shapes only, no gradients or outlines, bold limited palette (navy, mustard, coral, cream), simple looping motion (drips, bees, pops) | food, history, quick facts |
| 07 | Line Diagram | Black + faint blue grid, thin white line art drawn on, one flat orange fill, blue/orange/red force arrows, mono labels, dimension lines, diagonal lens-flare beam | how-it-works, Hidden Engineering |
| 08 | Cinematic 3D | Prerendered blurred background layers (depth of field), radial lighting, glow/bloom via 'lighter' compositing, wet reflections, two rain layers (blurred far, sharp near), vignette, lightning flashes | dramatic, wow science, weather, disasters |
| 09 | Toy Bricks | Everything built from brick() blocks with stud highlights, studded sky plate, primary colours, yellow minifig heads, parallax city, simulated motion (follow-the-leader cars, no overlaps) | cities, systems, traffic, kid-friendly |
| 10 | Soft 3D | Blurred warm bokeh background, matte radial-gradient shapes, rounded limbs, soft blurred drop shadows, blush cheeks, cosy pastel palette | cute animals, cosy topics |

Claude picks the style that fits the topic; vary styles video to video, never the same look twice in a row. These join the channel's existing styles.

## On-screen text (all styles)
- Caption pill: rgba(14,14,14,0.9) rounded rect, Inter 800 ~66 px, white, exactly ONE orange (#F97316) word per chunk, centred at ~80% height, pop-in, max 2 lines.
- Style tag pill at top only for samples/showcases, not normal uploads.
- Keep action out of the caption zone (y 1450–1620) and the top 120 px.

## Normal video (60–75 s+)
1. Follow the channel plan: trending/interesting topic, plan (script, shots, sources), wait for approval.
2. One style per video. 2–4 s per shot; the picture shows exactly what the narration says at that moment.
3. Audio per channel rules (ElevenLabs narration; tell Fiz before switching to the free voice). Time caption chunks to the narration.
4. Render 1080×1920, 30 fps. Remotion pass optional.
5. QA: contact sheet every ~1 s from the real MP4 + key frames full size. Check overlaps (tags/text/captions/edges), objects passing through each other, wrong colours, unreadable text. Fix and re-check before delivering.
6. Deliver MP4 + 2x thumbnail (2160×3840 + 1080×1920) + title, caption, hashtags.

## 10-style showcase (53 s)
`showcase.html`: black starfield, title "10 *Claude*✱ Animation styles (To Go Viral)", typed 1–10 list, phone mock-up with one fixed scene (woman in navy coat, RED umbrella, lit shopfront, rain) in each style ~4.1 s, "Wait for #8" hook, "MY TOP 3" at #8, slide-wipe + light-sweep transitions, end card "Want all 10 prompts?" + 10-thumbnail fan, "Comment 'Rain'" + Follow. Original music only.

## Rules
- Facts verified with sources; no copyrighted characters, logos or music.
- Draw only things the narration mentions; no weird or irrelevant objects.
- Deterministic rendering so re-renders match.
- Don't change agreed settings without Fiz's say-so.
