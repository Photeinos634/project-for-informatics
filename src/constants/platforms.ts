import type { PlatformPreset } from "@/types/platform";

export const PLATFORM_PRESETS: PlatformPreset[] = [
    {
        id: "windows-example",
        label: "Windows (設定例)",
        description: "Windows-31J・CRLFを使う構成例。OSの既定動作を示すものではありません。",
        encoding: "Windows-31J",
        newline: "CRLF",
        normalization: "NFC",
    },
    {
        id: "macos-example",
        label: "macOS (設定例)",
        description: "UTF-8・LFを使う構成例。OSの既定動作を示すものではありません。",
        encoding: "UTF-8",
        newline: "LF",
        normalization: "NFD",
    },
    {
        id: "ios-example",
        label: "iOS (設定例)",
        description: "UTF-8・LFを使う構成例。OSの既定動作を示すものではありません。",
        encoding: "UTF-8",
        newline: "LF",
        normalization: "NFC",
    },
];
