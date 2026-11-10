# MojiFix — System Design

## 1. 設計概要

### 1.1 基本方針

MojiFixはNext.js、React、TypeScriptを用いて構築する。

アプリケーションはブラウザ内で動作し、文字コード変換処理を含むすべての主要処理をクライアント側で実行する。

設計では以下を重視する。

- UIと処理ロジックの分離
- 文字コード処理の独立性
- 担当者間のインターフェース統一
- 将来的な文字コード追加への対応
- テスト容易性
- 静的エクスポートへの対応

---

## 2. 技術構成

| 技術 | 用途 |
|---|---|
| Next.js | Webアプリケーションの基盤 |
| React | UI構築 |
| TypeScript | 型安全な実装 |
| CSS | デザイン・レイアウト |
| Encoding Library | 日本語文字コードの処理 |
| GitHub | ソースコード管理・共同開発 |
| GitHub Copilot | コード生成・開発支援 |
| Vercel | 静的サイトの公開 |

### 2.1 Next.js

App Routerを利用する。

ただし、文字コード変換処理はブラウザ内で実行するため、サーバー機能に依存しない。

### 2.2 TypeScript

型定義を共有し、A・B・Cの間でデータの受け渡しを統一する。

### 2.3 Encoding Library

UTF-8、Shift_JIS、EUC-JP、ISO-2022-JPのエンコード・デコードに対応するブラウザ互換ライブラリを選定する。

ライブラリの具体的な選定と内部実装はBが担当する。

ライブラリ固有のAPIはEncoding Engine内部に閉じ込め、他の担当者には共通インターフェースを公開する。

---

## 3. アーキテクチャ

### 3.1 全体構成

MojiFixは3つの主要レイヤーで構成する。

1. Frontend / UI
2. Application Logic
3. Encoding Engine

```text
┌──────────────────────────────────────┐
│              Frontend                │
│                                      │
│  Input / Selector / Button / Output  │
│  HEX Viewer / Copy / Reset           │
└──────────────────┬───────────────────┘
                   │
                   v
┌──────────────────────────────────────┐
│          Application Logic           │
│                                      │
│  useConverter                        │
│  useClipboard                        │
│  converterService                    │
│  hex.ts                              │
│  validation.ts                       │
└──────────────────┬───────────────────┘
                   │
                   v
┌──────────────────────────────────────┐
│            Encoding Engine            │
│                                      │
│  encode()                            │
│  decode()                            │
│  Encoding Registry                   │
│  Browser Encoding Library            │
└──────────────────────────────────────┘
```

### 3.2 レイヤーごとの責務

#### Frontend / UI

ユーザーとのインターフェースを担当する。

- 入力値の表示・更新
- 文字コード選択
- 変換操作
- 結果表示
- HEX表示
- コピー操作
- リセット操作

文字コード変換の内部処理は行わない。

#### Application Logic

UIとEncoding Engineの間を仲介する。

- 入力検証
- 変換処理の実行
- HEX生成
- 結果の統一
- エラー管理
- React Hookによる状態管理

#### Encoding Engine

文字コードのエンコード・デコードを担当する。

- 文字列からバイト列への変換
- バイト列から文字列への変換
- 文字コードの登録・取得
- ライブラリの管理

UIやReactの状態管理には依存しない。

---

## 4. ディレクトリ設計

```text
MojiFix/
│
├── .github/
│   └── copilot-instructions.md
│
├── docs/
│   ├── specification.md
│   ├── design.md
│   ├── interfaces.md
│   └── copilot/
│       ├── A-frontend.md
│       ├── B-encoding-engine.md
│       └── C-application-logic.md
│
├── public/
│   └── favicon.ico
│
├── src/
│   │
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
│   ├── encoding/
│   ├── services/
│   └── utils/
│
├── README.md
├── package.json
├── tsconfig.json
└── next.config.ts
```

各ファイルの具体的なインターフェースは`interfaces.md`を参照する。

---

## 5. 文字コード処理設計

### 5.1 基本的な処理

文字コード処理はEncoding Engineに集約する。

外部からは以下の2つの操作を利用できるようにする。

```ts
encode(
  text: string,
  encoding: EncodingId
): Uint8Array;

decode(
  bytes: Uint8Array,
  encoding: EncodingId
): string;
```

### 5.2 エンコード

入力文字列を指定された文字コードでバイト列に変換する。

```ts
const bytes = encode(
  input,
  sourceEncoding
);
```

戻り値は`Uint8Array`とする。

### 5.3 デコード

バイト列を指定された文字コードで解釈する。

```ts
const output = decode(
  bytes,
  targetEncoding
);
```

同じバイト列をそのまま渡す。

### 5.4 文字コードライブラリの抽象化

ライブラリ固有の処理をアプリケーション全体に散らばらせない。

```text
Application Logic
       |
       v
Encoding Engine API
       |
       v
Browser Encoding Adapter
       |
       v
Encoding Library
```

ライブラリを変更する場合でも、Encoding Engineの外部インターフェースは維持できるようにする。

### 5.5 文字コードの追加

Encoding Registryによって文字コードを管理する。

```text
Encoding Registry
    |
    +-- UTF-8
    |
    +-- SHIFT_JIS
    |
    +-- EUC-JP
    |
    +-- ISO-2022-JP
```

新しい文字コードを追加する場合は、原則として以下の手順を取る。

1. 文字コードの実装を追加する。
2. EncodingDefinitionを作成する。
3. Registryに登録する。
4. エンコード・デコードのテストを追加する。

UI側に個別の文字コード実装を追加する必要がない構造とする。

---

## 6. Application Logic設計

### 6.1 Converter Service

配置先：

```text
src/services/converterService.ts
```

変換処理全体を統括する。

処理手順：

```text
ConvertRequest
      |
      v
入力検証
      |
      v
Encoding Engineでエンコード
      |
      v
Uint8Array
      |
      +------> HEX生成
      |
      v
Encoding Engineでデコード
      |
      v
ConvertResponse
```

### 6.2 HEX Utility

配置先：

```text
src/lib/utils/hex.ts
```

バイト列とHEX表記の変換を担当する。

HEX処理は文字コード処理から分離する。

### 6.3 Validation

配置先：

```text
src/lib/utils/validation.ts
```

入力値や文字コードIDを検証する。

### 6.4 useConverter

配置先：

```text
src/hooks/useConverter.ts
```

UIから変換機能を簡単に利用できるようにする。

管理する状態：

- 入力文字列
- 変換元文字コード
- 変換先文字コード
- 変換結果
- 変換中状態
- 使用可能な文字コード一覧

UIコンポーネントは基本的にこのHookを通じて変換処理を利用する。

### 6.5 useClipboard

配置先：

```text
src/hooks/useClipboard.ts
```

クリップボード操作を管理する。

コピー成功・失敗の状態をUIに提供する。

---

## 7. Frontend設計

### 7.1 Main Page

配置先：

```text
src/app/page.tsx
```

Main Pageは各UIコンポーネントとHookを組み合わせる役割を持つ。

複雑な変換処理をMain Pageに直接実装しない。

### 7.2 Component Design

#### Layout

- Header
- Footer

共通レイアウトを管理する。

#### Editor

- EditorPanel
- TextInput
- TextOutput

入力・出力欄を管理する。

#### Converter

- EncodingSelector
- ConvertButton
- HexViewer
- ConversionResult

文字コード選択や変換結果の表示を管理する。

#### UI

- Button
- Card

再利用可能な基本UIを管理する。

### 7.3 Props

コンポーネント間のデータ受け渡しはPropsを利用する。

Propsの詳細は`interfaces.md`に定義する。

### 7.4 State Management

初期リリースではReact Hooksによる状態管理を採用する。

大規模な状態管理ライブラリは導入しない。

---

## 8. データフロー設計

### 8.1 通常の変換

```text
ユーザー入力
     |
     v
useConverter
     |
     v
convertText()
     |
     v
encode()
     |
     v
Uint8Array
     |
     +------> bytesToHex()
     |              |
     |              v
     |          HEX文字列
     |
     v
decode()
     |
     v
変換結果
     |
     v
ConvertResponse
     |
     v
useConverterのresult
     |
     v
UI表示
```

### 8.2 エラー発生時

```text
変換処理
    |
    v
エラー発生
    |
    v
Converter Serviceで捕捉
    |
    v
ConversionErrorへ変換
    |
    v
ConvertResponse
    |
    v
Hookで状態更新
    |
    v
UIにエラー表示
```

### 8.3 部分的な結果の保持

エンコードに成功してデコードに失敗した場合など、すでに生成できたバイト列やHEX情報は保持する。

これにより、変換結果が得られなくても内部の処理結果を確認できる。

---

## 9. エラー処理設計

エラーは各レイヤーで適切に処理する。

| レイヤー | 処理 |
|---|---|
| Encoding Engine | 文字コード処理の失敗を例外などで通知 |
| Converter Service | 例外をConversionErrorに変換 |
| Hook | 結果を状態として保持 |
| Frontend | ユーザーに分かりやすく表示 |

### 9.1 エラーの分類

- 入力エラー
- 文字コード未対応
- エンコード失敗
- デコード失敗
- 内部エラー

### 9.2 警告の分類

- 文字の置換
- エンコード不能文字
- 情報損失の可能性

警告とエラーは区別する。

---

## 10. テスト設計

### 10.1 Encoding Engine

各文字コードのエンコード・デコードを独立してテストする。

確認項目：

- 正常な文字列
- 空文字列
- ASCII文字
- 日本語文字
- 対応範囲外の文字
- 不正なバイト列
- ISO-2022-JPの状態遷移

### 10.2 Converter Service

以下を確認する。

- 変換元文字コードによるエンコード
- HEXの正確性
- 変換先文字コードによるデコード
- エラー処理
- 警告処理
- 部分的な結果の保持

特に、エンコードしたバイト列とデコードに渡したバイト列が同一であることを確認する。

### 10.3 UI

以下を確認する。

- 入力
- 文字コード選択
- 変換操作
- HEX表示
- 出力表示
- コピー
- リセット
- エラー表示
- レスポンシブ表示

---

## 11. セキュリティ・プライバシー設計

### 11.1 ブラウザ内処理

変換処理はクライアント側で完結させる。

入力文字列をサーバーへ送信しない。

### 11.2 表示処理

変換結果は通常のテキストとして表示する。

ユーザー入力や変換結果をHTMLとして直接解釈させない。

### 11.3 データ保存

初期リリースでは入力内容や変換結果を永続保存しない。

---

## 12. デプロイ設計

### 12.1 Vercel

Vercelを利用して公開する。

Next.jsの静的エクスポートを使用する。

### 12.2 next.config.ts

基本設定：

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
};

export default nextConfig;
```

### 12.3 注意事項

- API Routesを使用しない。
- Route Handlersを変換処理に使用しない。
- Server Actionsを使用しない。
- ブラウザAPIはクライアント側で実行する。
- クライアント専用処理をServer Componentから直接実行しない。

---

## 13. 開発分担

| 担当 | 主なディレクトリ | 責務 |
|---|---|---|
| A | components / app | UI |
| B | lib/encoding / constants / types | Encoding Engine |
| C | hooks / services / lib/utils / types | Application Logic |

共通型定義は担当者間で事前に合意する。

### 13.1 Aの担当

- UIコンポーネント
- レイアウト
- 入力・出力
- 文字コード選択
- HEX表示
- コピー・リセット操作

### 13.2 Bの担当

- エンコード
- デコード
- Encoding Registry
- 文字コードライブラリ
- Encoding Engineのテスト

### 13.3 Cの担当

- Converter Service
- HEX Utility
- Validation
- useConverter
- useClipboard
- 統合

### 13.4 共有ルール

- 他担当のファイルを無断で大幅変更しない。
- 共通インターフェースを独自に変更しない。
- 変更が必要な場合は`interfaces.md`を先に更新する。
- 各担当の実装完了後に統合テストを行う。

---

## 14. 実装順序

推奨する開発順序：

1. 共通型定義の確定
2. Encoding Registryの実装
3. Encoding Engineの実装
4. HEX Utilityの実装
5. Converter Serviceの実装
6. useConverterの実装
7. useClipboardの実装
8. UIコンポーネントの実装
9. Main Pageへの統合
10. 統合テスト
11. Vercelへのデプロイ

Aは共通インターフェースが確定した段階で、UIの並行実装を開始してよい。

---

## 15. 今後の拡張

将来的に以下の拡張を想定する。

- 対応文字コードの追加
- HEX入力からのデコード
- バイト列の編集
- 変換履歴
- 複数文字コードの比較
- ファイル読み込み
- バイト列の詳細表示

初期設計ではこれらの機能を直接実装せず、追加しやすい構造を維持する。