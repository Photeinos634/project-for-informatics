import type { CharacterMapping } from "@/types/platform";

export function mapCharacterChanges(
    original: string,
    result: string,
): CharacterMapping[] {
    const sourceCharacters = Array.from(original);
    const resultCharacters = Array.from(result);
    const length = Math.max(sourceCharacters.length, resultCharacters.length);

    return Array.from({ length }, (_, index) => {
        const source = sourceCharacters[index] ?? null;
        const output = resultCharacters[index] ?? null;
        return {
            index,
            original: source,
            result: output,
            changed: source !== output,
        };
    });
}
