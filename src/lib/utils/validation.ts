import { getEncodingMetadata } from "@/lib/encoding/encodingMetadata";
import type { ConvertRequest, ConversionError } from "@/types/converter";

export function validateConvertRequest(request: ConvertRequest): ConversionError[] {
    const errors: ConversionError[] = [];

    if (typeof request.input !== "string") {
        errors.push({ code: "INVALID_INPUT", message: "入力は文字列である必要があります。" });
    }

    if (!request.sourceEncoding) {
        errors.push({ code: "SOURCE_ENCODING_REQUIRED", message: "変換元の文字コードを選択してください。" });
    } else {
        const source = getEncodingMetadata(request.sourceEncoding);
        if (!source) {
            errors.push({
                code: "UNSUPPORTED_SOURCE_ENCODING",
                message: `未対応の変換元文字コードです: ${request.sourceEncoding}`,
            });
        } else if (!source.capabilities.encode) {
            errors.push({
                code: "SOURCE_ENCODING_NOT_ENCODABLE",
                message: `変換元文字コードはエンコードに対応していません: ${source.label}`,
            });
        }
    }

    if (!request.targetEncoding) {
        errors.push({ code: "TARGET_ENCODING_REQUIRED", message: "変換先の文字コードを選択してください。" });
    } else {
        const target = getEncodingMetadata(request.targetEncoding);
        if (!target) {
            errors.push({
                code: "UNSUPPORTED_TARGET_ENCODING",
                message: `未対応の変換先文字コードです: ${request.targetEncoding}`,
            });
        } else if (!target.capabilities.decode) {
            errors.push({
                code: "TARGET_ENCODING_NOT_DECODABLE",
                message: `変換先文字コードはデコードに対応していません: ${target.label}`,
            });
        }
    }

    return errors;
}
