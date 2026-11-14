import { getPlatformPreset, getPlatformPresets } from "./presets";
import type { PlatformId, PlatformPreset } from "@/types/platform";

export function getPlatformMetadata(id: PlatformId): PlatformPreset | undefined {
    return getPlatformPreset(id);
}

export function getAllPlatformMetadata(): PlatformPreset[] {
    return getPlatformPresets();
}
