import { describe, expect, it } from "vitest";
import { EncodingJapaneseEngine } from "@/lib/encoding/engines/encodingJapaneseEngine";

describe("EncodingJapaneseEngine", () => {
  const engine = new EncodingJapaneseEngine();

  it("ASCII文字をUTF-8でエンコード・デコードできる", () => {
    const original = "Hello World";
    const encoded = engine.encode(original, "UTF-8");
    expect(encoded).toBeInstanceOf(Uint8Array);
    expect(engine.decode(encoded, "UTF-8")).toBe(original);
  });

  it("日本語をUTF-8でエンコード・デコードできる", () => {
    const original = "こんにちは、世界";
    const encoded = engine.encode(original, "UTF-8");
    expect(engine.decode(encoded, "UTF-8")).toBe(original);
  });

  it("Windows-31Jで日本語を処理できる", () => {
    const original = "こんにちは";
    const encoded = engine.encode(original, "Windows-31J");
    expect(engine.decode(encoded, "Windows-31J")).toBe(original);
  });

  it("EUC-JPで日本語を処理できる", () => {
    const original = "こんにちは";
    const encoded = engine.encode(original, "EUC-JP");
    expect(engine.decode(encoded, "EUC-JP")).toBe(original);
  });

  it("ISO-2022-JPで日本語を処理できる", () => {
    const original = "こんにちは";
    const encoded = engine.encode(original, "ISO-2022-JP");
    expect(Array.from(encoded)).toContain(0x1B);
    expect(engine.decode(encoded, "ISO-2022-JP")).toBe(original);
  });

  it("半角カタカナをWindows-31Jで処理できる", () => {
    const original = "ｶﾀｶﾅ";
    const encoded = engine.encode(original, "Windows-31J");
    expect(engine.decode(encoded, "Windows-31J")).toBe(original);
  });

  it("UTF-16LEで日本語を処理できる", () => {
    const original = "こんにちは";
    const encoded = engine.encode(original, "UTF-16LE");
    expect(engine.decode(encoded, "UTF-16LE")).toBe(original);
  });

  it("UTF-16BEで日本語を処理できる", () => {
    const original = "こんにちは";
    const encoded = engine.encode(original, "UTF-16BE");
    expect(engine.decode(encoded, "UTF-16BE")).toBe(original);
  });

  it("未対応の文字コードを拒否する", () => {
    expect(() => engine.encode("test", "UNKNOWN")).toThrow();
    expect(() => engine.decode(new Uint8Array(), "UNKNOWN")).toThrow();
  });

  it("Windows-31Jで表現できない絵文字をエラーにする", () => {
    expect(() => engine.encode("😀", "Windows-31J")).toThrow();
  });

  it("不正なWindows-31Jバイト列0x82を置換してデコードする", () => {
    expect(engine.decode(new Uint8Array([0x82]), "Windows-31J")).toBe("?");
  });

  it("不正なWindows-31Jバイト列0xFFを置換してデコードする", () => {
    expect(engine.decode(new Uint8Array([0xFF]), "Windows-31J")).toBe("?");
  });

  it("不正なWindows-31Jバイト列0x82 0x20を置換してデコードする", () => {
    expect(engine.decode(new Uint8Array([0x82, 0x20]), "Windows-31J")).toBe("?");
  });

  it("Windows-31JでCP932拡張文字の髙を処理できる", () => {
    const encoded = engine.encode("髙", "Windows-31J");
    expect(Array.from(encoded)).toEqual([0xEE, 0xE0]);
    expect(engine.decode(encoded, "Windows-31J")).toBe("髙");
  });

  it("厳密なShift_JISは未対応として拒否する", () => {
    expect(() => engine.encode("こんにちは", "Shift_JIS")).toThrow();
    expect(() => engine.decode(new Uint8Array([0x82, 0xA0]), "Shift_JIS")).toThrow();
  });
});
