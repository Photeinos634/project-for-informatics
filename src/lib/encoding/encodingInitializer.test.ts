import { describe, expect, it } from "vitest";
import { initializeEncoding } from "./encodingInitializer";
import { getAllEncodings } from "./encodingRegistry";
import { resolveEncodingEngine } from "./encodingResolver";

describe("encodingInitializer", () => {
  it("初期化によって文字コードが登録される", () => {
    initializeEncoding();

    const encodings = getAllEncodings();

    expect(encodings.length).toBeGreaterThan(0);
    expect(encodings.some((item) => item.id === "UTF-8")).toBe(true);
  });

  it("EncodingJapaneseEngineが登録される", () => {
    initializeEncoding();

    const engine = resolveEncodingEngine("UTF-8", "encode");

    expect(engine.id).toBe("encoding-japanese");
  });

  it("同じ初期化処理を複数回呼び出してもエラーにならない", () => {
    expect(() => {
      initializeEncoding();
      initializeEncoding();
    }).not.toThrow();
  });
});
