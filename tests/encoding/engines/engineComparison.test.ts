import { describe, expect, it } from "vitest";
import { EncodingJapaneseEngine } from "@/lib/encoding/engines/encodingJapaneseEngine";
import { IconvLiteEngine } from "@/lib/encoding/engines/iconvLiteEngine";

describe("Encoding Engine Comparison", () => {
  const japaneseEngine = new EncodingJapaneseEngine();
  const iconvEngine = new IconvLiteEngine();

  const testCases = [
    { encoding: "UTF-8", text: "Hello, 世界！" },
    { encoding: "Windows-31J", text: "こんにちは、世界！" },
    { encoding: "EUC-JP", text: "日本語の文字コード" },
  ];

  it.each(testCases)(
    "$encodingで両エンジンが正しく往復変換できる",
    ({ encoding, text }) => {
      const japaneseBytes = japaneseEngine.encode(text, encoding);
      const iconvBytes = iconvEngine.encode(text, encoding);

      expect(japaneseEngine.decode(japaneseBytes, encoding)).toBe(text);
      expect(iconvEngine.decode(iconvBytes, encoding)).toBe(text);
    }
  );

  it("両エンジンのUTF-8エンコード結果が一致する", () => {
    const text = "MojiFix 日本語";

    const japaneseBytes = japaneseEngine.encode(text, "UTF-8");
    const iconvBytes = iconvEngine.encode(text, "UTF-8");

    expect(Array.from(japaneseBytes)).toEqual(
      Array.from(iconvBytes)
    );
  });
});
