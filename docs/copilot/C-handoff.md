# C担当 引き継ぎ：Application Logic / Integration

## 1. 概要

C担当として、文字コードEngineとUIをつなぐApplication Logicを実装した。文字コード処理そのものはB担当のEngineを利用し、`docs/interfaces.md` の共通APIを維持する。

現在のトップページは文字コードの再解釈、HEX表示、変換結果とHEXのコピーに接続済み。Unicode解析・Platform互換性のService/Hookも実装済みだが、トップページの解析UIにはまだ接続していない。

## 2. 実装内容

### Converter

- `src/services/converterService.ts`
  - `initializeEncoding()` 後、要求を検証する。
  - Encoding Resolverから変換元のencode Engineを取得し、入力を `Uint8Array` に変換する。
  - 同じバイト列をHEXにし、変換先のdecode Engineへ直接渡す。
  - 失敗時は `ConvertResponse` の `errors` にエラーを返し、output/bytes/hexを成功扱いで返さない。
- `src/lib/utils/validation.ts`
  - 必須ID、Registryの存在、encode/decode capabilityを確認する。
- `src/lib/utils/errorHandler.ts`
  - 例外を共通 `ConversionError` に変換する。
- `src/hooks/useConverter.ts`
  - 入力、変換元・変換先、結果、変換中状態を管理する。
  - Registry metadataからUI選択肢を返す。
  - 入力やEncoding変更時に古い結果をクリアする。
- `src/app/page.tsx`
  - Converter HookとClipboard Hookを画面へ接続する。

`convert()` は同期APIであるため、現在の `isConverting` は同期呼び出し中の状態を示す。非同期Engineへ移行するときは共通interface、Service、Hook、画面を関連担当者と合意して更新する。

### Clipboard

- `src/hooks/useClipboard.ts` は `navigator.clipboard.writeText()` を利用する。
- Clipboard未対応・権限拒否などの失敗をHookの `error` として返し、ページ上に表示する。
- APIはHTTPSまたはlocalhostなど、Clipboard APIが許可されるブラウザー環境が必要。

### Binary

- `src/lib/binary/hex.ts`: `bytesToHex()` は大文字・スペース区切り、`hexToBytes()` は空白を除いて検証する。不正な文字や奇数桁は例外。
- `src/lib/binary/byteUtils.ts`: 配列コピー、連結、同値比較。
- `src/lib/binary/bom.ts`: UTF-8/16/32 BOMを検出、追加、除去する。入力を破壊しない。既に別のBOMがあるデータへの追加はエラー。UTF-32はBOM操作のみであり、現在の文字コードRegistryではエンコード・デコードできない。
- `src/lib/binary/newline.ts`: CRLF/LF/CRの検出、件数、文字列変換。`detectNewline()` は最初に現れた改行を返す。

### Unicode / Platform解析

- `src/services/analyzerService.ts` は既存B担当モジュールを集約し、コードポイント・互換性・異体字セレクタ・サロゲート・最初の改行種別を返す。
- `src/hooks/useAnalyzer.ts` は入力と解析結果を管理する。
- `src/constants/platforms.ts` はWindows/macOS/iOSの設定例を定義する。OSの既定仕様ではない。
- `src/lib/platform/compatibilityCheck.ts` はプリセット設定で正規化・改行処理した文字列をエンコードして同じ設定でデコードし、元入力との差を警告する。
- `src/services/compatibilityService.ts` は各結果と単純な文字単位対応情報を返す。
- Compatibility解析UIへの接続は未実装。`mapCharacterChanges()` は文字位置による比較で、挿入・削除を考慮した高度な編集距離diffではない。

## 3. 共通API・初期化

共通型・戻り値の変更時は必ず [docs/interfaces.md](../interfaces.md) を確認し、A/B担当との合意を得る。

文字コードEngineをService外から使う場合は、既存の初期化とResolverを利用する。

```ts
import { initializeEncoding } from "@/lib/encoding/encodingInitializer";
import { resolveEncodingEngine } from "@/lib/encoding/encodingResolver";

initializeEncoding();
const engine = resolveEncodingEngine("UTF-8", "encode");
const bytes = engine.encode("text", "UTF-8");
```

Engine、Registry、aliasをService内で再実装しないこと。

## 4. テスト・確認

C担当で追加・更新したテスト：

- `tests/converter/converterService.test.ts`
- `tests/binary/binaryUtils.test.ts`
- `tests/platform/compatibility.test.ts`
- `vitest.config.ts` にC担当のconverter/binary/platformを追加

この引き継ぎ作成時に確認した結果：

- `npm run typecheck` 成功
- `npx vitest run` 成功（14 test files、84 tests）
- `npm run build` 成功（Static Export）
- `npm run lint` 成功、ただし既存のEncoding Engineに未使用引数warningが2件
- ブラウザーでWindows-31JからUTF-8への再解釈、HEX表示を確認

## 5. 注意点・次の作業

1. **Engineの厳密なエンコードエラー**  
   ConverterはEngineの例外をエラーとして返すが、各Engineが変換不能文字を本当に例外にするかは別途検証が必要。特に `encoding-japanese` の `fallback: "error"` が全ケースで仕様を満たすか、代表的な非対応文字・孤立サロゲートでテストする。暗黙の置換があればB担当とEngine側の修正を相談する。
2. **Shift_JISとWindows-31J**  
   現Registryでは `Shift_JIS` aliasをWindows-31Jに解決する。厳密なShift_JISとしての対応が必要なら、`docs/interfaces.md`、仕様書、UI名称、Registry、Engine、テストを関係担当と合意の上で更新する。
3. **解析機能のUI統合**  
   `useAnalyzer()` とCompatibility Serviceを既存の解析画面へ接続する。画面の空雛形は完成機能として扱わない。
4. **改行混在の表示**  
   `detectNewline()` は先頭の種類だけを返す。混在を正確に示す場合は `countNewlines()` の結果をUI・共通型で表示する。
5. **Compatibility比較**  
   各プリセットの正規化・改行設定はサンプルである。実際のOS標準動作として説明しない。プリセットの結果は入力文字列を正規化/改行変換した後のエンコード往復結果と元入力を比較する。
6. **BOMとEncoding Registry**  
   BOM helperはUTF-32も認識するが、UTF-32は現在のEncoding Registryの対応範囲外。UIの選択肢に表示する場合は別途Engine対応を実装・検証する。

## 6. 実行コマンド

```bash
npm run typecheck
npm run lint
npx vitest run
npm run build
```

`package.json` に `test` scriptはないため、Vitestは `npx vitest run` で実行する。テスト対象は `vitest.config.ts` に列挙される。
