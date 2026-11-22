import { chromium } from 'playwright-core';
import { spawn } from 'child_process';
const FPS=30, DUR=53;
const ff = spawn('ffmpeg', ['-y','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-i','out/music.wav','-c:v','libx264','-preset','veryfast','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-shortest','-movflags','+faststart','out/10_styles_showcase.mp4'], { stdio: ['pipe','ignore','inherit'] });
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('file://' + process.cwd() + '/showcase.html'); await p.waitForFunction('window.done');
for (let i = 0; i < FPS*DUR; i++) {
  const d = await p.evaluate(t => frame(t, 0.92), i / FPS);
  if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
  if (i % 300 === 0) console.log('frame', i);
}
ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close();
