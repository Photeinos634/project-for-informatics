
import { describe, expect, it } from "vitest";
import { normalizeText } from "@/lib/unicode/normalization";

describe("normalizeText", () => {
  it("NFCで濁点を合成できる", () => {
    expect(normalizeText("か\u3099", "NFC")).toBe("が");
  });

  it("NFDで濁点を分解できる", () => {
    expect(normalizeText("が", "NFD")).toBe("か\u3099");
  });

  it("NFKCで半角カタカナを全角に変換できる", () => {
    expect(normalizeText("ｶﾀｶﾅ", "NFKC")).toBe("カタカナ");
  });

  it("NFKCで互換文字を変換できる", () => {
    expect(normalizeText("①", "NFKC")).toBe("1");
  });

  it("NFKDで互換文字を分解できる", () => {
    expect(normalizeText("①", "NFKD")).toBe("1");
  });

  it("ASCII文字はNFCで変化しない", () => {
    expect(normalizeText("ABC", "NFC")).toBe("ABC");
  });

  it("空文字列を処理できる", () => {
    expect(normalizeText("", "NFC")).toBe("");
  });
});
