# MojiFix Interfaces

## 1. 目的

本書では、A・B・Cの各担当が独立して開発するための共通インターフェースを定義する。

各担当は本書に定義された型・関数の仕様を守る。

インターフェースを変更する場合は、他の担当と合意した上で本書を更新する。

## 2. 共通ID

```ts
export type EncodingId = string;
export type PlatformId = string;

export type NormalizationForm =
  | "NFC"
  | "NFD"
  | "NFKC"
  | "NFKD";
```

文字コードIDは内部で統一した表記を使用する。

例：

```ts
"UTF-8"
"SHIFT_JIS"
"WINDOWS-31J"
"EUC-JP"
"ISO-2022-JP"
"UTF-16LE"
"UTF-16BE"
"MACINTOSH"
```

## 3. Encoding Engine

### 3.1 共通インターフェース

```ts
export interface EncodingEngine {
  readonly id: string;

  encode(
    text: string,
    encoding: EncodingId
  ): Uint8Array;

  decode(
    bytes: Uint8Array,
    encoding: EncodingId
  ): string;

  supports(
    encoding: EncodingId,
    operation: "encode" | "decode"
  ): boolean;
}
```

各ライブラリのアダプターはこのインターフェースを実装する。

### 3.2 EncodingDefinition

```ts
export interface EncodingDefinition {
  id: EncodingId;
  label: string;
  description: string;

  engineId: string;

  aliases: string[];

  capabilities: {
    encode: boolean;
    decode: boolean;
  };
}
```

同一文字コードに複数のエンジンを登録する必要がある場合は、登録情報を拡張し、エンジン選択を明示的に行う。

### 3.3 Registry

```ts
registerEncoding(
  definition: EncodingDefinition
): void;

getEncoding(
  id: EncodingId
): EncodingDefinition | undefined;

getAllEncodings(): EncodingDefinition[];
```

### 3.4 Resolver

```ts
resolveEncodingEngine(
  encoding: EncodingId,
  operation: "encode" | "decode"
): EncodingEngine;
```

未対応の場合は共通エラーを返す。

## 4. Converter

### 4.1 ConvertRequest

```ts
export interface ConvertRequest {
  input: string;
  sourceEncoding: EncodingId;
  targetEncoding: EncodingId;
}
```

### 4.2 ConversionError

```ts
export interface ConversionError {
  code: string;
  message: string;
  details?: unknown;
}
```

### 4.3 ConversionWarning

```ts
export interface ConversionWarning {
  code: string;
  message: string;
  details?: unknown;
}
```

### 4.4 ConvertResponse

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

### 4.5 converterService

```ts
convert(
  request: ConvertRequest
): ConvertResponse;
```

処理順序：

1. 入力・文字コードIDを検証する。
2. 変換元エンジンを解決する。
3. 入力文字列を変換元文字コードでエンコードする。
4. 生成されたバイト列を保持する。
5. HEXに変換する。
6. 変換先エンジンを解決する。
7. 同じバイト列を変換先文字コードでデコードする。
8. 結果を返す。

同期処理として実装できないライブラリを採用する場合は、Promiseを返す非同期APIへ変更し、A・B・Cで合意する。

## 5. Binary

### 5.1 HEX

```ts
bytesToHex(
  bytes: Uint8Array
): string;

hexToBytes(
  hex: string
): Uint8Array;
```

`hexToBytes` は不正な入力を受け取った場合にエラーを返す。

### 5.2 BOM

```ts
detectBOM(
  bytes: Uint8Array
): BOMInfo | null;
```

```ts
export interface BOMInfo {
  encoding: EncodingId;
  bytes: Uint8Array;
}
```

BOMの付与・除去関数も必要に応じて実装する。

### 5.3 改行コード

```ts
export type NewlineType =
  | "CRLF"
  | "LF"
  | "CR"
  | "NONE";

detectNewline(
  text: string
): NewlineType;
```

混在する改行コードを扱う場合は、単一の種類を返すだけでなく、出現数を返すAPIへ拡張する。

## 6. Unicode

### 6.1 正規化

```ts
normalizeText(
  text: string,
  form: NormalizationForm
): string;
```

### 6.2 コードポイント

```ts
export interface CodePointInfo {
  character: string;
  codePoint: number;
  codePointHex: string;
}

getCodePoints(
  text: string
): CodePointInfo[];
```

### 6.3 解析結果

```ts
export interface UnicodeAnalysis {
  original: string;
  normalized?: string;
  codePoints: CodePointInfo[];
}
```

異体字セレクタ・互換文字・サロゲート解析の詳細型は、各モジュールの実装時に追加する。

## 7. Platform

### 7.1 PlatformPreset

```ts
export interface PlatformPreset {
  id: PlatformId;
  label: string;
  description: string;

  encoding: EncodingId;

  newline: NewlineType;

  normalization?: NormalizationForm;
}
```

各値は代表的な設定例であり、OSの標準動作を保証するものではない。

### 7.2 CompatibilityResult

```ts
export interface CompatibilityResult {
  platform: PlatformId;

  supported: boolean;

  original: string;

  encodedBytes?: Uint8Array;

  decoded?: string;

  unchanged?: boolean;

  warnings: ConversionWarning[];
  errors: ConversionError[];
}
```

## 8. Hooks

### 8.1 useConverter

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
- 入力状態の管理
- 文字コード選択状態の管理
- 変換処理の呼び出し
- 変換結果の保持
- リセット

### 8.2 useAnalyzer

Unicode解析・互換性解析の結果と状態を管理する。

### 8.3 useClipboard

コピー処理を提供する。

## 9. UI Components

A担当は以下のコンポーネントを実装する。

| Component | 主な役割 |
|---|---|
| TextInput | 入力 |
| TextOutput | 出力 |
| EncodingSelector | 文字コード選択 |
| ConvertButton | 変換実行 |
| HexViewer | HEX表示 |
| ConversionResult | 結果表示 |
| CharacterInspector | 文字解析 |
| UnicodeInspector | Unicode情報 |
| CompatibilityReport | 互換性レポート |
| ByteInspector | バイト列解析 |

UIは文字コードライブラリを直接importしない。

## 10. インターフェース変更ルール

- 共通型を変更する場合は全担当に共有する。
- 引数や戻り値を変更する場合は関連テストも更新する。
- 文字コードIDは統一する。
- ライブラリ固有の型を他モジュールへ漏らさない。
- バイト列は `Uint8Array` を使用する。
- エラーは共通形式に変換する。

本書にないAPIを追加する場合は、関連する担当と合意する。
