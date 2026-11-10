# C担当 開発指示書
## GitHub Copilot向け：Application Logic / Integration

あなたはMojiFixプロジェクトのC担当です。

本担当では、B担当が実装する文字コードエンジンと、A担当が実装するUIを接続するアプリケーションロジックを担当します。

MojiFixの変換処理の中心となるサービス、HEX変換、状態管理、エラー処理を実装してください。

---

# 1. 担当範囲

担当する機能：

- 変換サービス
- 変換リクエスト・レスポンス型
- HEX変換ユーティリティ
- 入力検証
- React Hooks
- 変換処理の状態管理
- A担当・B担当との統合
- 統合テスト

担当外：

- 画面のデザイン
- UIコンポーネントの実装
- 文字コードライブラリの選定
- 文字コードエンジンの内部実装
- 文字コードレジストリの内部実装

# 2. 最重要仕様

MojiFixは通常の文字コード変換を行うアプリケーションではありません。

変換元の文字コードで生成したバイト列を、変換先の文字コードで直接デコードするアプリケーションです。

例えば、

| 項目 | 値 |
|---|---|
| 入力 | こんにちは |
| 変換元 | SHIFT_JIS |
| 変換先 | UTF-8 |

の場合、以下の処理を実施します。

```text
入力文字列
    ↓
SHIFT_JISでエンコード
    ↓
バイト列
    ├── HEX表示
    │
    └── UTF-8でデコード
             ↓
          変換結果
```

**HEXと変換後の文字列は、同一のバイト列を元に生成してください。**

この仕様を絶対に変更しないでください。

# 3. 作成・編集するファイル

基本的に以下を担当します。

```text
src/
├── hooks/
│   ├── useConverter.ts
│   └── useClipboard.ts
│
├── services/
│   └── converterService.ts
│
├── lib/
│   └── utils/
│       ├── hex.ts
│       └── validation.ts
│
└── types/
    └── converter.ts
```

必要に応じてテストファイルを追加してください。

# 4. B担当とのインターフェース

B担当が提供する以下の機能を利用します。

```ts
interface EncodingEngine {
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

文字コードの一覧はレジストリから取得してください。

想定API：

```ts
getAllEncodings();

getEncoding(id);
```

B担当の実装と関数名・引数が異なる場合は、統合前に確認してください。

独自の文字コード処理を実装してはいけません。

# 5. 型定義

## 5.1 ConvertRequest

```ts
export interface ConvertRequest {
  input: string;
  sourceEncoding: EncodingId;
  targetEncoding: EncodingId;
}
```

## 5.2 ConversionError

```ts
export interface ConversionError {
  code: string;
  message: string;
}
```

## 5.3 ConversionWarning

```ts
export interface ConversionWarning {
  code: string;
  message: string;
}
```

## 5.4 ConvertResponse

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

`sourceBytes`は変換元の文字コードで生成したバイト列です。

`output`は、その同じバイト列を変換先の文字コードでデコードした結果です。

# 6. HEX変換ユーティリティ

以下の関数を実装してください。

```ts
bytesToHex(bytes: Uint8Array): string
```

実装例：

```ts
export function bytesToHex(
  bytes: Uint8Array
): string {
  return Array.from(bytes)
    .map(byte =>
      byte.toString(16).padStart(2, "0").toUpperCase()
    )
    .join(" ");
}
```

表示形式は以下のようにしてください。

```text
82 B1 82 F1 82 C9 82 BF 82 CD
```

HEXは必ず変換元のバイト列から生成してください。

必要に応じて、将来的な機能拡張用に`hexToBytes`を追加しても構いませんが、初期実装では必須ではありません。

# 7. 変換サービス

以下の関数を実装してください。

```ts
convertText(
  request: ConvertRequest
): ConvertResponse
```

## 7.1 必須処理

処理順序は以下のとおりです。

1. リクエストの検証
2. 変換元文字コードの確認
3. 変換先文字コードの確認
4. 変換元文字コードでエンコード
5. バイト列をHEXに変換
6. 同じバイト列を変換先文字コードでデコード
7. 結果を返す

## 7.2 実装イメージ

```ts
export function convertText(
  request: ConvertRequest
): ConvertResponse {
  try {
    const {
      input,
      sourceEncoding,
      targetEncoding,
    } = request;

    // 1. 入力検証
    validateConvertRequest(request);

    // 2. 変換元の文字コードでエンコード
    const sourceBytes = encodeText(
      input,
      sourceEncoding
    );

    // 3. HEX生成
    const hex = bytesToHex(sourceBytes);

    // 4. 同じバイト列を変換先でデコード
    const output = decodeBytes(
      sourceBytes,
      targetEncoding
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
      sourceBytes: null,
      hex: null,
      errors: [
        {
          code: "CONVERSION_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "変換中にエラーが発生しました。",
        },
      ],
      warnings: [],
    };
  }
}
```

上記は実装イメージです。

実際のB担当のAPIに合わせて調整してください。

ただし、処理順序とバイト列の扱いは変更してはいけません。

# 8. 入力検証

以下を確認してください。

- 入力文字列が正しい型であること
- 変換元の文字コードIDが存在すること
- 変換先の文字コードIDが存在すること
- エンコード機能が利用可能であること
- デコード機能が利用可能であること

文字コードの対応状況は、B担当のレジストリを参照してください。

同じ文字コードIDの一覧を別途ハードコードしないでください。

# 9. React Hook

以下のHookを実装してください。

```ts
useConverter()
```

## 9.1 管理する状態

```ts
interface ConverterState {
  input: string;
  sourceEncoding: EncodingId;
  targetEncoding: EncodingId;
  result: ConvertResponse | null;
  isConverting: boolean;
}
```

## 9.2 提供する機能

```ts
interface UseConverterReturn {
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

A担当がこのHookを利用して画面を実装します。

そのため、上記のAPIを基本として実装してください。

変更が必要な場合はA担当と事前に合意してください。

## 9.3 状態管理の注意点

- 入力文字列を保持する。
- 変換元・変換先を保持する。
- 変換結果を保持する。
- 変換中かどうかを保持する。
- 入力変更後に古い結果をどう扱うかを一貫して決める。
- リセット時は適切に初期状態へ戻す。

変換サービス自体はReactに依存させないでください。

# 10. クリップボード機能

以下のHookを実装してください。

```ts
useClipboard()
```

提供機能：

- テキストをクリップボードにコピー
- コピー成功・失敗の状態管理
- コピー状態のリセット

ブラウザのClipboard APIを利用してください。

Clipboard APIが利用できない場合も考慮してください。

# 11. エラー・警告処理

以下を考慮してください。

| 状況 | 対応 |
|---|---|
| 未入力 | 必要に応じて案内 |
| 不明な文字コード | エラー |
| エンコード失敗 | エラー |
| デコード失敗 | エラー |
| 表現できない文字 | 警告またはエラー |
| 不正なバイト列 | デコーダーの仕様に従う |

エラーをすべて同じメッセージにせず、可能な範囲で原因を識別できるようにしてください。

また、デコードが置換文字を返した場合と、例外を投げた場合を区別できるようにしてください。

# 12. A担当との連携

A担当は以下のHookを利用します。

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

結果の表示には以下を使用します。

```ts
result?.output
result?.hex
result?.errors
result?.warnings
```

A担当のUIがこのAPIで実装できることを確認してください。

UI側に変換処理を実装させないでください。

# 13. テスト要件

以下をテストしてください。

## 13.1 基本テスト

```ts
const result = convertText({
  input: "こんにちは",
  sourceEncoding: "SHIFT_JIS",
  targetEncoding: "SHIFT_JIS",
});
```

期待する結果：

- successがtrue
- outputが元の文字列と一致
- sourceBytesが存在する
- hexが生成されている
- errorsが空

## 13.2 重要テスト

```ts
const result = convertText({
  input: "こんにちは",
  sourceEncoding: "SHIFT_JIS",
  targetEncoding: "UTF-8",
});
```

確認事項：

- SHIFT_JISでバイト列を生成する。
- HEXがそのバイト列と一致する。
- UTF-8デコードに同じバイト列を渡す。
- 変換先で再エンコードしない。
- 入力文字列と出力文字列が異なっても仕様上問題ない。

## 13.3 追加テスト

- UTF-8からUTF-8
- EUC-JPからEUC-JP
- ISO-2022-JPからISO-2022-JP
- 異なる文字コード間の変換
- 空文字列
- 不正な文字コードID
- エンコード失敗
- デコード失敗
- 長い文字列

# 14. 担当外ファイルの変更禁止

原則として以下は変更しないでください。

```text
src/components/
src/app/
src/lib/encoding/
src/constants/encodings.ts
```

B担当のエンジンやレジストリの変更が必要な場合は、B担当と相談してください。

# 15. 完了条件

- [ ] ConvertRequestを実装した。
- [ ] ConvertResponseを実装した。
- [ ] convertTextを実装した。
- [ ] bytesToHexを実装した。
- [ ] 入力検証を実装した。
- [ ] useConverterを実装した。
- [ ] useClipboardを実装した。
- [ ] A担当のUIと接続できる。
- [ ] B担当のエンジンと接続できる。
- [ ] 変換仕様に関するテストが通る。
- [ ] TypeScriptの型エラーがない。

# 16. GitHub Copilotへの作業指示

まず既存プロジェクトとB担当の実装状況を確認してください。

特に、文字コードエンジンとレジストリのAPIを確認してから実装してください。

次に、本書の担当範囲に限定して実装を進めてください。

A担当との連携に必要なHookのAPIは、本書に記載したものを基本としてください。

他担当のファイルを勝手に変更してはいけません。

実装後は単体テストと統合テストを実行し、変更ファイル・実装内容・テスト結果・未対応事項を報告してください。