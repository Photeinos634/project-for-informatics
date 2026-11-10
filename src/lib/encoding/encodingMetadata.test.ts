import { describe, expect, it, beforeEach } from "vitest";

import {
  getEncodingMetadata,
  getAllEncodingMetadata,
  canEncode,
  canDecode,
} from "./encodingMetadata";

import {
  registerEncoding,
} from "./encodingRegistry";

const testDefinitions = [
  {
    id: "UTF-8",
    label: "UTF-8",
    description: "Unicode UTF-8",
    engineId: "encoding-japanese",
    aliases: ["utf8"],
    capabilities: {
      encode: true,
      decode: true,
    },
  },
  {
    id: "Windows-31J",
    label: "Windows-31J (CP932)",
    description: "Windows Code Page 932",
    engineId: "encoding-japanese",
    aliases: ["CP932", "SJIS", "Shift_JIS"],
    capabilities: {
      encode: true,
      decode: true,
    },
  },
];

describe("encodingMetadata", () => {
  beforeEach(() => {
    for (const definition of testDefinitions) {
      try {
        registerEncoding(definition);
      } catch {
        // すでに登録されている場合は何もしない
      }
    }
  });

  it("UTF-8のメタデータを取得できる", () => {
    const result = getEncodingMetadata("UTF-8");

    expect(result).toBeDefined();
    expect(result?.id).toBe("UTF-8");
    expect(result?.label).toBe("UTF-8");
  });

  it("CP932からWindows-31Jの情報を取得できる", () => {
    const result = getEncodingMetadata("CP932");

    expect(result).toBeDefined();
    expect(result?.id).toBe("Windows-31J");
  });

  it("未登録の文字コードはundefinedになる", () => {
    expect(
      getEncodingMetadata("UNKNOWN-ENCODING")
    ).toBeUndefined();
  });

  it("登録済み文字コードの一覧を取得できる", () => {
    const result = getAllEncodingMetadata();

    expect(result.length).toBeGreaterThan(0);
    expect(result.some((item) => item.id === "UTF-8")).toBe(true);
  });

  it("エンコード対応状況を判定できる", () => {
    expect(canEncode("UTF-8")).toBe(true);
    expect(canEncode("UNKNOWN-ENCODING")).toBe(false);
  });

  it("デコード対応状況を判定できる", () => {
    expect(canDecode("UTF-8")).toBe(true);
    expect(canDecode("UNKNOWN-ENCODING")).toBe(false);
  });
});
