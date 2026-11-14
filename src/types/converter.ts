import type { EncodingId } from "@/types/encoding";

export interface ConvertRequest {
    input: string;
    sourceEncoding: EncodingId;
    targetEncoding: EncodingId;
}

export interface ConversionError {
    code: string;
    message: string;
    details?: unknown;
}

export interface ConversionWarning {
    code: string;
    message: string;
    details?: unknown;
}

export interface ConvertResponse {
    success: boolean;
    output: string | null;
    sourceBytes: Uint8Array | null;
    hex: string | null;
    errors: ConversionError[];
    warnings: ConversionWarning[];
}
