import { bytesToHex } from "@/lib/binary/hex";
import { initializeEncoding } from "@/lib/encoding/encodingInitializer";
import { resolveEncodingEngine } from "@/lib/encoding/encodingResolver";
import { createConversionError } from "@/lib/utils/errorHandler";
import { validateConvertRequest } from "@/lib/utils/validation";
import type {
    ConvertRequest,
    ConvertResponse,
    ConversionError,
} from "@/types/converter";

function failedResponse(errors: ConversionError[]): ConvertResponse {
    return {
        success: false,
        output: null,
        sourceBytes: null,
        hex: null,
        errors,
        warnings: [],
    };
}

export function convert(request: ConvertRequest): ConvertResponse {
    initializeEncoding();

    const validationErrors = validateConvertRequest(request);
    if (validationErrors.length > 0) {
        return failedResponse(validationErrors);
    }

    let sourceEngine;
    try {
        sourceEngine = resolveEncodingEngine(request.sourceEncoding, "encode");
    } catch (error) {
        return failedResponse([
            createConversionError(
                "SOURCE_ENGINE_UNAVAILABLE",
                error,
                "変換元の文字コードエンジンを利用できません。",
            ),
        ]);
    }

    let sourceBytes: Uint8Array;
    try {
        sourceBytes = sourceEngine.encode(request.input, request.sourceEncoding);
    } catch (error) {
        return failedResponse([
            createConversionError(
                "ENCODE_FAILED",
                error,
                "入力を変換元の文字コードでエンコードできませんでした。",
            ),
        ]);
    }

    let targetEngine;
    try {
        targetEngine = resolveEncodingEngine(request.targetEncoding, "decode");
    } catch (error) {
        return failedResponse([
            createConversionError(
                "TARGET_ENGINE_UNAVAILABLE",
                error,
                "変換先の文字コードエンジンを利用できません。",
            ),
        ]);
    }

    try {
        const output = targetEngine.decode(sourceBytes, request.targetEncoding);
        return {
            success: true,
            output,
            sourceBytes,
            hex: bytesToHex(sourceBytes),
            errors: [],
            warnings: [],
        };
    } catch (error) {
        return failedResponse([
            createConversionError(
                "DECODE_FAILED",
                error,
                "生成したバイト列を変換先の文字コードでデコードできませんでした。",
            ),
        ]);
    }
}
