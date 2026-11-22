# B-auto-encoding-detection

## 担当
B担当（Encoding Engine）

## 概要
バイト列から登録済み文字コード候補と信頼度を生成する判定ロジックを定義する。

## 対象モジュール案
- `src/lib/encoding/encodingDetection.ts`
- `src/lib/encoding/encodingRegistry.ts`
- `src/lib/binary/bom.ts`

## 実装要件
- デコード可能な登録文字コードのみ候補にする。
- BOM検出を強い判定根拠として優先する。
- UTF-8妥当性、バイト範囲、日本語文字コード制約を根拠にする。
- 候補ごとの信頼度と根拠を返す。
- ライブラリ例外を共通エラーへ変換する。
- 判定不能時は空候補と低信頼フラグを返す。

## 公開API案
`detectEncoding(bytes: Uint8Array): EncodingDetectionResult`

## 完了条件
- ASCIIなど情報量が少ない入力でも曖昧性を保持する。
- 判定によって元バイト列を変更しない。
- Registry外の文字コードを候補へ含めない。
