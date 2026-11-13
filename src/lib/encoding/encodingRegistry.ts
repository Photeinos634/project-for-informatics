import type {
  EncodingId,
  EncodingDefinition,
} from "@/types/encoding";

/**
 * 登録済み文字コードを管理するRegistry
 */
const encodingRegistry = new Map<
  EncodingId,
  EncodingDefinition
>();

/**
 * 文字コードを登録する
 */
export function registerEncoding(
  definition: EncodingDefinition
): void {
  if (encodingRegistry.has(definition.id)) {
    throw new Error(
      `Encoding already registered: ${definition.id}`
    );
  }

  encodingRegistry.set(definition.id, {
    ...definition,
    aliases: [...definition.aliases],
    capabilities: { ...definition.capabilities },
  });
}

/**
 * IDから文字コード情報を取得する
 */
export function getEncoding(
  id: EncodingId
): EncodingDefinition | undefined {
  const definition = encodingRegistry.get(id);

  if (!definition) {
    return undefined;
  }

  return {
    ...definition,
    aliases: [...definition.aliases],
    capabilities: { ...definition.capabilities },
  };
}

/**
 * 登録済みの全文字コードを取得する
 */
export function getAllEncodings(): EncodingDefinition[] {
  return Array.from(encodingRegistry.values()).map(
    (definition) => ({
      ...definition,
      aliases: [...definition.aliases],
      capabilities: { ...definition.capabilities },
    })
  );
}

/**
 * 文字コードIDまたは別名から登録情報を取得する
 */
export function getEncodingByAlias(
  input: string
): EncodingDefinition | undefined {
  const normalizedInput = input
    .toLowerCase()
    .replace(/[-_\s]/g, "");

  const definition = Array.from(
    encodingRegistry.values()
  ).find(
    (item) =>
      item.id.toLowerCase().replace(/[-_\s]/g, "") ===
        normalizedInput ||
      item.aliases.some(
        (alias) =>
          alias.toLowerCase().replace(/[-_\s]/g, "") ===
          normalizedInput
      )
  );

  if (!definition) {
    return undefined;
  }

  return {
    ...definition,
    aliases: [...definition.aliases],
    capabilities: { ...definition.capabilities },
  };
}
