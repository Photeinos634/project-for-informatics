import iconv from "iconv-lite";
import type { EncodingId } from "@/types/encoding";
import type { EncodingEngine } from "../encodingEngine";

/**
 * iconv-lite を利用する文字コード処理エンジン
 */
export class IconvLiteEngine implements EncodingEngine {
  readonly id = "iconv-lite";

  supports(
    encoding: EncodingId,
    operation: "encode" | "decode"
  ): boolean {
    return iconv.encodingExists(encoding);
  }

  encode(
    text: string,
    encoding: EncodingId
  ): Uint8Array {
    if (!this.supports(encoding, "encode")) {
      throw new Error(`Unsupported encoding: ${encoding}`);
    }

    return new Uint8Array(iconv.encode(text, encoding));
  }

  decode(
    bytes: Uint8Array,
    encoding: EncodingId
  ): string {
    if (!this.supports(encoding, "decode")) {
      throw new Error(`Unsupported encoding: ${encoding}`);
    }

    return iconv.decode(bytes, encoding);
  }
}