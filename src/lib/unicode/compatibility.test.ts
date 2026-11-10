
import { describe, expect, it } from "vitest";
import { analyzeCompatibility } from "./compatibility";

describe("analyzeCompatibility", () => {
  it("通常の文字は互換文字ではないと判定できる", () => {
    const result = analyzeCompatibility("A");

    expect(result).toHaveLength(1);
    expect(result[0].isCompatible).toBe(false);
    expect(result[0].normalized).toBe("A");
  });

  it("丸数字を互換文字として解析できる", () => {
    const result = analyzeCompatibility("①");

    expect(result[0].isCompatible).toBe(true);
    expect(result[0].normalized).toBe("1");
    expect(result[0].codePoint).toBe("U+2460");
    expect(result[0].normalizedCodePoint).toBe("U+0031");
  });

  it("全角英字を半角英字に対応付けられる", () => {
    const result = analyzeCompatibility("Ａ");

    expect(result[0].isCompatible).toBe(true);
    expect(result[0].normalized).toBe("A");
  });

  it("1文字が複数文字に変換される互換文字を解析できる", () => {
    const result = analyzeCompatibility("㍍");

    expect(result[0].isCompatible).toBe(true);
    expect(result[0].normalized).toBe("メートル");
  });

  it("複数の文字を個別に解析できる", () => {
    const result = analyzeCompatibility("A①Ｂ");

    expect(result).toHaveLength(3);
    expect(result.map((item) => item.normalized)).toEqual([
      "A",
      "1",
      "B",
    ]);
  });

  it("空文字列は空配列になる", () => {
    expect(analyzeCompatibility("")).toEqual([]);
  });
});
