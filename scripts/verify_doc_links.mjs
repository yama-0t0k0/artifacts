#!/usr/bin/env node
/**
 * 生成した HTML 内の GitHub blob リンクが、対象ブランチに実在するか全件検証する。
 *
 *   node scripts/verify_doc_links.mjs <html> [branch] [repo-path]
 *
 * 公開前に必ず通すこと。実在しないドキュメントへのリンクは、読者を存在しない根拠へ
 * 誘導するため、リンクが無い状態より有害である。
 */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const [, , htmlPath, branch = 'origin/Agent', repo = process.cwd()] = process.argv;
if (!htmlPath) {
  console.error('usage: node scripts/verify_doc_links.mjs <html> [branch] [repo-path]');
  process.exit(1);
}
const html = fs.readFileSync(htmlPath, 'utf8');

// href="..." と、JS で組み立てるリンク（DOC/SPEC テーブルの相対パス）の両方を拾う
const urls = new Set([...html.matchAll(/https:\/\/github\.com\/[^/]+\/[^/]+\/blob\/[^/]+\/([^"'`\s)]+)/g)].map(m => m[1]));
const tables = [...html.matchAll(/\[\s*'((?:docs|spec)?\/?[A-Za-z0-9_./&-]+\.(?:md|json))'\s*,/g)].map(m => m[1]);
for (const t of tables) urls.add(t);

let ok = 0; const missing = [];
for (const raw of urls) {
  // テーブルはリポジトリルート基点のパスで持つ場合と、docs/ spec/ を基点にした
  // 相対パスで持つ場合がある。DESIGN.md のようにルート直下のものもあるため、
  // まずそのままのパスで引き、駄目なら docs/ spec/ を前置して試す。
  const candidates = raw.startsWith('docs/') || raw.startsWith('spec/')
    ? [raw] : [raw, `docs/${raw}`, `spec/${raw}`];
  const found = candidates.some(c => {
    try { execFileSync('git', ['-C', repo, 'cat-file', '-e', `${branch}:${c}`], { stdio: 'ignore' }); return true; }
    catch { return false; }
  });
  found ? ok++ : missing.push(raw);
}
console.log(`検証: ${urls.size} 件 / 実在 ${ok} 件 / 不明 ${missing.length} 件（branch: ${branch}）`);
for (const m of missing) console.log('  MISSING:', m);
process.exit(missing.length ? 1 : 0);
