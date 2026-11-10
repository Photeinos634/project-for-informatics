import type {
  EncodingId,
  EncodingDefinition,
} from "@/types/encoding";

import {
  getEncoding,
  getAllEncodings,
} from "./encodingRegistry";

import {
  resolveEncodingAlias,
} from "./encodingAliases";

/**
 * 文字コードのメタデータを取得する
 */
export function getEncodingMetadata(
  input: EncodingId
): EncodingDefinition | undefined {
  const encodingId = resolveEncodingAlias(
    input,
    getAllEncodings()
  );

  if (!encodingId) {
    return undefined;
  }

  return getEncoding(encodingId);
}

/**
 * 登録済み文字コードのメタデータをすべて取得する
 */
export function getAllEncodingMetadata(): EncodingDefinition[] {
  return getAllEncodings();
}

/**
 * 指定された文字コードがエンコードに対応しているか確認する
 */
export function canEncode(input: EncodingId): boolean {
  return getEncodingMetadata(input)?.capabilities.encode ?? false;
}

/**
 * 指定された文字コードがデコードに対応しているか確認する
 */
export function canDecode(input: EncodingId): boolean {
  return getEncodingMetadata(input)?.capabilities.decode ?? false;
}
