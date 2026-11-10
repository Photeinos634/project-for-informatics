# MojiFix Design Document

## 1. システム概要

MojiFixはNext.js App Routerを使用したブラウザベースの文字コード解析アプリケーションである。

文字コード処理、Unicode解析、バイナリ操作、環境互換性解析を独立したモジュールとして構成する。

## 2. 技術構成

| 分類 | 技術 |
|---|---|
| Framework | Next.js |
| Language | TypeScript |
| UI | React |
| Encoding Library | encoding-japanese |
| Extended Encoding Library | iconv-lite |
| Testing | Vitest（採用候補） |
| Deployment | Vercel Static Export |

## 3. ディレクトリ構成

```text
MojiFix/
│
├── .github/
│   └── copilot-instructions.md
│
├── public/
│   ├── favicon.ico
│   └── images/
│
├── docs/
│   ├── README.md
│   ├── specification.md
│   ├── design.md
│   ├── interfaces.md
│   └── development/
│       ├── frontend.md
│       ├── encoding-engine.md
│       └── application-logic.md
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── editor/
│   │   │   ├── EditorPanel.tsx
│   │   │   ├── TextInput.tsx
│   │   │   └── TextOutput.tsx
│   │   │
│   │   ├── converter/
│   │   │   ├── EncodingSelector.tsx
│   │   │   ├── ConvertButton.tsx
│   │   │   ├── HexViewer.tsx
│   │   │   └── ConversionResult.tsx
│   │   │
│   │   ├── analyzer/
│   │   │   ├── CharacterInspector.tsx
│   │   │   ├── UnicodeInspector.tsx
│   │   │   ├── CompatibilityReport.tsx
│   │   │   └── ByteInspector.tsx
│   │   │
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Select.tsx
│   │       └── Tabs.tsx
│   │
│   ├── hooks/
│   │   ├── useConverter.ts
│   │   ├── useAnalyzer.ts
│   │   └── useClipboard.ts
│   │
│   ├── services/
│   │   ├── converterService.ts
│   │   ├── analyzerService.ts
│   │   └── compatibilityService.ts
│   │
│   ├── lib/
│   │   ├── encoding/
│   │   │   ├── engines/
│   │   │   │   ├── encodingJapaneseEngine.ts
│   │   │   │   └── iconvLiteEngine.ts
│   │   │   ├── encodingEngine.ts
│   │   │   ├── encodingRegistry.ts
│   │   │   ├── encodingResolver.ts
│   │   │   ├── encodingAliases.ts
│   │   │   └── encodingMetadata.ts
│   │   │
│   │   ├── unicode/
│   │   │   ├── normalization.ts
│   │   │   ├── codePoint.ts
│   │   │   ├── compatibility.ts
│   │   │   ├── variationSelector.ts
│   │   │   └── surrogate.ts
│   │   │
│   │   ├── platform/
│   │   │   ├── presets.ts
│   │   │   ├── compatibilityCheck.ts
│   │   │   ├── characterMapping.ts
│   │   │   └── platformMetadata.ts
│   │   │
│   │   ├── binary/
│   │   │   ├── hex.ts
│   │   │   ├── bom.ts
│   │   │   ├── newline.ts
│   │   │   └── byteUtils.ts
│   │   │
│   │   └── utils/
│   │       ├── validation.ts
│   │       └── errorHandler.ts
│   │
│   ├── constants/
│   │   ├── encodings.ts
│   │   ├── platforms.ts
│   │   └── normalization.ts
│   │
│   └── types/
│       ├── encoding.ts
│       ├── converter.ts
│       ├── analyzer.ts
│       └── platform.ts
│
├── tests/
│   ├── encoding/
│   │   ├── encodingJapanese.test.ts
│   │   ├── iconvLite.test.ts
│   │   ├── encodingCompatibility.test.ts
│   │   └── malformedBytes.test.ts
│   ├── unicode/
│   │   ├── normalization.test.ts
│   │   └── codePoint.test.ts
│   ├── platform/
│   │   └── compatibility.test.ts
│   └── converter/
│       └── converterService.test.ts
│
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── README.md
└── LICENSE
```

## 4. モジュール設計

### 4.1 encoding

文字コードのエンコード・デコードを担当する。

複数ライブラリを共通インターフェースで抽象化する。

```text
encoding/
├── engines/
│   ├── encodingJapaneseEngine.ts
│   └── iconvLiteEngine.ts
├── encodingEngine.ts
├── encodingRegistry.ts
├── encodingResolver.ts
├── encodingAliases.ts
└── encodingMetadata.ts
```

#### encodingJapaneseEngine
`encoding-japanese` のアダプター。

#### iconvLiteEngine
`iconv-lite` のアダプター。

#### encodingEngine
共通インターフェースを定義する。

#### encodingRegistry
利用可能な文字コード・エンジンを登録する。

#### encodingResolver
文字コードIDから利用するエンジンを解決する。

#### encodingAliases
文字コードの別名を正規IDへ変換する。

#### encodingMetadata
表示名、説明、対応能力などを管理する。

エンジンの選択は明示的な登録に基づいて行う。複数エンジンに対応する文字コードについて、暗黙の優先順位に依存しない。

### 4.2 unicode

Unicodeの解析・正規化を担当する。

文字コードエンジンとは独立させる。

### 4.3 platform

OSやアプリケーション間の文字互換性を調べる。

OSごとのプリセットは代表的な設定例として扱い、実際の環境を断定しない。

### 4.4 binary

HEX・BOM・改行コード・バイト列操作を担当する。

文字列への変換前のバイト列を保持できる設計にする。

### 4.5 utils

入力検証・共通エラー処理などを担当する。

## 5. データフロー

### 5.1 基本変換

```text
TextInput
   ↓
useConverter
   ↓
converterService
   ↓
encodingResolver
   ↓
EncodingEngine.encode
   ↓
Uint8Array
   ├── bytesToHex
   └── EncodingEngine.decode
             ↓
         ConvertResponse
             ↓
       ConversionResult
```

### 5.2 重要な設計原則

エンコード後のバイト列をデコード処理にそのまま渡す。

次のような不要な変換を挟まない。

```text
bytes
 ↓
source encodingでdecode
 ↓
Unicode string
 ↓
target encodingでencode
```

これは通常のトランスコードであり、基本の再解釈処理とは異なる。

## 6. 実行環境

- Next.js App Router
- Static Export
- ブラウザ内処理
- API Routesを使用しない
- Route Handlersを使用しない
- Server Actionsを使用しない
- データベースを使用しない

ブラウザ依存のライブラリは、クライアント側でのみ実行する。

`iconv-lite` のBuffer互換性とバンドル方法は、実装開始時に検証する。

## 7. エンジン追加方針

新しい文字コードを追加する場合：

1. エンジンが対応しているか確認する。
2. エンコード・デコードのテストを作成する。
3. `encodingMetadata` に情報を追加する。
4. `encodingRegistry` に登録する。
5. 必要に応じてエイリアスを登録する。
6. UI側で選択肢に表示されることを確認する。

UIに文字コードを直接ハードコードしない。

## 8. エラー処理

ライブラリ固有の例外は、アプリケーション共通のエラー形式に変換する。

エンコード不能文字や不正なバイト列を黙って処理しない。

## 9. 拡張方針

初期段階では文字コード変換・再解釈・HEX表示を優先する。

その後、Unicode解析、BOM・改行解析、OS間互換性解析を段階的に追加する。
