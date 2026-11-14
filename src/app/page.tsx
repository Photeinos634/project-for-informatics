"use client";

import { ConvertButton } from "@/components/converter/ConvertButton";
import { ConversionResult } from "@/components/converter/ConversionResult";
import { EditorPanel } from "@/components/editor/EditorPanel";
import { useClipboard } from "@/hooks/useClipboard";
import { useConverter } from "@/hooks/useConverter";

export default function Home() {
    const {
        input,
        setInput,
        sourceEncoding,
        setSourceEncoding,
        targetEncoding,
        setTargetEncoding,
        result,
        isConverting,
        encodings,
        convert,
        reset,
    } = useConverter();
    const clipboard = useClipboard();
    const output = result?.success ? result.output : null;
    const hex = result?.success ? result.hex : null;

    return (
        <div className="page-container">
            <section className="page-intro" aria-labelledby="page-title">
                <p className="eyebrow">文字コード再解釈ツール</p>
                <h1 id="page-title">文字化け直し</h1>
                <p>
                    入力した文字列を文字コードのバイト列として捉え直し、
                    表示の変化を確認できます。
                </p>
            </section>

            <div className="integration-notice" role="status">
                <span className="status-dot" aria-hidden="true" />
                入力内容はこの画面内で処理され、外部へ送信されません。
            </div>

            <EditorPanel
                input={input}
                onInputChange={setInput}
                sourceEncoding={sourceEncoding}
                onSourceEncodingChange={setSourceEncoding}
                targetEncoding={targetEncoding}
                onTargetEncodingChange={setTargetEncoding}
                encodings={encodings}
                onReset={reset}
                convertButton={
                    <ConvertButton
                        onClick={convert}
                        disabled={!sourceEncoding || !targetEncoding}
                        loading={isConverting}
                    >
                        変換する
                    </ConvertButton>
                }
            />

            <ConversionResult
                output={output}
                hex={hex}
                errors={result?.errors ?? []}
                warnings={result?.warnings ?? []}
                onCopyOutput={
                    output !== null
                        ? () => void clipboard.copy(output)
                        : undefined
                }
                onCopyHex={
                    hex !== null
                        ? () => void clipboard.copy(hex)
                        : undefined
                }
            />
            {clipboard.error && (
                <p className="message message--error" role="alert">
                    {clipboard.error}
                </p>
            )}
            {clipboard.isCopied && (
                <p className="message message--success" role="status">
                    クリップボードにコピーしました。
                </p>
            )}
        </div>
    );
}
//