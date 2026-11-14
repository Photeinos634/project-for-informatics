import { detectNewline } from "@/lib/binary/newline";
import { analyzeCodePoints } from "@/lib/unicode/codePoint";
import { analyzeCompatibility } from "@/lib/unicode/compatibility";
import { analyzeSurrogates } from "@/lib/unicode/surrogate";
import { analyzeVariationSelectors } from "@/lib/unicode/variationSelector";
import type { AnalyzerResult } from "@/types/analyzer";

export function analyzeText(input: string): AnalyzerResult {
    return {
        original: input,
        codePoints: analyzeCodePoints(input),
        compatibility: analyzeCompatibility(input),
        variationSelectors: analyzeVariationSelectors(input),
        surrogates: analyzeSurrogates(input),
        newline: detectNewline(input),
    };
}
