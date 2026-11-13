
/**
 * Unicode互換文字の解析結果
 */
export interface CompatibilityInfo {
  character: string;
  normalized: string;
  isCompatible: boolean;
  codePoint: string;
  normalizedCodePoint: string;
}

/**
 * 文字列に含まれる互換文字を解析する
 *
 * NFKCによって変化する文字を互換文字として判定する。
 * 元の文字列自体は変更しない。
 */
export function analyzeCompatibility(
  text: string
): CompatibilityInfo[] {
  return Array.from(text, (character) => {
    const normalized = character.normalize("NFKC");
    const codePoint = character.codePointAt(0)!;
    const normalizedCodePoint = normalized.codePointAt(0)!;

    return {
      character,
      normalized,
      isCompatible: character !== normalized,
      codePoint: `U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`,
      normalizedCodePoint: `U+${normalizedCodePoint.toString(16).toUpperCase().padStart(4, "0")}`,
    };
  });
}
