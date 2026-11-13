import type { EncodingDefinition } from "@/types/encoding";

/**
 * アプリケーションで使用する文字コードの初期登録情報
 */
export const ENCODING_DEFINITIONS: EncodingDefinition[] = [
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
    aliases: ["CP932", "SJIS", "Shift_JIS", "shift-jis"],
    capabilities: {
      encode: true,
      decode: true,
    },
  },
  {
    id: "EUC-JP",
    label: "EUC-JP",
    description: "日本語用文字コード EUC-JP",
    engineId: "encoding-japanese",
    aliases: ["EUCJP"],
    capabilities: {
      encode: true,
      decode: true,
    },
  },
  {
    id: "ISO-2022-JP",
    label: "ISO-2022-JP",
    description: "電子メールなどで使用される日本語用文字コード",
    engineId: "encoding-japanese",
    aliases: ["JIS"],
    capabilities: {
      encode: true,
      decode: true,
    },
  },
  {
    id: "UTF-16LE",
    label: "UTF-16 LE",
    description: "Unicode UTF-16 Little Endian",
    engineId: "encoding-japanese",
    aliases: ["UTF16LE"],
    capabilities: {
      encode: true,
      decode: true,
    },
  },
  {
    id: "UTF-16BE",
    label: "UTF-16 BE",
    description: "Unicode UTF-16 Big Endian",
    engineId: "encoding-japanese",
    aliases: ["UTF16BE"],
    capabilities: {
      encode: true,
      decode: true,
    },
  },
];
