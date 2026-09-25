import React, { useState } from 'react';
import { HexCoord } from '../types';

export interface FlowerHexTile {
  q: number; // axial q
  r: number; // axial r
  revealed: boolean;
  type: 'entrance' | 'pylon' | 'chamber' | 'core';
  title: string;
  description: string;
  hasUtopiaNode?: boolean;
  nodeActivated?: boolean;
}

interface FlowerHexGridProps {
  currentFloor: number;
  onAdvanceFloor?: () => void;
  onTileClick?: (tile: FlowerHexTile) => void;
}

/**
 * Generates the 19-tile radius-2 hexagon flower formation.
 * Axial coordinates with constraint: max(|q|, |r|, |q+r|) <= 2
 */
export function generateFlowerFloorTiles(): FlowerHexTile[] {
  const tiles: FlowerHexTile[] = [];

  for (let q = -2; q <= 2; q++) {
    const r1 = Math.max(-2, -q - 2);
    const r2 = Math.min(2, -q + 2);
    for (let r = r1; r <= r2; r++) {
      const isCenter = q === 0 && r === 0;
      const isOuter = Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) === 2;
      const isInnerRing = !isCenter && !isOuter;

      let type: FlowerHexTile['type'] = 'chamber';
      let title = `Vault Cell [${q},${r}]`;
      let description = 'Ancient subterranean chamber waiting to be explored.';
      let hasUtopiaNode = false;

      if (q === 0 && r === -2) {
        type = 'entrance';
        title = 'Descent Gateway';
        description = 'The stone archway leading down from Level 2.';
      } else if (isCenter) {
        type = 'core';
        title = 'Floor 1 Utopia Core Nexus';
        description = 'The grand alignment mechanism powering the subterranean floors.';
        hasUtopiaNode = true;
      } else if (isInnerRing && (q === 1 || q === -1)) {
        type = 'pylon';
        title = 'Harmonic Resonator Pylon';
        description = 'A brass pylon engraved with Utopia Engine glyphs.';
        hasUtopiaNode = true;
      }

      tiles.push({
        q,
        r,
        revealed: type === 'entrance', // Entrance starts revealed
        type,
        title,
        description,
        hasUtopiaNode,
        nodeActivated: false,
      });
    }
  }

  return tiles;
}

export const FlowerHexGrid: React.FC<FlowerHexGridProps> = ({
  currentFloor,
  onAdvanceFloor,
}) => {
  const [tiles, setTiles] = useState<FlowerHexTile[]>(() => generateFlowerFloorTiles());
  const [selectedTile, setSelectedTile] = useState<FlowerHexTile | null>(null);

  // SVG parameters for pointy-top axial hexes
  const hexSize = 42;
  const svgWidth = 460;
  const svgHeight = 440;
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;

  // Axial to pixel coords (pointy-topped)
  const hexToPixel = (q: number, r: number) => {
    const x = hexSize * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
    const y = hexSize * ((3 / 2) * r);
    return { x: centerX + x, y: centerY + y };
  };

  const getHexPoints = (cx: number, cy: number, size: number) => {
    const points: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i - 30);
      points.push(`${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`);
    }
    return points.join(' ');
  };

  const handleHexClick = (tile: FlowerHexTile) => {
    // Reveal tile when clicked
    setTiles((prev) =>
      prev.map((t) => (t.q === tile.q && t.r === tile.r ? { ...t, revealed: true } : t))
    );
    setSelectedTile({ ...tile, revealed: true });
  };

  const revealedCount = tiles.filter((t) => t.revealed).length;

  return (
    <div className="flex flex-col items-center bg-[#fdfbf7] border-2 border-[#2b261f] rounded-2xl p-4 shadow-xl max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="w-full flex items-center justify-between border-b-2 border-[#2b261f] pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-[#2d6a4f] text-white px-2 py-0.5 rounded border border-[#1b4332]">
              LEVEL 3 • FLOOR {currentFloor} of 3
            </span>
            <span className="text-xs font-mono font-bold bg-[#e8deca] text-[#5c5244] px-2 py-0.5 rounded border border-[#cfbe9f]">
              {revealedCount} / 19 Tiles Revealed
            </span>
          </div>
          <h2 className="text-xl font-serif font-black text-[#2b261f] mt-1">
            The 19-Petal Utopia Machine Floor
          </h2>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-mono font-bold text-[#7a6d59] uppercase block">
            Mechanic Destination
          </span>
          <span className="text-xs font-bold text-[#2d6a4f]">
            Utopia Alignment Grid
          </span>
        </div>
      </div>

      {/* Hex Flower SVG Canvas */}
      <div className="relative bg-[#f4edd9] border-2 border-[#2b261f] rounded-xl p-2 shadow-inner overflow-hidden flex items-center justify-center">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-[420px] h-auto select-none"
        >
          {/* Subtle grid background accent rings */}
          <circle cx={centerX} cy={centerY} r={hexSize * 3.4} fill="none" stroke="#e0d4bc" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx={centerX} cy={centerY} r={hexSize * 2.0} fill="none" stroke="#d5c7ab" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Render 19 Hex Petals */}
          {tiles.map((tile) => {
            const { x, y } = hexToPixel(tile.q, tile.r);
            const isSelected = selectedTile?.q === tile.q && selectedTile?.r === tile.r;

            // Colors based on revealed status and type
            let fill = '#e5dac3'; // Unrevealed face-down parchment
            let stroke = '#8c7d67';

            if (tile.revealed) {
              if (tile.type === 'entrance') {
                fill = '#cbd5e1';
                stroke = '#475569';
              } else if (tile.type === 'core') {
                fill = '#fed7aa';
                stroke = '#ea580c';
              } else if (tile.type === 'pylon') {
                fill = '#dcfce7';
                stroke = '#16a34a';
              } else {
                fill = '#faf5ec';
                stroke = '#2b261f';
              }
            }

            if (isSelected) {
              stroke = '#d97706';
            }

            return (
              <g
                key={`flower-${tile.q}-${tile.r}`}
                onClick={() => handleHexClick(tile)}
                className="cursor-pointer transition-transform hover:opacity-90 active:scale-95"
              >
                <polygon
                  points={getHexPoints(x, y, hexSize - 2)}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isSelected ? '3.5' : tile.revealed ? '2.5' : '1.5'}
                />

                {/* Inner Icon or Coordinate */}
                {tile.revealed ? (
                  <>
                    <text
                      x={x}
                      y={y - 6}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="text-base select-none pointer-events-none"
                    >
                      {tile.type === 'entrance' ? '⛩️' : tile.type === 'core' ? '⚙️' : tile.type === 'pylon' ? '🔮' : '🏛️'}
                    </text>
                    <text
                      x={x}
                      y={y + 12}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="9"
                      fontWeight="bold"
                      fill="#2b261f"
                      fontFamily="monospace"
                      className="select-none pointer-events-none"
                    >
                      {tile.type === 'entrance' ? 'EXIT' : tile.type === 'core' ? 'CORE' : tile.type === 'pylon' ? 'PYLON' : `${tile.q},${tile.r}`}
                    </text>
                  </>
                ) : (
                  <g className="select-none pointer-events-none">
                    <circle cx={x} cy={y} r="5" fill="#a89a80" />
                    <text
                      x={x}
                      y={y + 14}
                      textAnchor="middle"
                      fontSize="8"
                      fill="#8a7c64"
                      fontFamily="monospace"
                    >
                      ?
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Tile Inspector / Utopia Engine Placeholder Banner */}
      <div className="w-full mt-4 bg-[#f4edd9] border border-[#d6c4a5] rounded-xl p-3">
        {selectedTile ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-serif font-black text-sm text-[#2b261f] flex items-center gap-1.5">
                <span>{selectedTile.type === 'core' ? '⚙️' : selectedTile.type === 'pylon' ? '🔮' : '🏛️'}</span>
                <span>{selectedTile.title}</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-[#e8deca] text-[#5c5244] px-1.5 py-0.5 rounded">
                Hex [{selectedTile.q}, {selectedTile.r}]
              </span>
            </div>
            <p className="text-xs text-[#5c5244] leading-relaxed">
              {selectedTile.description}
            </p>

            {selectedTile.hasUtopiaNode && (
              <div className="mt-2 p-2 bg-[#fef3c7] border border-[#f59e0b] rounded-lg flex items-center justify-between text-xs">
                <span className="font-bold text-[#92400e] flex items-center gap-1">
                  <span>⚙️</span> Utopia Engine Alignment Socket
                </span>
                <span className="text-[10px] font-mono bg-[#fde68a] text-[#78350f] px-2 py-0.5 rounded font-bold">
                  (Assigned to Level 3)
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-xs font-mono text-[#7a6d59] py-1">
            Click on any flower hex tile above to flip and inspect the subterranean machine floor.
          </div>
        )}
      </div>
    </div>
  );
};
