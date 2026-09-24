import React from 'react';
import { TunnelCard, ALL_HEART_RANKS } from '../utils/delveDeck';
import { ShieldAlert, Sparkles, Trophy, Ban, Sparkle } from 'lucide-react';
import { DirectionIndex } from '../types';
import { getCardConciseDescription } from '../utils/tunnelEngine';

interface CardDisplayProps {
  card: TunnelCard | null;
  deckCount: number;
  discardCards?: TunnelCard[];
  onDrawCard?: () => void;
  canDraw?: boolean;
  activeExitDirs?: DirectionIndex[];
}

export const CardDisplay: React.FC<CardDisplayProps> = ({
  card,
  deckCount,
  discardCards = [],
  onDrawCard,
  canDraw = false,
  activeExitDirs = [],
}) => {
  const drawnRanksSet = new Set(discardCards.map((c) => c.rank));

  // Card title formatting
  const getCardTitle = (c: TunnelCard) => {
    switch (c.effect) {
      case 'fork':
        return `${c.rank} of Hearts — Fork Passage`;
      case 'chamber':
        return `${c.rank} of Hearts — Large Chamber`;
      case 'dead_end':
        return `${c.rank} of Hearts — Dead End`;
      case 'trap':
        return `${c.rank} of Hearts — Trap Chamber`;
      case 'treasure':
        return `${c.rank} of Hearts — Ancient Vault`;
      case 'target':
        return 'Ace of Hearts — Exit Archway';
      default:
        return c.name;
    }
  };

  return (
    <div className="bg-[#1c1917] border border-[#44403c] rounded-xl p-2 shadow-lg text-stone-200 flex flex-col gap-2 select-none">
      {/* Illuminated Cards Tracker Row (greys out as drawn) */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto py-1 px-1 bg-[#141211] rounded-lg border border-[#2b2724]">
        {ALL_HEART_RANKS.map((rank) => {
          const isDrawn = drawnRanksSet.has(rank);
          return (
            <div
              key={rank}
              className={`flex-1 min-w-[20px] py-1 px-0.5 rounded text-center text-[10px] font-mono leading-none border transition-all ${
                isDrawn
                  ? 'bg-[#1e1b18] text-stone-600 border-stone-800 line-through opacity-40'
                  : rank === 'A'
                  ? 'bg-amber-950 text-amber-300 border-amber-600 font-black animate-pulse shadow-xs'
                  : rank === 'J'
                  ? 'bg-rose-950 text-rose-300 border-rose-800 font-bold'
                  : 'bg-[#292524] text-rose-400 border-[#44403c] font-bold'
              }`}
              title={`${rank}♥: ${isDrawn ? 'Drawn' : 'In Deck'}`}
            >
              <span>{rank}</span>
            </div>
          );
        })}
      </div>

      {/* Main Interactive Section: Prompts To Draw Card OR Active Card Details */}
      {canDraw ? (
        <div className="p-2 bg-[#25211e] rounded-lg border border-[#443e38] shadow-md flex flex-col sm:flex-row items-center justify-between gap-2.5 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 text-left w-full sm:w-auto">
            {/* Playing Card Back Icon */}
            <div className="w-10 h-14 bg-gradient-to-b from-[#2e2620] to-[#1a1614] border border-amber-600/70 rounded-md shadow-md flex flex-col items-center justify-center p-0.5 flex-shrink-0">
              <span className="text-base text-rose-400 font-black">♥</span>
              <div className="w-5 h-5 rounded-full border border-amber-500/40 flex items-center justify-center mt-0.5">
                <Sparkle className="w-3 h-3 text-amber-300" />
              </div>
            </div>
            <div>
              <div className="text-xs font-black text-stone-100">
                {card && (card.effect === 'trap' || card.effect === 'treasure')
                  ? `${card.rank}♥ Cleared!`
                  : 'Chamber Unsurveyed!'}
              </div>
              <div className="text-[11px] text-stone-300 leading-snug mt-0.5">
                {card && (card.effect === 'trap' || card.effect === 'treasure')
                  ? 'Event resolved! Draw a new Delve Card to discover corridor exits.'
                  : 'Draw a Hearts Delve Card to survey this chamber & carve exits.'}
              </div>
            </div>
          </div>

          {onDrawCard && (
            <button
              onClick={onDrawCard}
              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 active:scale-95 text-emerald-100 font-bold text-xs uppercase rounded border border-emerald-500 shadow flex items-center justify-center gap-1.5 cursor-pointer transition-all flex-shrink-0"
            >
              <span className="text-sm leading-none">🂠</span>
              <span>
                {card && (card.effect === 'trap' || card.effect === 'treasure')
                  ? 'Draw Exits Card'
                  : 'Draw Delve Card'}
              </span>
            </button>
          )}
        </div>
      ) : card ? (
        <div className="flex items-center gap-3 px-1 py-0.5">
          {/* Card Face Graphic - Completely contained with absolute positioning & overflow-hidden */}
          <div className="relative w-11 h-15 bg-[#fffdfa] border-2 border-[#2b261f] rounded-md shadow-md select-none flex-shrink-0 overflow-hidden">
            {/* Top-left corner */}
            <div className="absolute top-1 left-1 flex flex-col items-center leading-none pointer-events-none">
              <span className="font-serif font-black text-xs text-[#b91c1c] leading-none">
                {card.rank}
              </span>
              <span className="text-[8px] text-[#b91c1c] leading-none mt-0.5">♥</span>
            </div>

            {/* Center Emblem */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {card.effect === 'target' ? (
                <Trophy className="w-4 h-4 text-amber-500 animate-pulse" />
              ) : card.effect === 'dead_end' ? (
                <Ban className="w-3.5 h-3.5 text-stone-500" />
              ) : card.effect === 'trap' ? (
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              ) : card.effect === 'treasure' ? (
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <span className="font-serif font-black text-sm text-[#b91c1c] leading-none">♥</span>
              )}
            </div>

            {/* Bottom-right corner (inverted) */}
            <div className="absolute bottom-1 right-1 flex flex-col items-center leading-none rotate-180 pointer-events-none">
              <span className="font-serif font-black text-xs text-[#b91c1c] leading-none">
                {card.rank}
              </span>
              <span className="text-[8px] text-[#b91c1c] leading-none mt-0.5">♥</span>
            </div>
          </div>

          {/* Concise Card Details */}
          <div className="flex-1 min-w-0 space-y-0.5 font-mono">
            <div className="flex items-center justify-between gap-1">
              <span className="font-bold text-xs text-rose-300 truncate">
                {getCardTitle(card)}
              </span>
              <span
                className={`text-[9px] px-1 py-0.2 rounded font-black uppercase flex-shrink-0 ${
                  card.effect === 'target'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : card.effect === 'dead_end'
                    ? 'bg-stone-700 text-stone-300'
                    : card.effect === 'trap'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : card.effect === 'treasure'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {card.effect === 'target' ? 'Goal' : card.effect}
              </span>
            </div>

            <p className="text-[11px] text-stone-300 leading-snug">
              {getCardConciseDescription(card, activeExitDirs)}
            </p>
          </div>
        </div>
      ) : (
        <div className="py-1 text-center text-xs font-mono text-stone-400">
          Step into an illuminated corridor exit to explore deeper.
        </div>
      )}
    </div>
  );
};
