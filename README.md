# MojiFix

**文字コードの再解釈によって、文字化けを確認・再現するWebアプリケーション**

MojiFixは、入力した文字列を指定した文字コードでバイト列に変換し、そのバイト列を別の文字コードとして再解釈することで、文字化けの再現や確認を行うWebアプリケーションです。

ブラウザ上で処理が完結するため、入力した文字列を変換のために外部サーバーへ送信する必要はありません。

---

## 目次

- [1. プロジェクト概要](#1-プロジェクト概要)
- [2. 主な機能](#2-主な機能)
- [3. 変換処理の仕組み](#3-変換処理の仕組み)
- [4. 対応文字コード](#4-対応文字コード)
- [5. 技術構成](#5-技術構成)
- [6. ディレクトリ構成](#6-ディレクトリ構成)
- [7. 開発環境の構築](#7-開発環境の構築)
- [8. 開発・実行方法](#8-開発実行方法)
- [9. チーム開発体制](#9-チーム開発体制)
- [10. GitHubでの開発ルール](#10-githubでの開発ルール)
- [11. GitHub Copilotの利用](#11-github-copilotの利用)
- [12. テスト](#12-テスト)
- [13. ビルド・デプロイ](#13-ビルドデプロイ)
- [14. 開発上の注意事項](#14-開発上の注意事項)
- [15. 今後の拡張予定](#15-今後の拡張予定)

---

# 1. プロジェクト概要

## 1.1 MojiFixとは

MojiFixは、文字コードの違いによって発生する文字化けを再現・確認するためのツールです。

例えば、UTF-8で保存された文字列を別の文字コードとして解釈した場合や、Shift_JISのバイト列をUTF-8として読み込んだ場合など、異なる文字コード間での解釈の違いを確認できます。

一般的な文字コード変換ツールとは異なり、MojiFixでは変換元で生成したバイト列を変換先の文字コードで直接デコードします。

## 1.2 開発目的

- 文字コードの違いによる文字化けを再現する。
- 文字コードとバイト列の関係を確認できるようにする。
- HEXデータを通じて文字列の内部表現を確認する。
- 複数の日本語文字コードに対応する。
- 将来的に対応文字コードを追加しやすい構造にする。

## 1.3 アプリケーションの特徴

| 項目 | 内容 |
|---|---|
| アプリケーション名 | MojiFix |
| 種類 | Webアプリケーション |
| 実行環境 | ブラウザ |
| 処理方式 | クライアントサイド処理 |
| フレームワーク | Next.js |
| 言語 | TypeScript |
| デプロイ先 | Vercel |

---

# 2. 主な機能

## 2.1 文字列入力

ユーザーが任意の文字列を入力できます。

日本語・英数字・記号などを入力できるほか、複数行の文字列にも対応します。

## 2.2 文字コード選択

変換元と変換先の文字コードをそれぞれ選択できます。

## 2.3 文字コードの再解釈

変換元の文字コードで生成したバイト列を、変換先の文字コードでデコードします。

## 2.4 HEX表示

変換元の文字コードによって生成されたバイト列を16進数形式で表示します。

## 2.5 結果のコピー

変換結果やHEXデータをクリップボードにコピーできます。

## 2.6 エラー・警告表示

対応していない文字コードや、エンコード・デコード時の問題をユーザーに通知します。

---

# 3. 変換処理の仕組み

**MojiFixの最も重要な仕様です。**

MojiFixは通常の文字コード変換とは異なり、同一のバイト列を異なる文字コードで解釈します。

## 3.1 基本的な処理

例えば、以下の条件を指定したとします。

| 項目 | 値 |
|---|---|
| 入力文字列 | こんにちは |
| 変換元 | SHIFT_JIS |
| 変換先 | UTF-8 |

処理は以下の順番で行われます。

1. 入力文字列をSHIFT_JISでエンコードする。
2. 生成されたバイト列を取得する。
3. 同じバイト列をHEX形式に変換する。
4. 同じバイト列をUTF-8としてデコードする。
5. デコード結果を画面に表示する。

```text
                  入力文字列
                      │
                      │ こんにちは
                      ▼
                SHIFT_JIS Encoder
                      │
                      ▼
                   バイト列
                      │
             ┌────────┴────────┐
             │                 │
             ▼                 ▼
          HEX変換          UTF-8 Decoder
             │                 │
             ▼                 ▼
         HEXデータ         変換後の文字列
```

## 3.2 実装上の重要事項

基本的な処理は以下のとおりです。

```ts
const bytes = encodeText(
  input,
  sourceEncoding
);

const hex = bytesToHex(bytes);

const output = decodeBytes(
  bytes,
  targetEncoding
);
```

`bytes`は変換元で生成したバイト列です。

HEX表示と変換後の文字列の両方に、必ず同じバイト列を使用してください。

## 3.3 通常の文字コード変換との違い

一般的な文字コード変換では、変換元の文字コードでデコードした後、変換先の文字コードで再エンコードします。

MojiFixでは、この処理を行いません。

```ts
// MojiFixで採用する方式
const bytes = encodeText(input, sourceEncoding);
const output = decodeBytes(bytes, targetEncoding);
```

以下のような処理は禁止です。

```ts
// 通常の文字コード変換であり、MojiFixの仕様とは異なる
const sourceBytes = encodeText(input, sourceEncoding);

const intermediateText = decodeBytes(
  sourceBytes,
  sourceEncoding
);

const targetBytes = encodeText(
  intermediateText,
  targetEncoding
);

const output = decodeBytes(
  targetBytes,
  targetEncoding
);
```

**変換元で生成したバイト列を、変換先で再エンコードしてはいけません。**

---

# 4. 対応文字コード

初期実装では以下の文字コードに対応します。

| ID | 表示名 |
|---|---|
| `UTF-8` | UTF-8 |
| `SHIFT_JIS` | Shift_JIS |
| `EUC-JP` | EUC-JP |
| `ISO-2022-JP` | ISO-2022-JP（JIS） |

各文字コードについて、エンコード・デコードの両方に対応することを目標とします。

ただし、実際の対応状況は採用ライブラリの機能と実装状況に従います。

将来的には、対応文字コードを追加できる設計とします。

---

# 5. 技術構成

## 5.1 使用技術

| 技術 | 用途 |
|---|---|
| Next.js | Webアプリケーションの構築 |
| React | UIの構築 |
| TypeScript | 型安全な開発 |
| CSS Modules / CSS | スタイリング |
| Git | バージョン管理 |
| GitHub | ソースコード管理・チーム開発 |
| GitHub Copilot | コーディング支援 |
| Vercel | デプロイ |

## 5.2 アーキテクチャ

MojiFixは、ブラウザ内で処理が完結する構成を採用します。

```text
┌─────────────────────────────────────┐
│             Browser                 │
│                                     │
│  ┌───────────────────────────────┐  │
│  │          Frontend             │  │
│  │       A担当：UI               │  │
│  └───────────────┬───────────────┘  │
│                  │                  │
│  ┌───────────────▼───────────────┐  │
│  │       Application Logic       │  │
│  │       C担当：変換処理         │  │
│  └───────────────┬───────────────┘  │
│                  │                  │
│       ┌──────────┴──────────┐       │
│       │                     │       │
│  ┌────▼─────────┐   ┌───────▼────┐  │
│  │ Encoding     │   │ HEX Utils  │  │
│  │ Engine       │   │            │  │
│  │ B担当        │   │ C担当      │  │
│  └──────────────┘   └────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

## 5.3 実行環境

- 文字コード処理はブラウザ内で実行する。
- 入力文字列を外部サーバーへ送信しない。
- データベースを使用しない。
- API RoutesやServer Actionsを使用しない。
- 静的エクスポートによるデプロイに対応する。

---

# 6. ディレクトリ構成

以下を基本構成とします。

```text
MojiFix/
│
├── .github/
│   └── copilot-instructions.md
│
├── public/
│   └── favicon.ico
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── editor/
│   │   │   ├── EditorPanel.tsx
│   │   │   ├── TextInput.tsx
│   │   │   └── TextOutput.tsx
│   │   │
│   │   ├── converter/
│   │   │   ├── EncodingSelector.tsx
│   │   │   ├── ConvertButton.tsx
│   │   │   ├── HexViewer.tsx
│   │   │   └── ConversionResult.tsx
│   │   │
│   │   └── ui/
│   │       ├── Button.tsx
│   │       └── Card.tsx
│   │
│   ├── hooks/
│   │   ├── useConverter.ts
│   │   └── useClipboard.ts
│   │
│   ├── services/
│   │   └── converterService.ts
│   │
│   ├── lib/
│   │   ├── encoding/
│   │   │   ├── encodingEngine.ts
│   │   │   ├── browserEncodingEngine.ts
│   │   │   └── encodingRegistry.ts
│   │   │
│   │   └── utils/
│   │       ├── hex.ts
│   │       └── validation.ts
│   │
│   ├── constants/
│   │   └── encodings.ts
│   │
│   └── types/
│       ├── encoding.ts
│       └── converter.ts
│
├── tests/
│
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

実際のプロジェクト構成と異なる場合は、既存構成を優先してください。

---

# 7. 開発環境の構築

## 7.1 必要なソフトウェア

開発を始める前に、以下を用意してください。

- Node.js（プロジェクトが要求するLTSバージョン）
- npm
- Git
- Visual Studio Code
- GitHubアカウント
- GitHub Copilot（利用する場合）

## 7.2 リポジトリの取得

```bash
git clone <repository-url>
```

プロジェクトディレクトリへ移動します。

```bash
cd MojiFix
```

## 7.3 依存関係のインストール

```bash
npm install
```

## 7.4 開発サーバーの起動

```bash
npm run dev
```

ブラウザで以下にアクセスします。

```text
http://localhost:3000
```

## 7.5 VS Codeの推奨拡張機能

- ESLint
- Prettier
- GitLens
- GitHub Pull Requests
- GitHub Copilot
- GitHub Copilot Chat

---

# 8. 開発・実行方法

## 8.1 主なnpmコマンド

| コマンド | 用途 |
|---|---|
| `npm install` | 依存関係のインストール |
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run lint` | ESLintによる検査 |
| `npx tsc --noEmit` | TypeScriptの型チェック |
| `npm test` | テスト実行（設定されている場合） |

実際に利用可能なコマンドは`package.json`を確認してください。

## 8.2 開発時の注意

実装後は、可能な範囲で以下を実行してください。

```bash
npx tsc --noEmit
npm run lint
npm run build
```

エラーが発生した場合は、原因を確認して修正してください。

---

# 9. チーム開発体制

本プロジェクトは3人で分担して開発します。

| 担当 | 役割 | 主な責務 |
|---|---|---|
| A | Frontend / UI | 画面・デザイン・表示 |
| B | Encoding Engine | 文字コード処理 |
| C | Application Logic / Integration | 変換サービス・状態管理・統合 |

## 9.1 A担当：Frontend / UI

主な作業：

- 画面レイアウト
- 入力欄
- 文字コード選択欄
- 変換ボタン
- 変換結果表示
- HEX表示
- コピー機能のUI
- レスポンシブ対応

主な担当ディレクトリ：

```text
src/app/
src/components/
```

A担当は、文字コード処理を独自に実装しません。

C担当のHookやサービスを利用して画面を構築します。

## 9.2 B担当：Encoding Engine

主な作業：

- エンコード処理
- デコード処理
- 文字コードレジストリ
- 対応文字コードの管理
- 文字コードライブラリの選定
- 単体テスト

主な担当ディレクトリ：

```text
src/lib/encoding/
src/constants/encodings.ts
src/types/encoding.ts
```

B担当は、文字コードのエンコード・デコード機能を提供します。

## 9.3 C担当：Application Logic / Integration

主な作業：

- 変換サービス
- HEX変換
- 入力検証
- React Hooks
- 状態管理
- A・B担当の実装統合
- 統合テスト

主な担当ディレクトリ：

```text
src/hooks/
src/services/
src/lib/utils/
src/types/converter.ts
```

C担当は、A担当とB担当の機能を接続する役割も担います。

---

# 10. GitHubでの開発ルール

## 10.1 ブランチ構成

以下のブランチ構成を基本とします。

```text
main
│
├── feature/frontend-ui
├── feature/encoding-engine
└── feature/app-logic
```

| ブランチ | 担当 |
|---|---|
| `main` | 統合済みの安定版 |
| `feature/frontend-ui` | A担当 |
| `feature/encoding-engine` | B担当 |
| `feature/app-logic` | C担当 |

各担当は原則として自分のブランチで作業します。

## 10.2 ブランチ作成

```bash
git switch main

git pull origin main

git switch -c feature/frontend-ui
```

担当に応じてブランチ名を変更してください。

## 10.3 コミット

変更内容が分かるコミットメッセージを付けてください。

例：

```bash
git add .

git commit -m "feat: add encoding selector"
```

推奨する接頭辞：

| 接頭辞 | 意味 |
|---|---|
| `feat:` | 新機能 |
| `fix:` | バグ修正 |
| `refactor:` | リファクタリング |
| `style:` | デザイン・書式変更 |
| `test:` | テスト追加・修正 |
| `docs:` | ドキュメント変更 |
| `chore:` | その他の作業 |

## 10.4 Push

```bash
git push -u origin feature/frontend-ui
```

## 10.5 Pull Request

実装が完了したら、GitHub上でPull Requestを作成します。

Pull Requestには以下を記載してください。

- 実装した内容
- 変更したファイル
- 動作確認結果
- 実行したテスト
- 未対応事項
- 他担当への影響

`main`への直接Pushは原則として避けてください。

## 10.6 コンフリクト対策

共通ファイルを変更する場合は、事前に他担当へ共有してください。

特に以下は複数担当に関係するため、変更時には注意してください。

```text
src/types/encoding.ts
src/types/converter.ts
src/constants/encodings.ts
```

---

# 11. GitHub Copilotの利用

本プロジェクトでは、GitHub Copilotを開発支援に利用します。

## 11.1 共通指示書

以下のファイルをリポジトリに配置します。

```text
.github/copilot-instructions.md
```

このファイルには、プロジェクト全体の仕様と実装ルールを記載します。

## 11.2 担当別指示書

各担当は、以下の指示書を参照してください。

| 担当 | 指示書 |
|---|---|
| A | `docs/copilot/A-frontend.md` |
| B | `docs/copilot/B-encoding-engine.md` |
| C | `docs/copilot/C-application-logic.md` |

担当別指示書は、全体指示書と併せてCopilotに読み込ませてください。

## 11.3 Copilotへの基本指示

実装を依頼する際は、以下を基本とします。

1. 最初に既存コードを確認させる。
2. 変更予定ファイルと実装方針を提示させる。
3. 担当範囲内で実装させる。
4. 他担当のファイルを勝手に変更させない。
5. 実装後に型チェック・テストを実行させる。
6. 変更内容と未対応事項を報告させる。

Copilotが仕様を独自解釈して変更しないよう、必ず全体仕様を参照させてください。

---

# 12. テスト

## 12.1 基本テスト

| 入力 | 変換元 | 変換先 | 期待する動作 |
|---|---|---|---|
| Hello | UTF-8 | UTF-8 | Hello |
| こんにちは | SHIFT_JIS | SHIFT_JIS | こんにちは |
| こんにちは | EUC-JP | EUC-JP | こんにちは |
| こんにちは | ISO-2022-JP | ISO-2022-JP | こんにちは |
| こんにちは | SHIFT_JIS | UTF-8 | 同じバイト列をUTF-8として解釈 |

※ 同一文字コードでの往復テストは、対象文字がその文字コードで表現できることが前提です。

## 12.2 確認事項

- 変換元で正しいバイト列が生成される。
- HEXがそのバイト列と一致する。
- 変換先デコーダーに同じバイト列が渡される。
- 不正なバイト列に対する処理が適切である。
- 変換元で表現できない文字に対する処理が適切である。
- UIと変換サービスが正しく接続されている。

## 12.3 ビルド確認

```bash
npx tsc --noEmit
npm run lint
npm run build
```

すべての検査が通ることを確認してください。

---

# 13. ビルド・デプロイ

## 13.1 静的エクスポート

Next.jsは静的エクスポートを利用します。

`next.config.ts`：

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
};

export default nextConfig;
```

ビルドが成功すると、通常は`out/`ディレクトリに静的ファイルが生成されます。

## 13.2 Vercelへのデプロイ

1. GitHubリポジトリをVercelに接続する。
2. Next.jsプロジェクトとして設定する。
3. 必要なビルド設定を確認する。
4. デプロイを実行する。
5. 公開URLで動作確認する。

## 13.3 デプロイ時の注意

- サーバー専用APIに依存しない。
- ブラウザ専用APIをサーバー側で実行しない。
- 外部ライブラリがブラウザで動作することを確認する。
- 本番ビルドをローカルでも確認する。

---

# 14. 開発上の注意事項

## 14.1 文字コード処理

MojiFixでは、通常の文字コード変換とバイト列の再解釈を区別してください。

変換元で生成したバイト列を変換先で再エンコードしてはいけません。

## 14.2 JavaScriptの文字列

JavaScriptの文字列はUnicode文字列として扱われます。

デコード処理の戻り値はJavaScriptの文字列であり、追加のUnicode変換は不要です。

ただし、デコードできないバイト列が存在する場合は、デコーダーの仕様に応じて置換文字やエラーが発生します。

## 14.3 HEXデータ

HEXはバイト列を16進数で表現したものです。

HEX自体は文字コードではありません。

## 14.4 ISO-2022-JP

ISO-2022-JPは状態を持つ文字コードです。

エスケープシーケンスを考慮し、原則としてバイト列全体を一度にデコードしてください。

## 14.5 拡張性

文字コードの追加によって、既存のUIや変換サービスを大幅に変更する必要がない構造を維持してください。

---

# 15. 今後の拡張予定

初期実装完了後、以下の機能を検討します。

- 対応文字コードの追加
- HEXデータからの直接入力
- HEXデータから文字列へのデコード
- 変換履歴
- 入力と出力の比較表示
- バイト列の詳細表示
- 文字ごとのバイト数表示
- 変換処理の詳細ログ
- 変換モードの追加

これらは初期実装の必須要件ではありません。

まずは、基本的な文字コード再解釈機能を正確に実装してください。

---

# 開発者向け最終確認

MojiFixの開発において、最も重要なのは以下の処理です。

```ts
const bytes = encodeText(input, sourceEncoding);

const hex = bytesToHex(bytes);

const output = decodeBytes(bytes, targetEncoding);
```

この処理を変更しないこと。

また、A・B・Cの各担当は、共通の型定義とインターフェースを維持しながら開発してください。

**仕様の正確性・担当間の連携・保守性・拡張性を重視し、安定して動作するMojiFixを完成させることを目標とします。**
