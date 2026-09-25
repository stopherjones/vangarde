import React from 'react';
import { ExplorationCard } from '../utils/explorationDeck';

interface Level2ExplorationBarProps {
  comparisonCard: ExplorationCard | null;
  drawnCard: ExplorationCard | null;
  deckCount: number;
  streak: number; // positive = winning streak, negative = losing streak, 0 = neutral
  statusText?: string | null;
  onOpenExplorationModal?: () => void;
  hasPendingPrediction?: boolean;
}

export const Level2ExplorationBar: React.FC<Level2ExplorationBarProps> = ({
  comparisonCard,
  drawnCard,
  deckCount,
  streak,
  statusText,
  onOpenExplorationModal,
  hasPendingPrediction = false,
}) => {
  const getSuitColor = (suit?: string) => {
    return suit === '♦' ? 'text-red-700' : 'text-slate-900';
  };

  const getSuitName = (suit?: string) => {
    switch (suit) {
      case '♠': return 'Spades';
      case '♦': return 'Diamonds';
      case '♣': return 'Clubs';
      default: return '';
    }
  };

  return (
    <div className="bg-[#fcf8ed] border-2 border-[#2b261f] rounded-xl p-2.5 shadow-xs select-none">
      {/* Top compact line: Title + Deck remaining count + Streak badge */}
      <div className="flex items-center justify-between border-b border-[#e2d5bd] pb-1.5 mb-2 gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-serif font-black text-[#2b261f] tracking-wide flex items-center gap-1">
            <span className="text-slate-900">♠</span>
            <span className="text-red-700">♦</span>
            <span className="text-slate-900">♣</span>
            <span>Chamber Exploration</span>
          </span>
          <span className="text-[10px] font-mono font-bold bg-[#e8deca] text-[#5c5244] px-1.5 py-0.5 rounded border border-[#cfbe9f]">
            {deckCount} left
          </span>
        </div>

        {/* Streak Meter */}
        <div className="flex items-center gap-1 font-mono text-[10px]">
          <span className="text-[#5c5244] font-semibold">Streak:</span>
          {streak > 0 ? (
            <span className="px-1.5 py-0.5 bg-[#dcfce7] text-[#15803d] font-black rounded border border-[#86efac]">
              ▲ +{streak} (+{streak + 1}⚡)
            </span>
          ) : streak < 0 ? (
            <span className="px-1.5 py-0.5 bg-[#fee2e2] text-[#b91c1c] font-black rounded border border-[#fca5a5]">
              ▼ {streak} ({streak - 1}⚡)
            </span>
          ) : (
            <span className="px-1.5 py-0.5 bg-[#f3f4f6] text-[#4b5563] font-bold rounded border border-[#d1d5db]">
              Neutral (±1⚡)
            </span>
          )}
        </div>
      </div>

      {/* Main Bar: Base Card & Status */}
      <div className="flex items-center gap-2.5">
        {/* Compact Card Graphic */}
        <div className="w-11 h-16 bg-white border-2 border-[#2b261f] rounded-md shadow-xs flex flex-col justify-between p-1 select-none shrink-0">
          <div className={`text-[10px] font-bold leading-none ${getSuitColor(comparisonCard?.suit)}`}>
            {comparisonCard?.rank}
            <div className="text-[8px]">{comparisonCard?.suit}</div>
          </div>
          <div className={`text-base font-black text-center ${getSuitColor(comparisonCard?.suit)}`}>
            {comparisonCard?.suit}
          </div>
          <div className={`text-[10px] font-bold leading-none text-right ${getSuitColor(comparisonCard?.suit)}`}>
            {comparisonCard?.rank}
          </div>
        </div>

        {/* Card info & prompt */}
        <div className="flex-1 min-w-0 font-mono">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] uppercase font-bold text-[#7a6d59]">
              Base Card: <strong className="text-[#2b261f] font-serif font-black">{comparisonCard ? `${comparisonCard.rank} of ${getSuitName(comparisonCard.suit)}` : 'None'}</strong>
            </span>
            {hasPendingPrediction && (
              <span className="text-[9px] px-1.5 py-0.5 bg-[#fef3c7] text-[#92400e] border border-[#f59e0b] font-bold rounded uppercase animate-pulse">
                Action Pending
              </span>
            )}
          </div>
          
          <div className="text-[10.5px] text-[#5c5244] mt-0.5">
            Rank value: <span className="font-bold text-[#1f2937]">{comparisonCard?.value}</span> (2 to 10)
          </div>

          {/* Discrete rule reminder line requested by user */}
          <div className="text-[9.5px] text-[#7a6d59] mt-0.5 leading-snug border-t border-[#e2d5bd] pt-0.5">
            Drawing J, Q, K, A allows you to discard current card or gamble for A♠
          </div>
        </div>

        {/* Action Button if modal was closed while prediction is still pending */}
        {hasPendingPrediction && onOpenExplorationModal && (
          <button
            type="button"
            onClick={onOpenExplorationModal}
            className="shrink-0 py-1.5 px-2 bg-[#d97706] hover:bg-[#b45309] text-white font-mono font-bold text-[10px] rounded border border-[#92400e] shadow-xs cursor-pointer flex flex-col items-center justify-center leading-tight"
          >
            <span>Predict</span>
            <span className="text-[8px] opacity-90">Higher/Lower</span>
          </button>
        )}
      </div>
    </div>
  );
};
