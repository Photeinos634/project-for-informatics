import { beforeAll, describe, expect, it } from "vitest";
import { suggestRepairCandidates } from "@/lib/encoding/repairCandidates";
import { initializeEncoding } from "@/lib/encoding/encodingInitializer";

beforeAll(() => {
    initializeEncoding();
});

describe("suggestRepairCandidates", () => {
    it("UTF-8の日本語から修復候補を生成する", () => {
        const bytes = new TextEncoder().encode("こんにちは");
        const result = suggestRepairCandidates(bytes, ["UTF-8"]);

        expect(result.candidates.length).toBe(1);
        expect(result.candidates[0].output).toBe("こんにちは");
        expect(result.candidates[0].targetEncoding).toBe("UTF-8");
    });

    it("複数の文字コードを候補として調べる", () => {
        const bytes = new TextEncoder().encode("こんにちは");
        const result = suggestRepairCandidates(
            bytes,
            ["UTF-8", "Windows-31J", "EUC-JP"],
        );

        expect(result.candidates.length).toBeGreaterThan(0);
    });

    it("不正なUTF-8バイト列を除外する", () => {
        const bytes = new Uint8Array([0xff, 0xff]);
        const result = suggestRepairCandidates(bytes, ["UTF-8"]);

        expect(result.candidates).toEqual([]);
        expect(result.warnings.length).toBeGreaterThan(0);
    });

    it("空の入力を警告する", () => {
        const result = suggestRepairCandidates(new Uint8Array());

        expect(result.candidates).toEqual([]);
        expect(result.warnings.length).toBeGreaterThan(0);
    });

    it("未登録の文字コードを候補にしない", () => {
        const bytes = new TextEncoder().encode("こんにちは");
        const result = suggestRepairCandidates(bytes, ["UNKNOWN-ENCODING"]);

        expect(result.candidates).toEqual([]);
        expect(result.warnings.length).toBeGreaterThan(0);
    });

    it("入力バイト列を変更しない", () => {
        const bytes = new TextEncoder().encode("こんにちは");
        const original = bytes.slice();

        suggestRepairCandidates(bytes);

        expect(bytes).toEqual(original);
    });

    it("BOM情報を返す", () => {
        const bytes = new Uint8Array([0xef, 0xbb, 0xbf, 0x41]);
        const result = suggestRepairCandidates(bytes, ["UTF-8"]);

        expect(result.detectedBOM?.encoding).toBe("UTF-8");
        expect(result.candidates[0]?.output).toBe("A");
    });

    it("候補のスコアを0から1の範囲で返す", () => {
        const bytes = new TextEncoder().encode("こんにちは");
        const result = suggestRepairCandidates(bytes, ["UTF-8"]);

        expect(result.candidates[0].confidence).toBeGreaterThanOrEqual(0);
        expect(result.candidates[0].confidence).toBeLessThanOrEqual(1);
    });
});
