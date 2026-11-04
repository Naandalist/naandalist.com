const M = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]

/** Ordered dither threshold for cell (x, y), strictly between 0 and 1. Tiles every 4 cells. */
export function bayer4(x: number, y: number): number {
  const xi = ((Math.trunc(x) % 4) + 4) % 4
  const yi = ((Math.trunc(y) % 4) + 4) % 4
  return (M[yi][xi] + 0.5) / 16
}
