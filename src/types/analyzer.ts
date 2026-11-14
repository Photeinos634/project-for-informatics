import type { CodePointInfo } from "@/lib/unicode/codePoint";
import type { CompatibilityInfo } from "@/lib/unicode/compatibility";
import type { SurrogateInfo } from "@/lib/unicode/surrogate";
import type { VariationSelectorInfo } from "@/lib/unicode/variationSelector";
import type { NewlineType } from "@/lib/binary/newline";

export interface AnalyzerResult {
    original: string;
    codePoints: CodePointInfo[];
    compatibility: CompatibilityInfo[];
    variationSelectors: VariationSelectorInfo[];
    surrogates: SurrogateInfo[];
    newline: NewlineType;
}
