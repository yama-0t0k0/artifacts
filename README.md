# artifacts

公開可能なアーティファクト（仕様ドキュメント・調査レポートのインフォグラフィック等）を GitHub Pages で配信するリポジトリ。

## 公開URL

- ランディング: https://yama-0t0k0.github.io/artifacts/

| コンテンツ | URL | 保護 |
|---|---|---|
| 📊 法人ユーザーアプリ 仕様インフォグラフィック | https://yama-0t0k0.github.io/artifacts/infographic/ | 🔒 |
| 🔍 バックエンド実装調査 — JS/TS 監査 | https://yama-0t0k0.github.io/artifacts/reports/backend-dart-audit/ | 🔒 |
| 🧩 個別アプリ共通化調査 — apps × shared 監査 | https://yama-0t0k0.github.io/artifacts/reports/apps-shared-audit/ | 🔒 |
| ⚙️ GitHub Actions 失敗調査 — forAgent CI/CD 監査 | https://yama-0t0k0.github.io/artifacts/reports/github-actions-failure-audit/ | 🔒 |
| 🎛️ Adminダッシュボード 機能ギャップ調査 | https://yama-0t0k0.github.io/artifacts/reports/admin-app-feature-gaps/ | なし |
| 📸 forAgent スクリーンショット撮影パネル | https://yama-0t0k0.github.io/artifacts/tools/screenshot-audit-launcher/ | なし |

## 構成

```
artifacts/
├── index.html                       ランディングページ
├── infographic/
│   └── index.html                   法人ユーザーアプリ 仕様インフォグラフィック（暗号化 + ログインゲート）
├── reports/                         調査レポート
│   ├── backend-dart-audit/
│   │   └── index.html               バックエンド実装調査 — JS/TS 監査（🔒）
│   ├── apps-shared-audit/
│   │   └── index.html               個別アプリ共通化調査 — apps × shared 監査（🔒）
│   ├── github-actions-failure-audit/
│   │   └── index.html               GitHub Actions 失敗調査 — forAgent CI/CD 監査（🔒）
│   └── admin-app-feature-gaps/
│       └── index.html               Adminダッシュボード 機能ギャップ調査（保護なし・平文）
├── tools/                           操作パネル・ツール類
│   └── screenshot-audit-launcher/
│       └── index.html               forAgent スクリーンショット撮影パネル（保護なし・平文）
├── scripts/
│   └── build_infographic_gate.js    平文HTMLを暗号化しゲートを生成するビルドスクリプト
└── .github/workflows/deploy-pages.yml  GitHub Actions による Pages デプロイ
```

## ツール（tools/）

### 📸 forAgent スクリーンショット撮影パネル

[forAgent](https://github.com/yama-0t0k0/forAgent) リポジトリの Agent Skill「artifact-screenshot-audit」（forAgent#577 で登録）への指示文を、画面上で条件を選ぶだけで組み立ててワンクリックでコピーできる操作パネル。コピーした指示を Claude Code に貼り付けると、Expo Web ビルドの全操作スクリーンショット撮影 → README 作成 → `same` ブランチへの commit までが自動実行される。

- **7アプリ対応**: `job_description` / `individual_user_app` / `corporate_user_app` / `admin_app` / `auth_portal` / `fmjs` / `lp_app` を選ぶと、URL・ペルソナ・viewport（admin_app のみデスクトップ 1280×800、他はモバイル 430×932）の既定値が自動セットされる。各項目は手動で書き換え可能（カスタム viewport も指定可）。
- **実行オプション**: push の要否 / 作業報告 Issue の投稿 / README 転記 Issue の投稿（画像 blob リンク付き。ON にすると push も自動で ON）をチェックボックスで指定。
- **固定仕様（パネルから外せない）**: ①既存スクリーンショットは確認なしで全削除して最新版に置き換え（`same` ブランチには常に最新版のみ） ②本番 Firebase への書き込み操作の禁止 ③git はスクリーンショットフォルダのみステージ — の3項目が生成される指示文に常に含まれる。
- 平文HTML・パスワード保護なし。外部リクエストなしの単一ファイルで動作する。

## 暗号化方式（🔒 付きコンテンツ）

- 本体HTMLを **AES-256-GCM（PBKDF2-SHA256 / 250,000回 / ランダム salt・iv）** で暗号化。
- 配信物はログイン画面＋暗号文のみ。入力パスワードからブラウザ内（Web Crypto）で復号して表示。
- **平文HTMLおよびパスワードはこのリポジトリに含まれません**（暗号文・salt・iv のみ）。
- 強度はカジュアル保護（クライアント側パスワード）です。

## 更新方法

平文ソース（このリポジトリ外で管理）を編集し、ビルドスクリプトで暗号化ゲートを再生成して push します。
`--out` と `--title` を対象コンテンツに合わせて指定してください。

```bash
# 例1: 仕様インフォグラフィック（更新日を当日にして再暗号化）
INFOGRAPHIC_PW=<password> node scripts/build_infographic_gate.js \
  --src <平文ソース.html> --out infographic/index.html --today

# 例2: 調査レポート（新規追加もこの形式で reports/<slug>/index.html に出力）
INFOGRAPHIC_PW=<password> node scripts/build_infographic_gate.js \
  --src <平文ソース.html> --out reports/apps-shared-audit/index.html \
  --title '個別アプリ共通化調査 — apps × shared 監査'

git add -A && git commit -m "Update artifact" && git push origin main
```

パスワード保護しないコンテンツは、平文HTMLをそのまま `reports/<slug>/index.html` に配置して push します。

新しいコンテンツを追加した場合は、`index.html`（ランディング）のカードと本 README の一覧も更新します。

`main` への push で GitHub Actions が自動デプロイします。
