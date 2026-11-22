# B-hex-input-edit

## 担当
B担当（Encoding Engine）

## 概要
HEX文字列をバイト列へ変換し、エンジンへ安全に渡せることを保証する。

## 対象モジュール
- `src/lib/binary/hex.ts`
- `src/lib/binary/byteUtils.ts`

## 実装要件
- `hexToBytes()` の既存検証を共通利用する。
- 空白・改行を許容し、不正文字と奇数桁を区別する。
- バイト列は `Uint8Array` とする。
- HEXモードでは文字列再エンコードを行わない。
- 往復変換をテストする。

## 完了条件
- 不正HEXをエンジンへ渡さない。
- 生成バイト列が元HEXと一致する。
