import React from 'react';
import { ExplorationCard } from '../utils/explorationDeck';

interface Level2ExplorationBarProps {
  comparisonCard: ExplorationCard | null;
  drawnCard: ExplorationCard | null;
  deckCount: number;
  streak: number; // positive = winning streak, negative = losing streak, 0 = neutral
  pendingChoice: 'higher_lower' | 'face_gamble' | null;
  drawnCardResultText: string | null;
  onPredict: (prediction: 'higher' | 'lower') => void;
  onFaceChoice: (choice: 'discard_redraw' | 'gamble_ace') => void;
  disabled?: boolean;
}

export const Level2ExplorationBar: React.FC<Level2ExplorationBarProps> = ({
  comparisonCard,
  drawnCard,
  deckCount,
  streak,
  pendingChoice,
  drawnCardResultText,
  onPredict,
  onFaceChoice,
  disabled = false,
}) => {
  const getSuitColor = (suit: string) => {
    return suit === '♦' ? 'text-red-700' : 'text-slate-900';
  };

  return (
    <div className="bg-[#fcf8ed] border-2 border-[#2b261f] rounded-xl p-3 shadow-md relative overflow-hidden">
      {/* Header with Title and Streak Gauge */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e2d5bd] pb-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-base font-serif font-black text-[#2b261f] tracking-wide flex items-center gap-1.5">
            <span className="text-slate-900">♠</span>
            <span className="text-red-700">♦</span>
            <span className="text-slate-900">♣</span>
            <span>Chamber Exploration</span>
          </span>
          <span className="text-xs font-mono font-bold bg-[#e8deca] text-[#5c5244] px-2 py-0.5 rounded border border-[#cfbe9f]">
            {deckCount} cards remaining
          </span>
        </div>

        {/* Streak Meter */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-[#5c5244] font-semibold">Streak:</span>
          {streak > 0 ? (
            <span className="px-2 py-0.5 bg-[#dcfce7] text-[#15803d] font-black rounded border border-[#86efac] flex items-center gap-1 animate-pulse">
              <span>▲</span> +{streak} (next: +{streak + 1}⚡)
            </span>
          ) : streak < 0 ? (
            <span className="px-2 py-0.5 bg-[#fee2e2] text-[#b91c1c] font-black rounded border border-[#fca5a5] flex items-center gap-1 animate-pulse">
              <span>▼</span> {streak} (next: {streak - 1}⚡)
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-[#f3f4f6] text-[#4b5563] font-bold rounded border border-[#d1d5db]">
              Neutral (next: ±1⚡)
            </span>
          )}
        </div>
      </div>

      {/* Main Card View & Action Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Left: Active Comparison Card */}
        <div className="md:col-span-4 flex items-center gap-3 bg-[#f5ecda] p-2.5 rounded-lg border border-[#d6c4a5]">
          <div className="w-14 h-20 bg-white border-2 border-[#2b261f] rounded-md shadow flex flex-col justify-between p-1.5 select-none shrink-0">
            <div className={`text-xs font-bold leading-none ${comparisonCard ? getSuitColor(comparisonCard.suit) : ''}`}>
              {comparisonCard?.rank}
              <div className="text-[10px]">{comparisonCard?.suit}</div>
            </div>
            <div className={`text-xl font-black text-center ${comparisonCard ? getSuitColor(comparisonCard.suit) : ''}`}>
              {comparisonCard?.suit}
            </div>
            <div className={`text-xs font-bold leading-none text-right ${comparisonCard ? getSuitColor(comparisonCard.suit) : ''}`}>
              {comparisonCard?.rank}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#7a6d59] font-bold">
              Base Card
            </div>
            <div className="text-sm font-serif font-black text-[#2b261f] truncate">
              {comparisonCard ? `${comparisonCard.rank} of ${comparisonCard.suit === '♠' ? 'Spades' : comparisonCard.suit === '♦' ? 'Diamonds' : 'Clubs'}` : 'None'}
            </div>
            <div className="text-[10px] font-mono text-[#5c5244] mt-0.5">
              Rank value: <span className="font-bold text-[#1f2937]">{comparisonCard?.value}</span> (2 to 10)
            </div>
          </div>
        </div>

        {/* Center: Interactive Prediction or Face Gamble Buttons */}
        <div className="md:col-span-8 flex flex-col gap-2">
          {pendingChoice === 'higher_lower' && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#2b261f]">
                <span>Predict next chamber card:</span>
                <span className="text-[11px] text-[#5c5244] font-normal italic">
                  Pairs push & reset streak
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onPredict('higher')}
                  className="flex-1 py-2 px-3 bg-[#15803d] hover:bg-[#166534] active:bg-[#14532d] disabled:opacity-50 text-white font-mono font-bold text-xs sm:text-sm rounded-lg shadow border border-[#14532d] flex items-center justify-center gap-2 cursor-pointer transition-transform active:translate-y-0.5"
                >
                  <span className="text-base">▲</span>
                  <span>HIGHER</span>
                  <span className="text-[10px] bg-[#14532d] px-1.5 py-0.5 rounded text-[#86efac]">
                    {streak >= 0 ? `+${streak + 1}⚡` : '+1⚡'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onPredict('lower')}
                  className="flex-1 py-2 px-3 bg-[#b91c1c] hover:bg-[#991b1b] active:bg-[#7f1d1d] disabled:opacity-50 text-white font-mono font-bold text-xs sm:text-sm rounded-lg shadow border border-[#7f1d1d] flex items-center justify-center gap-2 cursor-pointer transition-transform active:translate-y-0.5"
                >
                  <span className="text-base">▼</span>
                  <span>LOWER</span>
                  <span className="text-[10px] bg-[#7f1d1d] px-1.5 py-0.5 rounded text-[#fca5a5]">
                    {streak >= 0 ? `+${streak + 1}⚡` : '+1⚡'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {pendingChoice === 'face_gamble' && drawnCard && (
            <div className="bg-[#fff7ed] border border-[#ea580c] rounded-lg p-2.5 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-bold text-[#9a3412] mb-1.5">
                <span className="text-sm">👑</span>
                <span>Honor Card Revealed: {drawnCard.rank} of {drawnCard.suit}!</span>
              </div>
              <p className="text-[11px] text-[#7c2d12] mb-2 leading-relaxed">
                Choose your action: Discard this card and draw a fresh comparison card, OR draw another card right now seeking the <strong className="underline text-slate-900">Ace of Spades (A♠)</strong> for instant victory!
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onFaceChoice('discard_redraw')}
                  className="flex-1 py-1.5 px-2 bg-[#d97706] hover:bg-[#b45309] text-white font-mono font-bold text-xs rounded border border-[#92400e] shadow flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>🔄 Discard & Redraw Base</span>
                </button>

                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onFaceChoice('gamble_ace')}
                  className="flex-1 py-1.5 px-2 bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-mono font-bold text-xs rounded border border-[#1b4332] shadow flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>♠ Draw for Ace of Spades!</span>
                </button>
              </div>
            </div>
          )}

          {pendingChoice === null && (
            <div className="flex items-center justify-between bg-[#f5ecda] p-2 rounded-lg border border-[#e2d5bd]">
              <span className="text-xs font-mono text-[#5c5244]">
                {drawnCardResultText || 'Chamber cleared. Choose a corridor exit below to advance.'}
              </span>
              {drawnCard && (
                <span className="text-xs font-bold font-mono px-2 py-0.5 bg-white border border-[#cfbe9f] rounded">
                  Last drawn: <span className={getSuitColor(drawnCard.suit)}>{drawnCard.rank}{drawnCard.suit}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
