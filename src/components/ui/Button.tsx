import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
}

export function Button({
    variant = "primary",
    className,
    type = "button",
    ...props
}: ButtonProps) {
    const classes = ["button", `button--${variant}`, className]
        .filter(Boolean)
        .join(" ");

    return <button className={classes} type={type} {...props} />;
}