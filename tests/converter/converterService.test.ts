import { describe, expect, it, vi } from "vitest";
import { bytesToHex } from "@/lib/binary/hex";
import { initializeEncoding } from "@/lib/encoding/encodingInitializer";
import { resolveEncodingEngine } from "@/lib/encoding/encodingResolver";
import { convert, convertFromHex } from "@/services/converterService";

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

    it("decodes HEX bytes directly without re-encoding text", () => {
        initializeEncoding();

        const bytes = resolveEncodingEngine("UTF-8", "encode")
            .encode("こんにちは", "UTF-8");

        const hex = bytesToHex(bytes);
        const response = convertFromHex(hex, "UTF-8");

        expect(response.success).toBe(true);
        expect(response.sourceBytes).toEqual(bytes);
        expect(response.hex).toBe(hex);
        expect(response.output).toBe("こんにちは");
        expect(response.errors).toEqual([]);
    });

    it("accepts whitespace and newlines in HEX input", () => {
        const response = convertFromHex("41 42\n43\t44", "UTF-8");

        expect(response.success).toBe(true);
        expect(response.sourceBytes).toEqual(
            new Uint8Array([0x41, 0x42, 0x43, 0x44]),
        );
        expect(response.output).toBe("ABCD");
    });

    it("rejects invalid HEX characters before calling the engine", () => {
        initializeEncoding();

        const engine = resolveEncodingEngine("UTF-8", "decode");
        const decodeSpy = vi.spyOn(engine, "decode");

        const response = convertFromHex("GG", "UTF-8");

        expect(response.success).toBe(false);
        expect(response.errors[0]?.code).toBe("INVALID_HEX_INPUT");
        expect(response.sourceBytes).toBeNull();
        expect(decodeSpy).not.toHaveBeenCalled();

        decodeSpy.mockRestore();
    });

    it("rejects HEX input with an odd number of digits", () => {
        const response = convertFromHex("ABC", "UTF-8");

        expect(response.success).toBe(false);
        expect(response.errors[0]?.code).toBe("INVALID_HEX_INPUT");
        expect(response.output).toBeNull();
    });
});
