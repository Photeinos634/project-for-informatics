import type { EncodingId, EncodingDefinition } from "@/types/encoding";

/**
 * 文字コードの別名を正規化する
 */
function normalizeAlias(value: string): string {
  return value.toLowerCase().replace(/[-_\s]/g, "");
}

/**
 * 文字コードの別名を正式なIDに解決する
 */
export function resolveEncodingAlias(
  input: string,
  definitions: EncodingDefinition[]
): EncodingId | undefined {
  const normalizedInput = normalizeAlias(input);

  const definition = definitions.find(
    (item) =>
      normalizeAlias(item.id) === normalizedInput ||
      item.aliases.some(
        (alias) => normalizeAlias(alias) === normalizedInput
      )
  );

  return definition?.id;
}
