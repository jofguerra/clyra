// Read PNG width/height from file headers — no dependencies needed
const fs = require('fs');
const path = require('path');

function getPngSize(filepath) {
  const buf = Buffer.alloc(24);
  const fd = fs.openSync(filepath, 'r');
  fs.readSync(fd, buf, 0, 24, 0);
  fs.closeSync(fd);
  // PNG signature is 8 bytes, then IHDR chunk: 4 (length) + 4 (type) + width(4) + height(4)
  const width  = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height };
}

const dir = path.join(__dirname, '..', 'Animations and Assets', 'Heart');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));

console.log('Mascot part dimensions:');
console.log('─'.repeat(50));
for (const file of files) {
  const { width, height } = getPngSize(path.join(dir, file));
  console.log(`  ${file.padEnd(15)}  ${width} x ${height}`);
}
