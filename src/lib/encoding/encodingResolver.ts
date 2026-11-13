
import type { EncodingId } from "@/types/encoding";
import type { EncodingEngine } from "./encodingEngine";
import { getEncoding, getAllEncodings } from "./encodingRegistry";
import { resolveEncodingAlias } from "./encodingAliases";

/**
 * 登録済みエンジンを管理するRegistry
 */
const engineRegistry = new Map<string, EncodingEngine>();

/**
 * エンジンを登録する
 */
export function registerEncodingEngine(
  engine: EncodingEngine
): void {
  if (engineRegistry.has(engine.id)) {
    throw new Error(
      `Engine already registered: ${engine.id}`
    );
  }

  engineRegistry.set(engine.id, engine);
}

/**
 * 文字コードと処理種別からエンジンを解決する
 */
export function resolveEncodingEngine(
  encoding: EncodingId,
  operation: "encode" | "decode"
): EncodingEngine {
  const encodingId = resolveEncodingAlias(
    encoding,
    getAllEncodings()
  );

  if (!encodingId) {
    throw new Error(`Unsupported encoding: ${encoding}`);
  }

  const definition = getEncoding(encodingId);

  if (!definition) {
    throw new Error(`Encoding not registered: ${encodingId}`);
  }

  if (!definition.capabilities[operation]) {
    throw new Error(
      `${operation} is not supported: ${encoding}`
    );
  }

  const engine = engineRegistry.get(definition.engineId);

  if (!engine) {
    throw new Error(
      `Engine not registered: ${definition.engineId}`
    );
  }

  if (!engine.supports(definition.id, operation)) {
    throw new Error(
      `Engine ${engine.id} does not support ${operation} for ${definition.id}`
    );
  }

  return engine;
}
