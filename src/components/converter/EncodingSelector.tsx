import type { EncodingDefinition } from "@/types/encoding";

interface EncodingSelectorProps {
    label: string;
    value: string;
    encodings: EncodingDefinition[];
    operation: "encode" | "decode";
    onChange: (value: string) => void;
}

export function EncodingSelector({
    label,
    value,
    encodings,
    operation,
    onChange,
}: EncodingSelectorProps) {
    const supportedEncodings = encodings.filter(
        (encoding) => encoding.capabilities[operation],
    );

    return (
        <label>
            <span className="field-label">{label}</span>
            <select
                className="encoding-select"
                value={value}
                onChange={(event) => onChange(event.currentTarget.value)}
                disabled={supportedEncodings.length === 0}
                aria-label={`${label}文字コード`}
            >
                {supportedEncodings.length === 0 ? (
                    <option value="">利用可能な文字コードがありません</option>
                ) : (
                    <>
                        {value === "" && (
                            <option value="" disabled>
                                選択してください
                            </option>
                        )}
                        {supportedEncodings.map((encoding) => (
                            <option key={encoding.id} value={encoding.id}>
                                {encoding.label}
                            </option>
                        ))}
                    </>
                )}
            </select>
        </label>
    );
}