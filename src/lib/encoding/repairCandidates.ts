import { analyzeBOM } from "@/lib/binary/bom";
import { bytesToHex } from "@/lib/binary/hex";
import { initializeEncoding } from "@/lib/encoding/encodingInitializer";
import { getAllEncodings } from "@/lib/encoding/encodingRegistry";
import { resolveEncodingEngine } from "@/lib/encoding/encodingResolver";
import type { EncodingId } from "@/types/encoding";
import type {
    ConversionError,
    ConversionWarning,
} from "@/types/converter";

export interface RepairCandidate {
    sourceEncoding: EncodingId;
    targetEncoding: EncodingId;
    output: string;
    hex: string;
    confidence: number;
    explanation: string[];
}

export interface RepairResponse {
    candidates: RepairCandidate[];
    detectedBOM: ReturnType<typeof analyzeBOM>["bom"];
    warnings: ConversionWarning[];
    errors: ConversionError[];
}

function normalizeEncoding(encoding: string): string {
    return encoding.toLowerCase().replace(/[-_\s]/g, "");
}

function isValidUtf8(bytes: Uint8Array): boolean {
    try {
        new TextDecoder("utf-8", { fatal: true }).decode(bytes);
        return true;
    } catch {
        return false;
    }
}

function isValidWindows31J(bytes: Uint8Array): boolean {
    for (let i = 0; i < bytes.length; i++) {
        const byte = bytes[i];

        if (byte <= 0x7f || (byte >= 0xa1 && byte <= 0xdf)) continue;

        const lead =
            (byte >= 0x81 && byte <= 0x9f) ||
            (byte >= 0xe0 && byte <= 0xfc);

        if (!lead || i + 1 >= bytes.length) return false;

        const trail = bytes[++i];
        if (
            !((trail >= 0x40 && trail <= 0x7e) ||
              (trail >= 0x80 && trail <= 0xfc))
        ) return false;
    }

    return true;
}

function isValidEucJp(bytes: Uint8Array): boolean {
    for (let i = 0; i < bytes.length; i++) {
        const byte = bytes[i];

        if (byte <= 0x7f) continue;

        if (byte === 0x8e) {
            if (i + 1 >= bytes.length) return false;
            const next = bytes[++i];
            if (next < 0xa1 || next > 0xdf) return false;
            continue;
        }

        if (byte === 0x8f) {
            if (i + 2 >= bytes.length) return false;
            const second = bytes[++i];
            const third = bytes[++i];
            if (
                second < 0xa1 || second > 0xfe ||
                third < 0xa1 || third > 0xfe
            ) return false;
            continue;
        }

        if (byte >= 0xa1 && byte <= 0xfe) {
            if (i + 1 >= bytes.length) return false;
            const next = bytes[++i];
            if (next < 0xa1 || next > 0xfe) return false;
            continue;
        }

        return false;
    }

    return true;
}

function isValidIso2022Jp(bytes: Uint8Array): boolean {
    let jisMode = false;
    let hasEscape = false;
    let jisBytes = 0;

    for (let i = 0; i < bytes.length; i++) {
        const byte = bytes[i];

        if (byte === 0x1b) {
            if (i + 2 >= bytes.length) return false;

            const second = bytes[i + 1];
            const third = bytes[i + 2];

            const enterJis =
                second === 0x24 && (third === 0x40 || third === 0x42);
            const enterAscii =
                second === 0x28 && (third === 0x42 || third === 0x4a);

            if (!enterJis && !enterAscii) return false;

            jisMode = enterJis;
            hasEscape = true;
            i += 2;
            continue;
        }

        if (byte > 0x7f) return false;

        if (jisMode) {
            if (byte < 0x21 || byte > 0x7e) return false;
            jisBytes++;
        }
    }

    return hasEscape && jisBytes > 0 && jisBytes % 2 === 0;
}

function isValidUtf16(bytes: Uint8Array, littleEndian: boolean): boolean {
    if (bytes.length === 0 || bytes.length % 2 !== 0) return false;

    const readUnit = (index: number): number => {
        const first = bytes[index];
        const second = bytes[index + 1];

        return littleEndian
            ? first | (second << 8)
            : (first << 8) | second;
    };

    for (let i = 0; i < bytes.length; i += 2) {
        const unit = readUnit(i);

        if (unit >= 0xd800 && unit <= 0xdbff) {
            if (i + 3 >= bytes.length) return false;
            const next = readUnit(i + 2);
            if (next < 0xdc00 || next > 0xdfff) return false;
            i += 2;
        } else if (unit >= 0xdc00 && unit <= 0xdfff) {
            return false;
        }
    }

    return true;
}

function isStructurallyValid(
    encoding: EncodingId,
    bytes: Uint8Array,
): boolean {
    switch (normalizeEncoding(encoding)) {
        case "utf8":
            return isValidUtf8(bytes);
        case "windows31j":
        case "cp932":
        case "sjis":
        case "shiftjis":
            return isValidWindows31J(bytes);
        case "eucjp":
            return isValidEucJp(bytes);
        case "iso2022jp":
            return isValidIso2022Jp(bytes);
        case "utf16le":
            return isValidUtf16(bytes, true);
        case "utf16be":
            return isValidUtf16(bytes, false);
        default:
            return true;
    }
}

function countOccurrences(text: string, character: string): number {
    return [...text].filter((item) => item === character).length;
}

function calculateConfidence(text: string): number {
    if (text.length === 0) return 0;

    const characters = [...text];
    const total = characters.length;

    const replacementCount = countOccurrences(text, "\uFFFD");
    const controlCount = characters.filter((character) => {
        const code = character.codePointAt(0)!;
        return (
            (code < 0x20 && code !== 0x09 && code !== 0x0a && code !== 0x0d) ||
            (code >= 0x7f && code <= 0x9f)
        );
    }).length;

    const japaneseCount = characters.filter((character) => {
        const code = character.codePointAt(0)!;
        return (
            (code >= 0x3040 && code <= 0x30ff) ||
            (code >= 0x3400 && code <= 0x9fff)
        );
    }).length;

    const score =
        0.65 +
        (1 - controlCount / total) * 0.15 +
        (japaneseCount / total) * 0.2 -
        (replacementCount / total) * 0.8;

    return Math.max(0, Math.min(1, Number(score.toFixed(3))));
}

function createWarning(
    code: string,
    message: string,
    details?: unknown,
): ConversionWarning {
    return { code, message, details };
}

function createError(
    code: string,
    error: unknown,
    fallbackMessage: string,
): ConversionError {
    return {
        code,
        message: error instanceof Error ? error.message : fallbackMessage,
    };
}

export function suggestRepairCandidates(
    inputBytes: Uint8Array,
    targetEncodings?: EncodingId[],
): RepairResponse {
    initializeEncoding();

    const bytes = inputBytes.slice();
    const bomAnalysis = analyzeBOM(bytes);
    const detectedBOM = bomAnalysis.bom;
    const contentBytes = bomAnalysis.contentBytes;

    const candidates: RepairCandidate[] = [];
    const warnings: ConversionWarning[] = [];
    const errors: ConversionError[] = [];

    if (contentBytes.length === 0) {
        warnings.push(createWarning(
            "EMPTY_INPUT",
            "デコード対象のバイト列が空です。",
        ));
        return { candidates, detectedBOM, warnings, errors };
    }

    const registered = getAllEncodings().filter(
        (definition) => definition.capabilities.decode,
    );

    const requested = targetEncodings
        ? targetEncodings
        : registered.map((definition) => definition.id);

    const uniqueEncodings = [
        ...new Map(
            requested.map((encoding) => [
                normalizeEncoding(encoding),
                encoding,
            ]),
        ).values(),
    ];

    const outputMap = new Map<string, RepairCandidate>();

    for (const encoding of uniqueEncodings) {
        const definition = registered.find(
            (item) =>
                normalizeEncoding(item.id) === normalizeEncoding(encoding) ||
                item.aliases.some(
                    (alias) =>
                        normalizeEncoding(alias) === normalizeEncoding(encoding),
                ),
        );

        if (!definition) {
            warnings.push(createWarning(
                "ENCODING_NOT_REGISTERED",
                `${encoding} は登録済みのデコード可能な文字コードではありません。`,
                { encoding },
            ));
            continue;
        }

        if (!isStructurallyValid(definition.id, contentBytes)) {
            warnings.push(createWarning(
                "INVALID_BYTE_SEQUENCE",
                `${definition.id} として不正なバイト列のため候補から除外しました。`,
                { encoding: definition.id },
            ));
            continue;
        }

        try {
            const engine = resolveEncodingEngine(definition.id, "decode");
            const output = engine.decode(contentBytes.slice(), definition.id);

            if (output.length === 0 || output.trim().length === 0) {
                warnings.push(createWarning(
                    "EMPTY_DECODE_OUTPUT",
                    `${definition.id} のデコード結果が空のため除外しました。`,
                    { encoding: definition.id },
                ));
                continue;
            }

            const replacementCount = countOccurrences(output, "\uFFFD");
            if (
                replacementCount >
                Math.max(1, Math.floor([...output].length * 0.02))
            ) {
                warnings.push(createWarning(
                    "TOO_MANY_REPLACEMENT_CHARACTERS",
                    `${definition.id} のデコード結果に置換文字が多いため除外しました。`,
                    { encoding: definition.id, replacementCount },
                ));
                continue;
            }

            const existing = outputMap.get(output);

            if (existing) {
                existing.explanation.push(
                    `${definition.id} でも同じデコード結果になりました。`,
                );
                continue;
            }

            outputMap.set(output, {
                sourceEncoding: detectedBOM?.encoding ?? "unknown",
                targetEncoding: definition.id,
                output,
                hex: bytesToHex(bytes),
                confidence: calculateConfidence(output),
                explanation: [
                    `${definition.id} として実際にデコードしました。`,
                    "スコアは文字列の特徴に基づく相対的な推定値です。",
                ],
            });
        } catch (error) {
            errors.push(createError(
                "REPAIR_DECODE_FAILED",
                error,
                `${definition.id} でのデコードに失敗しました。`,
            ));
        }
    }

    candidates.push(
        ...[...outputMap.values()].sort(
            (left, right) => right.confidence - left.confidence,
        ),
    );

    if (candidates.length === 0 && warnings.length === 0) {
        warnings.push(createWarning(
            "NO_REPAIR_CANDIDATE",
            "有効な修復候補を生成できませんでした。",
        ));
    }

    return { candidates, detectedBOM, warnings, errors };
}
