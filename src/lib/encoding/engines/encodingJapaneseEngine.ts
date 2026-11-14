import * as Encoding from "encoding-japanese";
import type { EncodingId } from "@/types/encoding";
import type { EncodingEngine } from "../encodingEngine";

/**
 * encoding-japanese を利用する日本語文字コード処理エンジン
 */
export class EncodingJapaneseEngine implements EncodingEngine {
    readonly id = "encoding-japanese";

    /**
     * アプリ側の文字コードIDをライブラリ側の名前に変換する
     */
    private getLibraryEncoding(
        encoding: EncodingId,
    ): Encoding.Encoding | undefined {
        const normalized = encoding.toLowerCase().replace(/[-_]/g, "");

        const encodingMap: Record<string, Encoding.Encoding> = {
            utf8: "UTF8",
            shiftjis: "SJIS",
            sjis: "SJIS",
            eucjp: "EUCJP",
            iso2022jp: "JIS",
            jis: "JIS",
            utf16le: "UTF16LE",
            utf16be: "UTF16BE",
        };

        return encodingMap[normalized];
    }

    supports(encoding: EncodingId, operation: "encode" | "decode"): boolean {
        return (
            (operation === "encode" || operation === "decode") &&
            this.getLibraryEncoding(encoding) !== undefined
        );
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
