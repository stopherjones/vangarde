import React from 'react';
import { X, Dices, Zap, Eye, Castle, ShieldAlert, Sparkles } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-[#f4edd9] border-2 border-[#2b261f] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#e2d5bd] border-b-2 border-[#2b261f]">
          <h2 className="text-sm font-black font-mono uppercase tracking-wider text-[#2b261f] flex items-center gap-2">
            <span>📜 Field Manual & Expedition Rules</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#d4c3a5] text-[#2b261f] border border-[#2b261f] rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 overflow-y-auto space-y-3.5 text-xs font-mono text-[#2b261f] leading-relaxed">
          {/* Objective */}
          <div className="bg-[#ede4d3] p-2.5 rounded-lg border border-[#2b261f]/30">
            <div className="font-black uppercase text-[#2d6a4f] mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Objective: Find the Lost Beacon</span>
            </div>
            <p>
              Navigate the 11x12 uncharted wilderness from your expedition camp in the center of the realm. Reach the hidden
              Golden Beacon (located more than 2 hexes away from camp) before your Energy countdown runs out!
            </p>
          </div>

          {/* 2D6 Movement & Deviation */}
          <div className="space-y-1.5">
            <div className="font-black uppercase text-[#2b261f] flex items-center gap-1.5 border-b border-[#2b261f]/20 pb-0.5">
              <Dices className="w-3.5 h-3.5 text-[#2d6a4f]" />
              <span>2D6 Movement & Direction</span>
            </div>
            <p>
              Each turn, roll two six-sided dice (2D6). You freely choose which die represents
              <strong> Distance</strong> (1–6 hexes) and which represents <strong> Direction</strong> (1: NW, 2: N, 3: NE, 4: SE, 5: S, 6: SW).
            </p>
            <div className="bg-[#fefaf0] p-2 rounded border border-[#2b261f]/20">
              <span className="font-bold flex items-center gap-1 text-[#b45309]">
                <Zap className="w-3 h-3" /> One Deviation per Turn:
              </span>
              <p className="mt-0.5 text-[11px]">
                You can deviate once per turn: choose any direction regardless of your roll, or split your rolled distance between two directions!
              </p>
            </div>
          </div>

          {/* Energy & Move 1 */}
          <div className="space-y-1.5">
            <div className="font-black uppercase text-[#2b261f] flex items-center gap-1.5 border-b border-[#2b261f]/20 pb-0.5">
              <Eye className="w-3.5 h-3.5 text-[#2d6a4f]" />
              <span>Energy & Fog of War</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[11px]">
              <li><strong>Moving:</strong> Costs 1 Energy per hex traveled.</li>
              <li><strong>Boundary Bouncing:</strong> If your path reaches the edge of the map, it bounces back into the grid so you never get stuck with lost moves.</li>
              <li><strong>Revealing vs Activating:</strong> All hexes passed over are revealed from the fog. However, hazards and shrines only trigger if you land on them — except for Clue Cairns, which activate whenever you pass over them!</li>
              <li><strong>Move 1 Step:</strong> At any time (before or after rolling), you may pay 1 Energy to move directly into any adjacent hex (revealed or hidden), exploring and activating that space.</li>
            </ul>
          </div>

          {/* Special Hexes */}
          <div className="space-y-1.5">
            <div className="font-black uppercase text-[#2b261f] flex items-center gap-1.5 border-b border-[#2b261f]/20 pb-0.5">
              <Castle className="w-3.5 h-3.5 text-[#2d6a4f]" />
              <span>Special Landmarks</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
              <div className="p-1.5 bg-[#dfb87c]/30 rounded border border-[#2b261f]/20">
                <strong>Ancient Watchtowers:</strong> Reveals all adjacent hexes, plus 6 hexes along NW, N, NE, SE, S, SW lines of sight (or all hexes in those 6 directions with Telescope), and charts all watchtowers!
              </div>
              <div className="p-1.5 bg-[#bce3cb]/40 rounded border border-[#2b261f]/20">
                <strong>Supply Caches:</strong> Abundant food & water caches (+1, +2, or +3 Energy) scattered through the wilderness.
              </div>
              <div className="p-1.5 bg-[#dbc5ea]/40 rounded border border-[#2b261f]/20 sm:col-span-2">
                <strong>Fortune Shrines:</strong> Roll Fate D6: 1 Pip = Free Move 1 Hex (step into any adjacent hex for 0 ⚡), 2 Pips = Brass Telescope (Towers reveal all 6 rays), 3 Pips = Dice Modifier (±1 to either die each turn), 4 = Free Move 1 Hex & +2 Energy, 5 = Telescope & +2 Energy, 6 = Dice Modifier & +2 Energy.
              </div>
              <div className="p-1.5 bg-[#d9d0c1] rounded border border-[#2b261f]/20 sm:col-span-2">
                <strong>Clue Cairns (1 per column):</strong> When revealed, each cairn activates and signposts the bearing to the Golden Beacon based on coordinate proportions:
                <div className="mt-1 pl-2 border-l-2 border-[#2b261f]/30 space-y-0.5 text-[10.5px]">
                  <div>• <strong>North / South (↑ N / ↓ S):</strong> Beacon is predominantly north or south. All tiles north or south of the cairn are highlighted.</div>
                  <div>• <strong>East / West (→ E / ← W):</strong> Beacon is predominantly east or west. All tiles east or west of the cairn are highlighted.</div>
                  <div>• <strong>Diagonals (↗ NE, ↖ NW, ↘ SE, ↙ SW):</strong> Roughly as many spaces north/south as east/west. That entire quadrant is highlighted.</div>
                  <div>• <strong>Triangulation:</strong> As you discover multiple cairns, their overlapping regions intersect to progressively whittle down the beacon's exact location!</div>
                </div>
              </div>
            </div>
          </div>

          {/* Hazards */}
          <div className="space-y-1.5">
            <div className="font-black uppercase text-[#b91c1c] flex items-center gap-1.5 border-b border-[#2b261f]/20 pb-0.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Environmental Hazards</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[11px]">
              <li><strong>Peat Bogs:</strong> Cost -1 extra Energy to traverse.</li>
              <li><strong>Arcane Rifts:</strong> Unstable! Roll D6 upon entry: Odd inflicts -2 Energy penalty, Even is safe.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#e2d5bd] border-t-2 border-[#2b261f] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#2d6a4f] hover:bg-[#23533e] text-white font-mono font-bold text-xs uppercase rounded-md border-2 border-[#2b261f] shadow-xs active:translate-y-px cursor-pointer"
          >
            Understood, Let's Explore!
          </button>
        </div>
      </div>
    </div>
  );
};
