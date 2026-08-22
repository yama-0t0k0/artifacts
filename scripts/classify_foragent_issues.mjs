#!/usr/bin/env node
/**
 * forAgent の Issue を「どのアプリの・どのレイヤーの変更か」で一次分類する。
 *
 *   node scripts/classify_foragent_issues.mjs 718            # #718 以降
 *   node scripts/classify_foragent_issues.mjs 718 --json     # JSON で出力
 *
 * 前提: gh CLI が yama-0t0k0/forAgent へ認証済みであること。
 *
 * これは「一次分類」であり最終成果物ではない。本文に「変更ファイル」節を持たない
 * Issue（調査報告のみのもの等）や、撤去済みディレクトリを指す Issue は取りこぼす。
 * 出力の unmatched / areas が空の行は必ず本文を読んで補正すること。
 */
import { execFileSync } from 'node:child_process';

const REPO = 'yama-0t0k0/forAgent';
const FROM = Number(process.argv[2]);
const AS_JSON = process.argv.includes('--json');
if (!Number.isFinite(FROM)) {
  console.error('usage: node scripts/classify_foragent_issues.mjs <from-issue-number> [--json]');
  process.exit(1);
}

/** ブランチ同期作業。分類対象から外す。 */
const SYNC_CHORE = /^chore: Agent ブランチ最新化と same へのマージ・main 最新化/;

/** パス先頭一致 → [アプリ, レイヤー]。上から優先。 */
const RULES = [
  [/^apps\/admin_app\/expo_frontend\//,          'Admin App',       'フロントエンド'],
  [/^apps\/admin_app\/(node_backend|parse_worker)\//, 'Admin App',  'バックエンド'],
  [/^apps\/admin_app\//,                         'Admin App',       'アプリ設定'],
  [/^apps\/individual_user_app\/expo_frontend\//, 'Individual App', 'フロントエンド'],
  [/^apps\/individual_user_app\/dart_backend\//,  'Individual App', 'バックエンド'],
  [/^apps\/individual_user_app\//,               'Individual App',  'アプリ設定'],
  [/^apps\/corporate_user_app\/expo_frontend\//,  'Corporate App',  'フロントエンド'],
  [/^apps\/corporate_user_app\/dart_backend\//,   'Corporate App',  'バックエンド'],
  [/^apps\/corporate_user_app\//,                'Corporate App',   'アプリ設定'],
  [/^apps\/job_description\/expo_frontend\//,     'Job Description','フロントエンド'],
  [/^apps\/job_description\/dart_backend\//,      'Job Description','バックエンド'],
  [/^apps\/job_description\//,                   'Job Description', 'アプリ設定'],
  [/^apps\/fmjs\/expo_frontend\//,               'FMJS',            'フロントエンド'],
  [/^apps\/fmjs\/dart_backend\//,                'FMJS',            'バックエンド'],
  [/^apps\/fmjs\//,                              'FMJS',            'アプリ設定'],
  [/^apps\/lp_app\//,                            'LP App',          'フロントエンド'],
  [/^apps\/lp_domain_hosting\//,                 'LP App',          'ホスティング'],
  [/^apps\/functions\//,                         'Cloud Functions', 'バックエンド'],
  [/^apps\/backend\//,                           'Backend (Dart)',  'バックエンド'],
  [/^shared\/common_frontend\//,                 '共通モジュール',   'フロントエンド共通'],
  [/^shared\/common_backend\//,                  '共通モジュール',   'バックエンド共通'],
  [/^shared\/common_logic\//,                    '共通モジュール',   '共通ロジック'],
  [/^shared\/domain_logic\//,                    '共通モジュール',   'ドメインロジック'],
  [/^shared\/domain_models\//,                   '共通モジュール',   'ドメインモデル'],
  [/^shared\/ironclaw_core\//,                   '共通モジュール',   'IronClaw Core'],
  [/^shared\//,                                  '共通モジュール',   '共通'],
  [/^infrastructure\/firebase\//,                'データ層／インフラ','Firestore / Rules'],
  [/^tests\/security_rules\//,                   'データ層／インフラ','Firestore / Rules'],
  [/^infrastructure\//,                          'データ層／インフラ','インフラ設定'],
  [/^(firebase\.json|firestore\.rules|storage\.rules|\.firebaserc)$/, 'データ層／インフラ','Firebase 設定'],
  [/^tests\//,                                   '横断',            'テスト基盤'],
  [/^scripts\/release\//,                        '横断',            'リリース運用'],
  [/^scripts\/security\//,                       '横断',            'セキュリティ運用'],
  [/^(scripts|githooks)\//,                      '横断',            '開発運用スクリプト'],
  [/^\.github\//,                                '横断',            'CI/CD'],
  [/^\.claude\/skills\//,                        '横断',            'スキル'],
  [/^docs\//,                                    '横断',            'ドキュメント'],
  [/^reference_information_fordev\//,            '横断',            'ドキュメント'],
  [/^spec\//,                                    '横断',            '仕様 (spec)'],
  [/^(package(-lock)?\.json|jest\.config[^/]*\.js|playwright[^/]*\.ts|babel\.config\.js|analysis_options\.yaml|pubspec\.yaml|eslint\.config\.js|\.nvmrc|Containerfile|\.gitignore)$/,
                                                 '横断',            'ビルド／設定'],
];
const classify = p => { for (const [re,a,l] of RULES) if (re.test(p)) return {app:a, layer:l, path:p}; return null; };

const PATH_RE = /`([A-Za-z0-9_@./-]+\.(?:js|mjs|cjs|ts|tsx|jsx|dart|json|ya?ml|md|sh|rules|lock|html)|[A-Za-z0-9_@./-]+\/)`/g;
const paths = txt => [...new Set([...txt.matchAll(PATH_RE)]
  .map(m => m[1].replace(/^\.\//,''))
  .filter(p => p.includes('/') || /^(firebase\.json|package\.json|jest\.config|playwright|analysis_options|pubspec|eslint\.config|babel\.config)/.test(p)))];

const refs = body => [...new Set([
  ...[...body.matchAll(/(docs\/[A-Za-z0-9_./&-]+\.md)/g)].map(m => m[1]),
  ...[...body.matchAll(/(spec\/[A-Za-z0-9_./-]+\.(?:md|json))/g)].map(m => m[1]),
])];

const raw = execFileSync('gh',
  ['issue','list','--repo',REPO,'--state','all','--limit','400',
   '--json','number,title,labels,state,createdAt,body'],
  { encoding:'utf8', maxBuffer: 64*1024*1024 });

const rows = JSON.parse(raw)
  .filter(i => i.number >= FROM && !SYNC_CHORE.test(i.title))
  .sort((a,b) => a.number - b.number)
  .map(i => {
    const body = i.body || '';
    const sec  = body.split(/##+\s*(?:📝\s*)?変更(?:ファイル|点)/)[1];
    const list = sec ? paths(sec.split(/\n##+\s/)[0]) : [];
    const all  = list.length ? list : paths(body);
    const hits = all.map(classify).filter(Boolean);
    const tally = {};
    for (const h of hits) (tally[`${h.app}|${h.layer}`] ??= {app:h.app, layer:h.layer, files:[]}).files.push(h.path);
    return {
      number:i.number, title:i.title, state:i.state,
      labels:i.labels.map(l => l.name),
      areas:Object.values(tally).sort((a,b) => b.files.length - a.files.length),
      refs:refs(body),
      unmatched:all.filter(p => !classify(p)),
      needsReview: !sec || hits.length === 0,
    };
  });

if (AS_JSON) { console.log(JSON.stringify(rows,null,2)); process.exit(0); }

for (const r of rows) {
  console.log(`#${r.number} ${r.title}`);
  console.log(`   areas : ${r.areas.map(a => `${a.app}/${a.layer}(${a.files.length})`).join(', ') || '(なし)'}`);
  if (r.refs.length)      console.log(`   docs  : ${r.refs.join(', ')}`);
  if (r.unmatched.length) console.log(`   ??    : ${r.unmatched.join(', ')}`);
  if (r.needsReview)      console.log('   ⚠ 本文の手読みが必要（変更ファイル節なし／パス未検出）');
}
const review = rows.filter(r => r.needsReview).map(r => '#'+r.number);
console.log(`\n--- ${rows.length} 件（#${FROM} 以降、同期 chore を除く）`);
console.log(`--- 手読みが必要: ${review.length} 件 ${review.join(' ')}`);
