# C-auto-encoding-detection

## 担当
C担当（Application Logic / Integration）

## 概要
判定対象バイト列を生成し、判定結果をHookへ統合する。

## 対象モジュール案
- `src/hooks/useConverter.ts`
- `src/services/converterService.ts`
- `src/lib/binary/hex.ts`

## 統合要件
- テキスト入力時は変換元文字コードで生成したバイト列を判定対象にする。
- HEX入力時は `hexToBytes()` の結果を判定対象にする。
- 判定候補は通常の変換結果とは別に保持する。
- 候補選択時のみ文字コード選択を更新する。
- 入力・HEX・文字コード変更時に古い判定を無効化する。

## 完了条件
- 不正HEXは判定前に共通エラーへ変換する。
- 判定候補が変換処理の成功フラグへ混入しない。
