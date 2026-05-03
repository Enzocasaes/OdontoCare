import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('./src');

function filesInDir(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const res = path.join(dir, d.name);
    if (d.isDirectory()) return filesInDir(res);
    if (d.isFile() && res.endsWith('.js')) return [res];
    return [];
  });
}

for (const file of filesInDir(srcDir)) {
  const raw = fs.readFileSync(file, 'utf8');
  const lines = raw.split(/\n/);
  // find first non-empty line as sentinel
  const firstNonEmpty = lines.find((l) => l.trim().length > 0) || '';
  const idx = raw.indexOf(firstNonEmpty, raw.indexOf(firstNonEmpty) + 1);
  if (idx > 0 && raw.length > 200) {
    const truncated = raw.slice(0, idx);
    fs.writeFileSync(file, truncated, 'utf8');
    console.log('Truncated', file);
  }
}

console.log('Cleaning done');
