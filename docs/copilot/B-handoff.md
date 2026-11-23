# B担当（新美）引き継ぎ資料：文字コード処理・Unicode解析

## 1. 担当概要

B担当はMojiFixの文字コード処理エンジン、Unicode解析機能、および文字コード解析・修復機能を実装した。

主な実装内容：

- 文字コードエンコード・デコードエンジン
- 文字コードRegistry / Resolver
- Unicode解析・正規化
- 文字コード自動判定
- 複数の文字コードによる修復候補生成
- BOM検出・解析・追加・削除
- HEX入力からの直接デコード

### 最新の検証結果

- Vitest：16ファイル、113テスト成功
- Next.js production build：成功
- TypeScriptチェック：ビルド時のチェック成功

## 2. 初期化

文字コード処理を使用する前に初期化を行う。

```ts
import { initializeEncoding } from "@/lib/encoding/encodingInitializer";

initializeEncoding();
```

`initializeEncoding()` は複数回呼び出しても再登録しない設計になっている。

自動判定・修復候補生成の関数内部でも初期化を行う。

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

注意：

`Shift_JIS` という別名はWindows-31Jに解決される。
厳密なShift_JISとCP932は同一ではないため、画面表示ではWindows-31J（CP932）とする。

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

注意：

現在の文字コード定義は `encoding-japanese` を使用する設定になっている。
`iconv-lite` は登録されているが、現行の定義からResolver経由で選択される設定にはなっていない。

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

## 8. 文字コード自動判定

ファイル：

`src/lib/encoding/encodingDetection.ts`

公開API：

```ts
detectEncoding(bytes: Uint8Array): EncodingDetectionResult
```

### 型定義

```ts
export interface EncodingDetectionCandidate {
    encoding: EncodingId;
    confidence: number;
    reason: string[];
}

export interface EncodingDetectionResult {
    candidates: EncodingDetectionCandidate[];
    detectedBOM: BOMInfo | null;
    isReliable: boolean;
    warnings: ConversionWarning[];
}
```

### 処理概要

- 入力は `Uint8Array` のバイト列。
- 登録済みかつデコード可能な文字コードを判定候補とする。
- BOMを強い判定根拠として優先する。
- UTF-8の妥当性、日本語文字コードのバイト構造などを判定材料にする。
- 候補には信頼度と判定理由を付与する。
- 判定が困難な場合は候補を確定せず、信頼度の低い結果として返す。
- ASCIIのみ、空データなど判定材料が少ない入力では曖昧さを維持する。

### 使用例

```ts
import { detectEncoding } from "@/lib/encoding/encodingDetection";

const bytes = new Uint8Array([0xE3, 0x81, 0x82]);

const result = detectEncoding(bytes);

console.log(result.candidates);
console.log(result.detectedBOM);
console.log(result.isReliable);
```

注意：

自動判定は推定結果であり、必ず正しい文字コードを保証するものではない。
ユーザーが明示的に選択した文字コードを、自動判定だけで上書きしてはいけない。

## 9. 複数修復候補

ファイル：

`src/lib/encoding/repairCandidates.ts`

公開API：

```ts
suggestRepairCandidates(
    inputBytes: Uint8Array,
    targetEncodings?: EncodingId[]
): RepairResponse
```

### 型定義

```ts
export interface RepairCandidate {
    sourceEncoding: EncodingId;
    targetEncoding: EncodingId;
    output: string;
    hex: string;
    confidence: number;
    explanation: string[];
}

export interface RepairResponse {
    candidates: RepairCandidate[];
    detectedBOM: ReturnType<typeof analyzeBOM>["bom"];
    warnings: ConversionWarning[];
    errors: ConversionError[];
}
```

### 処理概要

- 同一の入力バイト列を複数の文字コードでデコードする。
- `targetEncodings` を指定した場合は、その文字コードを候補対象にする。
- 指定しない場合は登録済みのデコード可能な文字コードを候補対象にする。
- 不正なバイト列、置換文字が多い結果、空の結果などは除外または警告する。
- ISO-2022-JPは入力全体を一度にデコードする。
- 同じデコード結果は重複候補として統合する。
- 候補には相対的な信頼度と説明を付与する。

### 注意事項

- `targetEncoding` は統合された候補の代表文字コード。
- 同じ出力になる別の文字コード情報は `explanation` に記録される。
- `confidence` は候補間の相対的な推定値であり、正解を保証するものではない。
- 候補選択後も、元のバイト列を再エンコードしてはいけない。

## 10. BOM検出・解析

ファイル：

`src/lib/binary/bom.ts`

公開API：

```ts
detectBOM(bytes: Uint8Array): BOMInfo | null

analyzeBOM(bytes: Uint8Array): BOMAnalysis

addBOM(bytes: Uint8Array, encoding: EncodingId): Uint8Array

removeBOM(bytes: Uint8Array): Uint8Array
```

### 型定義

```ts
export interface BOMInfo {
    encoding: EncodingId;
    bytes: Uint8Array;
}

export interface BOMAnalysis {
    hasBOM: boolean;
    bom: BOMInfo | null;
    contentOffset: number;
    contentBytes: Uint8Array;
}
```

### 対応BOM

- UTF-8
- UTF-16LE
- UTF-16BE
- UTF-32LE
- UTF-32BE

### 処理上の注意

- UTF-32をUTF-16より先に判定する。
- BOMの有無と本文バイト列を分離して扱う。
- `contentOffset` はBOMのバイト数。
- `contentBytes` はBOMを除いた本文バイト列。
- 入力バイト列を直接変更しない。
- BOM検出だけで文字コードや入力バイト列を変更しない。
- UTF-32のBOMを検出できても、UTF-32の変換エンジンが登録されていることを意味しない。
- 既存のBOMと異なるBOMを追加しようとした場合はエラーにする。

## 11. HEX入力・変換

ファイル：

- `src/lib/binary/hex.ts`
- `src/services/converterService.ts`

### hex.ts

主な関数：

```ts
bytesToHex(bytes: Uint8Array): string

hexToBytes(hex: string): Uint8Array
```

`hexToBytes()` はHEX文字列をバイト列に変換する。

仕様：

- 空白・改行・タブを許容する。
- 大文字・小文字を許容する。
- 不正な16進文字を検出する。
- 16進数字の桁数が奇数の場合は別のエラーとして扱う。
- 戻り値は `Uint8Array`。

### convertFromHex()

HEX入力を直接デコードするService。

```ts
convertFromHex(
    hex: string,
    targetEncoding: EncodingId
): ConvertResponse
```

### 使用例

```ts
import { convertFromHex } from "@/services/converterService";

const result = convertFromHex(
    "E3 81 82",
    "UTF-8"
);

console.log(result.output);
console.log(result.errors);
```

### 処理上の注意

- HEXを `hexToBytes()` で検証する。
- 変換後のバイト列を変換先エンジンで直接デコードする。
- HEXモードではテキストを再エンコードしない。
- 不正なHEXの場合はデコード処理を行わない。
- エラーは共通の `ConversionError` 形式で返す。

## 12. Converter Service

ファイル：

`src/services/converterService.ts`

公開API：

```ts
convert(request: ConvertRequest): ConvertResponse

convertFromHex(
    hex: string,
    targetEncoding: EncodingId
): ConvertResponse
```

### 通常のテキスト変換

```ts
export interface ConvertRequest {
    input: string;
    sourceEncoding: EncodingId;
    targetEncoding: EncodingId;
}
```

通常のテキスト変換では、指定された変換元文字コードで入力をエンコードし、生成したバイト列を変換先文字コードでデコードする。

### HEX変換

`convertFromHex()` を使用する。
テキストへの再エンコードを挟まず、HEXから変換した元バイト列を直接デコードする。

### 共通エラー・警告

```ts
export interface ConversionError {
    code: string;
    message: string;
    details?: unknown;
}

export interface ConversionWarning {
    code: string;
    message: string;
    details?: unknown;
}
```

## 13. A・C担当との連携

### A担当

画面表示側で利用する主な情報：

- 自動判定候補：`EncodingDetectionResult.candidates`
- 判定信頼度：`EncodingDetectionCandidate.confidence`
- 判定理由：`EncodingDetectionCandidate.reason`
- BOM情報：`EncodingDetectionResult.detectedBOM`
- 修復候補：`RepairResponse.candidates`
- 修復候補の出力：`RepairCandidate.output`
- 修復候補の文字コード：`RepairCandidate.targetEncoding`
- 修復候補の信頼度：`RepairCandidate.confidence`
- HEX表示：`bytesToHex()`

### C担当

入力モードに応じてServiceを使い分ける。

- テキスト入力：`convert(request)`
- HEX入力：`convertFromHex(hex, targetEncoding)`
- 自動判定：`detectEncoding(bytes)`
- 修復候補生成：`suggestRepairCandidates(bytes, targetEncodings?)`
- BOM解析：`analyzeBOM(bytes)`

### 統合時の重要事項

1. 自動判定候補と変換結果は別々に管理する。
2. 自動判定だけでユーザーの文字コード選択を上書きしない。
3. 修復候補を選択したときに、その候補の `targetEncoding` を変換要求へ反映する。
4. HEXモードでは元バイト列を再エンコードしない。
5. 修復候補の選択でも元バイト列を再エンコードしない。
6. BOM検出だけで文字コードや元バイト列を変更しない。
7. 入力や文字コードが変更された場合、古い判定結果や候補を再利用しない。
8. エラーは `ConversionError`、警告は `ConversionWarning` の形式に統一する。

## 14. 編集ファイル構成

```text
src/
├── lib/
│   ├── binary/
│   │   ├── bom.ts
│   │   ├── byteUtils.ts
│   │   └── hex.ts
│   └── encoding/
│       ├── encodingDetection.ts
│       ├── repairCandidates.ts
│       ├── encodingEngine.ts
│       ├── encodingRegistry.ts
│       ├── encodingResolver.ts
│       ├── encodingInitializer.ts
│       ├── encodingMetadata.ts
│       └── engines/
├── services/
│   └── converterService.ts
└── types/
    ├── converter.ts
    └── encoding.ts

tests/
├── binary/
│   └── binaryUtils.test.ts
├── converter/
│   └── converterService.test.ts
├── encoding/
│   ├── encodingDetection.test.ts
│   ├── repairCandidates.test.ts
│   ├── encodingInitializer.test.ts
│   ├── encodingMetadata.test.ts
│   ├── encodingResolver.test.ts
│   └── engines/
└── unicode/
    ├── normalization.test.ts
    ├── codePoint.test.ts
    ├── compatibility.test.ts
    ├── variationSelector.test.ts
    └── surrogate.test.ts

vitest.config.ts
```

## 15. テスト・ビルド

最終確認結果：

```text
Test Files  16 passed (16)
Tests       113 passed (113)
```

本番ビルド：

```text
Next.js production build: successful
TypeScript: successful
Static page generation: successful
```

実行コマンド：

```powershell
npx.cmd vitest run
npm.cmd run build
```

Windows環境での注意：

- `npm.cmd` を使用する。
- GitのLF / CRLF警告は改行コードに関する警告であり、今回のテスト失敗ではない。
- Viteのnative configLoader警告は今回のテスト成功を妨げていない。

## 16. Git情報

作業ブランチ：

`yudai/b/auto-encoding-detection`

コミット：

`4e67cdc`

コミットメッセージ：

`feat: implement encoding detection and repair candidates`

GitHub：

`https://github.com/Photeinos634/project-for-informatics`

Pull Request：

作成済み。レビュー・マージ状況はGitHub上で確認すること。

## 17. 今後の確認事項

- A・C担当との統合テスト
- 自動判定候補と画面表示の接続
- 修復候補選択と変換要求の接続
- HEX入力モードとServiceの接続
- BOM操作と画面表示の接続
- 統合後の全テスト・本番ビルド確認

この資料はB担当の実装範囲を説明するものであり、A・C担当側の画面・Hookへの接続完了を意味するものではない。
