import { deflateSync } from "zlib";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// CRC32 table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
  crcTable[i] = c;
}
function crc32(buf) {
  let crc = 0xffffffff;
  for (const b of buf) crc = crcTable[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function pngChunk(type, data) {
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function generateIconPNG(size, rounded) {
  const px = new Uint8Array(size * size * 4);
  // background: #7c3aed (124, 58, 237)
  const [bgR, bgG, bgB] = [124, 58, 237];
  // foreground: white
  const [fgR, fgG, fgB] = [255, 255, 255];
  // inner glow: #9f67f5 (159, 103, 245)
  const [glR, glG, glB] = [159, 103, 245];

  const r = rounded ? Math.round(size * 0.22) : 0;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Rounded corner check
      if (r > 0) {
        let outside = false;
        if (x < r && y < r) outside = (x - r) ** 2 + (y - r) ** 2 > r ** 2;
        else if (x > size - 1 - r && y < r) outside = (x - (size - 1 - r)) ** 2 + (y - r) ** 2 > r ** 2;
        else if (x < r && y > size - 1 - r) outside = (x - r) ** 2 + (y - (size - 1 - r)) ** 2 > r ** 2;
        else if (x > size - 1 - r && y > size - 1 - r) outside = (x - (size - 1 - r)) ** 2 + (y - (size - 1 - r)) ** 2 > r ** 2;
        if (outside) { px[idx + 3] = 0; continue; }
      }

      // Background
      px[idx] = bgR; px[idx + 1] = bgG; px[idx + 2] = bgB; px[idx + 3] = 255;

      // Subtle inner gradient (lighter at top)
      const gradFactor = 1 - (y / size) * 0.3;
      px[idx] = Math.min(255, Math.round(bgR * gradFactor + glR * (1 - gradFactor)));
      px[idx + 1] = Math.min(255, Math.round(bgG * gradFactor + glG * (1 - gradFactor)));
      px[idx + 2] = Math.min(255, Math.round(bgB * gradFactor + glB * (1 - gradFactor)));

      // "H" shape (normalized 0..1)
      const u = x / size;
      const v = y / size;
      const isLeft = u >= 0.28 && u <= 0.41 && v >= 0.20 && v <= 0.80;
      const isRight = u >= 0.59 && u <= 0.72 && v >= 0.20 && v <= 0.80;
      const isCross = u >= 0.41 && u <= 0.59 && v >= 0.43 && v <= 0.57;

      if (isLeft || isRight || isCross) {
        px[idx] = fgR; px[idx + 1] = fgG; px[idx + 2] = fgB; px[idx + 3] = 255;
      }
    }
  }

  // Build PNG
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA

  const rawData = [];
  for (let y = 0; y < size; y++) {
    rawData.push(0); // filter: None
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      rawData.push(px[i], px[i + 1], px[i + 2], px[i + 3]);
    }
  }
  const compressed = deflateSync(Buffer.from(rawData));

  return Buffer.concat([
    sig,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", compressed),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

const iconsDir = join(__dirname, "..", "public", "icons");
mkdirSync(iconsDir, { recursive: true });

// 180x180 apple-touch-icon (solid, no rounding — iOS applies its own)
writeFileSync(join(iconsDir, "apple-touch-icon.png"), generateIconPNG(180, false));
console.log("✓ apple-touch-icon.png (180x180)");

// 192x192 manifest icon (rounded)
writeFileSync(join(iconsDir, "icon-192x192.png"), generateIconPNG(192, true));
console.log("✓ icon-192x192.png");

// 512x512 maskable icon (solid bg, safe-zone content)
writeFileSync(join(iconsDir, "icon-512x512.png"), generateIconPNG(512, false));
console.log("✓ icon-512x512.png");
