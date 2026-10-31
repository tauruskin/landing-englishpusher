import { test } from "node:test";
import assert from "node:assert/strict";
import { webpSize } from "./webp.ts";

// Builds the first 30 bytes of a WebP file: "RIFF" <size> "WEBP" <chunk id> <chunk body…>.
function webp(chunk: string, body: number[]): Uint8Array {
  const bytes = new Uint8Array(30);
  bytes.set([..."RIFF"].map((c) => c.charCodeAt(0)), 0);
  bytes.set([..."WEBP"].map((c) => c.charCodeAt(0)), 8);
  bytes.set([...chunk].map((c) => c.charCodeAt(0)), 12);
  bytes.set(body, 16);
  return bytes;
}

test("lossy VP8: width and height are 14-bit little-endian at bytes 26 and 28", () => {
  // bytes 16..19 chunk size, 20..22 frame tag, 23..25 start code 9d 01 2a, then w, h
  const body = [0, 0, 0, 0, 0, 0, 0, 0x9d, 0x01, 0x2a, 780 & 0xff, 780 >> 8, 1688 & 0xff, 1688 >> 8];
  assert.deepEqual(webpSize(webp("VP8 ", body)), { width: 780, height: 1688 });
});

test("lossless VP8L: width-1 and height-1 packed as 14-bit fields after the 0x2f signature", () => {
  const bits = (780 - 1) | ((1688 - 1) << 14);
  const body = [0, 0, 0, 0, 0x2f, bits & 0xff, (bits >> 8) & 0xff, (bits >> 16) & 0xff, (bits >>> 24) & 0xff];
  assert.deepEqual(webpSize(webp("VP8L", body)), { width: 780, height: 1688 });
});

test("extended VP8X: canvas width-1 and height-1 as 24-bit little-endian at bytes 24 and 27", () => {
  const w = 780 - 1;
  const h = 1688 - 1;
  const body = [0, 0, 0, 0, 0, 0, 0, 0, w & 0xff, (w >> 8) & 0xff, w >> 16, h & 0xff, (h >> 8) & 0xff, h >> 16];
  assert.deepEqual(webpSize(webp("VP8X", body)), { width: 780, height: 1688 });
});

test("a file that is not WebP is rejected", () => {
  assert.throws(() => webpSize(new TextEncoder().encode("\x89PNG\r\n\x1a\n0000000000000000000000")), /not a WebP/);
});
