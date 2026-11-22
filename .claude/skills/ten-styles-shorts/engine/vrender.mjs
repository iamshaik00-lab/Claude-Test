import { chromium } from 'playwright-core';
import { spawn } from 'child_process'; import fs from 'fs';
fs.mkdirSync('out/clips', { recursive: true });
const names = ['01_8bit_easter_egg','02_chalk_60_minutes','03_neon_brain_energy','04_lowpoly_cartridges','05_comic_octopus','06_flat_honey','07_blueprint_paper_plane','08_cinematic_lightning','09_bricks_traffic_jam','10_soft3d_sloth'];
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('file://' + process.cwd() + '/player.html'); await p.waitForFunction('window.done');
for (let i = 0; i < 10; i++) {
  const off = (i * 4.17) % 40;
  const ff = spawn('ffmpeg', ['-y','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-ss',String(off),'-t','10','-i','out/music.wav','-af','afade=t=in:d=0.3,afade=t=out:st=9.3:d=0.7,volume=0.8','-c:v','libx264','-preset','veryfast','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-ar','44100','-ac','2','-shortest','-movflags','+faststart',`out/clips/${names[i]}.mp4`], { stdio: ['pipe','ignore','ignore'] });
  for (let f = 0; f < 300; f++) { const d = await p.evaluate(([i, t]) => frame(i, t, 0.92), [i, f / 30]); if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('done', names[i]);
}
await b.close();
