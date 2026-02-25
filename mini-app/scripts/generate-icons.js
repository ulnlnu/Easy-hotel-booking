/**
 * 生成 TabBar 图标的脚本
 * 使用 Node.js 内置模块生成简单的 PNG 图标
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ICON_SIZE = 81;
const OUTPUT_DIR = path.join(__dirname, '../src/assets/icons');

// PNG 签名
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

// 创建 CRC32 表
const crc32Table = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crc32Table[n] = c >>> 0;
}

// 计算 CRC32
function crc32(data) {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = crc32Table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// 创建 PNG chunk
function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type);
  const crcData = Buffer.concat([typeBuffer, data]);
  const crcValue = crc32(crcData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crcValue, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// 创建 IHDR chunk
function createIHDR(width, height) {
  const data = Buffer.alloc(13);
  data.writeUInt32BE(width, 0);
  data.writeUInt32BE(height, 4);
  data.writeUInt8(8, 8);  // bit depth
  data.writeUInt8(6, 9);  // color type (RGBA)
  data.writeUInt8(0, 10); // compression
  data.writeUInt8(0, 11); // filter
  data.writeUInt8(0, 12); // interlace
  return createChunk('IHDR', data);
}

// 创建简单的首页图标（房子形状）
function createHomeIcon(color, bgColor) {
  const pixels = [];
  const [r, g, b, a] = color;

  for (let y = 0; y < ICON_SIZE; y++) {
    pixels.push(0); // filter byte
    for (let x = 0; x < ICON_SIZE; x++) {
      const centerX = ICON_SIZE / 2;
      const centerY = ICON_SIZE / 2;

      // 背景色（透明）
      let pr = bgColor[0], pg = bgColor[1], pb = bgColor[2], pa = bgColor[3];

      // 房子屋顶（三角形）
      const roofTop = 15;
      const roofBottom = 40;
      const roofHeight = roofBottom - roofTop;
      const roofWidth = 55;
      const roofLeft = centerX - roofWidth / 2;

      if (y >= roofTop && y < roofBottom) {
        const progress = (y - roofTop) / roofHeight;
        const currentWidth = roofWidth * progress;
        const leftBound = centerX - currentWidth / 2;
        const rightBound = centerX + currentWidth / 2;
        if (x >= leftBound && x <= rightBound) {
          pr = r; pg = g; pb = b; pa = a;
        }
      }

      // 房子主体（矩形）
      const bodyTop = 40;
      const bodyBottom = 65;
      const bodyLeft = centerX - 22;
      const bodyRight = centerX + 22;

      if (y >= bodyTop && y < bodyBottom && x >= bodyLeft && x < bodyRight) {
        pr = r; pg = g; pb = b; pa = a;
      }

      // 门
      const doorTop = 50;
      const doorBottom = 65;
      const doorLeft = centerX - 6;
      const doorRight = centerX + 6;

      if (y >= doorTop && y < doorBottom && x >= doorLeft && x < doorRight) {
        pr = bgColor[0]; pg = bgColor[1]; pb = bgColor[2]; pa = bgColor[3];
      }

      pixels.push(pr, pg, pb, pa);
    }
  }

  return Buffer.from(pixels);
}

// 创建简单的列表图标（三条横线）
function createListIcon(color, bgColor) {
  const pixels = [];
  const [r, g, b, a] = color;

  for (let y = 0; y < ICON_SIZE; y++) {
    pixels.push(0); // filter byte
    for (let x = 0; x < ICON_SIZE; x++) {
      // 背景色（透明）
      let pr = bgColor[0], pg = bgColor[1], pb = bgColor[2], pa = bgColor[3];

      // 三条横线
      const lineWidth = 45;
      const lineHeight = 8;
      const startX = (ICON_SIZE - lineWidth) / 2;
      const lineYs = [22, 38, 54];

      for (const lineY of lineYs) {
        if (y >= lineY && y < lineY + lineHeight && x >= startX && x < startX + lineWidth) {
          pr = r; pg = g; pb = b; pa = a;
        }
      }

      pixels.push(pr, pg, pb, pa);
    }
  }

  return Buffer.from(pixels);
}

// 创建 PNG 文件
function createPNG(pixelData) {
  const rawData = Buffer.concat([
    Buffer.from([0]), // filter type for first row
    pixelData
  ]);

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idat = createChunk('IDAT', compressed);
  const ihdr = createIHDR(ICON_SIZE, ICON_SIZE);
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([PNG_SIGNATURE, ihdr, idat, iend]);
}

// 修正后的 PNG 生成函数
function createPNG2(rawData, width, height) {
  const ihdr = createIHDR(width, height);
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idat = createChunk('IDAT', compressed);
  const iend = createChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([PNG_SIGNATURE, ihdr, idat, iend]);
}

// 生成图标数据（带正确的 filter byte）
function createIconData(drawFunc) {
  const pixels = [];
  for (let y = 0; y < ICON_SIZE; y++) {
    pixels.push(0); // filter byte for each row
    for (let x = 0; x < ICON_SIZE; x++) {
      const color = drawFunc(x, y);
      pixels.push(color[0], color[1], color[2], color[3]);
    }
  }
  return Buffer.from(pixels);
}

// 主函数
function main() {
  // 确保输出目录存在
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const defaultColor = [102, 102, 102, 255];  // #666
  const selectedColor = [24, 144, 255, 255];   // #1890ff
  const transparent = [0, 0, 0, 0];

  // 首页图标
  const homeIconData = createIconData((x, y) => {
    const centerX = ICON_SIZE / 2;
    // 屋顶
    if (y >= 15 && y < 40) {
      const progress = (y - 15) / 25;
      const halfWidth = 27.5 * progress;
      if (x >= centerX - halfWidth && x <= centerX + halfWidth) {
        return defaultColor;
      }
    }
    // 主体
    if (y >= 40 && y < 65 && x >= centerX - 22 && x < centerX + 22) {
      // 门
      if (y >= 50 && x >= centerX - 6 && x < centerX + 6) {
        return transparent;
      }
      return defaultColor;
    }
    return transparent;
  });

  const homeIconActiveData = createIconData((x, y) => {
    const centerX = ICON_SIZE / 2;
    if (y >= 15 && y < 40) {
      const progress = (y - 15) / 25;
      const halfWidth = 27.5 * progress;
      if (x >= centerX - halfWidth && x <= centerX + halfWidth) {
        return selectedColor;
      }
    }
    if (y >= 40 && y < 65 && x >= centerX - 22 && x < centerX + 22) {
      if (y >= 50 && x >= centerX - 6 && x < centerX + 6) {
        return transparent;
      }
      return selectedColor;
    }
    return transparent;
  });

  // 列表图标
  const listIconData = createIconData((x, y) => {
    const lineWidth = 45;
    const lineHeight = 8;
    const startX = (ICON_SIZE - lineWidth) / 2;
    const lineYs = [22, 38, 54];

    for (const lineY of lineYs) {
      if (y >= lineY && y < lineY + lineHeight && x >= startX && x < startX + lineWidth) {
        return defaultColor;
      }
    }
    return transparent;
  });

  const listIconActiveData = createIconData((x, y) => {
    const lineWidth = 45;
    const lineHeight = 8;
    const startX = (ICON_SIZE - lineWidth) / 2;
    const lineYs = [22, 38, 54];

    for (const lineY of lineYs) {
      if (y >= lineY && y < lineY + lineHeight && x >= startX && x < startX + lineWidth) {
        return selectedColor;
      }
    }
    return transparent;
  });

  // 生成 PNG 文件
  fs.writeFileSync(path.join(OUTPUT_DIR, 'home.png'), createPNG2(homeIconData, ICON_SIZE, ICON_SIZE));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'home-active.png'), createPNG2(homeIconActiveData, ICON_SIZE, ICON_SIZE));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'list.png'), createPNG2(listIconData, ICON_SIZE, ICON_SIZE));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'list-active.png'), createPNG2(listIconActiveData, ICON_SIZE, ICON_SIZE));

  console.log('Icons generated successfully!');
  console.log('Output directory:', OUTPUT_DIR);
}

main();
