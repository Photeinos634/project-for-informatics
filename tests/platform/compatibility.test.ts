import { describe, expect, it } from "vitest";
import { getPlatformPresets } from "@/lib/platform/presets";
import { analyzeCompatibility } from "@/services/compatibilityService";

describe("platform compatibility", () => {
    it("runs configured presets and reports whether text changes", () => {
        const presets = getPlatformPresets();
        const report = analyzeCompatibility("こんにちは\r\n", presets);

        expect(report.results).toHaveLength(presets.length);
        expect(report.results.every((result) => result.supported)).toBe(true);
        expect(report.results.find((result) => result.platform === "windows-example")?.unchanged)
            .toBe(true);
        expect(report.results.find((result) => result.platform === "macos-example")?.unchanged)
            .toBe(false);
        expect(report.characterMappings["windows-example"]).toBeDefined();
    });

    it("reports unsupported encodings without claiming success", () => {
        const report = analyzeCompatibility("text", [{
            id: "unsupported",
            label: "Unsupported",
            description: "Test-only unsupported encoding",
            encoding: "NOT-AN-ENCODING",
            newline: "LF",
        }]);

        expect(report.results[0]?.supported).toBe(false);
        expect(report.results[0]?.errors).toHaveLength(1);
        expect(report.results[0]?.decoded).toBeUndefined();
    });
});
