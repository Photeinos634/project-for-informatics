import { HexViewer } from "@/components/converter/HexViewer";
import { TextOutput } from "@/components/editor/TextOutput";
import { Card } from "@/components/ui/Card";

interface ConversionMessage {
    code?: string;
    message: string;
}

interface ConversionResultProps {
    output: string | null;
    hex: string | null;
    errors: ConversionMessage[];
    warnings: ConversionMessage[];
    onCopyOutput?: () => void;
    onCopyHex?: () => void;
}

export function ConversionResult({
    output,
    hex,
    errors,
    warnings,
    onCopyOutput,
    onCopyHex,
}: ConversionResultProps) {
    return (
        <div className="result-panel">
            {(errors.length > 0 || warnings.length > 0) && (
                <div className="message-list" aria-live="polite">
                    {errors.map((error, index) => (
                        <p
                            className="message message--error"
                            key={`${error.code ?? "error"}-${error.message}-${index}`}
                            role="alert"
                        >
                            {error.message}
                        </p>
                    ))}
                    {warnings.map((warning, index) => (
                        <p
                            className="message message--warning"
                            key={`${warning.code ?? "warning"}-${warning.message}-${index}`}
                        >
                            {warning.message}
                        </p>
                    ))}
                </div>
            )}

            <Card title="変換結果" description="変換先の文字コードとしてデコードした結果">
                {output === null ? (
                    <div className="empty-result">変換結果はここに表示されます</div>
                ) : (
                    <>
                        <TextOutput value={output} />
                        <div className="copy-actions">
                            <button
                                className="button button--secondary"
                                type="button"
                                onClick={onCopyOutput}
                                disabled={!onCopyOutput}
                            >
                                結果をコピー
                            </button>
                        </div>
                    </>
                )}
            </Card>

            <Card title="中間バイト列" description="変換元の文字コードで生成したバイト列のHEX表記">
                <HexViewer value={hex} onCopy={onCopyHex} />
            </Card>
        </div>
    );
}