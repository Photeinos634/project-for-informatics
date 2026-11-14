import { convertNewlines } from "@/lib/binary/newline";
import { initializeEncoding } from "@/lib/encoding/encodingInitializer";
import { resolveEncodingEngine } from "@/lib/encoding/encodingResolver";
import { normalizeText } from "@/lib/unicode/normalization";
import type { CompatibilityResult, PlatformPreset } from "@/types/platform";

export function checkCompatibility(
    input: string,
    preset: PlatformPreset,
): CompatibilityResult {
    initializeEncoding();
    const candidate = preset.normalization
        ? normalizeText(input, preset.normalization)
        : input;
    const prepared =
        preset.newline === "NONE" ? candidate : convertNewlines(candidate, preset.newline);

    try {
        const encoder = resolveEncodingEngine(preset.encoding, "encode");
        const encodedBytes = encoder.encode(prepared, preset.encoding);
        const decoder = resolveEncodingEngine(preset.encoding, "decode");
        const decoded = decoder.decode(encodedBytes, preset.encoding);
        const unchanged = decoded === input;

        return {
            platform: preset.id,
            supported: true,
            original: input,
            encodedBytes,
            decoded,
            unchanged,
            warnings: unchanged
                ? []
                : [{
                      code: "TEXT_CHANGED",
                      message: "指定した設定で処理すると元の文字列と異なる結果になります。",
                  }],
            errors: [],
        };
    } catch (error) {
        return {
            platform: preset.id,
            supported: false,
            original: input,
            warnings: [],
            errors: [{
                code: "COMPATIBILITY_CHECK_FAILED",
                message: error instanceof Error
                    ? error.message
                    : "この設定で文字列を処理できませんでした。",
            }],
        };
    }
}

export function checkAllCompatibility(
    input: string,
    presets: PlatformPreset[],
): CompatibilityResult[] {
    return presets.map((preset) => checkCompatibility(input, preset));
}
