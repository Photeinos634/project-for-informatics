
/**
 * 異体字セレクタの解析結果
 */
export interface VariationSelectorInfo {
  character: string;
  selector: string;
  characterCodePoint: string;
  selectorCodePoint: string;
  index: number;
}

/**
 * Unicodeの異体字セレクタかどうかを判定する
 */
function isVariationSelector(codePoint: number): boolean {
  return (
    (codePoint >= 0xFE00 && codePoint <= 0xFE0F) ||
    (codePoint >= 0xE0100 && codePoint <= 0xE01EF)
  );
}

/**
 * 文字列に含まれる異体字セレクタを解析する
 */
export function analyzeVariationSelectors(
  text: string
): VariationSelectorInfo[] {
  const characters = Array.from(text);
  const result: VariationSelectorInfo[] = [];
  let utf16Index = 0;

  for (let i = 0; i < characters.length; i++) {
    const character = characters[i];
    const codePoint = character.codePointAt(0)!;

    if (
      isVariationSelector(codePoint) &&
      i > 0
    ) {
      const previousCharacter = characters[i - 1];
      const previousCodePoint = previousCharacter.codePointAt(0)!;

      result.push({
        character: previousCharacter,
        selector: character,
        characterCodePoint: `U+${previousCodePoint.toString(16).toUpperCase()}`,
        selectorCodePoint: `U+${codePoint.toString(16).toUpperCase()}`,
        index: utf16Index - previousCharacter.length,
      });
    }

    utf16Index += character.length;
  }

  return result;
}
