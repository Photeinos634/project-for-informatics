import { describe, expect, it } from "vitest";
import { analyzeVariationSelectors } from "./variationSelector";

describe("analyzeVariationSelectors", () => {
  it("基本的な異体字セレクタを検出できる", () => {
    const result = analyzeVariationSelectors("漢\uFE00");

    expect(result).toHaveLength(1);
    expect(result[0].character).toBe("漢");
    expect(result[0].selectorCodePoint).toBe("U+FE00");
    expect(result[0].index).toBe(0);
  });

  it("絵文字に付く異体字セレクタを検出できる", () => {
    const result = analyzeVariationSelectors("😀\uFE0F");

    expect(result).toHaveLength(1);
    expect(result[0].character).toBe("😀");
    expect(result[0].selectorCodePoint).toBe("U+FE0F");
  });

  it("補助平面の異体字セレクタを検出できる", () => {
    const result = analyzeVariationSelectors("漢\u{E0100}");

    expect(result).toHaveLength(1);
    expect(result[0].selectorCodePoint).toBe("U+E0100");
  });

  it("異体字セレクタがない場合は空配列になる", () => {
    expect(analyzeVariationSelectors("漢字")).toEqual([]);
  });

  it("複数の異体字セレクタを検出できる", () => {
    const result = analyzeVariationSelectors("漢\uFE00字\uFE01");

    expect(result).toHaveLength(2);
    expect(result[0].character).toBe("漢");
    expect(result[1].character).toBe("字");
  });

  it("UTF-16インデックスを正しく取得できる", () => {
    const result = analyzeVariationSelectors("A😀\uFE0F");

    expect(result).toHaveLength(1);
    expect(result[0].index).toBe(1);
  });

  it("空文字列は空配列になる", () => {
    expect(analyzeVariationSelectors("")).toEqual([]);
  });
});
