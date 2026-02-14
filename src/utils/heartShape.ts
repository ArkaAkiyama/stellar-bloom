/**
 * Generates 3D positions arranged in a heart shape.
 * Uses parametric heart curve in 2D, distributed across a thin z-depth.
 */
export function generateHeartPositions(count: number, scale = 3): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    // Parametric heart curve
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);

    // Normalize to roughly -1..1 range, then scale
    positions[i * 3] = (x / 17) * scale + (Math.random() - 0.5) * 0.15;
    positions[i * 3 + 1] = (y / 17) * scale + (Math.random() - 0.5) * 0.15;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
  }
  return positions;
}

/**
 * Generates randomized scattered positions in 3D space.
 */
export function generateScatteredPositions(count: number, spread = 20): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.6;
  }
  return positions;
}
