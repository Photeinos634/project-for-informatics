# MojiFix

**MojiFix** は、文字コードの変換・再解釈・Unicode解析・環境間の文字互換性確認を行うブラウザベースのツールです。

Windows・macOS・iOSなどの異なる環境や、異なるアプリケーション間で発生する文字化け・文字表現の違いを調査できることを目指します。

## 実装予定の主な機能

以下はプロジェクトの目標機能です。現時点では画面とディレクトリの初期雛形がある段階で、文字コード変換・Unicode解析・互換性解析などの機能はまだ実装されていません。

### 文字コード変換・再解釈
- UTF-8
- Shift_JIS
- Windows-31J（CP932）
- EUC-JP
- ISO-2022-JP
- UTF-16系
- その他の文字コードへの拡張

### Unicode解析
- NFC / NFD / NFKC / NFKD
- Unicodeコードポイントの表示
- 互換文字の確認
- 異体字セレクタの解析
- UTF-16サロゲートペアの解析

### OS・環境間の互換性解析
- Windows・macOS・iOS向けプリセット
- 文字コード間の対応状況確認
- 変換による文字の変化・欠落の確認
- 文字の置換・非対応文字の検出

### バイナリ解析
- HEX表示
- BOMの検出
- 改行コードの検出
- バイト列の比較・操作

## 技術スタック

| 分類 | 技術 |
|---|---|
| フレームワーク | Next.js |
| 言語 | TypeScript |
| UI | React |
| 文字コード処理 | encoding-japanese（導入候補・未導入） |
| 多言語文字コード処理 | iconv-lite（導入候補・未導入） |
| スタイリング | CSS |
| テスト | Vitest（採用候補・未導入） |
| デプロイ | Vercel（Static Export設定済み） |
| バージョン管理 | Git / GitHub |

## 動作方針

MojiFixはブラウザ内で文字コード処理を行います。

入力された文字列や変換対象のバイト列を、外部サーバーに送信して変換することはありません。

Next.jsのStatic Exportを利用し、静的サイトとして公開する方針です。

## ディレクトリ構成

```text
MojiFix/
├── .github/
│   └── copilot-instructions.md
├── public/
│   ├── favicon.ico
│   └── images/
├── docs/
│   ├── index.md
│   ├── specification.md
│   ├── design.md
│   ├── interfaces.md
│   └── development/
│       ├── frontend.md
│       ├── encoding-engine.md
│       └── application-logic.md
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── analyzer/
│   │   ├── converter/
│   │   ├── editor/
│   │   ├── layout/
│   │   └── ui/
│   ├── hooks/
│   ├── services/
│   ├── lib/
│   │   ├── binary/
│   │   ├── encoding/
│   │   │   └── engines/
│   │   ├── platform/
│   │   ├── unicode/
│   │   └── utils/
│   ├── constants/
│   └── types/
├── tests/
│   ├── converter/
│   ├── encoding/
│   ├── platform/
│   └── unicode/
├── README.md
├── package.json
└── next.config.ts
```

詳細は `docs/design.md` を参照してください。

## 開発環境の準備

### 必要なもの
- Node.js
- npm
- Git
- GitHubアカウント
- Visual Studio Codeなどのエディタ

### セットアップ

```bash
git clone <repository-url>
cd MojiFix
npm install
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスします。

### ビルド

```bash
npm run build
```

ビルド結果は `out/` に出力されます。

## 導入予定の文字コードライブラリ

以下の2つのライブラリを利用する方針ですが、現時点では依存関係に含まれていません。

### encoding-japanese
日本語系文字コードを中心に扱います。

### iconv-lite
Windows系コードページ、Macintosh系、多言語文字コードなどの処理を担当します。

両ライブラリを共通インターフェースでラップし、アプリケーション側からライブラリを直接操作しない設計にします。

なお、ブラウザでの `iconv-lite` の動作にはバンドル・Buffer互換環境の検証が必要です。

## 開発体制

| 担当 | 役割 |
|---|---|
| A | Frontend / UI |
| B | Encoding Engine / Unicode |
| C | Application Logic / Integration |

共通インターフェースは `docs/interfaces.md` に定義します。

## 開発ルール

1. TypeScriptを使用する。
2. UIと変換ロジックを分離する。
3. 文字コード処理は共通インターフェースを経由する。
4. バイト列は `Uint8Array` に統一する。
5. 文字コード変換とバイト列の再解釈を混同しない。
6. Unicode正規化は文字コード変換と独立させる。
7. 新機能には可能な限りテストを追加する。
8. 仕様変更時は関連ドキュメントも更新する。

## ドキュメント

- `docs/index.md`：ドキュメント一覧
- `docs/specification.md`：機能仕様
- `docs/design.md`：システム設計
- `docs/interfaces.md`：共通インターフェース
- `docs/development/`：担当別開発指示

## ライセンス

ライセンスはプロジェクトの配布方針決定後に設定します。
