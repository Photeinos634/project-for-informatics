# B-bom-detection

## 担当
B担当（Encoding Engine）

## 概要
UTF-8/16/32のBOMを検出し、本文バイト列と分離する。

## 対象モジュール
- `src/lib/binary/bom.ts`

## 実装要件
- UTF-32 BOMをUTF-16より先に判定する。
- 元配列を変更せず分析結果を返す。
- `addBOM` / `removeBOM` の既存動作を維持する。
- 異なる文字コードへのBOM付与はエラーにする。

## 完了条件
- 全BOM種別をテストする。
- 本文開始位置を正しく返す。
- 元配列を破壊しない。
