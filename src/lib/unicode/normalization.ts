
import type { NormalizationForm } from "@/types/encoding";

/**
 * 文字列を指定されたUnicode正規化形式に変換する
 */
export function normalizeText(
  text: string,
  form: NormalizationForm
): string {
  return text.normalize(form);
}
