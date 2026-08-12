import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Pure Node.js PNG builder using built-in zlib & crc32
function makeCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
}

const crcTable = makeCRC32Table();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createPng(width, height, rgbaBuffer) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // deflate
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // no interlace

  const ihdrChunk = makeChunk("IHDR", ihdrData);

  // Scanlines with 0 filter byte prefix
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    const srcOffset = y * width * 4;
    rgbaBuffer.copy(rawData, rowOffset + 1, srcOffset, srcOffset + width * 4);
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk("IDAT", compressed);
  const iendChunk = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, "ascii");
  data.copy(buf, 8);
  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

// Drawing helper
function renderAarogyamIcon(size, isMaskable = false) {
  const buf = Buffer.alloc(size * size * 4);
  const scale = size / 512;

  // Background config
  const bgR = 0x08, bgG = 0x1c, bgB = 0x15; // #081c15
  const borderR = 0x2d, borderG = 0x6a, borderB = 0x4f; // #2d6a4f
  const strokeR = 0x40, strokeG = 0x91, strokeB = 0x6c; // #40916c
  const highlightR = 0x52, highlightG = 0xb7, highlightB = 0x88; // #52b788

  const margin = isMaskable ? 0 : Math.round(32 * scale);
  const cornerRadius = isMaskable ? 0 : Math.round(96 * scale);

  function setPixel(x, y, r, g, b, a) {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const idx = (y * size + x) * 4;
    const currentA = buf[idx + 3] / 255;
    const newA = a / 255;
    const outA = newA + currentA * (1 - newA);
    if (outA > 0) {
      buf[idx] = Math.round((r * newA + buf[idx] * currentA * (1 - newA)) / outA);
      buf[idx + 1] = Math.round((g * newA + buf[idx + 1] * currentA * (1 - newA)) / outA);
      buf[idx + 2] = Math.round((b * newA + buf[idx + 2] * currentA * (1 - newA)) / outA);
      buf[idx + 3] = Math.round(outA * 255);
    }
  }

  // Draw background card (rounded rectangle or full fill for maskable)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (isMaskable) {
        // Gradient fill for maskable
        const gradRatio = (x + y) / (size * 2);
        const r = Math.round(bgR + (0x1b - bgR) * gradRatio);
        const g = Math.round(bgG + (0x43 - bgG) * gradRatio);
        const b = Math.round(bgB + (0x32 - bgB) * gradRatio);
        setPixel(x, y, r, g, b, 255);
      } else {
        // Rounded card inside margin
        const innerX = x - margin;
        const innerY = y - margin;
        const innerW = size - 2 * margin;
        const innerH = size - 2 * margin;

        if (innerX >= 0 && innerX < innerW && innerY >= 0 && innerY < innerH) {
          let dist = 0;
          let inCorner = false;
          if (innerX < cornerRadius && innerY < cornerRadius) {
            dist = Math.hypot(innerX - cornerRadius, innerY - cornerRadius);
            inCorner = true;
          } else if (innerX >= innerW - cornerRadius && innerY < cornerRadius) {
            dist = Math.hypot(innerX - (innerW - cornerRadius), innerY - cornerRadius);
            inCorner = true;
          } else if (innerX < cornerRadius && innerY >= innerH - cornerRadius) {
            dist = Math.hypot(innerX - cornerRadius, innerY - (innerH - cornerRadius));
            inCorner = true;
          } else if (innerX >= innerW - cornerRadius && innerY >= innerH - cornerRadius) {
            dist = Math.hypot(innerX - (innerW - cornerRadius), innerY - (innerH - cornerRadius));
            inCorner = true;
          }

          if (!inCorner || dist <= cornerRadius) {
            const alpha = inCorner ? Math.min(1, Math.max(0, cornerRadius - dist + 1)) : 1;
            const gradRatio = (x + y) / (size * 2);
            const r = Math.round(bgR + (0x1b - bgR) * gradRatio);
            const g = Math.round(bgG + (0x43 - bgG) * gradRatio);
            const b = Math.round(bgB + (0x32 - bgB) * gradRatio);
            setPixel(x, y, r, g, b, Math.round(alpha * 255));
          }
        }
      }
    }
  }

  // Draw Card Inner Border if not maskable
  if (!isMaskable) {
    const borderWidth = Math.max(2, Math.round(10 * scale));
    // Draw outer subtle border
    for (let y = margin; y < size - margin; y++) {
      for (let x = margin; x < size - margin; x++) {
        const innerX = x - margin;
        const innerY = y - margin;
        const innerW = size - 2 * margin;
        const innerH = size - 2 * margin;
        
        let dist = 0;
        let inCorner = false;
        if (innerX < cornerRadius && innerY < cornerRadius) {
          dist = Math.hypot(innerX - cornerRadius, innerY - cornerRadius);
          inCorner = true;
        } else if (innerX >= innerW - cornerRadius && innerY < cornerRadius) {
          dist = Math.hypot(innerX - (innerW - cornerRadius), innerY - cornerRadius);
          inCorner = true;
        } else if (innerX < cornerRadius && innerY >= innerH - cornerRadius) {
          dist = Math.hypot(innerX - cornerRadius, innerY - (innerH - cornerRadius));
          inCorner = true;
        } else if (innerX >= innerW - cornerRadius && innerY >= innerH - cornerRadius) {
          dist = Math.hypot(innerX - (innerW - cornerRadius), innerY - (innerH - cornerRadius));
          inCorner = true;
        }

        if (inCorner) {
          if (dist <= cornerRadius && dist >= cornerRadius - borderWidth) {
            setPixel(x, y, borderR, borderG, borderB, 180);
          }
        } else {
          if (innerX < borderWidth || innerX >= innerW - borderWidth || innerY < borderWidth || innerY >= innerH - borderWidth) {
            setPixel(x, y, borderR, borderG, borderB, 180);
          }
        }
      }
    }
  }

  // Draw Pulse Wave line (vector path: M7 17h5l2.5-6 3.5 10 2.5-6.5L22 17h3 in 32x32 coords)
  // Scaled coordinates
  const pulsePoints = [
    { x: 7, y: 17 },
    { x: 12, y: 17 },
    { x: 14.5, y: 11 },
    { x: 18, y: 21 },
    { x: 20.5, y: 14.5 },
    { x: 22, y: 17 },
    { x: 25, y: 17 }
  ];

  // Scale points to canvas
  const canvasPoints = pulsePoints.map(p => {
    let px = (p.x / 32) * size;
    let py = (p.y / 32) * size;
    return { x: px, y: py };
  });

  const lineWidth = Math.max(3, Math.round(28 * scale * (isMaskable ? 0.8 : 1)));

  // Draw thick smooth lines between points with rounded caps
  for (let i = 0; i < canvasPoints.length - 1; i++) {
    const p1 = canvasPoints[i];
    const p2 = canvasPoints[i + 1];
    drawLine(p1.x, p1.y, p2.x, p2.y, lineWidth, highlightR, highlightG, highlightB);
  }

  function drawLine(x0, y0, x1, y1, width, r, g, b) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.hypot(dx, dy);
    const steps = Math.ceil(len * 2);
    const radius = width / 2;

    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const cx = x0 + dx * t;
      const cy = y0 + dy * t;

      const minX = Math.floor(cx - radius - 1);
      const maxX = Math.ceil(cx + radius + 1);
      const minY = Math.floor(cy - radius - 1);
      const maxY = Math.ceil(cy + radius + 1);

      for (let py = minY; py <= maxY; py++) {
        for (let px = minX; px <= maxX; px++) {
          const d = Math.hypot(px - cx, py - cy);
          if (d <= radius) {
            const alpha = Math.min(1, Math.max(0, radius - d + 0.5));
            setPixel(px, py, r, g, b, Math.round(alpha * 255));
          }
        }
      }
    }
  }

  return createPng(size, size, buf);
}

// Generate Icons
console.log("Generating PWA icons...");

const pwa192 = renderAarogyamIcon(192, false);
fs.writeFileSync(path.join(publicDir, "pwa-192x192.png"), pwa192);

const pwa512 = renderAarogyamIcon(512, false);
fs.writeFileSync(path.join(publicDir, "pwa-512x512.png"), pwa512);

const maskable512 = renderAarogyamIcon(512, true);
fs.writeFileSync(path.join(publicDir, "maskable-icon-512x512.png"), maskable512);

const appleIcon = renderAarogyamIcon(180, false);
fs.writeFileSync(path.join(publicDir, "apple-touch-icon.png"), appleIcon);

const favicon32 = renderAarogyamIcon(32, false);
fs.writeFileSync(path.join(publicDir, "favicon-32x32.png"), favicon32);

// Generate SVG Favicon
const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect x="1.5" y="1.5" width="29" height="29" rx="8.5" fill="#081c15" stroke="#2d6a4f" stroke-width="1.5" />
  <path d="M7 17h5l2.5-6 3.5 10 2.5-6.5L22 17h3" stroke="#40916c" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
</svg>`;
fs.writeFileSync(path.join(publicDir, "favicon.svg"), svgFavicon);

console.log("PWA icons generated successfully in frontend/public/");
