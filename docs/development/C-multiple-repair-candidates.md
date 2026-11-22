# C-multiple-repair-candidates

## 担当
C担当（Application Logic / Integration）

## 概要
修復候補の生成、選択、変換要求への反映を統合する。

## 対象モジュール案
- `src/hooks/useConverter.ts`
- `src/services/converterService.ts`

## 統合要件
- テキストモードでは変換元で生成したバイト列を候補生成へ渡す。
- HEXモードでは編集済みバイト列を候補生成へ渡す。
- 候補選択時は文字コードと出力を保持する。
- 候補生成中は古い候補をクリアする。
- 失敗時は共通エラーを返す。

## 完了条件
- 候補選択で元バイト列を再エンコードしない。
- 候補のHEXが元バイト列と一致する。
