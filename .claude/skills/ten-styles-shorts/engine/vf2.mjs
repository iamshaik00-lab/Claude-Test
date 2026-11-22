import { chromium } from 'playwright-core';
import fs from 'fs';
const list = process.argv[2].split(',').map(s => s.split(':').map(Number));
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('file://' + process.cwd() + '/player.html'); await p.waitForFunction('window.done');
for (const [i, t] of list) { const d = await p.evaluate(([i, t]) => frame(i, t, 0.8), [i, t]); fs.writeFileSync(`out/v/${i}_${t}.jpg`, Buffer.from(d.split(',')[1], 'base64')); }
await b.close();
