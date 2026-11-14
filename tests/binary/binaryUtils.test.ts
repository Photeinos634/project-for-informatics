import { describe, expect, it } from "vitest";
import { addBOM, detectBOM, removeBOM } from "@/lib/binary/bom";
import { concatBytes, copyBytes, equalBytes } from "@/lib/binary/byteUtils";
import { bytesToHex, hexToBytes } from "@/lib/binary/hex";
import { convertNewlines, countNewlines, detectNewline } from "@/lib/binary/newline";

describe("binary utilities", () => {
    it("converts bytes to uppercase spaced HEX and back", () => {
        const bytes = new Uint8Array([0x00, 0xab, 0xff]);
        expect(bytesToHex(bytes)).toBe("00 AB FF");
        expect(hexToBytes("00 ab\nFF")).toEqual(bytes);
        expect(hexToBytes("")).toEqual(new Uint8Array());
    });

    it("rejects malformed HEX input", () => {
        expect(() => hexToBytes("0G")).toThrow(/non-hexadecimal/);
        expect(() => hexToBytes("ABC")).toThrow(/even number/);
    });

    it("detects, adds, and removes BOM without mutating input", () => {
        const bytes = new Uint8Array([0x41]);
        const withBom = addBOM(bytes, "UTF-8");
        expect(bytes).toEqual(new Uint8Array([0x41]));
        expect(detectBOM(withBom)).toEqual({
            encoding: "UTF-8",
            bytes: new Uint8Array([0xef, 0xbb, 0xbf]),
        });
        expect(addBOM(withBom, "UTF-8")).toEqual(withBom);
        expect(() => addBOM(withBom, "UTF-16LE")).toThrow(/already contain a UTF-8 BOM/);
        expect(removeBOM(withBom)).toEqual(bytes);
        expect(detectBOM(new Uint8Array([0xff, 0xfe, 0x00, 0x00]))?.encoding)
            .toBe("UTF-32LE");
    });

    it("copies, concatenates, and compares byte arrays", () => {
        const original = new Uint8Array([1, 2]);
        const copy = copyBytes(original);
        expect(copy).not.toBe(original);
        expect(equalBytes(copy, original)).toBe(true);
        expect(concatBytes(original, new Uint8Array([3]))).toEqual(new Uint8Array([1, 2, 3]));
        expect(equalBytes(copy, new Uint8Array([1, 3]))).toBe(false);
    });

    it("detects, counts, and converts mixed newline sequences", () => {
        expect(detectNewline("a\r\nb\nc")).toBe("CRLF");
        expect(countNewlines("a\r\nb\nc\r")).toEqual({ CRLF: 1, LF: 1, CR: 1 });
        expect(convertNewlines("a\r\nb\nc\r", "LF")).toBe("a\nb\nc\n");
        expect(detectNewline("no newline")).toBe("NONE");
    });
});
