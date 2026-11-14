import type { EncodingId, NormalizationForm } from "@/types/encoding";
import type { NewlineType } from "@/lib/binary/newline";
import type { ConversionError, ConversionWarning } from "@/types/converter";

export type PlatformId = string;

export interface PlatformPreset {
    id: PlatformId;
    label: string;
    description: string;
    encoding: EncodingId;
    newline: NewlineType;
    normalization?: NormalizationForm;
}

export interface CompatibilityResult {
    platform: PlatformId;
    supported: boolean;
    original: string;
    encodedBytes?: Uint8Array;
    decoded?: string;
    unchanged?: boolean;
    warnings: ConversionWarning[];
    errors: ConversionError[];
}

export interface CharacterMapping {
    index: number;
    original: string | null;
    result: string | null;
    changed: boolean;
}
