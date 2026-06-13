const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const input = path.join(root, "public/brand/oremos-icon.png");
const WORK_SIZE = 320;

async function getContentBounds(imagePath) {
  const { data, info } = await sharp(imagePath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  let minX = info.width;
  let minY = info.height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * info.channels;
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;

      if (brightness > 30) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  return {
    left: minX,
    top: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

function binarize(data, channels, threshold = 35) {
  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += channels) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const value = brightness > threshold ? 255 : 0;
    out[i] = value;
    out[i + 1] = value;
    out[i + 2] = value;
    if (channels === 4) out[i + 3] = 255;
  }
  return out;
}

function dilate(data, width, height, channels, radius) {
  if (radius <= 0) return data;

  const out = Buffer.from(data);
  const hits = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      if (data[i] > 128) hits.push([x, y]);
    }
  }

  for (const [x, y] of hits) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const ni = (ny * width + nx) * channels;
        out[ni] = 255;
        out[ni + 1] = 255;
        out[ni + 2] = 255;
        if (channels === 4) out[ni + 3] = 255;
      }
    }
  }

  return out;
}

async function getSquaredCropBuffer() {
  const bounds = await getContentBounds(input);
  const cropped = sharp(input).extract(bounds);
  const meta = await cropped.metadata();
  const maxDim = Math.max(meta.width, meta.height);
  const padLeft = Math.floor((maxDim - meta.width) / 2);
  const padTop = Math.floor((maxDim - meta.height) / 2);

  return cropped
    .extend({
      top: padTop,
      bottom: maxDim - meta.height - padTop,
      left: padLeft,
      right: maxDim - meta.width - padLeft,
      background: { r: 0, g: 0, b: 0 },
    })
    .resize(WORK_SIZE, WORK_SIZE, { fit: "fill" })
    .png()
    .toBuffer();
}

function getDilateRadius(size) {
  if (size <= 16) return 5;
  if (size <= 32) return 4;
  if (size <= 48) return 3;
  if (size <= 180) return 2;
  return 1;
}

async function createMaximizedFavicon(outputPath, size) {
  const squared = await getSquaredCropBuffer();
  const { data, info } = await sharp(squared).raw().toBuffer({ resolveWithObject: true });

  const binary = binarize(data, info.channels);
  const radius = getDilateRadius(size);
  const bold = dilate(binary, info.width, info.height, info.channels, radius);

  await sharp(bold, { raw: info })
    .resize(size, size, {
      fit: "fill",
      kernel: size <= 48 ? sharp.kernel.nearest : sharp.kernel.lanczos3,
    })
    .png()
    .toFile(outputPath);
}

async function main() {
  const outputs = [
    ["app/icon.png", 512],
    ["public/icon.png", 512],
    ["public/apple-icon.png", 180],
    ["public/brand/oremos-favicon.png", 512],
    ["public/brand/oremos-favicon-48.png", 48],
    ["public/brand/oremos-favicon-32.png", 32],
    ["public/brand/oremos-favicon-16.png", 16],
    ["public/favicon.ico", 32],
  ];

  for (const [rel, size] of outputs) {
    const out = path.join(root, rel);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await createMaximizedFavicon(out, size);
    console.log(`✓ ${rel} (${size}px)`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
