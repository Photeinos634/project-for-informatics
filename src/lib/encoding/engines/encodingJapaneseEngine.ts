import * as Encoding from "encoding-japanese";
import type { EncodingId } from "@/types/encoding";
import type { EncodingEngine } from "../encodingEngine";

export class EncodingJapaneseEngine implements EncodingEngine {
  readonly id = "encoding-japanese";

  private getLibraryEncoding(
    encoding: EncodingId
  ): Encoding.Encoding | undefined {
    const normalized = encoding
      .toLowerCase()
      .replace(/[-_]/g, "");

    const encodingMap: Record<string, Encoding.Encoding> = {
      utf8: "UTF8",
      windows31j: "SJIS",
      cp932: "SJIS",
      eucjp: "EUCJP",
      iso2022jp: "JIS",
      jis: "JIS",
      utf16le: "UTF16LE",
      utf16be: "UTF16BE",
    };

    return encodingMap[normalized];
  }

  supports(
    encoding: EncodingId,
    operation: "encode" | "decode"
  ): boolean {
    return this.getLibraryEncoding(encoding) !== undefined;
  }

  encode(text: string, encoding: EncodingId): Uint8Array {
    const targetEncoding = this.getLibraryEncoding(encoding);

    if (!targetEncoding) {
      throw new Error(`Unsupported encoding: ${encoding}`);
    }

    const result = Encoding.convert(text, {
      to: targetEncoding,
      from: "UNICODE",
      type: "array",
      fallback: "error",
    });

    return new Uint8Array(result);
  }

  decode(bytes: Uint8Array, encoding: EncodingId): string {
    const sourceEncoding = this.getLibraryEncoding(encoding);

    if (!sourceEncoding) {
      throw new Error(`Unsupported encoding: ${encoding}`);
    }

    return Encoding.convert(bytes, {
      to: "UNICODE",
      from: sourceEncoding,
      type: "string",
      fallback: "error",
    });
  }
}
