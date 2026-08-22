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
| 💬 チャット機能 不具合調査 & 改善詳細設計 | https://yama-0t0k0.github.io/artifacts/reports/chat-bug-investigation/ | なし |
| ✅ チャット機能 改善結果 検証レポート | https://yama-0t0k0.github.io/artifacts/reports/chat-improvement-verification/ | なし |
| 🔁 チャット機能 改善結果 検証レポート（第2ラウンド） | https://yama-0t0k0.github.io/artifacts/reports/chat-improvement-verification-r2/ | なし |
| 🗂️ forAgent Issue 機能分類マップ — #718 以降 | https://yama-0t0k0.github.io/artifacts/reports/foragent-issue-classification-718/ | なし |
| 🗺️ forAgent アプリ全体構造マップ | https://yama-0t0k0.github.io/artifacts/docs/foragent-structure-map/ | 🔒 |
| 📤 AdminApp ファイルアップロード → プロフ予測入力 詳細設計 | https://yama-0t0k0.github.io/artifacts/docs/admin-fileupload-profile-prediction/ | なし |
| 📸 forAgent スクリーンショット撮影パネル | https://yama-0t0k0.github.io/artifacts/tools/screenshot-audit-launcher/ | なし |
<!-- CALENDAR_ROW:lat-ceo-meeting-calendar -->
| 🗓️ 2026年10月 山川CEO(株式会社Lat) 打ち合わせ方法カレンダー | https://yama-0t0k0.github.io/artifacts/calendars/2026-10-lat-ceo-meeting-calendar/ | なし |
<!-- /CALENDAR_ROW:lat-ceo-meeting-calendar -->

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
│   ├── admin-app-feature-gaps/
│   │   └── index.html               Adminダッシュボード 機能ギャップ調査（保護なし・平文）
│   ├── chat-bug-investigation/
│   │   ├── index.html               チャット機能 不具合調査 & 改善詳細設計（保護なし・平文）
│   │   └── screenshots/             イシュー貼り付け用スクリーンショット
│   ├── chat-improvement-verification/
│   │   ├── index.html               チャット機能 改善結果 検証レポート（保護なし・平文）
│   │   └── screenshots/             イシュー貼り付け用スクリーンショット
│   ├── chat-improvement-verification-r2/
│   │   ├── index.html               チャット機能 改善結果 検証レポート 第2ラウンド（保護なし・平文）
│   │   └── screenshots/             イシュー貼り付け用スクリーンショット
│   └── foragent-issue-classification-718/
│       └── index.html               forAgent Issue 機能分類マップ #718 以降（保護なし・平文）
├── docs/                            リファレンス・設計ドキュメント
│   ├── foragent-structure-map/
│   │   └── index.html               forAgent アプリ全体構造マップ（🔒）
│   └── admin-fileupload-profile-prediction/
│       └── index.html               AdminApp ファイルアップロード → プロフ予測入力 詳細設計（保護なし・平文）
├── tools/                           操作パネル・ツール類
│   └── screenshot-audit-launcher/
│       └── index.html               forAgent スクリーンショット撮影パネル（保護なし・平文）
├── calendars/                        個人スケジュール系カレンダー（レポート/ドキュメント/ツールとは別カテゴリ）
<!-- CALENDAR_TREE:lat-ceo-meeting-calendar -->
│   └── 2026-10-lat-ceo-meeting-calendar/
│       └── index.html               2026年10月 山川CEO(株式会社Lat) 打ち合わせ方法カレンダー（保護なし・平文）
<!-- /CALENDAR_TREE:lat-ceo-meeting-calendar -->
├── scripts/
│   ├── build_infographic_gate.js    平文HTMLを暗号化しゲートを生成するビルドスクリプト
│   └── classify_foragent_issues.mjs forAgent の Issue をアプリ／レイヤーで一次分類するスクリプト
└── .github/workflows/deploy-pages.yml  GitHub Actions による Pages デプロイ
```

## ツール（tools/）

### 📸 forAgent スクリーンショット撮影パネル

[forAgent](https://github.com/yama-0t0k0/forAgent) リポジトリの Agent Skill「artifact-screenshot-audit」（forAgent#577 で登録）への指示文を、画面上で条件を選ぶだけで組み立ててワンクリックでコピーできる操作パネル。コピーした指示を Claude Code に貼り付けると、Expo Web ビルドの全操作スクリーンショット撮影 → README 作成 → `same` ブランチへの commit までが自動実行される。

- **7アプリ対応**: `job_description` / `individual_user_app` / `corporate_user_app` / `admin_app` / `auth_portal` / `fmjs` / `lp_app` を選ぶと、URL・ペルソナ・viewport（admin_app のみデスクトップ 1280×800、他はモバイル 430×932）の既定値が自動セットされる。各項目は手動で書き換え可能（カスタム viewport も指定可）。
- **実行オプション**: push の要否 / 作業報告 Issue の投稿 / README 転記 Issue の投稿（画像 blob リンク付き。ON にすると push も自動で ON）をチェックボックスで指定。
- **固定仕様（パネルから外せない）**: ①既存スクリーンショットは確認なしで全削除して最新版に置き換え（`same` ブランチには常に最新版のみ） ②本番 Firebase への書き込み操作の禁止 ③git はスクリーンショットフォルダのみステージ — の3項目が生成される指示文に常に含まれる。
- 平文HTML・パスワード保護なし。外部リクエストなしの単一ファイルで動作する。

## Issue 機能分類マップの更新（`reports/foragent-issue-classification-<N>/`）

[forAgent](https://github.com/yama-0t0k0/forAgent) の Issue を「どのアプリの・どのレイヤーの変更か」で
分類したレポート。**開始 Issue 番号ごとに別ディレクトリ**として追加する（過去分を残すため）。

```bash
# ① 一次分類（gh CLI が forAgent へ認証済みであること）
node scripts/classify_foragent_issues.mjs 718

# ② JSON が欲しい場合
node scripts/classify_foragent_issues.mjs 718 --json > /tmp/classified.json
```

スクリプトは Issue 本文の「変更ファイル」節に列挙されたパスをディレクトリ構造へ突き合わせて
分類し、判定できなかった Issue を `⚠ 本文の手読みが必要` として列挙する。

> [!IMPORTANT]
> **スクリプトの出力をそのまま成果物にしないこと。**
> 「変更ファイル」節を持たない Issue（調査報告のみのもの）、撤去済みディレクトリを指す Issue
> （`apps/admin_app/node_backend` 等）、複数テーマに跨がる Issue は必ず取りこぼす。
> #718 の回では 64 件中 10 件が該当した。`⚠` の付いた Issue は本文を読んで補正する。

手順:

1. 上記スクリプトで一次分類を作る
2. `⚠` の付いた Issue と、`areas` が 1 件しかない Issue の本文を読んで補正する
3. `reports/foragent-issue-classification-718/index.html` を雛形として
   `reports/foragent-issue-classification-<新しい開始番号>/index.html` を作る
   （HTML 内の `DATA` 配列と、冒頭の対象範囲・集計日を差し替える）
4. 生成した `docs/` `spec/` へのリンクが実在するか、対象ブランチに対して全件検証する
5. 本 README の一覧・構成ツリーと `index.html` のカードを更新して push

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

# 例3: リファレンス・設計ドキュメント（docs/<slug>/index.html に出力）
INFOGRAPHIC_PW=<password> node scripts/build_infographic_gate.js \
  --src <平文ソース.html> --out docs/foragent-structure-map/index.html \
  --title 'forAgent アプリ全体構造マップ'

git add -A && git commit -m "Update artifact" && git push origin main
```

パスワード保護しないコンテンツは、平文HTMLをそのまま `reports/<slug>/index.html` に配置して push します。

新しいコンテンツを追加した場合は、`index.html`（ランディング）のカードと本 README の一覧も更新します。

`main` への push で GitHub Actions が自動デプロイします。
