# MojiFix — GitHub Copilot Instructions

このファイルは、MojiFixプロジェクトにおいてGitHub Copilotがコードを生成・編集する際に従うべき共通ルールを定義する。

Copilotは、実装前に本ファイルと関連ドキュメントを確認し、既存の設計・インターフェース・担当範囲を尊重すること。

---

## 1. Project Overview

MojiFixは、文字コードの違いによって発生する文字化けを再現・確認するためのブラウザ上で動作するWebアプリケーションである。

ユーザーが入力した文字列を指定した文字コードでバイト列に変換し、その同じバイト列を別の文字コードとして解釈し直すことで、文字化けを再現する。

### 技術スタック

- Next.js
- React
- TypeScript
- CSS
- Vercel
- GitHub

### 基本方針

- 文字コード変換処理はブラウザ内で完結させる。
- 外部サーバーへの変換リクエストを行わない。
- データベースを使用しない。
- Next.jsの静的エクスポートに対応させる。
- UI、文字コード処理、アプリケーションロジックを分離する。
- TypeScriptの型安全性を重視する。

---

## 2. Important: Conversion Specification

MojiFixの最も重要な仕様は、通常の文字コード変換ではなく、**バイト列の再解釈**を行うことである。

### 処理例

入力：

```text
こんにちは
```

変換元：

```text
SHIFT_JIS
```

変換先：

```text
UTF-8
```

処理：

1. 入力文字列「こんにちは」をSHIFT_JISでエンコードする。
2. 生成されたバイト列をHEX形式で表示する。
3. 同じバイト列をUTF-8としてデコードする。
4. デコードされた文字列を変換結果として表示する。

### 正しい処理

```ts
const bytes = encodeText(input, sourceEncoding);

const hex = bytesToHex(bytes);

const output = decodeBytes(bytes, targetEncoding);
```

### 禁止する処理

以下のように、変換元の文字コードで一度文字列に戻してから変換先の文字コードにエンコードする処理は実装しないこと。

```ts
// MojiFixの仕様とは異なる
const intermediate = decodeBytes(bytes, sourceEncoding);
const result = encodeText(intermediate, targetEncoding);
```

この処理は通常の文字コード変換に近いものであり、MojiFixが目的とする文字化けの再現とは異なる。

### 処理の概念図

```text
入力文字列
    |
    v
変換元の文字コードでエンコード
    |
    v
バイト列
    |
    +------> HEX表示
    |
    v
変換先の文字コードでデコード
    |
    v
変換結果
```

HEXはバイト列の表示形式であり、文字コードそのものではない。

---

## 3. Supported Encodings

初期対応する文字コードは以下の4種類とする。

| Encoding ID | 表示名 |
|---|---|
| UTF-8 | UTF-8 |
| SHIFT_JIS | Shift_JIS |
| EUC-JP | EUC-JP |
| ISO-2022-JP | ISO-2022-JP（JIS） |

### 注意事項

- 「JIS」という名称だけでは文字コードを特定できないため、ISO-2022-JPとして扱う。
- SHIFT_JISとEUC-JPは、ブラウザ標準APIだけではエンコードできない場合がある。
- 必要に応じてブラウザ対応の文字コードライブラリを利用する。
- ISO-2022-JPは状態を持つ文字コードであるため、バイト列全体をまとめてデコードする。
- エンコードできない文字が存在する場合は、警告またはエラーとして扱う。
- 不正なバイト列をデコードした場合の挙動を明確にする。

文字コードの追加は、UIを直接変更するのではなく、Encoding Registryへの登録によって行える設計とする。

---

## 4. Architecture

プロジェクトは以下の3つの責務に分離する。

### A：Frontend / UI

担当範囲：

- 画面レイアウト
- 入力欄
- 出力欄
- 文字コード選択
- 変換ボタン
- HEX表示
- コピー機能
- レスポンシブ対応

UI側で文字コードのエンコード・デコード処理を実装しない。

### B：Encoding Engine

担当範囲：

- 文字列のエンコード
- バイト列のデコード
- 文字コードライブラリの選定・利用
- Encoding Registry
- 対応文字コードの管理
- 文字コード処理のテスト

UIやReactの状態管理を実装しない。

### C：Application Logic / Integration

担当範囲：

- Converter Service
- HEX変換ユーティリティ
- 入力検証
- useConverter Hook
- useClipboard Hook
- A・Bの実装の統合

文字コードの内部処理はBのEncoding Engineを利用する。

---

## 5. Directory Structure

基本的なディレクトリ構成は以下とする。

```text
MojiFix/
├── .github/
│   └── copilot-instructions.md
│
├── docs/
│   ├── index.md
│   ├── specification.md
│   ├── design.md
│   ├── interfaces.md
│   └── development/
│       ├── frontend.md
│       ├── encoding-engine.md
│       └── application-logic.md
│
├── public/
│   ├── favicon.ico
│   └── images/
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── layout/
│   │   ├── editor/
│   │   ├── converter/
│   │   ├── analyzer/
│   │   └── ui/
│   │
│   ├── hooks/
│   ├── services/
│   ├── lib/
│   │   ├── binary/
│   │   ├── encoding/
│   │   │   └── engines/
│   │   ├── platform/
│   │   ├── unicode/
│   │   └── utils/
│   │
│   ├── constants/
│   │
│   └── types/
│
├── tests/
│
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
└── next.config.ts
```

この構成には未実装の機能用の空の雛形も含まれる。ディレクトリやファイルが存在することを、機能が実装済みである根拠として扱わないこと。

既存のディレクトリやファイルを変更する場合は、他の担当者の実装への影響を確認すること。

---

## 6. Shared Interfaces

A・B・Cの間で共有する型定義・関数仕様は、必ず以下のファイルを参照すること。

```text
docs/interfaces.md
```

特に次の項目を独自に変更してはならない。

- EncodingId
- EncodingDefinition
- EncodingEngine
- ConvertRequest
- ConvertResponse
- Converter Serviceの引数と戻り値
- useConverter Hookの戻り値

インターフェースを変更する必要がある場合は、他の担当者への影響を考慮し、先にinterfaces.mdを更新すること。

---

## 7. Coding Rules

### TypeScript

- TypeScriptを使用する。
- 可能な限り明示的な型定義を行う。
- `any`の使用は原則禁止する。
- 型アサーションは必要な場合に限る。
- 関数の引数と戻り値を明確にする。
- 共通型は`src/types/`で管理する。

### React

- 関数コンポーネントを使用する。
- Hookのルールを守る。
- UIと処理ロジックを分離する。
- 不必要な状態を増やさない。
- Propsの型を定義する。

### ファイル管理

- 1つのファイルに複数の責務を詰め込まない。
- ファイル名は原則PascalCaseまたはcamelCaseを用途に応じて使い分ける。
- 既存の命名規則に合わせる。
- 不必要な依存関係を追加しない。

### エラー処理

- エラーを握りつぶさない。
- ユーザーに必要なエラー情報を表示できるようにする。
- エラーの種類を区別する。
- 予期しない例外も適切に処理する。

---

## 8. Browser-only Processing

MojiFixはブラウザ内で動作するアプリケーションとする。

そのため、以下の実装は行わない。

- API Routes
- Route Handlersによる変換処理
- Server Actionsによる変換処理
- データベースを利用した変換処理
- 外部APIへの文字列送信
- サーバー側での文字コード変換

文字コードライブラリを使用する場合も、ブラウザ上で実行できるものを選択する。

---

## 9. Static Export / Deployment

Vercelで静的エクスポートとして公開する。

`next.config.ts`では、以下の設定を基本とする。

```ts
const nextConfig = {
  output: "export",
};

export default nextConfig;
```

注意事項：

- サーバー実行を前提とした機能を使用しない。
- ブラウザAPIはクライアント側で使用する。
- ブラウザAPIをServer Componentから直接呼び出さない。
- 必要なコンポーネントには`"use client"`を指定する。
- ビルド時にサーバー環境で実行されるコードに注意する。

---

## 10. Testing Requirements

最低限、以下を確認する。

### Encoding Engine

- UTF-8のエンコード・デコード
- Shift_JISのエンコード・デコード
- EUC-JPのエンコード・デコード
- ISO-2022-JPのエンコード・デコード
- エンコード不能文字
- 不正なバイト列
- 空文字列

### Converter Service

- 正しい変換元・変換先の組み合わせ
- HEX表示と実際のバイト列の一致
- 同じバイト列を変換先としてデコードしていること
- エラー発生時のレスポンス
- 入力が空の場合の処理

### UI

- 入力
- 文字コード選択
- 変換
- HEX表示
- 結果表示
- コピー
- リセット
- エラー表示

テストを実行していない場合は、実行済みであるかのように報告しないこと。

---

## 11. Copilot Implementation Rules

Copilotは、コードを生成する際に次のルールを守ること。

1. 既存のコードとディレクトリ構成を確認してから編集する。
2. 担当範囲外のファイルを勝手に変更しない。
3. 共通インターフェースを独自に変更しない。
4. 既存の実装を確認せずに同じ機能を重複実装しない。
5. 必要な依存パッケージを追加する場合は、その理由を説明する。
6. 変更したファイルと変更内容を説明する。
7. ビルドやテストを実行できる場合は実行する。
8. 未確認の動作について、動作確認済みと報告しない。
9. 不明な仕様を独自に決めず、関連ドキュメントを確認する。
10. 仕様変更が必要な場合は、変更理由と影響範囲を示す。

---

## 12. Priority of Specifications

仕様に矛盾がある場合は、次の順序で確認する。

1. ユーザーが明示的に決定した最新の仕様
2. `docs/specification.md`
3. `docs/interfaces.md`
4. `docs/design.md`
5. 本ファイル
6. 各担当者向けCopilot指示書
7. 既存の実装

ただし、実装上の問題や矛盾を発見した場合は、独断で仕様を変更せず、問題点を報告すること。

---

## 13. Final Goal

MojiFixの最終目標は、ユーザーが入力した文字列について、任意の対応文字コードでバイト列を生成し、その同じバイト列を別の文字コードとして解釈した結果を簡単に確認できるWebアプリケーションを実現することである。

特に、**エンコードしたバイト列をそのまま別の文字コードでデコードする**という基本仕様を常に維持すること。