import { PLATFORM_PRESETS } from "@/constants/platforms";
import type { PlatformPreset } from "@/types/platform";

export function getPlatformPresets(): PlatformPreset[] {
    return PLATFORM_PRESETS.map((preset) => ({ ...preset }));
}

export function getPlatformPreset(id: string): PlatformPreset | undefined {
    const preset = PLATFORM_PRESETS.find((item) => item.id === id);
    return preset ? { ...preset } : undefined;
}
