# MojiFix — Shared Interfaces

このドキュメントは、MojiFixの開発においてA・B・Cの各担当者が共有する型定義、関数仕様、Hook仕様、コンポーネント間のインターフェースを定義する。

各担当者は、このドキュメントに定義されたインターフェースに従って実装すること。

インターフェースの変更が必要な場合は、他の担当者への影響を確認したうえで本ドキュメントを更新する。

---

# 1. Overview

## 1.1 Responsibility

| 担当 | 責務 |
|---|---|
| A：Frontend / UI | UIの実装・表示・ユーザー操作 |
| B：Encoding Engine | 文字列とバイト列のエンコード・デコード |
| C：Application Logic | 変換処理の統合・状態管理・ユーティリティ |

## 1.2 Data Flow

```text
[ A：Frontend / UI ]
          |
          | input / encoding settings
          v
[ C：Converter Service ]
          |
          | encode()
          v
[ B：Encoding Engine ]
          |
          | Uint8Array
          v
[ C：Converter Service ]
          |
          +------> HEX生成
          |
          | decode()
          v
[ B：Encoding Engine ]
          |
          | string
          v
[ C：Converter Service ]
          |
          | ConvertResponse
          v
[ A：Frontend / UI ]
          |
          v
[ Result / HEX / Error Display ]
```

重要：変換元で生成したバイト列を、変換先の文字コードで直接デコードする。

---

# 2. Shared Types

共通型は原則として以下に配置する。

```text
src/types/
├── encoding.ts
└── converter.ts
```

## 2.1 EncodingId

```ts
export type EncodingId = string;
```

文字コードを識別するためのID。

初期対応するID：

```ts
export const ENCODING_IDS = {
  UTF8: "UTF-8",
  SHIFT_JIS: "SHIFT_JIS",
  EUC_JP: "EUC-JP",
  ISO_2022_JP: "ISO-2022-JP",
} as const;
```

IDは内部処理で使用する識別子であり、画面上の表示名とは分離する。

## 2.2 EncodingDefinition

```ts
import type { EncodingId } from "./encoding";

export interface EncodingDefinition {
  id: EncodingId;
  label: string;
  description: string;

  capabilities: {
    encode: boolean;
    decode: boolean;
  };
}
```

各文字コードの定義を表す。

| Property | Type | Description |
|---|---|---|
| id | EncodingId | 内部識別子 |
| label | string | UI表示名 |
| description | string | 説明 |
| capabilities.encode | boolean | エンコード対応 |
| capabilities.decode | boolean | デコード対応 |

## 2.3 EncodingEngine

```ts
import type { EncodingId } from "./encoding";

export interface EncodingEngine {
  encode(
    text: string,
    encoding: EncodingId
  ): Uint8Array;

  decode(
    bytes: Uint8Array,
    encoding: EncodingId
  ): string;
}
```

Bが実装する文字コード処理の共通インターフェース。

### encode

入力されたJavaScript文字列を指定された文字コードのバイト列に変換する。

```ts
const bytes = encodingEngine.encode(
  "こんにちは",
  "SHIFT_JIS"
);
```

戻り値は`Uint8Array`とする。

### decode

指定された文字コードとしてバイト列を解釈する。

```ts
const result = encodingEngine.decode(
  bytes,
  "UTF-8"
);
```

戻り値はJavaScript文字列とする。

---

# 3. Encoding Registry

配置先：

```text
src/lib/encoding/encodingRegistry.ts
```

文字コードの定義を管理する。

## 3.1 Required Functions

```ts
registerEncoding(
  encoding: EncodingDefinition
): void;
```

文字コードを登録する。

```ts
getEncoding(
  id: EncodingId
): EncodingDefinition | undefined;
```

IDから文字コードの定義を取得する。

```ts
getAllEncodings(): EncodingDefinition[];
```

登録されている文字コードの一覧を取得する。

```ts
isEncodingSupported(
  id: EncodingId
): boolean;
```

指定した文字コードが登録されているか確認する。

## 3.2 Initial Registry

初期状態では以下を登録する。

```ts
[
  {
    id: "UTF-8",
    label: "UTF-8",
    description: "Unicodeの可変長文字コード",
    capabilities: {
      encode: true,
      decode: true,
    },
  },
  {
    id: "SHIFT_JIS",
    label: "Shift_JIS",
    description: "日本語環境で広く利用されてきた文字コード",
    capabilities: {
      encode: true,
      decode: true,
    },
  },
  {
    id: "EUC-JP",
    label: "EUC-JP",
    description: "日本語UNIX環境などで利用されてきた文字コード",
    capabilities: {
      encode: true,
      decode: true,
    },
  },
  {
    id: "ISO-2022-JP",
    label: "ISO-2022-JP（JIS）",
    description: "エスケープシーケンスで文字集合を切り替える文字コード",
    capabilities: {
      encode: true,
      decode: true,
    },
  },
]
```

実際にエンコード・デコードできるかどうかは、使用するライブラリの対応状況に基づいて設定する。

---

# 4. Converter Types

配置先：

```text
src/types/converter.ts
```

## 4.1 ConvertRequest

```ts
import type { EncodingId } from "./encoding";

export interface ConvertRequest {
  input: string;
  sourceEncoding: EncodingId;
  targetEncoding: EncodingId;
}
```

変換処理に必要な情報。

| Property | Type | Description |
|---|---|---|
| input | string | 入力文字列 |
| sourceEncoding | EncodingId | 変換元文字コード |
| targetEncoding | EncodingId | 変換先文字コード |

## 4.2 ConversionError

```ts
export interface ConversionError {
  code: string;
  message: string;
}
```

変換処理で発生したエラーを表す。

想定するエラーコード：

| Code | Description |
|---|---|
| EMPTY_INPUT | 入力が空 |
| UNSUPPORTED_ENCODING | 未対応の文字コード |
| ENCODE_FAILED | エンコード失敗 |
| DECODE_FAILED | デコード失敗 |
| INVALID_REQUEST | リクエストが不正 |
| INTERNAL_ERROR | 予期しない内部エラー |

必要に応じて追加してよい。

## 4.3 ConversionWarning

```ts
export interface ConversionWarning {
  code: string;
  message: string;
}
```

変換は実行できるものの、ユーザーに注意を促す必要がある場合に使用する。

想定する警告コード：

| Code | Description |
|---|---|
| UNMAPPABLE_CHARACTER | 変換元文字コードで表現できない文字がある |
| REPLACEMENT_CHARACTER | デコード結果に置換文字が含まれる |
| POSSIBLE_DATA_LOSS | 情報が失われた可能性がある |

## 4.4 ConvertResponse

```ts
import type { ConversionError, ConversionWarning } from "./converter";

export interface ConvertResponse {
  success: boolean;

  output: string | null;

  sourceBytes: Uint8Array | null;

  hex: string | null;

  errors: ConversionError[];

  warnings: ConversionWarning[];
}
```

変換処理の結果を表す。

| Property | Type | Description |
|---|---|---|
| success | boolean | 成功したか |
| output | string \| null | 変換結果 |
| sourceBytes | Uint8Array \| null | 生成したバイト列 |
| hex | string \| null | HEX表記 |
| errors | ConversionError[] | エラー一覧 |
| warnings | ConversionWarning[] | 警告一覧 |

### 成功時の例

```ts
{
  success: true,
  output: "変換結果",
  sourceBytes: new Uint8Array([0x82, 0xB1]),
  hex: "82 B1",
  errors: [],
  warnings: []
}
```

### 失敗時の例

```ts
{
  success: false,
  output: null,
  sourceBytes: null,
  hex: null,
  errors: [
    {
      code: "ENCODE_FAILED",
      message: "指定された文字コードでエンコードできませんでした。"
    }
  ],
  warnings: []
}
```

### 部分的な結果について

エンコード後にデコードで失敗した場合など、途中まで生成できた情報を保持してよい。

例えば、`sourceBytes`と`hex`は取得できているが、`output`の生成に失敗した場合は、取得済みの情報をnullに戻さず保持する。

---

# 5. Encoding Engine API

配置先：

```text
src/lib/encoding/
├── encodingEngine.ts
├── browserEncodingEngine.ts
└── encodingRegistry.ts
```

## 5.1 Public API

Bは以下の関数を外部に公開する。

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

Cは原則としてこの2つの関数を利用する。

## 5.2 Error Handling

以下の場合は適切なエラーを発生させる。

- 未登録の文字コードが指定された場合
- 指定された文字コードがエンコードに対応していない場合
- 指定された文字コードがデコードに対応していない場合
- ライブラリ内部で処理に失敗した場合

例：

```ts
throw new Error("Unsupported encoding: " + encoding);
```

エラーの具体的な形式はBの内部実装に任せるが、Cが適切に捕捉できるようにする。

## 5.3 Encoding Requirements

- 入力文字列を指定された文字コードでエンコードする。
- バイト列を指定された文字コードでデコードする。
- 文字コード間の通常のトランスコードを行わない。
- ISO-2022-JPはバイト列全体を一度に処理する。
- エンコード不能文字の扱いを明確にする。
- 不正なバイト列に対するデコードの挙動を明確にする。

---

# 6. Converter Service API

配置先：

```text
src/services/converterService.ts
```

Cが実装する。

## 6.1 convertText

```ts
export function convertText(
  request: ConvertRequest
): ConvertResponse;
```

入力文字列を指定された文字コードでエンコードし、そのバイト列を変換先文字コードでデコードする。

### 処理手順

```ts
const bytes = encode(
  request.input,
  request.sourceEncoding
);

const hex = bytesToHex(bytes);

const output = decode(
  bytes,
  request.targetEncoding
);
```

### 実装例

```ts
export function convertText(
  request: ConvertRequest
): ConvertResponse {
  let sourceBytes: Uint8Array | null = null;
  let hex: string | null = null;

  try {
    if (!request.input) {
      return {
        success: false,
        output: null,
        sourceBytes: null,
        hex: null,
        errors: [
          {
            code: "EMPTY_INPUT",
            message: "文字列を入力してください。",
          },
        ],
        warnings: [],
      };
    }

    sourceBytes = encode(
      request.input,
      request.sourceEncoding
    );

    hex = bytesToHex(sourceBytes);

    const output = decode(
      sourceBytes,
      request.targetEncoding
    );

    return {
      success: true,
      output,
      sourceBytes,
      hex,
      errors: [],
      warnings: [],
    };
  } catch (error) {
    return {
      success: false,
      output: null,
      sourceBytes,
      hex,
      errors: [
        {
          code: "CONVERSION_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "変換中に予期しないエラーが発生しました。",
        },
      ],
      warnings: [],
    };
  }
}
```

上記は基本形であり、実際の実装ではエンコード失敗とデコード失敗を区別すること。

また、`UNMAPPABLE_CHARACTER`などの警告を返す場合は、Encoding Engineから情報を取得できる設計にする。

---

# 7. Utility Functions

配置先：

```text
src/lib/utils/hex.ts
src/lib/utils/validation.ts
```

## 7.1 bytesToHex

```ts
export function bytesToHex(
  bytes: Uint8Array
): string;
```

バイト列をHEX形式の文字列に変換する。

例：

```ts
const bytes = new Uint8Array([
  0x82,
  0xB1,
  0x82,
  0xF1,
]);

bytesToHex(bytes);

// "82 B1 82 F1"
```

仕様：

- 16進数は大文字で表示する。
- 1バイトにつき2桁で表示する。
- バイト間は半角スペースで区切る。
- 空のバイト列は空文字列を返す。

## 7.2 hexToBytes

```ts
export function hexToBytes(
  hex: string
): Uint8Array;
```

HEX文字列をバイト列に変換する。

初期UIで直接使用しない場合でも、将来の機能拡張に備えて実装を検討してよい。

## 7.3 Validation

```ts
export function validateConvertRequest(
  request: ConvertRequest
): ConversionError[];
```

変換リクエストの入力値を検証する。

確認項目：

- 入力が空か
- 文字コードIDが登録されているか
- 必須項目が存在するか

---

# 8. React Hooks API

配置先：

```text
src/hooks/
├── useConverter.ts
└── useClipboard.ts
```

Cが実装する。

## 8.1 useConverter

UIから変換機能を利用するためのHook。

### Public API

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

### Return Type

```ts
export interface UseConverterReturn {
  input: string;
  setInput: (value: string) => void;

  sourceEncoding: EncodingId;
  setSourceEncoding: (value: EncodingId) => void;

  targetEncoding: EncodingId;
  setTargetEncoding: (value: EncodingId) => void;

  result: ConvertResponse | null;

  isConverting: boolean;

  encodings: EncodingDefinition[];

  convert: () => void;
  reset: () => void;
}
```

### Responsibilities

| Property / Function | Description |
|---|---|
| input | 入力文字列 |
| setInput | 入力文字列の更新 |
| sourceEncoding | 変換元文字コード |
| setSourceEncoding | 変換元の変更 |
| targetEncoding | 変換先文字コード |
| setTargetEncoding | 変換先の変更 |
| result | 変換結果 |
| isConverting | 変換中かどうか |
| encodings | 選択可能な文字コード一覧 |
| convert | 変換実行 |
| reset | 初期状態に戻す |

### 初期値

```ts
input = "";

sourceEncoding = "UTF-8";

targetEncoding = "SHIFT_JIS";

result = null;

isConverting = false;
```

初期値は変更可能だが、AとCで認識を統一すること。

### Important

- Hook内部でConverter Serviceを呼び出す。
- UI側に文字コード処理を実装させない。
- 変換結果は`ConvertResponse`として保持する。
- 入力や文字コードの変更時に、必要に応じて古い結果をクリアする。
- 変換処理が同期処理である場合、`isConverting`の扱いは実装に応じて調整する。

## 8.2 useClipboard

クリップボード操作をまとめるHook。

### Public API

```ts
const {
  copy,
  copied,
  error,
} = useClipboard();
```

### Return Type

```ts
export interface UseClipboardReturn {
  copy: (text: string) => Promise<boolean>;
  copied: boolean;
  error: string | null;
}
```

### Responsibilities

- Clipboard APIを利用してテキストをコピーする。
- コピー成功・失敗を管理する。
- UIにコピー結果を通知する。
- ブラウザ環境でのみ実行する。

---

# 9. Frontend Component Interfaces

Aが実装するUIコンポーネントのPropsを定義する。

コンポーネントはHookから受け取った値を表示し、必要なユーザー操作を親コンポーネントへ通知する。

## 9.1 TextInput

配置先：

```text
src/components/editor/TextInput.tsx
```

```ts
export interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}
```

入力文字列を管理するコンポーネント。

## 9.2 TextOutput

配置先：

```text
src/components/editor/TextOutput.tsx
```

```ts
export interface TextOutputProps {
  value: string;
  placeholder?: string;
  readOnly?: boolean;
}
```

変換結果を表示するコンポーネント。

## 9.3 EncodingSelector

配置先：

```text
src/components/converter/EncodingSelector.tsx
```

```ts
export interface EncodingSelectorProps {
  label: string;

  value: EncodingId;

  encodings: EncodingDefinition[];

  onChange: (value: EncodingId) => void;

  disabled?: boolean;
}
```

文字コードを選択するコンポーネント。

注意：

- 文字コード一覧をコンポーネント内部にハードコードしない。
- `encodings` Propsから選択肢を生成する。
- Registryに登録された文字コードを表示する。

## 9.4 ConvertButton

配置先：

```text
src/components/converter/ConvertButton.tsx
```

```ts
export interface ConvertButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}
```

変換処理を開始するボタン。

## 9.5 HexViewer

配置先：

```text
src/components/converter/HexViewer.tsx
```

```ts
export interface HexViewerProps {
  value: string;
  onCopy?: () => void;
}
```

生成されたバイト列のHEX表記を表示する。

## 9.6 ConversionResult

配置先：

```text
src/components/converter/ConversionResult.tsx
```

```ts
export interface ConversionResultProps {
  result: ConvertResponse | null;
}
```

変換結果、エラー、警告を表示する。

---

# 10. Main Page Integration

配置先：

```text
src/app/page.tsx
```

Aが画面を構築し、CのHookを利用する。

### Integration Example

```tsx
"use client";

import { useConverter } from "@/hooks/useConverter";

export default function Home() {
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

  return (
    <main>
      {/* 入力欄 */}

      {/* 変換元・変換先の選択 */}

      {/* 変換ボタン */}

      {/* HEX表示 */}

      {/* 変換結果 */}

      {/* リセットボタン */}
    </main>
  );
}
```

これは接続方法の例であり、実際のUIデザインはAが担当する。

---

# 11. Error Handling Policy

エラーは可能な限り以下の段階で処理する。

| Layer | Responsibility |
|---|---|
| Encoding Engine | 文字コード処理に関するエラー |
| Converter Service | エラーの分類・レスポンス化 |
| Hook | UIに渡す状態の管理 |
| Frontend | ユーザーへのエラー表示 |

UI側で文字コード処理の例外を直接処理しない。

## 11.1 Error Response Example

```ts
{
  success: false,
  output: null,
  sourceBytes: null,
  hex: null,
  errors: [
    {
      code: "UNSUPPORTED_ENCODING",
      message: "指定された文字コードには対応していません。"
    }
  ],
  warnings: []
}
```

## 11.2 Warning Response Example

```ts
{
  success: true,
  output: "変換結果",
  sourceBytes: new Uint8Array([0x82, 0xA0]),
  hex: "82 A0",
  errors: [],
  warnings: [
    {
      code: "REPLACEMENT_CHARACTER",
      message: "変換結果に置換文字が含まれている可能性があります。"
    }
  ]
}
```

---

# 12. Testing Interfaces

各担当者は、自分の担当範囲についてテストを作成する。

## A：Frontend

確認項目：

- Propsが正しく受け渡される。
- 入力値が更新される。
- 文字コード選択が動作する。
- 変換ボタンが正しくHookの関数を呼び出す。
- 結果とエラーが正しく表示される。
- コピー操作が動作する。

## B：Encoding Engine

確認項目：

- 各文字コードで正しくエンコードできる。
- 各文字コードで正しくデコードできる。
- バイト列が期待どおり生成される。
- 不正な入力に対して適切に処理する。
- 対応していない文字コードを指定した場合にエラーとなる。

## C：Application Logic

確認項目：

- ConvertRequestを正しく処理する。
- HEXが実際のバイト列と一致する。
- 同じバイト列を変換先の文字コードでデコードしている。
- エラーがConvertResponseに変換される。
- Hookの状態が正しく更新される。

---

# 13. Change Management

このドキュメントに定義されたインターフェースを変更する場合は、以下の手順に従う。

1. 変更の必要性を確認する。
2. 影響を受ける担当者を確認する。
3. 本ドキュメントを更新する。
4. 関連する型定義を更新する。
5. 各担当者の実装を更新する。
6. 統合テストを実施する。

特に以下の変更は、事前に担当者間で合意する。

- EncodingIdの変更
- EncodingEngineの関数仕様変更
- ConvertResponseの変更
- useConverterの戻り値変更
- UIコンポーネントのProps変更

---

# 14. Implementation Priority

推奨する実装順序は以下のとおり。

| Step | Task | Main |
|---|---|---|
| 1 | 共通型定義の確定 | 全員 |
| 2 | Encoding Registry | B |
| 3 | Encoding Engine | B |
| 4 | HEX Utility | C |
| 5 | Converter Service | C |
| 6 | useConverter / useClipboard | C |
| 7 | UI Components | A |
| 8 | Main Page Integration | A・C |
| 9 | 統合テスト | 全員 |
| 10 | ビルド・デプロイ確認 | 全員 |

Aは共通インターフェースが確定した段階でUIを並行実装してよい。

---

# 15. Important Notes

- このドキュメントはA・B・Cの共通契約である。
- 担当者ごとの独自解釈で関数名や型を変更しない。
- UIから文字コード処理を直接呼び出さない。
- Converter ServiceからEncoding Engineを利用する。
- HEXはEncoding Engineではなく、Application Logic側のUtilityとして実装する。
- 変換元で生成したバイト列を、そのまま変換先でデコードする。
- 文字コードライブラリの具体的なAPIはBが選定し、外部には本ドキュメントのAPIを公開する。
- 仕様と実装に矛盾がある場合は、独断で修正せず担当者間で確認する。