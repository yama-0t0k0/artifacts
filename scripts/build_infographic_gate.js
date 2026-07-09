#!/usr/bin/env node
/*
 * build_infographic_gate.js
 * 平文インフォグラフィック(HTML)をパスワード暗号化し、
 * クライアント側(Web Crypto)で復号するログインゲート付き HTML を生成する。
 *
 * 使い方:
 *   INFOGRAPHIC_PW=yourpass node scripts/build_infographic_gate.js
 *   node scripts/build_infographic_gate.js --pw yourpass
 *   node scripts/build_infographic_gate.js --pw yourpass \
 *        --src .preview_infographic/index.html --out infographic/index.html
 *
 * 引数:
 *   --pw   <password>  暗号化パスワード（未指定時は環境変数 INFOGRAPHIC_PW を使用）
 *   --src  <path>      平文ソース HTML（既定: .preview_infographic/index.html）
 *   --out  <path>      出力先（既定: infographic/index.html）
 *   --iter <n>         PBKDF2 反復回数（既定: 250000）
 *   --title <text>     ログイン画面の見出し（既定: 法人ユーザーアプリ 仕様）
 *   --today            ドキュメント先頭の「更新日」を当日(ローカル)に差し替える
 *   --date <YYYY-MM-DD> 「更新日」を指定日に差し替える（--today より優先）
 *
 * 注意:
 *   - パスワードはスクリプト/出力に保存されません（暗号文・salt・iv のみ）。
 *   - --today / --date 指定時は平文ソース(--src)の更新日も書き換えて保存します。
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function arg(name, def) {
  const i = process.argv.indexOf('--' + name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : def;
}
function flag(name) {
  return process.argv.includes('--' + name);
}
function todayLocal() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

const ROOT = path.resolve(__dirname, '..');
const PASSWORD = arg('pw', process.env.INFOGRAPHIC_PW);
const SRC = path.resolve(ROOT, arg('src', '.preview_infographic/index.html'));
const OUT = path.resolve(ROOT, arg('out', 'infographic/index.html'));
const ITER = parseInt(arg('iter', '250000'), 10);
const TITLE = arg('title', '法人ユーザーアプリ 仕様');
const DATE_OVERRIDE = arg('date', flag('today') ? todayLocal() : null);

if (!PASSWORD) {
  console.error('ERROR: パスワード未指定。--pw <password> か 環境変数 INFOGRAPHIC_PW を指定してください。');
  process.exit(1);
}
if (DATE_OVERRIDE && !/^\d{4}-\d{2}-\d{2}$/.test(DATE_OVERRIDE)) {
  console.error('ERROR: --date は YYYY-MM-DD 形式で指定してください: ' + DATE_OVERRIDE);
  process.exit(1);
}
if (!fs.existsSync(SRC)) {
  console.error('ERROR: ソースが見つかりません: ' + SRC);
  process.exit(1);
}

let src = fs.readFileSync(SRC, 'utf8');

// --today / --date: ドキュメント先頭の「更新日: <b ...>YYYY-MM-DD</b>」を差し替え
if (DATE_OVERRIDE) {
  const re = /(更新日:\s*<b[^>]*>)([^<]*)(<\/b>)/;
  if (!re.test(src)) {
    console.error('WARN: 更新日フィールドが見つからず差し替えをスキップしました。');
  } else {
    src = src.replace(re, '$1' + DATE_OVERRIDE + '$3');
    fs.writeFileSync(SRC, src); // 平文ソースにも反映してドリフトを防ぐ
    console.log('📅 更新日を ' + DATE_OVERRIDE + ' に差し替えました（ソースにも保存）');
  }
}
const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const key = crypto.pbkdf2Sync(PASSWORD, salt, ITER, 32, 'sha256');
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const ct = Buffer.concat([cipher.update(src, 'utf8'), cipher.final()]);
const tag = cipher.getAuthTag();
const payload = Buffer.concat([ct, tag]); // Web Crypto は ciphertext||tag を期待
const b64 = (b) => b.toString('base64');

const login = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${TITLE} — ログイン</title>
<style>
:root{ --bg:#16171a; --bg2:#1e2025; --card:#23262c; --txt:#e9eaec; --muted:#9aa1ab; --line:rgba(255,255,255,.12); --accent:#6aa6ff; --bad:#ff8a8a; }
@media (prefers-color-scheme: light){ :root{ --bg:#f6f7f5; --bg2:#fff; --card:#fff; --txt:#1b1d21; --muted:#5f656e; --line:rgba(0,0,0,.12); --accent:#1f6fe0; --bad:#d8463f; } }
*{box-sizing:border-box}
html,body{height:100%}
body{margin:0;background:
  radial-gradient(120% 120% at 0% 0%, rgba(106,166,255,.16), transparent 55%),
  radial-gradient(120% 120% at 100% 100%, rgba(126,224,192,.14), transparent 55%), var(--bg);
  color:var(--txt);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Hiragino Sans","Noto Sans JP",sans-serif;
  display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px;}
.box{width:100%;max-width:380px;background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:34px 30px;}
.lockico{width:52px;height:52px;border-radius:14px;background:rgba(106,166,255,.16);display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:18px;}
h1{font-size:20px;margin:0 0 6px;font-weight:700;}
p.sub{margin:0 0 22px;color:var(--muted);font-size:13px;line-height:1.6;}
label{font-size:12px;color:var(--muted);display:block;margin-bottom:6px;}
input{width:100%;height:44px;background:var(--card);border:1px solid var(--line);border-radius:10px;color:var(--txt);
  font-size:15px;padding:0 14px;outline:none;}
input:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(106,166,255,.2);}
button{width:100%;height:44px;margin-top:16px;border:0;border-radius:10px;background:var(--accent);color:#fff;
  font-size:15px;font-weight:600;cursor:pointer;}
button:disabled{opacity:.6;cursor:default;}
.err{color:var(--bad);font-size:13px;margin-top:12px;min-height:18px;}
.foot{margin-top:18px;font-size:11px;color:var(--muted);line-height:1.6;}
</style>
</head>
<body>
<form class="box" id="f" autocomplete="off">
  <div class="lockico">🔒</div>
  <h1>${TITLE}</h1>
  <p class="sub">このページは保護されています。閲覧するにはパスワードを入力してください。</p>
  <label for="pw">パスワード</label>
  <input type="password" id="pw" autofocus autocomplete="current-password">
  <button type="submit" id="btn">復号して表示</button>
  <div class="err" id="err"></div>
  <div class="foot">クライアント側で復号されます（カジュアル保護）。</div>
</form>
<script>
const DATA={
  salt:"${b64(salt)}", iv:"${b64(iv)}", ct:"${b64(payload)}", iter:${ITER}
};
const b64d=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const f=document.getElementById('f'),pw=document.getElementById('pw'),err=document.getElementById('err'),btn=document.getElementById('btn');
f.addEventListener('submit',async e=>{
  e.preventDefault(); err.textContent=''; btn.disabled=true; btn.textContent='復号中…';
  try{
    const enc=new TextEncoder();
    const km=await crypto.subtle.importKey('raw',enc.encode(pw.value),'PBKDF2',false,['deriveKey']);
    const key=await crypto.subtle.deriveKey(
      {name:'PBKDF2',salt:b64d(DATA.salt),iterations:DATA.iter,hash:'SHA-256'},
      km,{name:'AES-GCM',length:256},false,['decrypt']);
    const plainBuf=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64d(DATA.iv)},key,b64d(DATA.ct));
    const html=new TextDecoder().decode(plainBuf);
    try{sessionStorage.setItem('unlocked','1')}catch(_){}
    document.open(); document.write(html); document.close();
  }catch(_){
    err.textContent='パスワードが違います。'; btn.disabled=false; btn.textContent='復号して表示'; pw.select();
  }
});
</script>
</body>
</html>`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, login);

console.log('✅ 暗号化ゲートを生成しました');
console.log('   src :', path.relative(ROOT, SRC), '(' + src.length + ' bytes)');
console.log('   out :', path.relative(ROOT, OUT), '(' + login.length + ' bytes)');
console.log('   PBKDF2 iter:', ITER, '| 平文はリポジトリに含まれません');
console.log('   次: git add ' + path.relative(ROOT, OUT) + ' && git commit && git push origin same');
