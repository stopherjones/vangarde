import { DirectionIndex, HexCoord } from '../types';

export const GRID_COLS = 10;
export const GRID_ROWS = 12;

export const DIRECTION_LABELS: Record<DirectionIndex, { label: string; arrow: string; short: string }> = {
  1: { label: 'NW', arrow: '↖', short: 'NW ↖' },
  2: { label: 'N',  arrow: '↑', short: 'N ↑' },
  3: { label: 'NE', arrow: '↗', short: 'NE ↗' },
  4: { label: 'SE', arrow: '↘', short: 'SE ↘' },
  5: { label: 'S',  arrow: '↓', short: 'S ↓' },
  6: { label: 'SW', arrow: '↙', short: 'SW ↙' },
};

export function getNeighbor(coord: HexCoord, dir: DirectionIndex): HexCoord | null {
  const isOdd = coord.col % 2 !== 0;
  let nextCol = coord.col;
  let nextRow = coord.row;

  switch (dir) {
    case 1: // NW
      nextCol = coord.col - 1;
      nextRow = isOdd ? coord.row : coord.row - 1;
      break;
    case 2: // N
      nextCol = coord.col;
      nextRow = coord.row - 1;
      break;
    case 3: // NE
      nextCol = coord.col + 1;
      nextRow = isOdd ? coord.row : coord.row - 1;
      break;
    case 4: // SE
      nextCol = coord.col + 1;
      nextRow = isOdd ? coord.row + 1 : coord.row;
      break;
    case 5: // S
      nextCol = coord.col;
      nextRow = coord.row + 1;
      break;
    case 6: // SW
      nextCol = coord.col - 1;
      nextRow = isOdd ? coord.row + 1 : coord.row;
      break;
  }

  if (nextCol < 0 || nextCol >= GRID_COLS || nextRow < 0 || nextRow >= GRID_ROWS) {
    return null; // Out of bounds
  }

  return { col: nextCol, row: nextRow };
}

export function getAllNeighbors(coord: HexCoord): HexCoord[] {
  const neighbors: HexCoord[] = [];
  const directions: DirectionIndex[] = [1, 2, 3, 4, 5, 6];
  for (const dir of directions) {
    const n = getNeighbor(coord, dir);
    if (n) {
      neighbors.push(n);
    }
  }
  return neighbors;
}

// Calculate revealed coords when activating a watchtower
// Standard: reveals all adjacent tiles, plus the 6 tiles in the NW, N, NE, SE, S, SW directions (distance 2 along each ray)
// Telescope: reveals all adjacent tiles, plus ALL tiles in the NW, N, NE, SE, S, SW directions to the grid boundaries
export function getTowerRevealedCoords(
  coord: HexCoord,
  hasTelescope: boolean
): HexCoord[] {
  const revealedCoords: HexCoord[] = [];
  const visited = new Set<string>();

  // 1. All adjacent tiles (1 step in each direction)
  const adjacent = getAllNeighbors(coord);
  for (const n of adjacent) {
    const key = `${n.col},${n.row}`;
    if (!visited.has(key)) {
      visited.add(key);
      revealedCoords.push(n);
    }
  }

  // 2. The 6 directions: NW(1), N(2), NE(3), SE(4), S(5), SW(6)
  const directions: DirectionIndex[] = [1, 2, 3, 4, 5, 6];
  for (const dir of directions) {
    const step1 = getNeighbor(coord, dir);
    if (!step1) continue;

    if (hasTelescope) {
      // With telescope: reveal all tiles along this direction to the grid edge
      let curr = getNeighbor(step1, dir);
      while (curr) {
        const key = `${curr.col},${curr.row}`;
        if (!visited.has(key)) {
          visited.add(key);
          revealedCoords.push(curr);
        }
        curr = getNeighbor(curr, dir);
      }
    } else {
      // Without telescope: reveal the next tile in each of the 6 directions (distance 2)
      const step2 = getNeighbor(step1, dir);
      if (step2) {
        const key = `${step2.col},${step2.row}`;
        if (!visited.has(key)) {
          visited.add(key);
          revealedCoords.push(step2);
        }
      }
    }
  }

  return revealedCoords;
}

// Determine which 4-quadrant sector a hex coordinate is located in
export function getQuadrant(coord: HexCoord): {
  code: 'NW' | 'NE' | 'SW' | 'SE';
  name: string;
  bounds: string;
} {
  const isNorth = coord.row < 6;
  const isWest = coord.col < 5;
  if (isNorth && isWest) {
    return { code: 'NW', name: 'Northwest', bounds: 'Cols 0–4, Rows 0–5' };
  } else if (isNorth && !isWest) {
    return { code: 'NE', name: 'Northeast', bounds: 'Cols 5–9, Rows 0–5' };
  } else if (!isNorth && isWest) {
    return { code: 'SW', name: 'Southwest', bounds: 'Cols 0–4, Rows 6–11' };
  } else {
    return { code: 'SE', name: 'Southeast', bounds: 'Cols 5–9, Rows 6–11' };
  }
}

// Calculate next hex step with edge bouncing reflection so players never get stuck at map boundaries
export function getBouncedStep(
  coord: HexCoord,
  currentDir: DirectionIndex
): { nextCoord: HexCoord; nextDir: DirectionIndex; bounced: boolean } {
  // Check if standard neighbor in currentDir is in bounds
  const directNeighbor = getNeighbor(coord, currentDir);
  if (directNeighbor) {
    return { nextCoord: directNeighbor, nextDir: currentDir, bounced: false };
  }

  // Out of bounds: calculate virtual step to determine which boundary/corner was crossed
  const isOdd = coord.col % 2 !== 0;
  let testCol = coord.col;
  let testRow = coord.row;

  switch (currentDir) {
    case 1: // NW
      testCol = coord.col - 1;
      testRow = isOdd ? coord.row : coord.row - 1;
      break;
    case 2: // N
      testCol = coord.col;
      testRow = coord.row - 1;
      break;
    case 3: // NE
      testCol = coord.col + 1;
      testRow = isOdd ? coord.row : coord.row - 1;
      break;
    case 4: // SE
      testCol = coord.col + 1;
      testRow = isOdd ? coord.row + 1 : coord.row;
      break;
    case 5: // S
      testCol = coord.col;
      testRow = coord.row + 1;
      break;
    case 6: // SW
      testCol = coord.col - 1;
      testRow = isOdd ? coord.row + 1 : coord.row;
      break;
  }

  const hitWest = testCol < 0;
  const hitEast = testCol >= GRID_COLS;
  const hitNorth = testRow < 0;
  const hitSouth = testRow >= GRID_ROWS;

  let bouncedDir: DirectionIndex;

  // Corner bounces (both vertical and horizontal boundary hit simultaneously)
  if (hitWest && hitNorth) {
    bouncedDir = 4; // NW corner -> SE
  } else if (hitWest && hitSouth) {
    bouncedDir = 3; // SW corner -> NE
  } else if (hitEast && hitNorth) {
    bouncedDir = 6; // NE corner -> SW
  } else if (hitEast && hitSouth) {
    bouncedDir = 1; // SE corner -> NW
  } else if (hitWest) {
    // West vertical wall reflection: horizontal inverted
    // NW (1) -> NE (3); SW (6) -> SE (4)
    bouncedDir = currentDir === 1 ? 3 : 4;
  } else if (hitEast) {
    // East vertical wall reflection: horizontal inverted
    // NE (3) -> NW (1); SE (4) -> SW (6)
    bouncedDir = currentDir === 3 ? 1 : 6;
  } else if (hitNorth) {
    // North ceiling reflection: vertical inverted
    // N (2) -> S (5); NW (1) -> SW (6); NE (3) -> SE (4)
    bouncedDir = currentDir === 2 ? 5 : currentDir === 1 ? 6 : 4;
  } else if (hitSouth) {
    // South floor reflection: vertical inverted
    // S (5) -> N (2); SW (6) -> NW (1); SE (4) -> NE (3)
    bouncedDir = currentDir === 5 ? 2 : currentDir === 6 ? 1 : 3;
  } else {
    // Standard 180° reverse
    bouncedDir = (((currentDir + 2) % 6) + 1) as DirectionIndex;
  }

  // Attempt neighbor in bounced direction
  let target = getNeighbor(coord, bouncedDir);

  // If corner constraint prevents direct bouncedDir, fallback to 180° reverse
  if (!target) {
    const reverseDir = (((currentDir + 2) % 6) + 1) as DirectionIndex;
    target = getNeighbor(coord, reverseDir);
    if (target) {
      return { nextCoord: target, nextDir: reverseDir, bounced: true };
    }
  }

  // Failsafe: pick any valid neighbor to ensure player never gets stuck
  if (!target) {
    const valid = getAllNeighbors(coord);
    if (valid.length > 0) {
      return { nextCoord: valid[0], nextDir: bouncedDir, bounced: true };
    }
    return { nextCoord: coord, nextDir: bouncedDir, bounced: true };
  }

  return { nextCoord: target, nextDir: bouncedDir, bounced: true };
}

// Trace a straight line path with wall bouncing so players never get blocked by map edges
export function tracePath(start: HexCoord, initialDir: DirectionIndex, distance: number): HexCoord[] {
  const path: HexCoord[] = [];
  let current = start;
  let currentDir = initialDir;

  for (let i = 0; i < distance; i++) {
    const { nextCoord, nextDir } = getBouncedStep(current, currentDir);
    path.push(nextCoord);
    current = nextCoord;
    currentDir = nextDir;
  }

  return path;
}

// Trace path with a waypoint deviation: step1Dir for dist1, then step2Dir for dist2
export function traceSplitPath(
  start: HexCoord,
  dir1: DirectionIndex,
  dist1: number,
  dir2: DirectionIndex,
  dist2: number
): HexCoord[] {
  const path1 = tracePath(start, dir1, dist1);
  const intermediate = path1.length > 0 ? path1[path1.length - 1] : start;
  const path2 = tracePath(intermediate, dir2, dist2);
  return [...path1, ...path2];
}

// Convert column and row to pixel center (flat-topped hexes)
export function hexToPixel(col: number, row: number, radius: number): { x: number; y: number } {
  const width = radius * 2;
  const height = Math.sqrt(3) * radius;
  const horizontalSpacing = radius * 1.5;
  const verticalSpacing = height;

  const x = col * horizontalSpacing + radius;
  const y = row * verticalSpacing + (col % 2 !== 0 ? height / 2 : 0) + height / 2;

  return { x, y };
}

// Generate SVG polygon points for a flat-topped hex centered at (cx, cy)
export function getHexPolygonPoints(cx: number, cy: number, radius: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angleRad = (Math.PI / 180) * (60 * i);
    const px = cx + radius * Math.cos(angleRad);
    const py = cy + radius * Math.sin(angleRad);
    points.push(`${px.toFixed(2)},${py.toFixed(2)}`);
  }
  return points.join(' ');
}

// Hex distance estimation (approximate axial distance)
export function hexDistance(a: HexCoord, b: HexCoord): number {
  // Convert offset to cube coordinates
  const q1 = a.col;
  const r1 = a.row - (a.col - (a.col & 1)) / 2;
  const s1 = -q1 - r1;

  const q2 = b.col;
  const r2 = b.row - (b.col - (b.col & 1)) / 2;
  const s2 = -q2 - r2;

  return Math.max(Math.abs(q1 - q2), Math.abs(r1 - r2), Math.abs(s1 - s2));
}

// Compass direction hint from adventurer to goal
export function getCompassDirection(from: HexCoord, to: HexCoord): string {
  const dx = to.col - from.col;
  const dy = to.row - from.row;

  if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
    if (dy < 0) return 'directly North';
    if (dy > 0) return 'directly South';
    if (dx > 0) return 'East';
    return 'West';
  }

  if (dy < -2) {
    if (dx > 1) return 'North-East';
    if (dx < -1) return 'North-West';
    return 'due North';
  }
  if (dy > 2) {
    if (dx > 1) return 'South-East';
    if (dx < -1) return 'South-West';
    return 'due South';
  }
  if (dx > 0) return 'East';
  return 'West';
}
