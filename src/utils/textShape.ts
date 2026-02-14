/**
 * Generates 3D particle positions that spell out text using offscreen canvas sampling.
 * Falls back to scattered positions if canvas is unavailable.
 */
export function generateTextPositions(
  text: string,
  count: number,
  scale = 4,
  fontSize = 64
): Float32Array {
  const positions = new Float32Array(count * 3);

  // Try canvas-based text rasterization
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      canvas.width = 512;
      canvas.height = 128;

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#fff";
      ctx.font = `bold ${fontSize}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      // Collect all lit pixel coordinates
      const litPixels: [number, number][] = [];
      const step = 2; // sample every 2px for density
      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const idx = (y * canvas.width + x) * 4;
          if (pixels[idx] > 128) {
            litPixels.push([x, y]);
          }
        }
      }

      if (litPixels.length > 0) {
        // Map lit pixels to 3D positions
        const aspect = canvas.width / canvas.height;
        for (let i = 0; i < count; i++) {
          const pixel = litPixels[i % litPixels.length];
          // Normalize to -1..1 range, apply scale
          const nx = ((pixel[0] / canvas.width) - 0.5) * scale * aspect;
          const ny = -((pixel[1] / canvas.height) - 0.5) * scale;
          // Add slight jitter for organic feel
          positions[i * 3] = nx + (Math.random() - 0.5) * 0.08;
          positions[i * 3 + 1] = ny + (Math.random() - 0.5) * 0.08;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
        }
        return positions;
      }
    }
  }

  // Fallback: scatter
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * scale;
    positions[i * 3 + 1] = (Math.random() - 0.5) * scale * 0.3;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
  }
  return positions;
}
