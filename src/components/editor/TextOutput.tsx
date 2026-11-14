interface TextOutputProps {
    value: string | null;
}

export function TextOutput({ value }: TextOutputProps) {
    return (
        <textarea
            className="output-area"
            value={value ?? ""}
            readOnly
            placeholder={value === "" ? "（空文字列）" : "変換結果がここに表示されます"}
            aria-label="変換結果"
        />
    );
}