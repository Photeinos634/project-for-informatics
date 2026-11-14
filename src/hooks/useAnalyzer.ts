"use client";

import { useState } from "react";
import { analyzeText } from "@/services/analyzerService";
import type { AnalyzerResult } from "@/types/analyzer";

export function useAnalyzer() {
    const [input, setInputState] = useState("");
    const [result, setResult] = useState<AnalyzerResult | null>(null);

    const setInput = (value: string): void => {
        setInputState(value);
        setResult(null);
    };

    const analyze = (): void => {
        setResult(analyzeText(input));
    };

    const reset = (): void => {
        setInputState("");
        setResult(null);
    };

    return { input, setInput, result, analyze, reset };
}
