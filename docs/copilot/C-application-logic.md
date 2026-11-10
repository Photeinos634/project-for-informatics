# Development Guide: C担当（Application Logic / Integration）

## 1. 担当概要

C担当はMojiFixのアプリケーションロジックと各担当の実装統合を担当する。

主な責任：

- 文字コード変換処理の統括
- HEX処理
- 入力検証
- エラー処理
- React Hooks
- Unicode・互換性解析サービスとの統合
- A・B担当の実装統合

## 2. 担当ディレクトリ

```text
src/
├── hooks/
│   ├── useConverter.ts
│   ├── useAnalyzer.ts
│   └── useClipboard.ts
│
├── services/
│   ├── converterService.ts
│   ├── analyzerService.ts
│   └── compatibilityService.ts
│
├── lib/
│   ├── binary/
│   │   ├── hex.ts
│   │   ├── bom.ts
│   │   ├── newline.ts
│   │   └── byteUtils.ts
│   │
│   ├── platform/
│   │   ├── presets.ts
│   │   ├── compatibilityCheck.ts
│   │   ├── characterMapping.ts
│   │   └── platformMetadata.ts
│   │
│   └── utils/
│       ├── validation.ts
│       └── errorHandler.ts
│
└── types/
    ├── converter.ts
    ├── analyzer.ts
    └── platform.ts
```

## 3. Converter Service

### 3.1 基本処理

MojiFixの中心となる変換処理を実装する。

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

重要：

- 変換元でエンコードしたバイト列を保持する。
- 同じバイト列を変換先でデコードする。
- 途中で変換元デコードを挟まない。
- HEXは同じバイト列から生成する。

### 3.2 ConvertRequest

```ts
export interface ConvertRequest {
  input: string;
  sourceEncoding: EncodingId;
  targetEncoding: EncodingId;
}
```

### 3.3 ConvertResponse

```ts
export interface ConvertResponse {
  success: boolean;
  output: string | null;
  sourceBytes: Uint8Array | null;
  hex: string | null;
  errors: ConversionError[];
  warnings: ConversionWarning[];
}
```

失敗時には、部分的な結果を成功扱いで表示しない。

## 4. Binary

### hex.ts

以下を実装する。

- bytesToHex
- hexToBytes

### bom.ts

以下を実装する。

- BOM検出
- BOM付与
- BOM除去

元のバイト列を破壊せず、新しいバイト列を返す設計を推奨する。

### newline.ts

改行コードを検出・変換する。

文字列に対する処理と、バイト列に対する処理を区別する。

### byteUtils.ts

バイト列の比較・結合・コピーなどを実装する。

## 5. Platform

### presets.ts

Windows・macOS・iOSなどの比較用プリセットを定義する。

各プリセットの設定は固定的なOS仕様ではなく、代表的な構成例として扱う。

### compatibilityCheck.ts

指定した文字列を各設定でエンコード・デコードし、結果を比較する。

### characterMapping.ts

変換前後の文字の対応関係を解析する。

### platformMetadata.ts

環境ごとの設定・説明を管理する。

## 6. Hooks

### useConverter.ts

以下の状態を管理する。

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

役割：

- 入力状態
- 変換元・変換先文字コード
- 変換結果
- 変換中状態
- 変換処理の実行
- リセット

### useAnalyzer.ts

Unicode解析・互換性解析の状態と結果を管理する。

### useClipboard.ts

コピー処理を提供する。

## 7. 入力検証・エラー処理

入力・文字コード・HEXなどを検証する。

エラーは共通型に変換する。

エンコード不能文字や未対応文字コードを無視して成功扱いにしてはならない。

## 8. 統合

C担当はA・B担当の実装を統合する。

統合時には以下を確認する。

- UIからHookが正しく呼び出される。
- HookからServiceが呼び出される。
- ServiceからResolverが呼び出される。
- 文字コードエンジンが正しく選択される。
- バイト列が `Uint8Array` で統一されている。
- HEXとデコード結果が同一バイト列に基づいている。
- エラーがUIまで正しく伝わる。

## 9. テスト

### Converter
- 正常な変換
- 変換元と変換先が同じ場合
- 変換元と変換先が異なる場合
- 空入力
- エンコード不能文字
- 未対応文字コード

### Binary
- HEX変換
- HEX逆変換
- 不正なHEX
- BOM検出
- 改行コード検出

### Platform
- 各プリセットの比較
- エンコード不能文字
- 変換前後の差異
- 正規化形式の違い

## 10. 完了条件

- Converter Serviceが動作する。
- Hooksが動作する。
- HEX処理が正確である。
- エラーが適切に処理される。
- A・B担当の実装と統合できている。
- テストが用意されている。

## 11. 開発上の注意

B担当の文字コード処理を独自に再実装しない。

A担当のUIに変換処理を直接実装させない。

共通インターフェースの変更は、必ず関係者間で共有する。
