import { beforeAll, describe, expect, it } from "vitest";
import type { EncodingDefinition } from "@/types/encoding";
import { registerEncoding } from "@/lib/encoding/encodingRegistry";
import {
  registerEncodingEngine,
  resolveEncodingEngine,
} from "@/lib/encoding/encodingResolver";
import { EncodingJapaneseEngine } from "@/lib/encoding/engines/encodingJapaneseEngine";

const definition: EncodingDefinition = {
  id: "Windows-31J",
  label: "Windows-31J (CP932)",
  description: "Windowsで使用される日本語文字コード",
  engineId: "encoding-japanese",
  aliases: ["CP932", "SJIS"],
  capabilities: {
    encode: true,
    decode: true,
  },
};

beforeAll(() => {
  registerEncoding(definition);
  registerEncodingEngine(new EncodingJapaneseEngine());
});

describe("EncodingResolver", () => {
  it("CP932から正しいエンジンを解決できる", () => {
    const engine = resolveEncodingEngine("CP932", "encode");
    expect(engine.id).toBe("encoding-japanese");
  });

  it("SJISから正しいエンジンを解決できる", () => {
    const engine = resolveEncodingEngine("SJIS", "decode");
    expect(engine.id).toBe("encoding-japanese");
  });

  it("解決したエンジンで日本語を処理できる", () => {
    const engine = resolveEncodingEngine("CP932", "encode");
    const encoded = engine.encode("こんにちは", "Windows-31J");

    expect(engine.decode(encoded, "Windows-31J")).toBe("こんにちは");
  });

  it("未登録の文字コードはエラーになる", () => {
    expect(() =>
      resolveEncodingEngine("UNKNOWN", "encode")
    ).toThrow();
  });
});
