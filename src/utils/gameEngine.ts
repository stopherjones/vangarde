import { HexTile, HexCoord, HexType } from '../types';
import { GRID_COLS, GRID_ROWS, hexDistance } from './hexMath';

export const START_COORD: HexCoord = { col: 5, row: 11 };

export function generateMap(): { tiles: Map<string, HexTile>; goalCoord: HexCoord; towerCoords: HexCoord[] } {
  const tiles = new Map<string, HexTile>();
  const allCoords: HexCoord[] = [];

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      allCoords.push({ col: c, row: r });
    }
  }

  // Pick Goal: Row 0 to 3, distance >= 8 from start
  const potentialGoals = allCoords.filter(
    (coord) => coord.row <= 3 && hexDistance(coord, START_COORD) >= 8
  );
  const goalCoord = potentialGoals[Math.floor(Math.random() * potentialGoals.length)] || { col: 5, row: 1 };

  // Helper to pick non-overlapping random coords
  const occupied = new Set<string>();
  occupied.add(`${START_COORD.col},${START_COORD.row}`);
  occupied.add(`${goalCoord.col},${goalCoord.row}`);

  function getRandomAvailable(predicate?: (c: HexCoord) => boolean): HexCoord | null {
    const candidates = allCoords.filter(
      (c) => !occupied.has(`${c.col},${c.row}`) && (!predicate || predicate(c))
    );
    if (candidates.length === 0) return null;
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    occupied.add(`${picked.col},${picked.row}`);
    return picked;
  }

  // One Tower in each column across the grid (columns 0 through GRID_COLS - 1)
  const towerCoords: HexCoord[] = [];
  for (let c = 0; c < GRID_COLS; c++) {
    const tower = getRandomAvailable((coord) => coord.col === c);
    if (tower) {
      towerCoords.push(tower);
    }
  }

  // One Cairn in each column across the grid (columns 0 through GRID_COLS - 1)
  const clueCoords: HexCoord[] = [];
  for (let c = 0; c < GRID_COLS; c++) {
    const cairn = getRandomAvailable((coord) => coord.col === c);
    if (cairn) {
      clueCoords.push(cairn);
    }
  }

  // Energy caches: ~10 of +1 energy, ~5 of +2 energy, 3 of +3 energy (18 total)
  const cache1Coords: HexCoord[] = [];
  for (let i = 0; i < 10; i++) {
    const c = getRandomAvailable();
    if (c) cache1Coords.push(c);
  }

  const cache2Coords: HexCoord[] = [];
  for (let i = 0; i < 5; i++) {
    const c = getRandomAvailable();
    if (c) cache2Coords.push(c);
  }

  const cache3Coords: HexCoord[] = [];
  for (let i = 0; i < 3; i++) {
    const c = getRandomAvailable();
    if (c) cache3Coords.push(c);
  }

  // 5 Fortune Shrines (Roll D6: Map, Telescope, or Energy)
  const shrineCoords: HexCoord[] = [];
  for (let i = 0; i < 5; i++) {
    const c = getRandomAvailable();
    if (c) shrineCoords.push(c);
  }

  // 7 Bogs (hazards: -1 energy)
  const bogCoords: HexCoord[] = [];
  for (let i = 0; i < 7; i++) {
    const c = getRandomAvailable();
    if (c) bogCoords.push(c);
  }

  // 5 Arcane Rifts (hazards: roll odd/even for 0 or -2 energy)
  const riftCoords: HexCoord[] = [];
  for (let i = 0; i < 5; i++) {
    const c = getRandomAvailable();
    if (c) riftCoords.push(c);
  }

  // Assemble all tiles
  for (const c of allCoords) {
    const key = `${c.col},${c.row}`;
    let type: HexType = 'blank';
    let value = 0;
    let flavorText = 'Uncharted Wilderness';

    if (c.col === START_COORD.col && c.row === START_COORD.row) {
      type = 'start';
      flavorText = 'Base Expedition Camp';
    } else if (c.col === goalCoord.col && c.row === goalCoord.row) {
      type = 'goal';
      flavorText = 'The Lost Golden Beacon!';
    } else if (towerCoords.some((t) => t.col === c.col && t.row === c.row)) {
      type = 'tower';
      flavorText = 'Ancient Watchtower: Reveals adjacent lands, 6 directional sightlines & all towers';
    } else if (cache1Coords.some((x) => x.col === c.col && x.row === c.row)) {
      type = 'energy_cache';
      value = 1;
      flavorText = 'Spring Rations (+1 Energy)';
    } else if (cache2Coords.some((x) => x.col === c.col && x.row === c.row)) {
      type = 'energy_cache';
      value = 2;
      flavorText = 'Supply Depot (+2 Energy)';
    } else if (cache3Coords.some((x) => x.col === c.col && x.row === c.row)) {
      type = 'energy_cache';
      value = 3;
      flavorText = 'Abundant Cache (+3 Energy)';
    } else if (shrineCoords.some((x) => x.col === c.col && x.row === c.row)) {
      type = 'luck_shrine';
      flavorText = 'Fortune Shrine: Roll D6 for Map, Telescope, or Energy';
    } else if (bogCoords.some((x) => x.col === c.col && x.row === c.row)) {
      type = 'bog_hazard';
      value = -1;
      flavorText = 'Deep Peat Bog (-1 Energy to traverse)';
    } else if (riftCoords.some((x) => x.col === c.col && x.row === c.row)) {
      type = 'rift_hazard';
      value = -2;
      flavorText = 'Arcane Bramble Rift: Roll D6 (Odd = -2 Energy, Even = Safe)';
    } else if (clueCoords.some((x) => x.col === c.col && x.row === c.row)) {
      type = 'clue_cairn';
      flavorText = 'Ancient Cairn: Whispers the bearing of the Goal';
    }

    const isStart = c.col === START_COORD.col && c.row === START_COORD.row;

    tiles.set(key, {
      id: key,
      col: c.col,
      row: c.row,
      type,
      revealed: isStart,
      visited: isStart,
      value,
      flavorText,
    });
  }

  return { tiles, goalCoord, towerCoords };
}
