import { describe, expect, it } from "vitest";
import { IconvLiteEngine } from "./iconvLiteEngine";

describe("IconvLiteEngine", () => {
  const engine = new IconvLiteEngine();

  it("UTF-8で日本語をエンコードできる", () => {
    const result = engine.encode("こんにちは", "utf8");
    expect(result).toBeInstanceOf(Uint8Array);
    expect(engine.decode(result, "utf8")).toBe("こんにちは");
  });

  it("Windows-31Jで日本語をエンコード・デコードできる", () => {
    const result = engine.encode("こんにちは", "cp932");
    expect(engine.decode(result, "cp932")).toBe("こんにちは");
  });

  it("対応している文字コードを判定できる", () => {
    expect(engine.supports("utf8", "encode")).toBe(true);
    expect(engine.supports("utf8", "decode")).toBe(true);
  });

  it("未対応の文字コードを判定できる", () => {
    expect(engine.supports("UNKNOWN-ENCODING", "encode")).toBe(false);
    expect(engine.supports("UNKNOWN-ENCODING", "decode")).toBe(false);
  });

  it("未対応の文字コードのエンコードではエラーになる", () => {
    expect(() => engine.encode("こんにちは", "UNKNOWN-ENCODING"))
      .toThrow("Unsupported encoding: UNKNOWN-ENCODING");
  });

  it("未対応の文字コードのデコードではエラーになる", () => {
    expect(() => engine.decode(new Uint8Array([0x41]), "UNKNOWN-ENCODING"))
      .toThrow("Unsupported encoding: UNKNOWN-ENCODING");
  });

  it("不正なUTF-8バイト列を置換文字でデコードする", () => {
    const result = engine.decode(new Uint8Array([0xC3, 0x28]), "utf8");
    expect(result).toBe("�(");
  });

  it("ASCIIで表現できない文字を代替文字に置き換える", () => {
    const result = engine.encode("あ", "ascii");
    expect(Array.from(result)).toEqual([0x3F]);
  });
});
