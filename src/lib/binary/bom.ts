import { concatBytes, copyBytes } from "./byteUtils";
import type { EncodingId } from "@/types/encoding";

export interface BOMInfo {
    encoding: EncodingId;
    bytes: Uint8Array;
}

export interface BOMAnalysis {
    hasBOM: boolean;
    bom: BOMInfo | null;
    contentOffset: number;
    contentBytes: Uint8Array;
}

// UTF-32をUTF-16より先に判定する。
// UTF-32LEの先頭4バイトはUTF-16LEのBOMと先頭2バイトが共通する。
const BOM_DEFINITIONS: readonly BOMInfo[] = [
    { encoding: "UTF-32BE", bytes: new Uint8Array([0x00, 0x00, 0xfe, 0xff]) },
    { encoding: "UTF-32LE", bytes: new Uint8Array([0xff, 0xfe, 0x00, 0x00]) },
    { encoding: "UTF-8", bytes: new Uint8Array([0xef, 0xbb, 0xbf]) },
    { encoding: "UTF-16BE", bytes: new Uint8Array([0xfe, 0xff]) },
    { encoding: "UTF-16LE", bytes: new Uint8Array([0xff, 0xfe]) },
];

export function detectBOM(bytes: Uint8Array): BOMInfo | null {
    const definition = BOM_DEFINITIONS.find((item) =>
        item.bytes.every((byte, index) => bytes[index] === byte),
    );

    return definition
        ? {
              encoding: definition.encoding,
              bytes: copyBytes(definition.bytes),
          }
        : null;
}

export function analyzeBOM(bytes: Uint8Array): BOMAnalysis {
    const bom = detectBOM(bytes);
    const contentOffset = bom ? bom.bytes.length : 0;

    return {
        hasBOM: bom !== null,
        bom,
        contentOffset,
        contentBytes: bytes.slice(contentOffset),
    };
}

export function addBOM(
    bytes: Uint8Array,
    encoding: EncodingId,
): Uint8Array {
    const definition = BOM_DEFINITIONS.find(
        (item) => item.encoding.toLowerCase() === encoding.toLowerCase(),
    );

    if (!definition) {
        throw new Error(`BOM is not defined for encoding: ${encoding}`);
    }

    const existing = detectBOM(bytes);

    if (existing) {
        if (existing.encoding === definition.encoding) {
            return copyBytes(bytes);
        }

        throw new Error(`Bytes already contain a ${existing.encoding} BOM.`);
    }

    return concatBytes(definition.bytes, bytes);
}

export function removeBOM(bytes: Uint8Array): Uint8Array {
    const bom = detectBOM(bytes);

    return bom
        ? bytes.slice(bom.bytes.length)
        : copyBytes(bytes);
}
