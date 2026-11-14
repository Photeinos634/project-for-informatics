"use client";

import { useState } from "react";

export function useClipboard() {
    const [isCopied, setIsCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const copy = async (value: string): Promise<boolean> => {
        setIsCopied(false);
        setError(null);

        if (!navigator.clipboard?.writeText) {
            setError("このブラウザーではクリップボードへのコピーを利用できません。");
            return false;
        }

        try {
            await navigator.clipboard.writeText(value);
            setIsCopied(true);
            return true;
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? `コピーできませんでした: ${caught.message}`
                    : "コピーできませんでした。",
            );
            return false;
        }
    };

    return { copy, isCopied, error };
}
