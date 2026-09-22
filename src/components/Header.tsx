import React from 'react';
import { Volume2, VolumeX, BookOpen, RotateCcw, Compass } from 'lucide-react';

interface HeaderProps {
  energy: number;
  maxEnergy: number;
  turn: number;
  revealedCount: number;
  totalHexes: number;
  goalFound: boolean;
  goalClue?: string | null;
  goalQuadrant?: { code: string; name: string; bounds?: string } | null;
  hasTelescope?: boolean;
  hasDiceModifier?: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenRules: () => void;
  onNewGame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  energy,
  maxEnergy,
  turn,
  revealedCount,
  totalHexes,
  goalFound,
  goalClue,
  goalQuadrant,
  hasTelescope,
  hasDiceModifier,
  soundEnabled,
  onToggleSound,
  onOpenRules,
  onNewGame,
}) => {
  const exploredPct = Math.round((revealedCount / totalHexes) * 100);
  const isLowEnergy = energy <= 5;

  return (
    <header className="shrink-0 bg-[#e8deca] border-b-2 border-[#2b261f] shadow-xs select-none">
      {/* Compact single row top utility & game status */}
      <div className="flex items-center justify-between px-2.5 py-1 border-b border-[#2b261f]/20">
        <button
          id="btn-new-expedition"
          onClick={onNewGame}
          className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase bg-[#f5efe3] hover:bg-[#fff9ed] text-[#2b261f] border border-[#2b261f] rounded shadow-2xs active:translate-y-px cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>New Game</span>
        </button>

        {/* Center Title + Active Boons Badges */}
        <div className="flex items-center gap-1.5 font-bold text-xs text-[#2b261f] uppercase font-mono tracking-tight">
          <div className="flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-[#2d6a4f]" />
            <span>Hex Crawl</span>
          </div>

          {(goalQuadrant || hasTelescope || hasDiceModifier) && (
            <div className="flex items-center gap-1 ml-1 text-[10px] normal-case">
              {goalQuadrant && (
                <span
                  className="px-1.5 py-0.2 bg-[#fef3c7] text-[#92400e] border border-[#b45309]/50 rounded font-black font-mono"
                  title={`Map: Beacon located in ${goalQuadrant.name} (${goalQuadrant.bounds || ''})`}
                >
                  🗺️ {goalQuadrant.code}
                </span>
              )}
              {hasTelescope && (
                <span
                  className="px-1.5 py-0.2 bg-[#dbeafe] text-[#1e40af] border border-[#3b82f6]/50 rounded font-black font-mono"
                  title="Telescope Active: Watchtowers reveal all 6 directions to board edge!"
                >
                  🔭 Scope
                </span>
              )}
              {hasDiceModifier && (
                <span
                  className="px-1.5 py-0.2 bg-[#f3e8ff] text-[#6b21a8] border border-[#9333ea]/50 rounded font-black font-mono"
                  title="Dice Modifier Active: You can adjust either movement die by ±1 every turn!"
                >
                  🎲 ±1 Mod
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            id="btn-toggle-sound"
            onClick={onToggleSound}
            aria-label="Toggle Sound"
            className="p-1 text-xs bg-[#f5efe3] hover:bg-[#fff9ed] text-[#2b261f] border border-[#2b261f] rounded shadow-2xs cursor-pointer"
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-stone-400" />}
          </button>

          <button
            id="btn-open-rules"
            onClick={onOpenRules}
            className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold uppercase bg-[#f5efe3] hover:bg-[#fff9ed] text-[#2b261f] border border-[#2b261f] rounded shadow-2xs cursor-pointer"
          >
            <BookOpen className="w-3 h-3" />
            <span>Rules</span>
          </button>
        </div>
      </div>

      {/* Ultra-compact Scorecard Stats Bar */}
      <div className="grid grid-cols-4 divide-x divide-[#2b261f]/30 py-0.5 bg-[#ede4d3] text-center">
        {/* Energy Countdown */}
        <div className="flex items-center justify-center gap-1 px-1">
          <span className="text-[9px] uppercase font-mono text-[#5c5446]">⚡</span>
          <span
            className={`text-sm font-black font-mono tracking-tight ${
              isLowEnergy ? 'text-red-700 animate-pulse' : 'text-[#2d6a4f]'
            }`}
          >
            {energy}
          </span>
          <span className="text-[10px] font-mono text-[#786e5e]">/{maxEnergy}</span>
        </div>

        {/* Turn Count */}
        <div className="flex items-center justify-center gap-1 px-1">
          <span className="text-[9px] uppercase font-mono text-[#5c5446]">Turn:</span>
          <span className="text-sm font-black font-mono text-[#2b261f]">
            {turn}
          </span>
        </div>

        {/* Explored Percentage */}
        <div className="flex items-center justify-center gap-1 px-1">
          <span className="text-[9px] uppercase font-mono text-[#5c5446]">Seen:</span>
          <span className="text-sm font-black font-mono text-[#2b261f]">
            {exploredPct}%
          </span>
        </div>

        {/* Beacon / Goal Status */}
        <div className="flex items-center justify-center gap-1 px-1">
          <span className="text-[9px] uppercase font-mono text-[#5c5446]">Goal:</span>
          <span
            className={`text-[11px] font-black font-mono uppercase truncate ${
              goalFound ? 'text-[#2d6a4f]' : goalClue ? 'text-[#b45309]' : 'text-[#8a7f6f]'
            }`}
            title={
              goalFound
                ? 'Goal Found!'
                : goalQuadrant
                ? `In ${goalQuadrant.name}${goalClue ? ` (${goalClue})` : ''}`
                : goalClue
                ? `Goal lies: ${goalClue}`
                : 'Goal Hidden'
            }
          >
            {goalFound
              ? '🌟 Found'
              : goalQuadrant
              ? `${goalQuadrant.code} ${goalClue || ''}`
              : goalClue
              ? `🧭 ${goalClue}`
              : '❓ Hidden'}
          </span>
        </div>
      </div>
    </header>
  );
};
