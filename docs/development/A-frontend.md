# Development Guide: A担当（Frontend / UI）

## 1. 担当概要

A担当はMojiFixの画面設計・UIコンポーネント・ユーザー操作を担当する。

文字コード処理や変換アルゴリズムそのものは実装しない。

C担当が提供するHooksやサービス、B担当が提供する文字コード情報を利用して画面を構築する。

## 2. 担当ディレクトリ

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
    ├── analyzer/
    │   ├── CharacterInspector.tsx
    │   ├── UnicodeInspector.tsx
    │   ├── CompatibilityReport.tsx
    │   └── ByteInspector.tsx
    │
    └── ui/
        ├── Button.tsx
        ├── Card.tsx
        ├── Select.tsx
        └── Tabs.tsx
```

## 3. 実装範囲

### 3.1 共通レイアウト

- Header
- Footer
- ページ全体のレイアウト
- レスポンシブ対応

### 3.2 入力・出力

- TextInput
- TextOutput
- 入力文字数表示
- コピー操作
- エラー表示

### 3.3 変換UI

- EncodingSelector
- ConvertButton
- HexViewer
- ConversionResult

文字コードの選択肢は固定配列でハードコードせず、HookやRegistryから取得する。

### 3.4 解析UI

- CharacterInspector
- UnicodeInspector
- CompatibilityReport
- ByteInspector

解析ロジックはC担当が提供するHook・サービスを利用する。

## 4. 使用するインターフェース

基本的に `useConverter()` を使用する。

```ts
const {
  input,
  setInput,
  sourceEncoding,
  setSourceEncoding,
  targetEncoding,
  setTargetEncoding,
  result,
  isConverting,
  encodings,
  convert,
  reset,
} = useConverter();
```

A担当はこのAPIを前提にUIを実装する。

## 5. 実装ルール

1. 文字コードライブラリを直接importしない。
2. 変換処理をコンポーネント内に直接実装しない。
3. 文字コードの選択肢をハードコードしない。
4. 共通型は `src/types/` を参照する。
5. UIの状態管理はHookを使用する。
6. コンポーネントは可能な限り小さく分割する。
7. エラー・警告・処理中状態を適切に表示する。
8. PC・タブレット・スマートフォンに対応する。

## 6. UI設計上の注意

MojiFixは技術的な解析ツールであるため、変換結果だけでなく、その根拠となる情報を分かりやすく表示する。

特に以下を区別する。

- 入力文字列
- 生成されたバイト列
- HEX表示
- デコード結果
- エラー
- 警告

HEX表示は文字列として再処理せず、受け取ったバイト列の表示に徹する。

## 7. 開発時の確認

- 入力欄が正しく動作するか。
- 文字コードを選択できるか。
- 変換ボタンが正しくHookを呼び出すか。
- HEX表示が正しいか。
- 変換結果が表示されるか。
- エラー・警告が表示されるか。
- コピー・リセットが動作するか。
- スマートフォンでも操作できるか。

## 8. 担当外の変更

文字コード処理、Unicode解析、共通インターフェースを変更する場合は、B・C担当と相談する。
