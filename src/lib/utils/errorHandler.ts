import type { ConversionError } from "@/types/converter";

export function createConversionError(
    code: string,
    error: unknown,
    fallbackMessage: string,
): ConversionError {
    const message = error instanceof Error ? error.message : fallbackMessage;
    return { code, message };
}
