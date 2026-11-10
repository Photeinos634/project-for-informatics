
/**
 * Unicodeコードポイントの情報
 */
export interface CodePointInfo {
  character: string;
  codePoint: number;
  hex: string;
  index: number;
}

/**
 * 文字列をUnicodeコードポイント単位で解析する
 */
export function analyzeCodePoints(text: string): CodePointInfo[] {
  const result: CodePointInfo[] = [];
  let index = 0;

  for (const character of text) {
    const codePoint = character.codePointAt(0);

    if (codePoint === undefined) {
      continue;
    }

    result.push({
      character,
      codePoint,
      hex: `U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`,
      index,
    });

    index += character.length;
  }

  return result;
}
