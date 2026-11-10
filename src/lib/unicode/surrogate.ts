/**
 * サロゲート解析結果
 */
export interface SurrogateInfo {
  character: string;
  codePoint: string;
  index: number;
  type: "pair" | "unpaired-high" | "unpaired-low";
  highSurrogate?: string;
  lowSurrogate?: string;
}

/**
 * 16進数表記に変換する
 */
function toHex(value: number): string {
  return `U+${value.toString(16).toUpperCase().padStart(4, "0")}`;
}

/**
 * 文字列に含まれるサロゲートを解析する
 */
export function analyzeSurrogates(text: string): SurrogateInfo[] {
  const result: SurrogateInfo[] = [];

  for (let i = 0; i < text.length; i++) {
    const codeUnit = text.charCodeAt(i);

    if (codeUnit >= 0xD800 && codeUnit <= 0xDBFF) {
      const nextCodeUnit = text.charCodeAt(i + 1);

      if (nextCodeUnit >= 0xDC00 && nextCodeUnit <= 0xDFFF) {
        const codePoint =
          0x10000 +
          ((codeUnit - 0xD800) << 10) +
          (nextCodeUnit - 0xDC00);

        result.push({
          character: text.slice(i, i + 2),
          codePoint: toHex(codePoint),
          index: i,
          type: "pair",
          highSurrogate: toHex(codeUnit),
          lowSurrogate: toHex(nextCodeUnit),
        });

        i++;
      } else {
        result.push({
          character: text[i],
          codePoint: toHex(codeUnit),
          index: i,
          type: "unpaired-high",
        });
      }
    } else if (codeUnit >= 0xDC00 && codeUnit <= 0xDFFF) {
      result.push({
        character: text[i],
        codePoint: toHex(codeUnit),
        index: i,
        type: "unpaired-low",
      });
    }
  }

  return result;
}
