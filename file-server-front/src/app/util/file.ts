const KB_UNIT: number = 1024;
const MB_UNIT: number = 1024 * 1024;
const GB_UNIT: number = 1024 * 1024 * 1024;

export function resolveSize(sizeInBytes: number): string {
    if (sizeInBytes > GB_UNIT) {
        return divideUnit(sizeInBytes, GB_UNIT) + " gb";
    }
    if (sizeInBytes > MB_UNIT) {
        return divideUnit(sizeInBytes, MB_UNIT) + " mb";
    }
    return divideUnit(sizeInBytes, KB_UNIT) + " kb";
}

export function divideUnit(size: number, unit: number): string {
    return (size / unit).toFixed(1);
}