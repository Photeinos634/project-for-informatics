import { describe, expect, it } from "vitest";
import { bytesToHex } from "@/lib/binary/hex";
import { initializeEncoding } from "@/lib/encoding/encodingInitializer";
import { resolveEncodingEngine } from "@/lib/encoding/encodingResolver";
import { convert } from "@/services/converterService";

describe("converterService", () => {
    it("reinterprets the exact source bytes using the target encoding", () => {
        initializeEncoding();
        const request = {
            input: "こんにちは",
            sourceEncoding: "Windows-31J",
            targetEncoding: "UTF-8",
        };
        const expectedBytes = resolveEncodingEngine("Windows-31J", "encode")
            .encode(request.input, request.sourceEncoding);
        const response = convert(request);

        expect(response.success).toBe(true);
        expect(response.sourceBytes).toEqual(expectedBytes);
        expect(response.hex).toBe(bytesToHex(expectedBytes));
        expect(response.output).toBe(
            resolveEncodingEngine("UTF-8", "decode").decode(expectedBytes, "UTF-8"),
        );
        expect(response.output).not.toBe(request.input);
        expect(response.errors).toEqual([]);
    });

    it("allows empty input and returns an empty byte sequence", () => {
        const response = convert({
            input: "",
            sourceEncoding: "UTF-8",
            targetEncoding: "UTF-8",
        });

        expect(response.success).toBe(true);
        expect(response.output).toBe("");
        expect(response.sourceBytes).toEqual(new Uint8Array());
        expect(response.hex).toBe("");
    });

    it("returns an error instead of a partial result for invalid encodings", () => {
        const response = convert({
            input: "text",
            sourceEncoding: "NOT-AN-ENCODING",
            targetEncoding: "UTF-8",
        });

        expect(response.success).toBe(false);
        expect(response.output).toBeNull();
        expect(response.sourceBytes).toBeNull();
        expect(response.hex).toBeNull();
        expect(response.errors[0]?.code).toBe("UNSUPPORTED_SOURCE_ENCODING");
    });

    it("reports unencodable characters as failures", () => {
        const response = convert({
            input: "😀",
            sourceEncoding: "Windows-31J",
            targetEncoding: "UTF-8",
        });

        expect(response.success).toBe(false);
        expect(response.errors[0]?.code).toBe("ENCODE_FAILED");
        expect(response.output).toBeNull();
    });

    it("requires both encoding selections", () => {
        const response = convert({
            input: "text",
            sourceEncoding: "",
            targetEncoding: "",
        });

        expect(response.success).toBe(false);
        expect(response.errors.map((error) => error.code)).toEqual([
            "SOURCE_ENCODING_REQUIRED",
            "TARGET_ENCODING_REQUIRED",
        ]);
    });
});
