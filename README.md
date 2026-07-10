# artifacts

公開可能なアーティファクト（仕様ドキュメント・調査レポートのインフォグラフィック等）を GitHub Pages で配信するリポジトリ。

## 公開URL

- ランディング: https://yama-0t0k0.github.io/artifacts/

| コンテンツ | URL | 保護 |
|---|---|---|
| 📊 法人ユーザーアプリ 仕様インフォグラフィック | https://yama-0t0k0.github.io/artifacts/infographic/ | 🔒 |
| 🔍 バックエンド実装調査 — JS/TS 監査 | https://yama-0t0k0.github.io/artifacts/reports/backend-dart-audit/ | 🔒 |
| 🧩 個別アプリ共通化調査 — apps × shared 監査 | https://yama-0t0k0.github.io/artifacts/reports/apps-shared-audit/ | 🔒 |

## 構成

```
artifacts/
├── index.html                       ランディングページ
├── infographic/
│   └── index.html                   法人ユーザーアプリ 仕様インフォグラフィック（暗号化 + ログインゲート）
├── reports/                         調査レポート（いずれも暗号化 + ログインゲート）
│   ├── backend-dart-audit/
│   │   └── index.html               バックエンド実装調査 — JS/TS 監査
│   └── apps-shared-audit/
│       └── index.html               個別アプリ共通化調査 — apps × shared 監査
├── scripts/
│   └── build_infographic_gate.js    平文HTMLを暗号化しゲートを生成するビルドスクリプト
└── .github/workflows/deploy-pages.yml  GitHub Actions による Pages デプロイ
```

## 暗号化方式（全コンテンツ共通）

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

新しいコンテンツを追加した場合は、`index.html`（ランディング）のカードと本 README の一覧も更新します。

`main` への push で GitHub Actions が自動デプロイします。
