# B担当(新美)引き渡し用資料：文字コード処理・Unicode解析

## 1. 担当概要

B担当はMojiFixの文字コード処理エンジンとUnicode解析機能を実装した。

現在の検証結果：

- Vitest：72テスト成功
- TypeScript：型チェック成功
- エンジン間比較テスト：4テスト成功

## 2. 初期化

文字コード処理を使用する前に、初期化を行う。

```ts
import { initializeEncoding } from "@/lib/encoding/encodingInitializer";

initializeEncoding();
```

`initializeEncoding()` は複数回呼び出しても再登録しない設計になっている。

## 3. エンコード・デコード

共通インターフェースは `EncodingEngine`。

```ts
export interface EncodingEngine {
  readonly id: string;
  encode(text: string, encoding: EncodingId): Uint8Array;
  decode(bytes: Uint8Array, encoding: EncodingId): string;
  supports(
    encoding: EncodingId,
    operation: "encode" | "decode"
  ): boolean;
}
```

### 使用例

```ts
import { initializeEncoding } from "@/lib/encoding/encodingInitializer";
import { resolveEncodingEngine } from "@/lib/encoding/encodingResolver";

initializeEncoding();

const encoding = "UTF-8";

const encoder = resolveEncodingEngine(encoding, "encode");
const bytes = encoder.encode("こんにちは", encoding);

const decoder = resolveEncodingEngine(encoding, "decode");
const text = decoder.decode(bytes, encoding);

console.log(text);
```

## 4. 対応文字コード

現在の定義：

- UTF-8
- Windows-31J（CP932）
- EUC-JP
- ISO-2022-JP
- UTF-16LE
- UTF-16BE

注意：`Shift_JIS` という別名はWindows-31Jに解決される。厳密なShift_JISとCP932は同一ではないため、画面表示ではWindows-31J（CP932）とする。

## 5. Registry / Resolver

### encodingRegistry.ts

主な関数：

- `registerEncoding()`：文字コードを登録
- `getEncoding()`：指定した文字コードの定義を取得
- `getAllEncodings()`：登録済み文字コード一覧を取得
- `getEncodingByAlias()`：別名から定義を取得

### encodingResolver.ts

- `registerEncodingEngine()`：エンジンを登録
- `resolveEncodingEngine()`：文字コードと処理種別からエンジンを取得

### encodingMetadata.ts

- `getEncodingMetadata()`：文字コードの詳細を取得
- `getAllEncodingMetadata()`：全メタデータを取得
- `canEncode()`：エンコード対応を確認
- `canDecode()`：デコード対応を確認

## 6. エンジン

### EncodingJapaneseEngine

`encoding-japanese` を使用する。

### IconvLiteEngine

`iconv-lite` を使用する。

両エンジンについて、UTF-8・Windows-31J・EUC-JPの往復変換を比較テストしている。

注意：現在の文字コード定義は `encoding-japanese` を使用する設定になっている。`iconv-lite` は登録されているが、現行の定義からResolver経由で選択される設定にはなっていない。

## 7. Unicode解析機能

| ファイル | 主な関数 |
|---|---|
| normalization.ts | `normalizeText()` |
| codePoint.ts | `analyzeCodePoints()` |
| compatibility.ts | `analyzeCompatibility()` |
| variationSelector.ts | `analyzeVariationSelectors()` |
| surrogate.ts | `analyzeSurrogates()` |

### normalization.ts

NFC・NFD・NFKC・NFKDによるUnicode正規化。

### codePoint.ts

文字ごとのUnicodeコードポイント、16進数表記、文字列内の位置を取得。

### compatibility.ts

互換文字とNFKC正規化後の文字を比較。

### variationSelector.ts

異体字セレクタを検出。

### surrogate.ts

サロゲートペア、不正な上位サロゲート、不正な下位サロゲートを検出。

## 8. エラー・制約事項

- 未対応の文字コードはエラーになる。
- 登録されていないエンジンはエラーになる。
- エンコード・デコードの対応状況をResolverで確認する。
- 変換エンジンによって不正バイト列や変換不能文字の扱いが異なる。
- `encoding-japanese` と `iconv-lite` のエラー・置換動作は同一ではない。

## 9. C担当との連携

C担当は、以下を利用して画面側の変換機能を実装できる。

1. `initializeEncoding()` で初期化する。
2. `resolveEncodingEngine()` で処理エンジンを取得する。
3. `encode()` または `decode()` を実行する。
4. 必要に応じて `encodingMetadata.ts` から対応状況や文字コード情報を取得する。
5. Unicode解析機能は各解析関数を直接利用する。

## 10. テスト

実装済みのテスト：

- EncodingJapaneseEngine
- IconvLiteEngine
- Engine Comparison
- Encoding Resolver
- Encoding Initializer
- Encoding Metadata
- Unicode Normalization
- Unicode Code Point
- Unicode Compatibility
- Variation Selector
- Surrogate

現在、全72テスト成功。型チェックも成功している。