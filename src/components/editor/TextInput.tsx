interface TextInputProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function TextInput({ value, onChange, disabled = false }: TextInputProps) {
    return (
        <label>
            <span className="field-label">入力テキスト</span>
            <textarea
                className="input-area"
                value={value}
                onChange={(event) => onChange(event.currentTarget.value)}
                placeholder="文字列を入力してください"
                spellCheck={false}
                disabled={disabled}
                aria-label="変換する文字列"
            />
        </label>
    );
}