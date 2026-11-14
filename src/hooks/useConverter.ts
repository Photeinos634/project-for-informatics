"use client";

import { useState } from "react";
import { getAllEncodingMetadata } from "@/lib/encoding/encodingMetadata";
import { initializeEncoding } from "@/lib/encoding/encodingInitializer";
import { convert } from "@/services/converterService";
import type { EncodingDefinition } from "@/types/encoding";
import type { ConvertResponse } from "@/types/converter";

initializeEncoding();
const availableEncodings: EncodingDefinition[] = getAllEncodingMetadata();

export function useConverter() {
    const [input, setInputState] = useState("");
    const [sourceEncoding, setSourceEncodingState] = useState("");
    const [targetEncoding, setTargetEncodingState] = useState("");
    const [result, setResult] = useState<ConvertResponse | null>(null);
    const [isConverting, setIsConverting] = useState(false);

    const setInput = (value: string): void => {
        setInputState(value);
        setResult(null);
    };

    const setSourceEncoding = (encoding: string): void => {
        setSourceEncodingState(encoding);
        setResult(null);
    };

    const setTargetEncoding = (encoding: string): void => {
        setTargetEncodingState(encoding);
        setResult(null);
    };

    const runConversion = (): void => {
        setIsConverting(true);
        try {
            setResult(convert({ input, sourceEncoding, targetEncoding }));
        } finally {
            setIsConverting(false);
        }
    };

    const reset = (): void => {
        setInputState("");
        setSourceEncodingState("");
        setTargetEncodingState("");
        setResult(null);
    };

    return {
        input,
        setInput,
        sourceEncoding,
        setSourceEncoding,
        targetEncoding,
        setTargetEncoding,
        result,
        isConverting,
        encodings: availableEncodings,
        convert: runConversion,
        reset,
    };
}
