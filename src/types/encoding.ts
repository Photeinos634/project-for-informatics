export type EncodingId = string;

export type NormalizationForm = "NFC" | "NFD" | "NFKC" | "NFKD";

/**
 * 文字コードの登録情報
 */
export interface EncodingDefinition {
    id: EncodingId;
    label: string;
    description: string;

    engineId: string;

    aliases: string[];

    capabilities: {
        encode: boolean;
        decode: boolean;
    };
}
