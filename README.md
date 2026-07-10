# artifacts

公開可能なアーティファクト（仕様ドキュメントのインフォグラフィック等）を GitHub Pages で配信するリポジトリ。

## 公開URL

- ランディング: https://yama-0t0k0.github.io/artifacts/
- 法人ユーザーアプリ 仕様インフォグラフィック（🔒 パスワード保護）: https://yama-0t0k0.github.io/artifacts/infographic/
- 個別アプリ共通化調査 — apps × shared 監査（🔒 パスワード保護）: https://yama-0t0k0.github.io/artifacts/reports/apps-shared-audit/

## 構成

```
artifacts/
├── index.html                       ランディングページ
├── infographic/
│   └── index.html                   仕様インフォグラフィック（AES-256-GCM 暗号化 + ログインゲート）
├── scripts/
│   └── build_infographic_gate.js    平文HTMLを暗号化しゲートを生成するビルドスクリプト
└── .github/workflows/deploy-pages.yml  GitHub Actions による Pages デプロイ
```

## インフォグラフィックの暗号化方式

- 本体HTMLを **AES-256-GCM（PBKDF2-SHA256 / 250,000回 / ランダム salt・iv）** で暗号化。
- 配信物はログイン画面＋暗号文のみ。入力パスワードからブラウザ内（Web Crypto）で復号して表示。
- **平文HTMLおよびパスワードはこのリポジトリに含まれません**（暗号文・salt・iv のみ）。
- 強度はカジュアル保護（クライアント側パスワード）です。

## 更新方法

平文ソース（このリポジトリ外で管理）を編集し、ビルドスクリプトで暗号化ゲートを再生成して push します。

```bash
# 更新日を当日にして再暗号化
INFOGRAPHIC_PW=<password> node scripts/build_infographic_gate.js \
  --src <平文ソース.html> --out infographic/index.html --today

git add infographic/index.html && git commit -m "Update infographic" && git push origin main
```

`main` への push で GitHub Actions が自動デプロイします。
