import { describe, expect, it } from "vitest";

import {
    addBOM,
    analyzeBOM,
    detectBOM,
    removeBOM,
} from "@/lib/binary/bom";

import {
    concatBytes,
    copyBytes,
    equalBytes,
} from "@/lib/binary/byteUtils";

import {
    bytesToHex,
    hexToBytes,
} from "@/lib/binary/hex";

import {
    convertNewlines,
    countNewlines,
    detectNewline,
} from "@/lib/binary/newline";

describe("binary utilities", () => {
    describe("HEX conversion", () => {
        it("converts bytes to uppercase spaced HEX and back", () => {
            const bytes = new Uint8Array([0x00, 0xab, 0xff]);

            expect(bytesToHex(bytes)).toBe("00 AB FF");
            expect(hexToBytes("00 ab\nFF")).toEqual(bytes);
            expect(hexToBytes("")).toEqual(new Uint8Array());
        });

        it("accepts spaces, tabs, and newlines", () => {
            expect(hexToBytes("41 42\t43\r\n44")).toEqual(
                new Uint8Array([0x41, 0x42, 0x43, 0x44]),
            );
        });

        it("accepts mixed uppercase and lowercase digits", () => {
            expect(hexToBytes("aB Cd eF")).toEqual(
                new Uint8Array([0xab, 0xcd, 0xef]),
            );
        });

        it("preserves bytes through a HEX round trip", () => {
            const original = new Uint8Array([
                0x00, 0x01, 0x7f, 0x80, 0xab, 0xff,
            ]);

            const hex = bytesToHex(original);
            const restored = hexToBytes(hex);

            expect(restored).toEqual(original);
        });

        it("rejects malformed HEX input", () => {
            expect(() => hexToBytes("0G")).toThrow(/non-hexadecimal/);
            expect(() => hexToBytes("ABC")).toThrow(/even number/);
        });
    });

    describe("BOM utilities", () => {
        it("detects, adds, and removes BOM without mutating input", () => {
            const bytes = new Uint8Array([0x41]);
            const withBom = addBOM(bytes, "UTF-8");

            expect(bytes).toEqual(new Uint8Array([0x41]));

            expect(detectBOM(withBom)).toEqual({
                encoding: "UTF-8",
                bytes: new Uint8Array([0xef, 0xbb, 0xbf]),
            });

            expect(addBOM(withBom, "UTF-8")).toEqual(withBom);

            expect(() => addBOM(withBom, "UTF-16LE")).toThrow(
                /already contain a UTF-8 BOM/,
            );

            expect(removeBOM(withBom)).toEqual(bytes);

            expect(
                detectBOM(new Uint8Array([0xff, 0xfe, 0x00, 0x00]))?.encoding,
            ).toBe("UTF-32LE");
        });
    });

    describe("analyzeBOM", () => {
        it("analyzes a UTF-8 BOM and returns the content bytes", () => {
            const bytes = new Uint8Array([
                0xef, 0xbb, 0xbf, 0x41, 0x42,
            ]);

            const result = analyzeBOM(bytes);

            expect(result.hasBOM).toBe(true);
            expect(result.bom?.encoding).toBe("UTF-8");
            expect(result.contentOffset).toBe(3);
            expect(result.contentBytes).toEqual(
                new Uint8Array([0x41, 0x42]),
            );
        });

        it("returns the entire byte sequence when no BOM exists", () => {
            const bytes = new Uint8Array([0x41, 0x42]);

            const result = analyzeBOM(bytes);

            expect(result.hasBOM).toBe(false);
            expect(result.bom).toBeNull();
            expect(result.contentOffset).toBe(0);
            expect(result.contentBytes).toEqual(bytes);
        });

        it("does not mutate the original byte sequence", () => {
            const bytes = new Uint8Array([
                0xef, 0xbb, 0xbf, 0x41,
            ]);
            const original = bytes.slice();

            analyzeBOM(bytes);

            expect(bytes).toEqual(original);
        });

        it("returns an independent content byte array", () => {
            const bytes = new Uint8Array([
                0xef, 0xbb, 0xbf, 0x41,
            ]);

            const result = analyzeBOM(bytes);
            result.contentBytes[0] = 0x42;

            expect(bytes[3]).toBe(0x41);
        });

        it("detects UTF-32LE before UTF-16LE", () => {
            const bytes = new Uint8Array([
                0xff, 0xfe, 0x00, 0x00, 0x41,
            ]);

            const result = analyzeBOM(bytes);

            expect(result.bom?.encoding).toBe("UTF-32LE");
            expect(result.contentOffset).toBe(4);
            expect(result.contentBytes).toEqual(
                new Uint8Array([0x41]),
            );
        });
    });

    describe("Byte utilities", () => {
        it("copies, concatenates, and compares byte arrays", () => {
            const original = new Uint8Array([1, 2]);
            const copy = copyBytes(original);

            expect(copy).not.toBe(original);
            expect(equalBytes(copy, original)).toBe(true);

            expect(
                concatBytes(original, new Uint8Array([3])),
            ).toEqual(new Uint8Array([1, 2, 3]));

            expect(equalBytes(copy, new Uint8Array([1, 3]))).toBe(false);
        });
    });

    describe("Newline utilities", () => {
        it("detects, counts, and converts mixed newline sequences", () => {
            expect(detectNewline("a\r\nb\nc")).toBe("CRLF");

            expect(countNewlines("a\r\nb\nc\r")).toEqual({
                CRLF: 1,
                LF: 1,
                CR: 1,
            });

            expect(convertNewlines("a\r\nb\nc\r", "LF")).toBe(
                "a\nb\nc\n",
            );

            expect(detectNewline("no newline")).toBe("NONE");
        });
    });
});
