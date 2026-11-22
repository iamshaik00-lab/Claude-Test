# 10 Styles engine
- scene.js   — helpers (rng, chalkLine, glow, tri/shade low-poly, halftone, brick, rain…) + the 10 fixed-scene renderers (showcase format)
- videos.js  — 10 sample shorts v1…v10, one per style. Pattern: function vN(ctx, W, H, t) draws frame at time t; vN.caps = [[start, end, 'text with *orange word'], …]
- player.html — overlay: style tag pill + caption pills (black/white/orange). window.frame(i, t) → JPEG data URL
- showcase.html — the 53 s "10 Claude Animation styles" phone-template showcase
- vrender.mjs — renders each video (30 fps) through headless Chrome → ffmpeg; needs out/music.wav (or swap in narration)
- vf2.mjs "i:t,i:t" — QA stills
Needs: Node 22+, `npm i playwright-core`, Chrome (set executablePath in the .mjs files), ffmpeg.
