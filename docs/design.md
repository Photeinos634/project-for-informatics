# MojiFix Design Document

## 1. システム概要

MojiFixはNext.js App Routerを使用するブラウザー内動作の文字コード解析アプリケーションである。Static Exportで配布し、入力文字列を変換サーバーへ送信しない。

現在のトップページは文字コードの再解釈、HEX表示、変換結果とHEXのコピーを提供する。Unicode・互換性解析はService/Hookまで実装されているが、現在のトップページには接続されていない。

## 2. 技術構成

| 分類 | 現在の採用技術・設定 |
|---|---|
| Framework | Next.js App Router (`output: "export"`) |
| Language / UI | TypeScript / React |
| Encoding | `encoding-japanese`、`iconv-lite` |
| Testing | Vitest |
| Styling | CSS、Tailwind CSS |
| Deployment target | Vercelなどの静的ホスティング |

`encoding-japanese` と `iconv-lite` は共通の `EncodingEngine` を実装する。現行の文字コード定義は `encoding-japanese` に割り当てられており、`iconv-lite` は初期化時に登録されるが、現在の定義ではResolverから選択されない。

## 3. 実装構成

```text
src/
├── app/
│   ├── page.tsx                 # useConverter / useClipboardを接続
│   └── globals.css
├── components/
│   ├── analyzer/                # 解析UIの雛形を含む
│   ├── converter/               # 文字コード選択・結果・HEX UI
│   ├── editor/                  # 入力・出力UI
│   ├── layout/
│   └── ui/
├── hooks/
│   ├── useConverter.ts
│   ├── useAnalyzer.ts
│   └── useClipboard.ts
├── services/
│   ├── converterService.ts
│   ├── analyzerService.ts
│   └── compatibilityService.ts
├── lib/
│   ├── encoding/                # Engines、Registry、Resolver、aliases、metadata
│   ├── unicode/                 # 正規化、コードポイント、互換性、異体字、サロゲート
│   ├── binary/                  # HEX、BOM、改行、バイト列操作
│   ├── platform/                # プリセット、互換性比較、文字対応
│   └── utils/                   # 入力検証、共通エラー生成
├── constants/
└── types/

tests/
├── binary/
├── converter/
├── encoding/
├── platform/
└── unicode/
```

ディレクトリやUIコンポーネントの雛形があることは、機能が画面から利用可能であることを意味しない。現時点で動作する画面機能と内部モジュールの区別は [README.md](../README.md) と [C担当引き継ぎ](./copilot/C-handoff.md) を参照する。

## 4. モジュール設計

### 4.1 Encoding Engine

- `EncodingEngine` が文字コードのエンコード・デコードAPIを提供する。
- `encodingRegistry` が文字コードID、表示名、aliases、engine ID、処理能力を管理する。
- `encodingResolver` が文字コードと処理種別からエンジンを解決する。
- `encodingInitializer` がエンジンと定義を初期登録する。
- バイト列は `Uint8Array` に統一する。

登録文字コードはUTF-8、Windows-31J（CP932）、EUC-JP、ISO-2022-JP、UTF-16LE、UTF-16BE。現状の別名定義では `Shift_JIS` はWindows-31Jへ解決する。厳密なShift_JISとのマッピング差に注意する。

### 4.2 Application Services / Hooks

`converterService.convert()` は要求を検証し、変換元エンジンで入力をエンコード、生成バイト列からHEXを作成し、同じバイト列を変換先エンジンでデコードする。検証・各処理の失敗は `ConvertResponse` 内のエラーとして返し、失敗時に部分結果を成功として返さない。

`useConverter()` は入力・文字コード・変換結果・処理状態を管理する。エンコード定義からUIの選択肢を構成し、入力や選択が変更された際に古い結果をクリアする。

`useClipboard()` はブラウザーのClipboard APIを利用し、未対応・拒否などの失敗状態を呼び出し側に返す。`useAnalyzer()` は `analyzerService` の結果を状態管理する。

### 4.3 Binary / Unicode / Platform

- `lib/binary/hex.ts`：バイト列とHEX文字列の変換。不正なHEXを拒否する。
- `lib/binary/bom.ts`：UTF-8/16/32 BOMの検出・追加・除去。入力配列は変更しない。BOMを認識することは、その文字コードがEncoding Registryに登録されていることを意味しない。
- `lib/binary/newline.ts`：CRLF/LF/CRの先頭出現検出、件数集計、改行変換。
- `analyzerService`：コードポイント、互換文字、異体字セレクタ、サロゲート、改行を集約する。
- `compatibilityService`：プリセットを使ったエンコード/デコード比較と文字単位の差分情報を返す。
- Platform presetは代表的な設定例であり、実際のOS既定値を断定しない。

### 4.4 UI

`app/page.tsx` は `useConverter()` と `useClipboard()` を利用し、入力、選択、変換、結果、HEX表示、コピーを接続する。文字コード一覧はUIにハードコードせずRegistryのmetadataから取得する。

解析用Service/Hookは存在するが、Unicode・互換性解析画面は現時点で実装済みの画面機能に含まれない。

## 5. データフロー

```text
TextInput / EncodingSelector
   ↓
useConverter
   ↓
converterService.convert
   ├─ validateConvertRequest
   ├─ encodingResolver -> sourceEngine.encode -> Uint8Array
   ├─ bytesToHex(the same Uint8Array)
   └─ encodingResolver -> targetEngine.decode(the same Uint8Array)
   ↓
ConvertResponse
   ↓
ConversionResult / HexViewer
```

基本処理では、元エンコードのバイト列を変換先デコードに直接渡す。変換元文字コードでの中間デコードや、変換先への再エンコードを挟まない。

## 6. 実行・テスト

- `npm run dev`：開発サーバー
- `npm run typecheck`：TypeScript型チェック
- `npm run lint`：ESLint
- `npx vitest run`：Vitestテスト。対象ファイルは `vitest.config.ts` で指定
- `npm run build`：Next.js Static Exportのビルド

変換エンジンごとに変換不能文字・不正バイト列の挙動が異なり得る。表示上の成功だけでなく、実バイト列と各Engineのテストを基準に対応可否を確認する。

## 7. 制約・次の作業候補

- Unicode解析Hook/Serviceと既存の解析UIを接続し、利用可能な解析画面を作る。
- Compatibility Serviceの設定や比較結果を画面へ表示する。
- Engineのフォールバック・置換挙動と「エンコード不能文字をエラーにする」仕様をエンジン単位で検証する。
- `Shift_JIS` とWindows-31Jを同一視しない方針について、共有仕様とRegistry aliasの合意を取る。
- BOM検出はUTF-32も扱うが、UTF-32のエンコード/デコードは現在のEncoding Registryの範囲外。
