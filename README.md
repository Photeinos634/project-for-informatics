# MojiFix

MojiFixは、文字列を指定した文字コードでバイト列に変換し、その同じバイト列を別の文字コードとしてデコードして文字化けを確認する、ブラウザー内動作のWebアプリケーションです。

## 現在の実装

### 画面から利用できる機能

- テキスト入力と文字コード選択
- バイト列の再解釈とHEX表示
- 変換結果・HEXのクリップボードコピー
- 入力、未対応文字コード、エンコード・デコード失敗の表示

### 登録済み文字コード

- UTF-8
- Windows-31J（CP932）。`Shift_JIS` などの別名を含む
- EUC-JP
- ISO-2022-JP
- UTF-16LE / UTF-16BE

`Shift_JIS` とWindows-31J（CP932）は完全に同じ文字集合ではありません。現在は既存Registryの別名定義に従い、`Shift_JIS` をWindows-31Jへ解決します。

### 実装済みのアプリケーションモジュール

- HEXとバイト列の変換・比較・結合・コピー
- UTF-8、UTF-16、UTF-32 BOMの検出、追加、除去
- 改行コードの検出、出現数集計、変換
- Unicodeコードポイント、互換文字、異体字セレクタ、サロゲートの解析サービス
- 文字コード・改行・正規化の設定例を用いた互換性解析サービス

解析サービスやHookは実装済みですが、これらの解析機能は現在のメイン画面にはまだ接続されていません。コンポーネントの雛形があることも、画面機能が完成していることを意味しません。

## 変換仕様

MojiFixの基本機能は通常のトランスコードではなく、バイト列の再解釈です。

```text
入力文字列
  -> 変換元文字コードでエンコード
  -> 同じバイト列からHEXを生成
  -> 同じバイト列を変換先文字コードでデコード
```

変換元文字コードで文字列に戻してから変換先で再エンコードする処理は行いません。文字コード処理はブラウザー内で完結し、入力を外部サーバーへ送信しません。

## 技術スタック

| 分類 | 技術 |
|---|---|
| フレームワーク | Next.js App Router |
| 言語・UI | TypeScript、React |
| 文字コード処理 | `encoding-japanese`、`iconv-lite` |
| スタイリング | CSS、Tailwind CSS |
| テスト | Vitest |
| デプロイ | Next.js Static Export、Vercel向け |

`encoding-japanese` と `iconv-lite` は共通のEncoding Engineインターフェースを実装しています。現在、登録済み文字コードのResolver設定では `encoding-japanese` が選択され、`iconv-lite` は登録されているものの、文字コード定義から通常選択される設定ではありません。実際の対応範囲・変換不能文字の挙動はエンジンごとに異なるため、エンジンの変更時はテストで確認してください。

## 開発

必要環境：Node.js 20.9.0以上、npm

```bash
npm ci
npm run dev
```

ブラウザーで `http://localhost:3000` を開きます。ポートが使用中の場合、Next.jsは別のポートを選ぶことがあります。

```bash
npm run typecheck
npm run lint
npx vitest run
npm run build
```

本プロジェクトには独立した `test` npm script はありません。テスト対象は [vitest.config.ts](./vitest.config.ts) に定義されています。

## 主なディレクトリ

```text
src/
├── app/          # Next.jsページとスタイル
├── components/   # UIコンポーネント
├── hooks/        # useConverter、useAnalyzer、useClipboard
├── services/     # 変換、Unicode解析、互換性解析
├── lib/
│   ├── binary/   # HEX、BOM、改行、バイト操作
│   ├── encoding/ # Encoding Engine、Registry、Resolver
│   ├── platform/ # 互換性設定・比較
│   └── unicode/  # Unicode解析・正規化
├── constants/
└── types/
tests/             # converter、binary、encoding、platform、unicodeのテスト
docs/
└── copilot/       # 担当間の引き継ぎ資料
```

## ドキュメント

- [仕様書](./docs/specification.md)
- [設計書](./docs/design.md)
- [共通インターフェース](./docs/interfaces.md)
- [担当別開発ガイド](./docs/development/)
- [B担当引き継ぎ](./docs/copilot/B-handoff.md)
- [C担当引き継ぎ](./docs/copilot/C-handoff.md)

## 開発上の注意

- 共有APIと型は [docs/interfaces.md](./docs/interfaces.md) を参照し、関係者間の合意なく変更しないでください。
- UIで文字コードエンジンを直接呼び出さず、HookとServiceを利用してください。
- 文字コードの追加時はRegistry、別名、能力定義、エンジン、テストを一緒に確認してください。
- OSプリセットは設定例であり、OSの既定動作を断定するものではありません。

## ライセンス

ライセンスはプロジェクトの配布方針決定後に設定します。
