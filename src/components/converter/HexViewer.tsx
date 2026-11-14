import { Button } from "@/components/ui/Button";

interface HexViewerProps {
    value: string | null;
    onCopy?: () => void;
}

export function HexViewer({ value, onCopy }: HexViewerProps) {
    return (
        <div>
            <div className="card__header">
                <div>
                    <h3 className="card__title">HEX</h3>
                    <p className="card__description">エンコードで生成された実際のバイト列</p>
                </div>
                <Button
                    variant="secondary"
                    onClick={onCopy}
                    disabled={value === null || !onCopy}
                    aria-label="HEXをコピー"
                >
                    HEXをコピー
                </Button>
            </div>
            <pre className="hex-value" aria-label="生成されたバイト列のHEX表示">
                {value === null ? "変換するとバイト列が表示されます" : value}
            </pre>
        </div>
    );
}