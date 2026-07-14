import { execFileSync } from 'child_process';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const assetsDir =
    'C:/Users/Full Scale/.cursor/projects/d-Personal-My-Apps-byte-tenant-management/assets';
const original = path.join(
    assetsDir,
    'c__Users_Full_Scale_AppData_Roaming_Cursor_User_workspaceStorage_abd50ff41d0921ff721fb2c56fab8597_images_image-aa260d11-acf1-412d-9acf-0c51232b32a2.png'
);
const dance = path.join(assetsDir, 'boy-band-canal-dance.png');
const output = path.join(assetsDir, 'boy-band-canal-reel.mp4');

const filter = [
    '[0:v]scale=1080:1920:force_original_aspect_ratio=increase,',
    'crop=1080:1920,',
    "zoompan=z='min(zoom+0.0015,1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=45:s=1080x1920:fps=30,",
    'setsar=1[v0];',
    '[1:v]scale=1080:1920:force_original_aspect_ratio=increase,',
    'crop=1080:1920,',
    "zoompan=z='1+0.07*sin(2*PI*on/24)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=555:s=1080x1920:fps=30,",
    'setsar=1[v1];',
    '[v0][v1]concat=n=2:v=1:a=0,format=yuv420p[vout]',
].join('');

execFileSync(
    ffmpegPath,
    [
        '-y',
        '-loop',
        '1',
        '-t',
        '1.5',
        '-i',
        original,
        '-loop',
        '1',
        '-t',
        '18.5',
        '-i',
        dance,
        '-filter_complex',
        filter,
        '-map',
        '[vout]',
        '-t',
        '20',
        '-an',
        '-movflags',
        '+faststart',
        output,
    ],
    { stdio: 'inherit' }
);

console.log(`Reel saved to: ${output}`);
