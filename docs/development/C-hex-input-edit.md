# C-hex-input-edit

## 担当
C担当（Application Logic / Integration）

## 概要
テキストモードとHEXモードを分離し、編集済みHEXを変換へ統合する。

## 対象モジュール案
- `src/hooks/useConverter.ts`
- `src/services/converterService.ts`
- `src/lib/utils/validation.ts`

## 統合要件
- 判別可能なテキスト要求とHEX要求を定義する。
- HEXモードでは変換先エンジンでバイト列を直接デコードする。
- テキストモードでは既存の変換元エンコード処理を維持する。
- モード切替時に誤った入力ソースへフォールバックしない。

## 完了条件
- 不正HEXを共通エラーへ変換する。
- HEX表示と変換バイト列が一致する。
