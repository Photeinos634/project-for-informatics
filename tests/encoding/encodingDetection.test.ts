import { beforeAll, describe, expect, it } from "vitest";
import { addBOM } from "@/lib/binary/bom";
import { detectEncoding } from "@/lib/encoding/encodingDetection";
import { initializeEncoding } from "@/lib/encoding/encodingInitializer";

beforeAll(() => {
    initializeEncoding();
});

describe("detectEncoding", () => {
    it("UTF-8 BOMを最優先で検出する", () => {
        const body = new TextEncoder().encode("こんにちは");
        const bytes = addBOM(body, "UTF-8");

        const result = detectEncoding(bytes);

        expect(result.detectedBOM?.encoding).toBe("UTF-8");
        expect(result.candidates[0]?.encoding).toBe("UTF-8");
        expect(result.isReliable).toBe(true);
    });

    it("UTF-16LE BOMを検出する", () => {
        const bytes = new Uint8Array([
            0xff, 0xfe,
            0x41, 0x00,
        ]);

        const result = detectEncoding(bytes);

        expect(result.detectedBOM?.encoding).toBe("UTF-16LE");
        expect(result.candidates[0]?.encoding).toBe("UTF-16LE");
        expect(result.isReliable).toBe(true);
    });

    it("UTF-16BE BOMを検出する", () => {
        const bytes = new Uint8Array([
            0xfe, 0xff,
            0x00, 0x41,
        ]);

        const result = detectEncoding(bytes);

        expect(result.detectedBOM?.encoding).toBe("UTF-16BE");
        expect(result.candidates[0]?.encoding).toBe("UTF-16BE");
        expect(result.isReliable).toBe(true);
    });

    it("正常なUTF-8日本語を検出する", () => {
        const bytes = new TextEncoder().encode("こんにちは");

        const result = detectEncoding(bytes);

        expect(result.candidates[0]?.encoding).toBe("UTF-8");
        expect(result.isReliable).toBe(true);
    });

    it("ASCIIのみのデータは判定しない", () => {
        const bytes = new TextEncoder().encode("Hello World");

        const result = detectEncoding(bytes);

        expect(result.candidates).toEqual([]);
        expect(result.isReliable).toBe(false);
        expect(result.warnings.length).toBeGreaterThan(0);
    });

    it("空のデータは判定しない", () => {
        const result = detectEncoding(new Uint8Array());

        expect(result.candidates).toEqual([]);
        expect(result.isReliable).toBe(false);
    });

    it("UTF-8として不正なデータをUTF-8候補にしない", () => {
        const bytes = new Uint8Array([0x82, 0xa0]);

        const result = detectEncoding(bytes);

        expect(
            result.candidates.some(
                (candidate) => candidate.encoding === "UTF-8",
            ),
        ).toBe(false);
    });

    it("入力バイト列を変更しない", () => {
        const bytes = new TextEncoder().encode("こんにちは");
        const original = bytes.slice();

        detectEncoding(bytes);

        expect(bytes).toEqual(original);
    });

    it("候補は登録済みの文字コードだけにする", () => {
        const bytes = new TextEncoder().encode("こんにちは");

        const result = detectEncoding(bytes);
        const registered = [
            "UTF-8",
            "Windows-31J",
            "EUC-JP",
            "ISO-2022-JP",
            "UTF-16LE",
            "UTF-16BE",
        ];

        for (const candidate of result.candidates) {
            expect(registered).toContain(candidate.encoding);
        }
    });
});
