import { describe, expect, it } from "vitest";
import { analyzeCodePoints } from "@/lib/unicode/codePoint";

describe("analyzeCodePoints", () => {
  it("ASCII文字を解析できる", () => {
    const result = analyzeCodePoints("ABC");

    expect(result).toHaveLength(3);
    expect(result[0].hex).toBe("U+0041");
    expect(result[1].hex).toBe("U+0042");
    expect(result[2].hex).toBe("U+0043");
  });

  it("日本語を解析できる", () => {
    const result = analyzeCodePoints("あ");

    expect(result).toHaveLength(1);
    expect(result[0].codePoint).toBe(0x3042);
    expect(result[0].hex).toBe("U+3042");
  });

  it("絵文字を1つのコードポイントとして解析できる", () => {
    const result = analyzeCodePoints("😀");

    expect(result).toHaveLength(1);
    expect(result[0].codePoint).toBe(0x1F600);
    expect(result[0].hex).toBe("U+1F600");
  });

  it("文字列内のUTF-16インデックスを取得できる", () => {
    const result = analyzeCodePoints("A😀B");

    expect(result.map((item) => item.index)).toEqual([0, 1, 3]);
  });

  it("空文字列は空配列になる", () => {
    expect(analyzeCodePoints("")).toEqual([]);
  });
});
