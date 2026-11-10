# Development Guide: B担当（Encoding Engine / Unicode）

## 1. 担当概要

B担当はMojiFixの文字コード処理エンジンとUnicode解析機能を担当する。

主な責任は以下の通り。

- 文字列のエンコード
- バイト列のデコード
- 文字コードライブラリの統合
- 文字コードの登録・管理
- 文字コードのエイリアス管理
- Unicode正規化
- Unicodeコードポイント解析
- 異体字・互換文字の解析

## 2. 担当ディレクトリ

```text
src/
├── lib/
│   └── encoding/
│       ├── engines/
│       │   ├── encodingJapaneseEngine.ts
│       │   └── iconvLiteEngine.ts
│       ├── encodingEngine.ts
│       ├── encodingRegistry.ts
│       ├── encodingResolver.ts
│       ├── encodingAliases.ts
│       └── encodingMetadata.ts
│
│   └── unicode/
│       ├── normalization.ts
│       ├── codePoint.ts
│       ├── compatibility.ts
│       ├── variationSelector.ts
│       └── surrogate.ts
│
├── constants/
│   └── encodings.ts
│
└── types/
    └── encoding.ts
```

## 3. 文字コードエンジン

### 3.1 encoding-japanese

日本語系文字コードを中心に利用する。

初期対応候補：

- UTF-8
- Shift_JIS
- EUC-JP
- ISO-2022-JP
- UTF-16系

注意点：

- `SJIS` はCP932拡張との関係を確認する。
- 厳密なShift_JISとWindows-31Jを同一視しない。
- エンコード不能文字の扱いを明示する。
- 不正なバイト列のデコード挙動をテストする。
- ISO-2022-JPの状態遷移を考慮し、バイト列全体を適切に処理する。

### 3.2 iconv-lite

多言語・Windows・Macintosh系文字コードの処理に利用する。

対応候補：

- Windows系コードページ
- Macintosh系文字コード
- UTF系
- ISO-8859系
- その他の対応文字コード

注意点：

- 実際の対応一覧は使用バージョンで確認する。
- ISO-2022-JPなど未対応の文字コードを登録しない。
- ブラウザでの動作を検証する。
- Buffer互換環境とバンドル方法を確認する。
- 不正なバイト列・エンコード不能文字の挙動を確認する。

## 4. 共通インターフェース

すべてのエンジンは `EncodingEngine` を実装する。

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

ライブラリ固有のAPIを直接C担当に公開してはならない。

## 5. Registry / Resolver

### Registry

利用可能な文字コードとエンジンの対応関係を管理する。

### Resolver

文字コードIDと処理種別から、利用するエンジンを返す。

同一文字コードを複数エンジンで扱える場合は、どのエンジンを使用するか明示的に管理する。

ライブラリの対応範囲に基づかず、文字コード名だけで処理可能と判断してはならない。

## 6. エンコード・デコードの注意点

### 6.1 Uint8Array

エンコード結果は `Uint8Array` に統一する。

ライブラリがBufferを返す場合は、共通インターフェースに合わせる。

### 6.2 エンコード不能文字

初期仕様では、原則としてエンコード不能文字をエラーにする。

代替文字へ置換する機能を追加する場合は、置換した事実をC担当へ伝えられるAPIにする。

### 6.3 不正なバイト列

デコード時に不正なバイト列が含まれる場合、ライブラリの実際の挙動を検証する。

- 置換文字を出力するか。
- エラーを発生させるか。
- 一部のバイト列を無視するか。

この挙動をテストし、仕様化する。

### 6.4 Stateful Encoding

ISO-2022-JPなど状態を持つ文字コードでは、バイト列を途中で分割して独立にデコードしない。

## 7. Unicode解析

### normalization.ts

NFC / NFD / NFKC / NFKDを実装する。

```ts
export function normalizeText(
  text: string,
  form: NormalizationForm
): string;
```

### codePoint.ts

文字列をコードポイント単位で解析する。

### compatibility.ts

互換文字・互換漢字などを解析する。

### variationSelector.ts

異体字セレクタを解析する。

### surrogate.ts

UTF-16コードユニットとサロゲートペアを解析する。

## 8. テスト

最低限、以下を確認する。

### 文字コードテスト

- ASCII
- 日本語
- 半角カタカナ
- 変換可能文字
- 変換不能文字
- CP932固有文字
- 不正なバイト列
- ISO-2022-JPの状態遷移

### Unicodeテスト

- NFCとNFDの違い
- NFKCとNFKDの違い
- サロゲートペア
- 絵文字
- 異体字セレクタ
- 互換文字

### エンジン間比較

同じ文字コードを複数エンジンで処理する場合、結果が一致するか検証する。

不一致がある場合は、マッピングの違いとして記録する。

## 9. 完了条件

- 共通インターフェースを実装している。
- 対応文字コードが正確に登録されている。
- エンコード・デコードのテストがある。
- 未対応文字コードを誤って受け付けない。
- ブラウザで動作する。
- C担当が利用できるAPIが整っている。

## 10. 担当間連携

C担当に以下を提供する。

- EncodingEngine
- Registry
- Resolver
- EncodingMetadata
- Unicode解析API

共通インターフェースを変更する場合は、C担当と合意してから変更する。
