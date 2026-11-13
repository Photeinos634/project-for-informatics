import { describe, expect, it } from "vitest";
import { analyzeSurrogates } from "@/lib/unicode/surrogate";

describe("analyzeSurrogates", () => {
  it("絵文字のサロゲートペアを検出できる", () => {
    const result = analyzeSurrogates("😀");

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("pair");
    expect(result[0].codePoint).toBe("U+1F600");
    expect(result[0].highSurrogate).toBe("U+D83D");
    expect(result[0].lowSurrogate).toBe("U+DE00");
  });

  it("対応する上位サロゲートがない場合を検出できる", () => {
    const result = analyzeSurrogates("\uD800");

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("unpaired-high");
    expect(result[0].index).toBe(0);
  });

  it("対応する下位サロゲートがない場合を検出できる", () => {
    const result = analyzeSurrogates("\uDC00");

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("unpaired-low");
    expect(result[0].index).toBe(0);
  });

  it("通常の文字は検出しない", () => {
    expect(analyzeSurrogates("ABC漢字")).toEqual([]);
  });

  it("複数のサロゲートペアを検出できる", () => {
    const result = analyzeSurrogates("😀😃");

    expect(result).toHaveLength(2);
    expect(result[0].codePoint).toBe("U+1F600");
    expect(result[1].codePoint).toBe("U+1F603");
  });

  it("UTF-16インデックスを正しく取得できる", () => {
    const result = analyzeSurrogates("A😀B");

    expect(result).toHaveLength(1);
    expect(result[0].index).toBe(1);
  });

  it("空文字列は空配列になる", () => {
    expect(analyzeSurrogates("")).toEqual([]);
  });
});
