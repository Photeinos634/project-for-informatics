import type { ReactNode } from "react";
import type { EncodingDefinition } from "@/types/encoding";
import { EncodingSelector } from "@/components/converter/EncodingSelector";
import { TextInput } from "@/components/editor/TextInput";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface EditorPanelProps {
    input: string;
    onInputChange: (value: string) => void;
    sourceEncoding: string;
    onSourceEncodingChange: (value: string) => void;
    targetEncoding: string;
    onTargetEncodingChange: (value: string) => void;
    encodings: EncodingDefinition[];
    onReset: () => void;
    convertButton: ReactNode;
}

export function EditorPanel({
    input,
    onInputChange,
    sourceEncoding,
    onSourceEncodingChange,
    targetEncoding,
    onTargetEncodingChange,
    encodings,
    onReset,
    convertButton,
}: EditorPanelProps) {
    return (
        <div className="editor-panel">
            <Card
                title="変換する文字列"
                description="入力した文字列は、選択した文字コードでバイト列に変換されます。"
            >
                <TextInput value={input} onChange={onInputChange} />
                <div className="editor-actions">
                    <Button
                        variant="secondary"
                        onClick={onReset}
                        disabled={!input && !sourceEncoding && !targetEncoding}
                    >
                        入力をリセット
                    </Button>
                </div>
            </Card>

            <Card
                title="文字コード"
                description="元の文字コードで生成した同じバイト列を、変換先として読み直します。"
            >
                <div className="encoding-grid">
                    <EncodingSelector
                        label="変換元"
                        value={sourceEncoding}
                        encodings={encodings}
                        operation="encode"
                        onChange={onSourceEncodingChange}
                    />
                    <span className="encoding-arrow" aria-hidden="true">
                        →
                    </span>
                    <EncodingSelector
                        label="変換先"
                        value={targetEncoding}
                        encodings={encodings}
                        operation="decode"
                        onChange={onTargetEncodingChange}
                    />
                </div>
                <p className="encoding-help">
                    変換先では再エンコードせず、元の文字列から生成したバイト列をそのままデコードします。
                </p>
                <div className="editor-actions">{convertButton}</div>
            </Card>
        </div>
    );
}