export function copyBytes(bytes: Uint8Array): Uint8Array {
    return bytes.slice();
}

export function concatBytes(...arrays: Uint8Array[]): Uint8Array {
    const length = arrays.reduce((total, bytes) => total + bytes.length, 0);
    const result = new Uint8Array(length);
    let offset = 0;

    for (const bytes of arrays) {
        result.set(bytes, offset);
        offset += bytes.length;
    }

    return result;
}

export function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
    if (left.length !== right.length) {
        return false;
    }

    return left.every((byte, index) => byte === right[index]);
}
