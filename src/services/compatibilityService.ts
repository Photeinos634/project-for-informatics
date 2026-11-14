import { mapCharacterChanges } from "@/lib/platform/characterMapping";
import { checkAllCompatibility } from "@/lib/platform/compatibilityCheck";
import { getPlatformPresets } from "@/lib/platform/presets";
import type { CompatibilityResult, PlatformPreset } from "@/types/platform";

export interface CompatibilityReport {
    results: CompatibilityResult[];
    characterMappings: Record<string, ReturnType<typeof mapCharacterChanges>>;
}

export function analyzeCompatibility(
    input: string,
    presets: PlatformPreset[] = getPlatformPresets(),
): CompatibilityReport {
    const results = checkAllCompatibility(input, presets);
    const characterMappings = Object.fromEntries(
        results.flatMap((result) =>
            result.decoded === undefined
                ? []
                : [[result.platform, mapCharacterChanges(input, result.decoded)]],
        ),
    );

    return { results, characterMappings };
}
