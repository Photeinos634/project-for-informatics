import { analyzeBOM } from "@/lib/binary/bom";
import { initializeEncoding } from "@/lib/encoding/encodingInitializer";
import { getAllEncodings } from "@/lib/encoding/encodingRegistry";
import { resolveEncodingEngine } from "@/lib/encoding/encodingResolver";
import type { EncodingId } from "@/types/encoding";
import type { ConversionWarning } from "@/types/converter";
import type { BOMInfo } from "@/lib/binary/bom";

export interface EncodingDetectionCandidate {
    encoding: EncodingId;
    confidence: number;
    reason: string[];
}

export interface EncodingDetectionResult {
    candidates: EncodingDetectionCandidate[];
    detectedBOM: BOMInfo | null;
    isReliable: boolean;
    warnings: ConversionWarning[];
}

interface DetectionEvidence {
    encoding: EncodingId;
    confidence: number;
    reason: string[];
}

function warning(code: string, message: string): ConversionWarning {
    return { code, message };
}

function isAsciiOnly(bytes: Uint8Array): boolean {
    return bytes.every((byte) => byte <= 0x7f);
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

        if (byte <= 0x7f || (byte >= 0xa1 && byte <= 0xdf)) {
            continue;
        }

        const isLead =
            (byte >= 0x81 && byte <= 0x9f) ||
            (byte >= 0xe0 && byte <= 0xfc);

        if (!isLead || i + 1 >= bytes.length) {
            return false;
        }

        const trail = bytes[++i];
        const isValidTrail =
            (trail >= 0x40 && trail <= 0x7e) ||
            (trail >= 0x80 && trail <= 0xfc);

        if (!isValidTrail) {
            return false;
        }
    }

    return true;
}

function isValidEucJp(bytes: Uint8Array): boolean {
    for (let i = 0; i < bytes.length; i++) {
        const byte = bytes[i];

        if (byte <= 0x7f) {
            continue;
        }

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
            ) {
                return false;
            }
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
    let hasEscapeSequence = false;
    let inJisMode = false;
    let jisCharacterByteCount = 0;

    for (let i = 0; i < bytes.length; i++) {
        const byte = bytes[i];

        if (byte === 0x1b) {
            if (i + 2 >= bytes.length) return false;

            const second = bytes[i + 1];
            const third = bytes[i + 2];

            const isJisEscape =
                second === 0x24 && (third === 0x40 || third === 0x42);
            const isAsciiEscape =
                second === 0x28 &&
                (third === 0x42 || third === 0x4a);

            if (!isJisEscape && !isAsciiEscape) {
                return false;
            }

            hasEscapeSequence = true;
            inJisMode = isJisEscape;
            i += 2;
            continue;
        }

        if (byte > 0x7f) return false;

        if (inJisMode) {
            if (byte < 0x21 || byte > 0x7e) return false;
            jisCharacterByteCount++;
        }
    }

    return hasEscapeSequence && jisCharacterByteCount >= 2;
}

function hasUtf16LittleEndianPattern(bytes: Uint8Array): boolean {
    if (bytes.length < 4 || bytes.length % 2 !== 0) return false;

    let oddZeros = 0;
    let evenZeros = 0;

    for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] === 0) {
            if (i % 2 === 0) evenZeros++;
            else oddZeros++;
        }
    }

    return oddZeros >= 2 && oddZeros > evenZeros * 2;
}

function hasUtf16BigEndianPattern(bytes: Uint8Array): boolean {
    if (bytes.length < 4 || bytes.length % 2 !== 0) return false;

    let oddZeros = 0;
    let evenZeros = 0;

    for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] === 0) {
            if (i % 2 === 0) evenZeros++;
            else oddZeros++;
        }
    }

    return evenZeros >= 2 && evenZeros > oddZeros * 2;
}

function hasSuspiciousDecodedText(text: string): boolean {
    if (text.length === 0) return true;
    if (text.includes("\uFFFD")) return true;

    let suspiciousCount = 0;

    for (const character of text) {
        const code = character.codePointAt(0)!;

        if (
            (code < 0x20 && code !== 0x09 && code !== 0x0a && code !== 0x0d) ||
            (code >= 0x7f && code <= 0x9f)
        ) {
            suspiciousCount++;
        }
    }

    return suspiciousCount / text.length > 0.1;
}

function canDecode(
    encoding: EncodingId,
    bytes: Uint8Array,
): boolean {
    try {
        const engine = resolveEncodingEngine(encoding, "decode");
        const decoded = engine.decode(bytes.slice(), encoding);
        return !hasSuspiciousDecodedText(decoded);
    } catch {
        return false;
    }
}

function getRegisteredDecodableEncodings(): EncodingId[] {
    return getAllEncodings()
        .filter((definition) => definition.capabilities.decode)
        .filter((definition) => {
            try {
                resolveEncodingEngine(definition.id, "decode");
                return true;
            } catch {
                return false;
            }
        })
        .map((definition) => definition.id);
}

function detectEvidence(bytes: Uint8Array): DetectionEvidence[] {
    const evidence: DetectionEvidence[] = [];
    const registered = new Set(getRegisteredDecodableEncodings());

    const add = (
        encoding: EncodingId,
        confidence: number,
        reason: string,
    ) => {
        if (!registered.has(encoding)) return;
        if (!canDecode(encoding, bytes)) return;

        evidence.push({
            encoding,
            confidence,
            reason: [reason],
        });
    };

    if (isValidUtf8(bytes)) {
        add(
            "UTF-8",
            0.90,
            "UTF-8として厳密なバイト列検証に成功しました。",
        );
    }

    if (isValidWindows31J(bytes)) {
        add(
            "Windows-31J",
            0.72,
            "Windows-31Jのバイト範囲と文字の並びが妥当です。",
        );
    }

    if (isValidEucJp(bytes)) {
        add(
            "EUC-JP",
            0.70,
            "EUC-JPのバイト範囲と文字の並びが妥当です。",
        );
    }

    if (isValidIso2022Jp(bytes)) {
        add(
            "ISO-2022-JP",
            0.98,
            "ISO-2022-JPのエスケープシーケンスを検出しました。",
        );
    }

    if (hasUtf16LittleEndianPattern(bytes)) {
        add(
            "UTF-16LE",
            0.88,
            "UTF-16LEに特徴的なゼロバイトの配置を検出しました。",
        );
    }

    if (hasUtf16BigEndianPattern(bytes)) {
        add(
            "UTF-16BE",
            0.88,
            "UTF-16BEに特徴的なゼロバイトの配置を検出しました。",
        );
    }

    return evidence.sort((a, b) => b.confidence - a.confidence);
}

export function detectEncoding(
    inputBytes: Uint8Array,
): EncodingDetectionResult {
    initializeEncoding();

    const bytes = inputBytes.slice();
    const bomAnalysis = analyzeBOM(bytes);
    const detectedBOM = bomAnalysis.bom;
    const warnings: ConversionWarning[] = [];

    if (detectedBOM) {
        try {
            const registered = getRegisteredDecodableEncodings();

            if (registered.includes(detectedBOM.encoding)) {
                const contentBytes = bomAnalysis.contentBytes;

                if (!canDecode(detectedBOM.encoding, contentBytes)) {
                    warnings.push(
                        warning(
                            "BOM_CONTENT_DECODE_FAILED",
                            "BOMは検出されましたが、後続のバイト列を正常にデコードできませんでした。",
                        ),
                    );

                    return {
                        candidates: [],
                        detectedBOM,
                        isReliable: false,
                        warnings,
                    };
                }

                return {
                    candidates: [{
                        encoding: detectedBOM.encoding,
                        confidence: 1,
                        reason: [
                            `${detectedBOM.encoding}のBOMを検出しました。`,
                            "BOMを最も強い判定根拠として採用しました。",
                        ],
                    }],
                    detectedBOM,
                    isReliable: true,
                    warnings,
                };
            }

            warnings.push(
                warning(
                    "BOM_ENCODING_NOT_REGISTERED",
                    `BOMの文字コード ${detectedBOM.encoding} は登録されていないため、自動判定候補にはできません。`,
                ),
            );

            return {
                candidates: [],
                detectedBOM,
                isReliable: false,
                warnings,
            };
        } catch {
            warnings.push(
                warning(
                    "BOM_DETECTION_FAILED",
                    "BOMに基づく文字コード判定に失敗しました。",
                ),
            );

            return {
                candidates: [],
                detectedBOM,
                isReliable: false,
                warnings,
            };
        }
    }

    if (bytes.length === 0 || (isAsciiOnly(bytes) && !bytes.includes(0x1b))) {
        warnings.push(
            warning(
                "INSUFFICIENT_ENCODING_EVIDENCE",
                "空データまたはASCII文字のみのデータでは文字コードを特定できません。",
            ),
        );

        return {
            candidates: [],
            detectedBOM: null,
            isReliable: false,
            warnings,
        };
    }

    const evidence = detectEvidence(bytes);

    if (evidence.length === 0) {
        warnings.push(
            warning(
                "NO_VALID_ENCODING_CANDIDATE",
                "登録済みの文字コードに妥当な候補が見つかりませんでした。",
            ),
        );

        return {
            candidates: [],
            detectedBOM: null,
            isReliable: false,
            warnings,
        };
    }

    const best = evidence[0];
    const second = evidence[1];

    if (
        best.confidence < 0.85 ||
        (second !== undefined &&
            best.confidence - second.confidence < 0.15)
    ) {
        warnings.push(
            warning(
                "AMBIGUOUS_ENCODING",
                "複数の文字コードが候補となるか、判定根拠が十分でないため特定できませんでした。",
            ),
        );

        return {
            candidates: [],
            detectedBOM: null,
            isReliable: false,
            warnings,
        };
    }

    return {
        candidates: [{
            encoding: best.encoding,
            confidence: best.confidence,
            reason: best.reason,
        }],
        detectedBOM: null,
        isReliable: true,
        warnings,
    };
}

