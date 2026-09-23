import React from 'react';
import {
  DirectionIndex,
  DiceState,
  DeviationState,
  HexCoord,
} from '../types';
import { DIRECTION_LABELS } from '../utils/hexMath';
import { Footprints, Eye, Dices, CornerDownRight, RotateCcw } from 'lucide-react';

interface ControlPanelProps {
  diceState: DiceState;
  deviationState: DeviationState;
  selectedDirection: DirectionIndex;
  effectiveDistance: number;
  energy: number;
  pathPreview: HexCoord[];
  isMoveOne: boolean;
  freeMoves?: number;
  hasDiceModifier?: boolean;
  statusMessage: string;
  onRollDice: () => void;
  onSelectDirectionDie: (dieNum: 1 | 2) => void;
  onToggleMoveOne: () => void;
  onExecuteMove: () => void;
  onResetDeviation?: () => void;
  onModifyDie?: (dieNum: 1 | 2, delta: -1 | 1 | 0) => void;
}

// Render retro dice face with authentic pips and active highlight
const InteractiveDie: React.FC<{
  dieNum: 1 | 2;
  value: number;
  baseValue: number;
  role: 'direction' | 'distance';
  isDirectionChosen: boolean;
  onClick: () => void;
  disabled?: boolean;
  hasModifier?: boolean;
  modifierDelta?: -1 | 0 | 1;
  onModify?: (delta: -1 | 1 | 0) => void;
}> = ({
  dieNum,
  value,
  baseValue,
  role,
  isDirectionChosen,
  onClick,
  disabled,
  hasModifier,
  modifierDelta = 0,
  onModify,
}) => {
  const pipsMap: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };
  const activePips = pipsMap[value] || [4];
  const dirInfo = role === 'direction' ? DIRECTION_LABELS[value as DirectionIndex] : null;

  return (
    <div
      onClick={onClick}
      className={`group relative flex-1 min-w-0 flex items-center gap-1.5 p-1.5 rounded-lg border-2 transition-all cursor-pointer select-none text-left h-full ${
        isDirectionChosen
          ? 'bg-[#2d6a4f] text-white border-[#1c1917] shadow-md ring-2 ring-[#15803d]'
          : 'bg-[#fdfbf7] text-[#2b261f] border-[#2b261f] hover:bg-[#fff9ed] shadow-xs'
      }`}
      title={`Die ${dieNum} is currently assigned to ${role.toUpperCase()}. Tap to toggle.`}
    >
      {/* 3x3 Pip Dice Box */}
      <div
        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-md border-2 grid grid-cols-3 grid-rows-3 p-1 shrink-0 ${
          isDirectionChosen
            ? 'bg-[#fdfbf7] border-[#1c1917]'
            : 'bg-[#f4efe3] border-[#2b261f]'
        }`}
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            {activePips.includes(i) && (
              <div
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                  isDirectionChosen ? 'bg-[#1c1917]' : 'bg-[#2b261f]'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Label and assignment details */}
      <div className="flex flex-col min-w-0 flex-1 pr-0.5 justify-center">
        <span
          className={`text-[9px] font-mono uppercase font-bold tracking-wider truncate ${
            isDirectionChosen ? 'text-[#bbf7d0]' : 'text-[#786e5e]'
          }`}
        >
          {role === 'direction' ? 'DIR 🎯' : 'DIST 📏'}
        </span>
        <span className="text-xs sm:text-sm font-mono font-black leading-tight flex items-center gap-1 whitespace-nowrap">
          {role === 'direction' && dirInfo ? (
            <span>{dirInfo.short}</span>
          ) : (
            <span>{value} Spaces</span>
          )}
          {modifierDelta !== 0 && (
            <span className="text-[10px] text-purple-300 font-bold">
              ({modifierDelta > 0 ? `+${modifierDelta}` : modifierDelta})
            </span>
          )}
        </span>
        <span
          className={`text-[8px] sm:text-[8.5px] font-mono underline opacity-80 group-hover:opacity-100 whitespace-nowrap ${
            isDirectionChosen ? 'text-white' : 'text-[#2d6a4f]'
          }`}
        >
          {role === 'direction' ? 'Tap: Distance' : 'Tap: Direction'}
        </span>
      </div>

      {/* Optional +/- 1 Dice Modifier Controls */}
      {hasModifier && onModify && !disabled && (
        <div
          className="flex flex-col gap-0.5 pl-1 border-l border-current/20 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onModify(modifierDelta === 1 ? 0 : 1)}
            disabled={value >= 6 && modifierDelta !== -1}
            className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono font-black border transition-all cursor-pointer ${
              modifierDelta === 1
                ? 'bg-[#9333ea] text-white border-[#581c87] shadow-xs'
                : 'bg-[#f4efe3] hover:bg-[#fff9ed] text-[#2b261f] border-[#2b261f]/40 disabled:opacity-30'
            }`}
            title="Adjust die by +1"
          >
            +1
          </button>
          <button
            type="button"
            onClick={() => onModify(modifierDelta === -1 ? 0 : -1)}
            disabled={value <= 1 && modifierDelta !== 1}
            className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono font-black border transition-all cursor-pointer ${
              modifierDelta === -1
                ? 'bg-[#9333ea] text-white border-[#581c87] shadow-xs'
                : 'bg-[#f4efe3] hover:bg-[#fff9ed] text-[#2b261f] border-[#2b261f]/40 disabled:opacity-30'
            }`}
            title="Adjust die by -1"
          >
            -1
          </button>
        </div>
      )}
    </div>
  );
};

export const ControlPanel: React.FC<ControlPanelProps> = ({
  diceState,
  deviationState,
  effectiveDistance,
  energy,
  pathPreview,
  isMoveOne,
  freeMoves = 0,
  hasDiceModifier,
  statusMessage,
  onRollDice,
  onSelectDirectionDie,
  onToggleMoveOne,
  onExecuteMove,
  onResetDeviation,
  onModifyDie,
}) => {
  const canMove = diceState.rolled && pathPreview.length > 0 && energy > 0;
  const moveEnergyCost = Math.min(pathPreview.length, energy);

  return (
    <footer className="shrink-0 bg-[#e8deca] border-t-2 border-[#2b261f] select-none flex flex-col shadow-lg z-30">
      <div className="p-1.5 sm:p-2 flex flex-col gap-1.5">
        {!diceState.rolled ? (
          /* 1. Pre-Roll State: Big prominent roll button + Move 1 toggle */
          <div className="flex items-center gap-2">
            <button
              id="btn-roll-dice"
              onClick={onRollDice}
              disabled={diceState.isRolling || energy <= 0}
              className="flex-1 py-2 px-3 bg-[#2d6a4f] hover:bg-[#23533e] active:bg-[#1b4332] text-white border-2 border-[#2b261f] rounded-lg font-mono font-black text-xs sm:text-sm tracking-wider uppercase shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Dices className={`w-4 h-4 ${diceState.isRolling ? 'animate-spin' : ''}`} />
              <span>{diceState.isRolling ? 'ROLLING 2D6...' : 'ROLL 2D6 FOR MOVEMENT'}</span>
            </button>

            <button
              id="btn-move-one"
              onClick={onToggleMoveOne}
              disabled={energy <= 0 && freeMoves <= 0}
              className={`py-1 px-2.5 text-[10.5px] font-mono font-bold rounded-lg border-2 border-[#2b261f] flex flex-col items-center justify-center transition-colors cursor-pointer shrink-0 leading-tight ${
                isMoveOne
                  ? 'bg-[#d97706] text-white ring-2 ring-[#92400e]'
                  : freeMoves > 0
                  ? 'bg-[#dcfce7] hover:bg-[#bbf7d0] text-[#15803d] border-[#16a34a] shadow-xs'
                  : 'bg-[#f5efe3] hover:bg-[#fff9ed] text-[#2b261f]'
              }`}
              title={
                freeMoves > 0
                  ? `Free Move 1 Hex: Step into any adjacent hex for 0 Energy (${freeMoves} free move${freeMoves > 1 ? 's' : ''} left)`
                  : 'Move directly 1 step into any adjacent hex (revealed or hidden) for 1 Energy'
              }
            >
              <div className="flex items-center gap-1">
                <Footprints className="w-3.5 h-3.5" />
                <span>{isMoveOne ? 'Cancel' : freeMoves > 0 ? `Free Move (${freeMoves})` : 'Move 1'}</span>
              </div>
              <span className="text-[9px] opacity-80 whitespace-nowrap">
                {isMoveOne ? 'Step' : freeMoves > 0 ? 'FREE ⚡' : '(-1 ⚡)'}
              </span>
            </button>
          </div>
        ) : (
          /* 2. Post-Roll State: Clean interactive dice row + Execute move */
          <div className="flex flex-col gap-1.5">
            {/* Interactive Dice Selection Bar */}
            <div className="flex items-stretch justify-between gap-1.5">
              <div className="flex items-stretch gap-1.5 flex-1 min-w-0">
                {/* Die 1 */}
                <InteractiveDie
                  dieNum={1}
                  value={diceState.die1}
                  baseValue={diceState.baseDie1}
                  role={diceState.chosenDirectionDie === 1 ? 'direction' : 'distance'}
                  isDirectionChosen={diceState.chosenDirectionDie === 1}
                  onClick={() => onSelectDirectionDie(1)}
                  disabled={diceState.isRolling}
                  hasModifier={hasDiceModifier}
                  modifierDelta={diceState.modifiedDie === 1 ? (diceState.modifierDelta || 0) : 0}
                  onModify={onModifyDie ? (delta) => onModifyDie(1, delta) : undefined}
                />

                {/* Die 2 */}
                <InteractiveDie
                  dieNum={2}
                  value={diceState.die2}
                  baseValue={diceState.baseDie2}
                  role={diceState.chosenDirectionDie === 2 ? 'direction' : 'distance'}
                  isDirectionChosen={diceState.chosenDirectionDie === 2}
                  onClick={() => onSelectDirectionDie(2)}
                  disabled={diceState.isRolling}
                  hasModifier={hasDiceModifier}
                  modifierDelta={diceState.modifiedDie === 2 ? (diceState.modifierDelta || 0) : 0}
                  onModify={onModifyDie ? (delta) => onModifyDie(2, delta) : undefined}
                />
              </div>

              {/* Action Button: Move 1 step option */}
              <div className="flex items-stretch shrink-0 ml-auto">
                <button
                  id="btn-toggle-move-one"
                  onClick={onToggleMoveOne}
                  disabled={energy <= 0 && freeMoves <= 0}
                  className={`py-1 px-2 text-[10px] font-mono font-bold rounded-lg border-2 border-[#2b261f] flex flex-col items-center justify-center transition-all cursor-pointer shrink-0 leading-tight h-full ${
                    isMoveOne
                      ? 'bg-[#d97706] text-white ring-2 ring-[#92400e]'
                      : freeMoves > 0
                      ? 'bg-[#dcfce7] hover:bg-[#bbf7d0] text-[#15803d] border-[#16a34a] shadow-xs'
                      : 'bg-[#f5efe3] hover:bg-[#fff9ed] text-[#2b261f]'
                  }`}
                  title={
                    freeMoves > 0
                      ? `Free Move 1 Hex: Step into any adjacent hex for 0 Energy (${freeMoves} free move${freeMoves > 1 ? 's' : ''} left)`
                      : 'Move directly 1 step into an adjacent hex instead of rolling path (-1⚡)'
                  }
                >
                  <div className="flex items-center gap-1">
                    <Footprints className="w-3 h-3" />
                    <span>{isMoveOne ? 'Cancel' : freeMoves > 0 ? `Free Move (${freeMoves})` : 'Move 1'}</span>
                  </div>
                  <span className="text-[9px] opacity-80 whitespace-nowrap">
                    {isMoveOne ? 'Step' : freeMoves > 0 ? 'FREE ⚡' : '(-1 ⚡)'}
                  </span>
                </button>
              </div>
            </div>

            {/* Hint bar explaining on-map deviation or dice modifier active */}
            {deviationState.active && deviationState.type === 'split_path' ? (
              <div className="flex items-center justify-between gap-2 px-2 py-1 bg-[#fef3c7] border border-[#d97706] rounded-md text-[10.5px] font-mono text-[#92400e]">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <CornerDownRight className="w-3.5 h-3.5 text-[#d97706] shrink-0" />
                  <span className="leading-tight">
                    {deviationState.step1Distance === 0
                      ? `Deviation from Current Hex: ${deviationState.step2Distance} spaces. Tap branch on map or execute.`
                      : `Deviation at Step ${deviationState.step1Distance}: ${deviationState.step2Distance} spaces left. Tap branch on map or execute.`}
                  </span>
                </div>
                {onResetDeviation && (
                  <button
                    onClick={onResetDeviation}
                    className="px-2 py-0.5 text-[10px] font-mono font-bold rounded border border-[#b45309] bg-[#fffbeb] hover:bg-[#fde68a] text-[#92400e] flex items-center gap-1 cursor-pointer shrink-0 transition-colors shadow-2xs"
                    title="Clear deviation and reset to straight path"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            ) : hasDiceModifier && diceState.modifiedDie ? (
              <div className="flex items-center justify-between px-2 py-0.5 bg-[#f3e8ff] border border-[#9333ea] rounded text-[10px] font-mono text-[#6b21a8]">
                <span>
                  🎲 Die {diceState.modifiedDie} adjusted by {diceState.modifierDelta! > 0 ? `+${diceState.modifierDelta}` : diceState.modifierDelta}. Path updated!
                </span>
                {onModifyDie && (
                  <button
                    onClick={() => onModifyDie(diceState.modifiedDie as 1 | 2, 0)}
                    className="underline hover:text-[#581c87] cursor-pointer"
                  >
                    Undo
                  </button>
                )}
              </div>
            ) : null}

            {/* Big Execute Move Primary Action Button */}
            <button
              id="btn-execute-move"
              onClick={onExecuteMove}
              disabled={!canMove}
              className="w-full py-2 px-3 bg-[#2d6a4f] hover:bg-[#23533e] active:bg-[#1b4332] text-white border-2 border-[#2b261f] rounded-lg font-mono font-black text-xs sm:text-sm tracking-wider uppercase shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Footprints className="w-4 h-4" />
              <span>
                {canMove
                  ? `CONFIRM MOVE (${moveEnergyCost} Hex${moveEnergyCost !== 1 ? 'es' : ''} • Costs ${moveEnergyCost}⚡)`
                  : 'OBSTRUCTED / NO PATH'}
              </span>
            </button>
          </div>
        )}
      </div>
    </footer>
  );
};

