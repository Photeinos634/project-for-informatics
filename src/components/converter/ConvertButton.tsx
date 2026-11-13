import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

interface ConvertButtonProps {
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    children?: ReactNode;
}

export function ConvertButton({
    onClick,
    disabled = false,
    loading = false,
    children = "変換する",
}: ConvertButtonProps) {
    return (
        <Button
            className="convert-button"
            onClick={onClick}
            disabled={disabled || loading}
            aria-busy={loading}
        >
            {loading ? "変換中..." : children}
        </Button>
    );
}