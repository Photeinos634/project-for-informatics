import type { ReactNode } from "react";

interface CardProps {
    title: string;
    description?: string;
    eyebrow?: string;
    children: ReactNode;
    className?: string;
}

export function Card({
    title,
    description,
    eyebrow,
    children,
    className,
}: CardProps) {
    const classes = ["card", className].filter(Boolean).join(" ");

    return (
        <section className={classes} aria-label={title}>
            <div className="card__header">
                <div>
                    {eyebrow && <p className="eyebrow">{eyebrow}</p>}
                    <h2 className="card__title">{title}</h2>
                    {description && <p className="card__description">{description}</p>}
                </div>
            </div>
            {children}
        </section>
    );
}