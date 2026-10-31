// Reads the pixel size from a WebP file header, so the tour test can check that every screenshot
// matches the width/height the <img> declares (no layout shift). Handles the three WebP
// bitstream chunks: lossy "VP8 ", lossless "VP8L" and extended "VP8X".
export function webpSize(bytes: Uint8Array): { width: number; height: number } {
  const ascii = (offset: number, length: number) =>
    String.fromCharCode(...bytes.subarray(offset, offset + length));
  if (bytes.length < 30 || ascii(0, 4) !== "RIFF" || ascii(8, 4) !== "WEBP") {
    throw new Error("not a WebP file");
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const chunk = ascii(12, 4);
  if (chunk === "VP8 ") {
    return { width: view.getUint16(26, true) & 0x3fff, height: view.getUint16(28, true) & 0x3fff };
  }
  if (chunk === "VP8L") {
    const bits = view.getUint32(21, true);
    return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8X") {
    const u24 = (offset: number) => bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
    return { width: u24(24) + 1, height: u24(27) + 1 };
  }
  throw new Error(`unknown WebP chunk "${chunk}"`);
}
