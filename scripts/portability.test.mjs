import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ignored = new Set(['.git', 'node_modules', '.agents', '.DS_Store']);
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (ignored.has(entry.name)) return [];
    const full = path.join(dir, entry.name);
    assert.ok(!entry.isSymbolicLink(), `Non-portable symlink: ${full}`);
    return entry.isDirectory() ? files(full) : [full];
  });
}
function fingerprint(dir) {
  return Object.fromEntries(files(dir).sort().map(file => [
    path.relative(dir, file), createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
  ]));
}

test('all assets are ordinary files without author-machine paths', () => {
  for (const file of files(root)) {
    const content = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(content, /\/(?:Users|home)\/[A-Za-z0-9_-]+\//, path.relative(root, file));
  }
});

test('local Markdown resource links exist inside the clone', () => {
  const failures = [];
  for (const file of files(root).filter(file => file.endsWith('.md'))) {
    const text = fs.readFileSync(file, 'utf8').replace(/^```.*?^```[^\n]*/gms, '');
    for (const match of text.matchAll(/\]\(([^\s)]+)\)/g)) {
      const href = match[1];
      if (/^(?:[a-z][a-z0-9+.-]*:|#)/i.test(href)) continue;
      const target = path.resolve(path.dirname(file), href.split('#')[0]);
      if (!target.startsWith(root + path.sep) || !fs.existsSync(target)) {
        failures.push(`${path.relative(root, file)} -> ${href}`);
      }
    }
  }
  assert.deepEqual(failures, []);
});

test('both hosts can execute their bundled shared helper after relocation', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'ai4se-relocation-'));
  const clone = path.join(temporary, 'clone with spaces');
  try {
    fs.cpSync(root, clone, { recursive: true, filter: source => !ignored.has(path.basename(source)) });
    for (const relative of [
      '.qoder/skills/sdd-bootstrap/scripts/init-checkpoint-log.sh',
      '.github/skills/ai4se-sdd/harness/bootstrap/scripts/init-checkpoint-log.sh',
    ]) {
      const project = fs.mkdtempSync(path.join(temporary, 'project-'));
      execFileSync('bash', [path.join(clone, relative), '--root', project], { encoding: 'utf8' });
      const logs = fs.readdirSync(path.join(project, 'docs/ai4se-plugins'));
      assert.equal(logs.length, 1);
      assert.match(fs.readFileSync(path.join(project, 'docs/ai4se-plugins', logs[0]), 'utf8'), /skill\.harness\.bootstrap/);
    }
    const before = fingerprint(clone);
    execFileSync(process.execPath, [path.join(clone, 'scripts/refresh-agent-assets.mjs')]);
    assert.deepEqual(fingerprint(clone), before, 'Regeneration must be independent of checkout location');
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});
