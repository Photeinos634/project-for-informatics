import type { EncodingId } from "@/types/encoding";

/**
 * 文字コード処理エンジンの共通インターフェース
 */
export interface EncodingEngine {
  readonly id: string;

  encode(
    text: string,
    encoding: EncodingId
  ): Uint8Array;

  decode(
    bytes: Uint8Array,
    encoding: EncodingId
  ): string;

  supports(
    encoding: EncodingId,
    operation: "encode" | "decode"
  ): boolean;
}