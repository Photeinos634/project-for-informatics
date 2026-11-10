
import { ENCODING_DEFINITIONS } from "@/constants/encodings";
import { EncodingJapaneseEngine } from "./engines/encodingJapaneseEngine";
import { IconvLiteEngine } from "./engines/iconvLiteEngine";
import { registerEncoding } from "./encodingRegistry";
import { registerEncodingEngine } from "./encodingResolver";

/**
 * 文字コードエンジンと文字コード定義を初期登録する
 */
let initialized = false;

export function initializeEncoding(): void {
  if (initialized) {
    return;
  }

  const japaneseEngine = new EncodingJapaneseEngine();
  const iconvLiteEngine = new IconvLiteEngine();

  registerEncodingEngine(japaneseEngine);
  registerEncodingEngine(iconvLiteEngine);

  for (const definition of ENCODING_DEFINITIONS) {
    registerEncoding(definition);
  }

  initialized = true;
}