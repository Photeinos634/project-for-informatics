# A担当 開発指示書
## GitHub Copilot向け：Frontend / UI

あなたはMojiFixプロジェクトのA担当です。

本担当では、Webアプリケーションの画面設計・UI実装を担当します。

文字コードのエンコード・デコード処理や変換アルゴリズムそのものは実装せず、C担当が提供するHookや変換サービスを利用して画面を構築してください。

---

# 1. 担当範囲

担当する機能：

- アプリケーション全体のレイアウト
- ヘッダー・フッター
- 入力テキストエリア
- 変換元文字コードセレクター
- 変換先文字コードセレクター
- 変換実行ボタン
- 変換結果表示
- HEX表示
- コピー機能のUI
- エラー・警告表示
- レスポンシブデザイン

担当外：

- 文字コードのエンコード処理
- 文字コードのデコード処理
- 文字コードレジストリの実装
- HEX変換アルゴリズム
- 変換サービスの実装
- 変換ロジックの状態管理

担当外の機能が必要な場合は、対応する担当者にインターフェースを確認してください。

# 2. 開発環境

- Next.js
- TypeScript
- React
- CSS Modulesまたは既存プロジェクトのCSS方式
- Vercel静的エクスポート

既存のプロジェクト設定を優先してください。

新しいUIライブラリやCSSフレームワークを勝手に導入しないでください。

# 3. 作成・編集するファイル

基本的に以下のファイルを担当します。

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
└── components/
    ├── layout/
    │   ├── Header.tsx
    │   └── Footer.tsx
    │
    ├── editor/
    │   ├── EditorPanel.tsx
    │   ├── TextInput.tsx
    │   └── TextOutput.tsx
    │
    ├── converter/
    │   ├── EncodingSelector.tsx
    │   ├── ConvertButton.tsx
    │   ├── HexViewer.tsx
    │   └── ConversionResult.tsx
    │
    └── ui/
        ├── Button.tsx
        └── Card.tsx
```

既存の構成と異なる場合は、既存構成を尊重しながら対応してください。

# 4. UI設計

## 4.1 基本画面

以下の要素を配置してください。

1. MojiFixのタイトル
2. 入力テキストエリア
3. 変換元文字コード選択欄
4. 変換先文字コード選択欄
5. 変換ボタン
6. 変換結果表示欄
7. HEX表示欄

基本的な画面構成は以下のとおりです。

```text
┌──────────────────────────────────────┐
│                MojiFix               │
│                                      │
│  変換前                              │
│  ┌────────────────────────────────┐  │
│  │                                │  │
│  │ 文字列を入力してください       │  │
│  │                                │  │
│  └────────────────────────────────┘  │
│                                      │
│  変換元            変換先            │
│  ┌──────────┐      ┌──────────┐      │
│  │ UTF-8    │  →   │ SHIFT_JIS│      │
│  └──────────┘      └──────────┘      │
│                                      │
│             [ 変換する ]             │
│                                      │
│  変換後                              │
│  ┌────────────────────────────────┐  │
│  │                                │  │
│  │ 変換結果                       │  │
│  │                                │  │
│  └────────────────────────────────┘  │
│                                      │
│  HEX                                 │
│  ┌────────────────────────────────┐  │
│  │ 82 B1 82 F1 ...                │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

## 4.2 デザイン方針

- シンプルで見やすいデザイン
- 文字コード変換ツールとしての実用性を優先
- 入力欄と出力欄を明確に区別
- HEXデータは等幅フォントで表示
- 長い文字列でもレイアウトが崩れない
- PC・タブレット・スマートフォンに対応
- 操作対象が分かりやすいボタンデザイン

過剰なアニメーションや装飾は避けてください。

# 5. コンポーネント仕様

## Header.tsx

アプリケーション名や簡単な説明を表示します。

## Footer.tsx

コピーライトや補足情報を表示します。

## TextInput.tsx

入力文字列を受け取ります。

Propsの例：

```ts
interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
}
```

## EncodingSelector.tsx

文字コードを選択するコンポーネントです。

Propsの例：

```ts
import type { EncodingDefinition } from "@/types/encoding";

interface EncodingSelectorProps {
  label: string;
  value: string;
  encodings: EncodingDefinition[];
  onChange: (value: string) => void;
}
```

**重要：文字コードの選択肢を直接ハードコードしてはいけません。**

C担当から渡される文字コード一覧を利用してください。

## ConvertButton.tsx

変換処理を実行するボタンです。

Propsの例：

```ts
interface ConvertButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}
```

## TextOutput.tsx

変換結果を表示します。

Propsの例：

```ts
interface TextOutputProps {
  value: string;
}
```

## HexViewer.tsx

HEXデータを表示します。

Propsの例：

```ts
interface HexViewerProps {
  value: string;
  onCopy?: () => void;
}
```

## ConversionResult.tsx

変換結果・HEX・エラー・警告などをまとめて表示します。

# 6. C担当との連携

C担当が提供する以下のHookを利用してください。

```ts
useConverter()
```

想定する使用方法：

```tsx
const {
  input,
  setInput,
  sourceEncoding,
  setSourceEncoding,
  targetEncoding,
  setTargetEncoding,
  result,
  isConverting,
  convert,
  encodings,
} = useConverter();
```

実際のAPIはC担当と合意したものを使用してください。

Hookの仕様が未確定の場合、独自にAPIを決めて実装を進めず、インターフェースを確認してください。

# 7. UI側の実装ルール

- 変換処理をコンポーネントに直接記述しない。
- HEX変換をコンポーネント内で行わない。
- 文字コードの一覧をハードコードしない。
- 入力値の状態管理はC担当のHookを利用する。
- 表示に必要なデータはPropsで受け取る。
- コンポーネントは可能な限り再利用可能にする。
- Server ComponentとClient Componentを適切に区別する。
- 状態やイベントを利用するコンポーネントには必要に応じて`"use client"`を付ける。

# 8. 担当外ファイルの変更禁止

原則として以下は変更しないでください。

```text
src/lib/encoding/
src/services/
src/hooks/
src/types/
src/constants/
```

型やHookの変更が必要な場合は、担当者と相談してください。

# 9. 完了条件

- [ ] 基本画面が表示される。
- [ ] 入力欄が動作する。
- [ ] 変換元を選択できる。
- [ ] 変換先を選択できる。
- [ ] 変換ボタンが動作する。
- [ ] 変換結果が表示される。
- [ ] HEXが表示される。
- [ ] コピー機能が動作する。
- [ ] エラー・警告が表示される。
- [ ] スマートフォンでも使用できる。
- [ ] C担当のHookと統合できる。
- [ ] TypeScriptの型エラーがない。

# 10. GitHub Copilotへの作業指示

まず既存プロジェクトを調査してください。

その後、本書の担当範囲に限定して実装を進めてください。

最初に作業計画と変更予定ファイルを提示し、問題がなければ実装してください。

C担当がまだ実装していない部分については、実際の変換処理を独自実装せず、合意済みのインターフェースに従って接続してください。

担当外のファイルを変更する必要がある場合は、変更前に理由と対象ファイルを報告してください。

実装後は、変更ファイル・実装内容・動作確認結果・未対応事項を報告してください。