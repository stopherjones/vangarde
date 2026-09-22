import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DirectionIndex,
  HexCoord,
  HexTile,
  DiceState,
  DeviationState,
  EventPrompt,
  HexType,
} from './types';
import {
  GRID_COLS,
  GRID_ROWS,
  DIRECTION_LABELS,
  tracePath,
  traceSplitPath,
  getAllNeighbors,
  getCompassDirection,
  getTowerRevealedCoords,
  getQuadrant,
} from './utils/hexMath';
import { generateMap, START_COORD } from './utils/gameEngine';
import { sounds } from './utils/sound';
import { Header } from './components/Header';
import { HexGrid } from './components/HexGrid';
import { ControlPanel } from './components/ControlPanel';
import { RulesModal } from './components/RulesModal';
import { EventModal } from './components/EventModal';
import { GameOverModal } from './components/GameOverModal';

const MAX_ENERGY = 28;

export default function App() {
  // Game Map State
  const [mapData, setMapData] = useState(() => generateMap());
  const [playerCoord, setPlayerCoord] = useState<HexCoord>(START_COORD);
  const [knownTowers, setKnownTowers] = useState<HexCoord[]>([]);
  const [visitedTowerCount, setVisitedTowerCount] = useState<number>(0);

  // Stats
  const [energy, setEnergy] = useState<number>(MAX_ENERGY);
  const [turn, setTurn] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isLost, setIsLost] = useState<boolean>(false);

  // 2D6 Dice State
  const [diceState, setDiceState] = useState<DiceState>({
    die1: 2,
    die2: 6,
    baseDie1: 2,
    baseDie2: 6,
    chosenDirectionDie: 1, // die1 is direction, die2 is distance
    assignedDistance: 6,
    assignedDirection: 2, // 2 = N ↑
    rolled: false,
    isRolling: false,
    modifiedDie: null,
    modifierDelta: 0,
  });

  // Selected Direction override (active direction)
  const [selectedDirection, setSelectedDirection] = useState<DirectionIndex>(2);

  // Tactical Deviation State
  const [deviationState, setDeviationState] = useState<DeviationState>({
    active: false,
    usedThisTurn: false,
    type: 'none',
    pivotIndex: null,
    overrideDirection: 2,
    step1Distance: 2,
    step1Direction: 2,
    step2Distance: 4,
    step2Direction: 3,
  });

  // Move 1 Mode State (replaces Scout - allows stepping 1 space into any adjacent hex)
  const [isMoveOne, setIsMoveOne] = useState<boolean>(false);

  // Status message ticker
  const [statusMessage, setStatusMessage] = useState<string>(
    'Expedition Base: Roll 2D6 to determine movement distance & direction.'
  );

  // Compass clue to goal discovered from Cairns
  const [goalClue, setGoalClue] = useState<string | null>(null);

  // Ancient Map (from Shrines): reveals which quadrant the goal tile is in
  const [goalQuadrant, setGoalQuadrant] = useState<{
    code: 'NW' | 'NE' | 'SW' | 'SE';
    name: string;
    bounds: string;
  } | null>(null);

  // Brass Telescope (from Shrines): reveals all tiles in all 6 directions on future towers visited
  const [hasTelescope, setHasTelescope] = useState<boolean>(false);

  // Dice Modifier (from Shrines): allows +/- 1 adjustment to either movement die each turn
  const [hasDiceModifier, setHasDiceModifier] = useState<boolean>(false);

  // Modal Dialogs
  const [showRules, setShowRules] = useState<boolean>(false);
  const [eventPrompt, setEventPrompt] = useState<EventPrompt | null>(null);

  // Reset / New Game
  const handleNewGame = useCallback(() => {
    const newMap = generateMap();
    setMapData(newMap);
    setPlayerCoord(START_COORD);
    setKnownTowers([]);
    setVisitedTowerCount(0);
    setGoalClue(null);
    setGoalQuadrant(null);
    setHasTelescope(false);
    setHasDiceModifier(false);
    setEnergy(MAX_ENERGY);
    setTurn(1);
    setIsWon(false);
    setIsLost(false);
    setDiceState({
      die1: 2,
      die2: 6,
      baseDie1: 2,
      baseDie2: 6,
      chosenDirectionDie: 1,
      assignedDistance: 6,
      assignedDirection: 2,
      rolled: false,
      isRolling: false,
      modifiedDie: null,
      modifierDelta: 0,
    });
    setSelectedDirection(2);
    setDeviationState({
      active: false,
      usedThisTurn: false,
      type: 'none',
      pivotIndex: null,
      overrideDirection: 2,
      step1Distance: 2,
      step1Direction: 2,
      step2Distance: 4,
      step2Direction: 3,
    });
    setIsMoveOne(false);
    setStatusMessage('New Expedition started! Roll 2D6 to explore the wilderness.');
  }, []);

  // Sync sounds state
  const handleToggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  // Roll 2D6
  const handleRollDice = () => {
    if (energy <= 0 || diceState.isRolling) return;

    setDiceState((prev) => ({ ...prev, isRolling: true }));
    sounds.playDiceRoll();

    let count = 0;
    const interval = setInterval(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      setDiceState((prev) => ({ ...prev, die1: d1, die2: d2 }));
      count++;

      if (count > 7) {
        clearInterval(interval);
        const finalD1 = Math.floor(Math.random() * 6) + 1;
        const finalD2 = Math.floor(Math.random() * 6) + 1;

        // By default: Die 1 is Direction, Die 2 is Distance
        // Or if user clicked earlier, preserve chosen direction die (default 1)
        const chosenDirDie: 1 | 2 = 1;
        const dir = (chosenDirDie === 1 ? finalD1 : finalD2) as DirectionIndex;
        const dist = chosenDirDie === 1 ? finalD2 : finalD1;

        setDiceState({
          die1: finalD1,
          die2: finalD2,
          baseDie1: finalD1,
          baseDie2: finalD2,
          chosenDirectionDie: chosenDirDie,
          assignedDistance: dist,
          assignedDirection: dir,
          rolled: true,
          isRolling: false,
          modifiedDie: null,
          modifierDelta: 0,
        });

        setSelectedDirection(dir);
        setDeviationState({
          active: false,
          usedThisTurn: false,
          type: 'none',
          pivotIndex: null,
          overrideDirection: dir,
          step1Distance: Math.max(1, Math.floor(dist / 2)),
          step1Direction: dir,
          step2Distance: Math.max(1, dist - Math.floor(dist / 2)),
          step2Direction: (dir % 6 + 1) as DirectionIndex,
        });

        const modHint = hasDiceModifier ? ' (±1 Dice Modifier Active)' : '';
        setStatusMessage(
          `Rolled [${finalD1}, ${finalD2}]! Direction: Die 1 (${DIRECTION_LABELS[dir].short}), Distance: Die 2 (${dist} spaces).${modHint} Tap either die to switch.`
        );
      }
    }, 60);
  };

  // Adjust either die by +/- 1 when Dice Modifier boon is active
  const handleModifyDie = (dieNum: 1 | 2, delta: -1 | 1 | 0) => {
    if (!hasDiceModifier || !diceState.rolled || diceState.isRolling) return;

    let newDie1 = diceState.baseDie1;
    let newDie2 = diceState.baseDie2;
    let modifiedDie: 1 | 2 | null = null;
    let modifierDelta: -1 | 0 | 1 = 0;

    if (delta !== 0) {
      if (dieNum === 1) {
        newDie1 = Math.max(1, Math.min(6, diceState.baseDie1 + delta));
        newDie2 = diceState.baseDie2;
        modifiedDie = 1;
        modifierDelta = (newDie1 - diceState.baseDie1) as -1 | 1;
      } else {
        newDie2 = Math.max(1, Math.min(6, diceState.baseDie2 + delta));
        newDie1 = diceState.baseDie1;
        modifiedDie = 2;
        modifierDelta = (newDie2 - diceState.baseDie2) as -1 | 1;
      }
    }

    const chosenDirDie = diceState.chosenDirectionDie;
    const dirVal = (chosenDirDie === 1 ? newDie1 : newDie2) as DirectionIndex;
    const distVal = chosenDirDie === 1 ? newDie2 : newDie1;

    setDiceState((prev) => ({
      ...prev,
      die1: newDie1,
      die2: newDie2,
      assignedDirection: dirVal,
      assignedDistance: distVal,
      modifiedDie,
      modifierDelta,
    }));

    setSelectedDirection(dirVal);

    // Reset or update deviation parameters
    setDeviationState({
      active: false,
      usedThisTurn: false,
      type: 'none',
      pivotIndex: null,
      overrideDirection: dirVal,
      step1Distance: Math.max(1, Math.floor(distVal / 2)),
      step1Direction: dirVal,
      step2Distance: Math.max(1, distVal - Math.floor(distVal / 2)),
      step2Direction: ((dirVal % 6) + 1) as DirectionIndex,
    });

    sounds.playClick();
    if (delta !== 0) {
      setStatusMessage(
        `Dice Modifier: Die ${dieNum} adjusted by ${delta > 0 ? `+${delta}` : delta}. Direction: ${dirVal} (${DIRECTION_LABELS[dirVal].short}), Distance: ${distVal} hexes.`
      );
    } else {
      setStatusMessage(`Dice Modifier reset to natural roll: [${newDie1}, ${newDie2}].`);
    }
  };

  // Clicking a die toggles which die represents Direction and which represents Distance
  // "You roll the dice and can click on a dice to choose direction and the other will automatically show distance in that direction"
  const handleSelectDirectionDie = (dieNum: 1 | 2) => {
    if (!diceState.rolled) return;

    const dirVal = (dieNum === 1 ? diceState.die1 : diceState.die2) as DirectionIndex;
    const distVal = dieNum === 1 ? diceState.die2 : diceState.die1;

    setDiceState((prev) => ({
      ...prev,
      chosenDirectionDie: dieNum,
      assignedDirection: dirVal,
      assignedDistance: distVal,
    }));

    setSelectedDirection(dirVal);

    // Reset deviation to straight line in newly assigned direction
    setDeviationState({
      active: false,
      usedThisTurn: false,
      type: 'none',
      pivotIndex: null,
      overrideDirection: dirVal,
      step1Distance: Math.max(1, Math.floor(distVal / 2)),
      step1Direction: dirVal,
      step2Distance: Math.max(1, distVal - Math.floor(distVal / 2)),
      step2Direction: (dirVal % 6 + 1) as DirectionIndex,
    });

    sounds.playClick();
    setStatusMessage(
      `Selected Die ${dieNum} (${dirVal} ${DIRECTION_LABELS[dirVal].short}) for DIRECTION. Distance is automatically ${distVal} hexes.`
    );
  };

  // Clicking a tile on the highlighted path triggers deviation pivot at that tile!
  // "You can press anywhere on that line to use a deviation. So in direction 2, distance 6, if you press on the 4th hex in the line, it highlights that you can use the last 2 spaces of direction in any direction"
  const handlePathTileClick = (coord: HexCoord, stepIndex: number) => {
    if (!diceState.rolled) return;

    const totalDistance = Math.min(diceState.assignedDistance, energy);
    const step1Dist = stepIndex + 1; // 1-based distance traveled before deviation
    const remainingDistance = totalDistance - step1Dist;

    if (remainingDistance <= 0) {
      // User tapped the end of the line: confirm or show message
      setStatusMessage(
        `Final destination of move (${coord.col}, ${coord.row}). Click 'CONFIRM MOVE' to step here, or tap an earlier hex on the line to deviate.`
      );
      return;
    }

    // Default branch direction: turn clockwise from current direction
    const currentDir = diceState.assignedDirection;
    const defaultBranchDir = ((currentDir % 6) + 1) as DirectionIndex;

    setDeviationState({
      active: true,
      usedThisTurn: true,
      type: 'split_path',
      pivotIndex: stepIndex,
      overrideDirection: currentDir,
      step1Distance: step1Dist,
      step1Direction: currentDir,
      step2Distance: remainingDistance,
      step2Direction: defaultBranchDir,
    });

    sounds.playClick();
    setStatusMessage(
      `Deviation set at hex ${step1Dist}! You have ${remainingDistance} space${remainingDistance !== 1 ? 's' : ''} left. Tap any branch arrow on the map to choose your new direction!`
    );
  };

  // Select which direction to turn from the deviation pivot point
  const handleSelectDeviationBranch = (dir: DirectionIndex) => {
    setDeviationState((prev) => ({
      ...prev,
      active: true,
      type: 'split_path',
      step2Direction: dir,
    }));
    sounds.playClick();
    setStatusMessage(
      `Deviation turned towards ${DIRECTION_LABELS[dir].short}! Path updated. Tap 'Confirm Move' to step.`
    );
  };

  // Reset deviation back to straight path
  const handleResetDeviation = () => {
    setDeviationState((prev) => ({
      ...prev,
      active: false,
      usedThisTurn: false,
      type: 'none',
      pivotIndex: null,
    }));
    sounds.playClick();
    setStatusMessage(
      `Deviation cleared: Using straight rolled path (${diceState.assignedDistance} hexes towards ${DIRECTION_LABELS[diceState.assignedDirection].short}).`
    );
  };

  // Calculate Movement Path Preview
  const pathPreview = useMemo(() => {
    if (!diceState.rolled) return [];

    const effectiveDist = Math.min(diceState.assignedDistance, energy);
    if (effectiveDist <= 0) return [];

    if (deviationState.active && deviationState.type === 'split_path') {
      const s1 = Math.min(deviationState.step1Distance, effectiveDist);
      const s2 = Math.min(deviationState.step2Distance, effectiveDist - s1);
      return traceSplitPath(
        playerCoord,
        deviationState.step1Direction,
        s1,
        deviationState.step2Direction,
        s2
      );
    } else {
      const dir = deviationState.active ? selectedDirection : diceState.assignedDirection;
      return tracePath(playerCoord, dir, effectiveDist);
    }
  }, [
    diceState.rolled,
    diceState.assignedDistance,
    diceState.assignedDirection,
    energy,
    deviationState,
    selectedDirection,
    playerCoord,
  ]);

  // Reveal a tile and handle landmarks
  const revealTileAt = (coord: HexCoord, currentTiles: Map<string, HexTile>): HexTile | null => {
    const key = `${coord.col},${coord.row}`;
    const tile = currentTiles.get(key);
    if (!tile) return null;

    if (!tile.revealed) {
      tile.revealed = true;
      sounds.playTileReveal();
    }

    // Cairns activate when revealed or passed over, showing rough direction to the goal
    if (tile.type === 'clue_cairn' && !tile.activated) {
      tile.activated = true;
      const bearing = getCompassDirection(coord, mapData.goalCoord);
      tile.cairnBearing = bearing;
      setGoalClue(bearing);
    }

    return tile;
  };

  // Execute Move along a sequence of steps
  const executeMoveTo = (steps: HexCoord[]) => {
    if (steps.length === 0 || energy <= 0) return;

    const destination = steps[steps.length - 1];
    const energyCost = steps.length;

    sounds.playStep();

    // Spend energy
    const remainingEnergy = Math.max(0, energy - energyCost);
    setEnergy(remainingEnergy);

    // Update map tiles along path and at destination
    const updatedTiles = new Map(mapData.tiles);

    // Reveal intermediate tiles passed through, but only activate cairns along the path
    let activatedCairnClue: string | null = null;
    for (const step of steps) {
      const t = updatedTiles.get(`${step.col},${step.row}`);
      if (t) {
        t.revealed = true;
        // Hexes reveal, but do not activate when passed over, other than cairns
        if (t.type === 'clue_cairn' && !t.activated) {
          t.activated = true;
          const bearing = getCompassDirection({ col: t.col, row: t.row }, mapData.goalCoord);
          t.cairnBearing = bearing;
          activatedCairnClue = bearing;
          setGoalClue(bearing);
          sounds.playBonus();
        }
      }
    }

    // Land on destination
    const destTile = updatedTiles.get(`${destination.col},${destination.row}`);
    if (destTile) {
      destTile.visited = true;
      destTile.revealed = true;
    }

    setPlayerCoord(destination);
    setMapData((prev) => ({ ...prev, tiles: updatedTiles }));

    // Advance turn and reset dice for next roll
    setTurn((prev) => prev + 1);
    setDiceState((prev) => ({ ...prev, rolled: false }));
    setDeviationState((prev) => ({
      ...prev,
      active: false,
      usedThisTurn: false,
      type: 'none',
    }));
    setIsMoveOne(false);

    // Check Destination interactions (hazards, shrines, caches, and towers only activate when landed on)
    if (!destTile) return;

    // 1. Goal Hex Reached
    if (destTile.type === 'goal') {
      sounds.playVictory();
      setIsWon(true);
      setStatusMessage('VICTORY! You have reached the Lost Golden Beacon!');
      return;
    }

    // 2. Watchtower Reached
    if (destTile.type === 'tower') {
      sounds.playTower();
      const towerRevealed = getTowerRevealedCoords(destination, hasTelescope);
      for (const n of towerRevealed) {
        const nt = updatedTiles.get(`${n.col},${n.row}`);
        if (nt) nt.revealed = true;
      }
      // Reveal locations of all other towers
      setKnownTowers(mapData.towerCoords);
      setVisitedTowerCount((prev) => prev + 1);
      const scopeMsg = hasTelescope
        ? 'Telescope Active: Revealed all 6 rays across the map!'
        : 'Adjacent lands & 6 directional sights revealed!';
      setStatusMessage(`Tower beacon activated! ${scopeMsg} All towers mapped!`);
      setEventPrompt({
        title: 'Ancient Watchtower Reached!',
        category: 'Landmark',
        description: hasTelescope
          ? 'You scale the stone watchtower! Using your Brass Telescope, your line of sight pierces the fog along all 6 directions (NW, N, NE, SE, S, SW) to the edge of the realm! All watchtowers across the realm are now charted.'
          : 'You scale the ancient stone watchtower and look out over the expanse! The fog has lifted from all adjacent hexes and the 6 hexes in the NW, N, NE, SE, S, and SW directions. All watchtowers across the realm are now charted onto your map.',
        type: 'tower',
        coord: destination,
        statBadge: hasTelescope
          ? '🔭 Telescope View: All 6 Rays Revealed • All Towers Mapped'
          : 'Adjacent + 6 Sights Revealed • All Towers Mapped',
      });
      return;
    }

    // 3. Energy Cache Reached
    if (destTile.type === 'energy_cache') {
      sounds.playBonus();
      const bonus = destTile.value || 1;
      setEnergy((prev) => Math.min(prev + bonus, MAX_ENERGY));
      destTile.type = 'blank';
      setStatusMessage(`Discovered fresh spring rations! Restored +${bonus} Energy.`);
      setEventPrompt({
        title: 'Energy Cache Uncovered!',
        category: 'Discovery',
        description:
          bonus >= 3
            ? 'An abundant subterranean cache overflowing with pure spring water and dried rations! Your expedition recovers +3 Energy.'
            : bonus === 2
            ? 'A supply depot tucked into the hollow of an ancient tree. Fresh spring water and rations restore +2 Energy.'
            : 'You discovered a secluded freshwater spring and rations. Your expedition draws fresh strength (+1 Energy).',
        type: 'cache',
        coord: destination,
        statBadge: `+${bonus} Energy Restored!`,
      });
      return;
    }

    // 4. Fortune Shrine Reached
    if (destTile.type === 'luck_shrine') {
      setEventPrompt({
        title: 'Fortune Shrine Discovered',
        category: 'Discovery',
        description:
          'You kneel before an ancient violet crystalline altar. Roll the Fate D6 to receive an ancient blessing:\n• 1 Pip: Ancient Map (Goal Quadrant)\n• 2 Pips: Brass Telescope (Future towers reveal all 6 directions to map edge)\n• 3 Pips: Dice Modifier (±1 to either die each turn)\n• 4 Pips: Ancient Map & +2 Energy\n• 5 Pips: Brass Telescope & +2 Energy\n• 6 Pips: Dice Modifier & +2 Energy',
        type: 'shrine',
        coord: destination,
        statBadge: 'Fate D6: Map, Telescope, Dice Modifier, +2 Energy',
      });
      destTile.type = 'blank';
      return;
    }

    // 5. Peat Bog Hazard Reached
    if (destTile.type === 'bog_hazard') {
      sounds.playHazard();
      const penalty = Math.abs(destTile.value || 1);
      const newE = Math.max(0, remainingEnergy - penalty);
      setEnergy(newE);
      destTile.type = 'blank';
      setStatusMessage(`Trapped in muddy peat bog! Lost -${penalty} Energy.`);
      setEventPrompt({
        title: 'Peat Bog Hazard!',
        category: 'Hazard',
        description:
          'Treacherous sludge and sucking mud engulf your boots! Slogging through the treacherous bog consumes precious reserves.',
        type: 'bog',
        coord: destination,
        statBadge: `-${penalty} Energy Sapped!`,
      });
      if (newE <= 0) {
        setIsLost(true);
      }
      return;
    }

    // 6. Arcane Rift Hazard Reached
    if (destTile.type === 'rift_hazard') {
      sounds.playHazard();
      setEventPrompt({
        title: 'Arcane Bramble Rift!',
        category: 'Hazard',
        description:
          'Thorned crystalline rifts surge from the earth! Roll the Fate Die: Odd inflicts -2 Energy penalty, Even lets you escape unharmed.',
        type: 'rift',
        coord: destination,
        statBadge: 'Fate Test: Odd = -2 Energy, Even = Safe',
      });
      destTile.type = 'blank';
      return;
    }

    // 7. Clue Cairn Reached
    if (destTile.type === 'clue_cairn') {
      sounds.playBonus();
      if (!destTile.activated) {
        destTile.activated = true;
        const bearing = getCompassDirection(destination, mapData.goalCoord);
        destTile.cairnBearing = bearing;
        setGoalClue(bearing);
      }
      setStatusMessage(`Ancient Cairn reached! Inscription: "The Lost Beacon lies to the ${destTile.cairnBearing}."`);
      setEventPrompt({
        title: 'Ancient Clue Cairn!',
        category: 'Discovery',
        description: `You examine the mysterious stacked stones and decipher the ancient runic carvings: "The Lost Golden Beacon lies to the ${destTile.cairnBearing}."`,
        type: 'clue',
        coord: destination,
        statBadge: `Compass Bearing: ${destTile.cairnBearing}`,
      });
      return;
    }

    // 8. Base Camp Reached
    if (destTile.type === 'start') {
      setStatusMessage('Expedition Base Camp. You are back at the start post.');
      setEventPrompt({
        title: 'Base Expedition Camp',
        category: 'Landmark',
        description:
          'You have returned to your expedition base camp. Sturdy wooden shelters and survey equipment remain stationed here.',
        type: 'start',
        coord: destination,
        statBadge: 'Expedition Origin',
      });
      return;
    }

    // Standard move message
    const cairnMsg = activatedCairnClue ? ` Activated Cairn along path: Goal lies to the ${activatedCairnClue}!` : '';
    setStatusMessage(
      `Moved to (${destination.col}, ${destination.row}). Energy: ${remainingEnergy}/${MAX_ENERGY}.${cairnMsg} Roll for your next move.`
    );

    // Check Energy Exhaustion
    if (remainingEnergy <= 0) {
      setIsLost(true);
    }
  };

  // Trigger move along current planned path
  const handleExecuteMove = () => {
    if (!diceState.rolled || pathPreview.length === 0 || energy <= 0) return;
    executeMoveTo(pathPreview);
  };

  // Resolve Fate Event Roll from Shrine or Rift
  const handleResolveEvent = (rollResult?: number) => {
    if (!eventPrompt) return;

    if (eventPrompt.type === 'shrine' && rollResult) {
      const q = getQuadrant(mapData.goalCoord);

      switch (rollResult) {
        case 1: {
          sounds.playBonus();
          setGoalQuadrant(q);
          setStatusMessage(`Ancient Map revealed! The Golden Beacon lies in the ${q.name} Quadrant (${q.bounds}).`);
          break;
        }
        case 2: {
          sounds.playBonus();
          setHasTelescope(true);
          setStatusMessage('Brass Telescope acquired! Future watchtowers will reveal all tiles in all 6 directions to grid boundaries.');
          break;
        }
        case 3: {
          sounds.playBonus();
          setHasDiceModifier(true);
          setStatusMessage('Dice Modifier blessing acquired! You can now adjust either movement die by ±1 every turn.');
          break;
        }
        case 4: {
          sounds.playBonus();
          setGoalQuadrant(q);
          setEnergy((prev) => Math.min(prev + 2, MAX_ENERGY));
          setStatusMessage(`Ancient Map & +2 Energy! Golden Beacon lies in the ${q.name} Quadrant (${q.bounds}). Restored +2 Energy!`);
          break;
        }
        case 5: {
          sounds.playBonus();
          setHasTelescope(true);
          setEnergy((prev) => Math.min(prev + 2, MAX_ENERGY));
          setStatusMessage('Brass Telescope & +2 Energy! Future watchtowers reveal all 6 directions, and restored +2 Energy!');
          break;
        }
        case 6: {
          sounds.playBonus();
          setHasDiceModifier(true);
          setEnergy((prev) => Math.min(prev + 2, MAX_ENERGY));
          setStatusMessage('Dice Modifier & +2 Energy! You can now adjust either die by ±1 every turn, and restored +2 Energy!');
          break;
        }
      }
    } else if (eventPrompt.type === 'rift' && rollResult) {
      if (rollResult % 2 !== 0) {
        sounds.playHazard();
        setEnergy((prev) => {
          const next = Math.max(0, prev - 2);
          if (next <= 0) setIsLost(true);
          return next;
        });
        setStatusMessage('Entangled in brambles! Lost -2 Energy.');
      } else {
        sounds.playBonus();
        setStatusMessage('Evaded the thorny rift safely without penalty!');
      }
    }

    setEventPrompt(null);
  };

  // Toggle Move 1 Mode (costs 1 Energy to step into any adjacent hex)
  const handleToggleMoveOne = () => {
    if (energy <= 0) return;
    setIsMoveOne((prev) => !prev);
    if (!isMoveOne) {
      setStatusMessage('Move 1 Active: Tap any directly adjacent hex (revealed or hidden) to step into it (-1 ⚡).');
    } else {
      setStatusMessage('Move 1 cancelled.');
    }
  };

  // Click on a Hex (handles Move 1 if active, or triggers tile info pop-up inspection)
  const handleTileClick = (coord: HexCoord) => {
    const tileKey = `${coord.col},${coord.row}`;
    const tile = mapData.tiles.get(tileKey);

    if (isMoveOne) {
      const neighbors = getAllNeighbors(playerCoord);
      const isAdjacent = neighbors.some((n) => n.col === coord.col && n.row === coord.row);

      if (!isAdjacent) {
        setStatusMessage('Can only Move 1 into a directly adjacent hex next to your pawn!');
        return;
      }

      if (energy <= 0) {
        setStatusMessage('No energy left to move!');
        return;
      }

      // Exit Move 1 mode and step immediately into target hex
      setIsMoveOne(false);
      executeMoveTo([coord]);
      return;
    }

    // Tile Info Pop-up when clicking a tile
    if (!tile) return;
    sounds.playClick();

    // 1. Unrevealed / Fogged tile
    if (!tile.revealed) {
      const isKnownTower = knownTowers.some((t) => t.col === coord.col && t.row === coord.row);
      if (isKnownTower) {
        setEventPrompt({
          title: 'Charted Watchtower',
          category: 'Tile Inspection',
          description:
            'A distant watchtower mapped during a beacon survey. Shrouded in fog of war. Move to this hex to scale its high ramparts and unveil all 6 adjacent hexes.',
          type: 'tower',
          coord,
          statBadge: 'Known Watchtower (Unvisited)',
        });
      } else {
        setEventPrompt({
          title: 'Uncharted Territory',
          category: 'Tile Inspection',
          description:
            'This region is shrouded in dense fog. You can scout it using the "Scout Adjacent Hex" action (-1 ⚡) if next to your pawn, or roll and move through it to explore.',
          type: 'info',
          coord,
          statBadge: 'Fog of War',
        });
      }
      return;
    }

    // 2. Revealed tile inspection
    switch (tile.type) {
      case 'tower':
        setEventPrompt({
          title: 'Ancient Watchtower',
          category: 'Tile Inspection',
          description: hasTelescope
            ? 'A fortified stone observation post. With your Brass Telescope, landing here reveals all adjacent hexes PLUS all hexes in the NW, N, NE, SE, S, and SW directions to the edges of the map, and charts all watchtowers.'
            : 'A fortified stone observation post. Landing directly on this hex lifts the fog from all adjacent hexes and the 6 hexes in the NW, N, NE, SE, S, SW directions, and marks the locations of all 10 watchtowers across the realm.',
          type: 'tower',
          coord,
          statBadge: tile.visited
            ? 'Visited Watchtower'
            : hasTelescope
            ? 'Active Watchtower (Telescope View)'
            : 'Active Watchtower (Unvisited)',
        });
        break;

      case 'energy_cache':
        setEventPrompt({
          title: 'Energy Cache',
          category: 'Tile Inspection',
          description: `A hidden natural spring and emergency food rations. Landing directly on this hex restores +${tile.value || 1} Energy to your expedition reserves.`,
          type: 'cache',
          coord,
          statBadge: `Restores +${tile.value || 1} Energy on Landing`,
        });
        break;

      case 'bog_hazard':
        setEventPrompt({
          title: 'Peat Bog Hazard',
          category: 'Tile Inspection',
          description:
            'Deep waterlogged peat moss and sucking mire. Landing directly on this hex costs an extra -1 Energy penalty to pull your boots free.',
          type: 'bog',
          coord,
          statBadge: 'Hazard: -1 Energy on Landing',
        });
        break;

      case 'rift_hazard':
        setEventPrompt({
          title: 'Arcane Bramble Rift',
          category: 'Tile Inspection',
          description:
            'A hazardous tear in the earth tangled with jagged crystal brambles. Landing here forces a Fate D6 roll (Odd = -2 Energy penalty, Even = Safe escape).',
          type: 'rift',
          coord,
          statBadge: 'Hazard: Fate D6 Roll on Landing',
        });
        break;

      case 'luck_shrine':
        setEventPrompt({
          title: 'Fortune Shrine',
          category: 'Tile Inspection',
          description:
            'A mystical shrine sculpted from resonant violet crystal. Landing directly on this hex triggers a Fate D6 roll for 1 of 6 blessings:\n1: Ancient Map (Goal Quadrant)\n2: Brass Telescope (Towers reveal all 6 directions)\n3: +1 Energy\n4: +2 Energy\n5: Telescope & +1 Energy\n6: Map & +1 Energy',
          type: 'shrine',
          coord,
          statBadge: 'Landmark: Fate D6 Roll on Landing',
        });
        break;

      case 'clue_cairn':
        setEventPrompt({
          title: 'Ancient Clue Cairn',
          category: 'Tile Inspection',
          description: tile.cairnBearing
            ? `Stacked river stones etched with wind runes pointing to the Golden Beacon: "The Beacon lies to the ${tile.cairnBearing}."`
            : 'Stacked stone cairn. Activates when passed over or landed on, whispering the rough compass bearing to the Lost Golden Beacon.',
          type: 'clue',
          coord,
          statBadge: tile.cairnBearing ? `Points: ${tile.cairnBearing}` : 'Activates when visited or traversed',
        });
        break;

      case 'start':
        setEventPrompt({
          title: 'Base Expedition Camp',
          category: 'Tile Inspection',
          description:
            'The starting headquarters for your expedition. Safe staging post where your journey into the hexagonal wilderness began.',
          type: 'start',
          coord,
          statBadge: 'Expedition Origin',
        });
        break;

      case 'goal':
        setEventPrompt({
          title: 'The Lost Golden Beacon',
          category: 'Tile Inspection',
          description:
            'The mythical glowing monolith shining with ancient light! Land on this hex to complete the expedition and claim victory!',
          type: 'info',
          coord,
          statBadge: 'Primary Objective (Goal)',
        });
        break;

      case 'blank':
      default:
        setEventPrompt({
          title: 'Wilderness Hex',
          category: 'Tile Inspection',
          description:
            'Open wilderness terrain. Standard travel cost is 1 Energy per hex. Free of hazards and special landmark effects.',
          type: 'info',
          coord,
          statBadge: tile.visited ? 'Already Traversed' : 'Charted Ground',
        });
        break;
    }
  };

  // Derived stats
  const revealedCount = useMemo(() => {
    let count = 0;
    for (const t of mapData.tiles.values()) {
      if (t.revealed) count++;
    }
    return count;
  }, [mapData.tiles]);

  const totalHexes = GRID_COLS * GRID_ROWS;
  const goalTile = mapData.tiles.get(`${mapData.goalCoord.col},${mapData.goalCoord.row}`);
  const goalFound = !!goalTile?.revealed;

  return (
    <div className="flex flex-col h-dvh w-full max-w-lg mx-auto bg-[#ded4bf] text-[#2b261f] select-none overflow-hidden font-mono border-x-2 border-[#2b261f] shadow-2xl relative">
      {/* 1. Fixed Header (Scorecard stats bar) */}
      <Header
        energy={energy}
        maxEnergy={MAX_ENERGY}
        turn={turn}
        revealedCount={revealedCount}
        totalHexes={totalHexes}
        goalFound={goalFound}
        goalClue={goalClue}
        goalQuadrant={goalQuadrant}
        hasTelescope={hasTelescope}
        hasDiceModifier={hasDiceModifier}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenRules={() => setShowRules(true)}
        onNewGame={handleNewGame}
      />

      {/* 2. Interactive SVG Hex Grid (Middle Map Area) */}
      <main className="flex-1 min-h-0 relative">
        <HexGrid
          tiles={mapData.tiles}
          playerCoord={playerCoord}
          pathPreview={pathPreview}
          knownTowers={knownTowers}
          isMoveOne={isMoveOne}
          deviationState={deviationState}
          onTileClick={handleTileClick}
          onPathTileClick={handlePathTileClick}
          onSelectDeviationBranch={handleSelectDeviationBranch}
          onExecuteMove={handleExecuteMove}
          canExecuteMove={diceState.rolled && pathPreview.length > 0 && energy > 0}
        />
      </main>

      {/* 3. Fixed Footer Control Panel (Dice Selection & Info Ticker) */}
      <ControlPanel
        diceState={diceState}
        deviationState={deviationState}
        selectedDirection={selectedDirection}
        effectiveDistance={diceState.assignedDistance}
        energy={energy}
        pathPreview={pathPreview}
        isMoveOne={isMoveOne}
        hasDiceModifier={hasDiceModifier}
        statusMessage={statusMessage}
        onRollDice={handleRollDice}
        onSelectDirectionDie={handleSelectDirectionDie}
        onToggleMoveOne={handleToggleMoveOne}
        onExecuteMove={handleExecuteMove}
        onResetDeviation={handleResetDeviation}
        onModifyDie={handleModifyDie}
      />

      {/* Rules Modal */}
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />

      {/* Interactive Event Prompt Modal (Shrines, Rifts) */}
      <EventModal prompt={eventPrompt} onResolve={handleResolveEvent} />

      {/* Game Over / Win Modal */}
      {(isWon || isLost) && (
        <GameOverModal
          won={isWon}
          turns={turn}
          energyLeft={energy}
          revealedCount={revealedCount}
          totalHexes={totalHexes}
          towersFound={visitedTowerCount}
          totalTowers={mapData.towerCoords.length}
          onRestart={handleNewGame}
        />
      )}
    </div>
  );
}
