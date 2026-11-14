export type NewlineType = "CRLF" | "LF" | "CR" | "NONE";

export interface NewlineCounts {
    CRLF: number;
    LF: number;
    CR: number;
}

export function countNewlines(text: string): NewlineCounts {
    const matches = text.match(/\r\n|\r|\n/g) ?? [];
    return matches.reduce<NewlineCounts>(
        (counts, newline) => {
            if (newline === "\r\n") {
                counts.CRLF += 1;
            } else if (newline === "\r") {
                counts.CR += 1;
            } else {
                counts.LF += 1;
            }
            return counts;
        },
        { CRLF: 0, LF: 0, CR: 0 },
    );
}

export function detectNewline(text: string): NewlineType {
    const first = /\r\n|\r|\n/.exec(text)?.[0];
    if (first === "\r\n") {
        return "CRLF";
    }
    if (first === "\r") {
        return "CR";
    }
    return first === "\n" ? "LF" : "NONE";
}

export function convertNewlines(text: string, newline: Exclude<NewlineType, "NONE">): string {
    const replacement = newline === "CRLF" ? "\r\n" : newline === "CR" ? "\r" : "\n";
    return text.replace(/\r\n|\r|\n/g, replacement);
}
