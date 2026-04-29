import { createStore } from "zustand/vanilla";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { useStore } from "zustand";
import {
  applyLevelChoice,
  calculateTaskCompletionReward,
  canAttemptRaid,
  clamp,
  createEmptyTimer,
  createInitialGameState,
  createNextRaidBoss,
  createTimerBonusSnapshot,
  executeBattleTurn,
  expToNextLevel,
  generateEquipment,
  getAvailableActions,
  getEnergyCap,
  getEquippedItems,
  getEquipmentSkillRerollCost,
  getLevelChoiceRerollCost,
  getSlotLabel,
  getTaskDurationMs,
  grantMonsterExperience,
  grantRandomSkill,
  initializeBattleState,
  MAX_BATTLE_TURNS,
  normalizePersistedGameState,
  rerollChoiceSet,
  rerollEquipmentActiveSkill,
  rerollEquipmentPassiveSkill,
  simulateRaidBattle,
  toLocalDateKey,
} from "@/lib/gameRules";
import type {
  Equipment,
  PersistedGameState,
  Task,
  TimerBonusSnapshot,
  ViewId,
} from "@/types/game";
import type { BattleAction } from "@/lib/gameRules";

type StoreDependencies = {
  storage?: StateStorage;
  random?: () => number;
  now?: () => Date;
};

type UIState = {
  activeView: ViewId;
  lastActionMessage: string | null;
};

type Actions = {
  setActiveView: (view: ViewId) => void;
  clearLastActionMessage: () => void;
  addTask: (input: {
    title: string;
    subject?: string;
    durationMinutes: number;
    difficulty: number;
  }) => void;
  deleteTask: (taskId: string) => void;
  startTaskTimer: (taskId: string) => void;
  stopTaskTimer: () => void;
  completeTask: (taskId: string) => void;
  claimLevelChoice: (choiceId: string) => void;
  rerollLevelChoices: () => void;
  equipItem: (equipmentId: string) => void;
  rerollEquipmentSkill: (equipmentId: string, skillType: "active" | "passive") => void;
  attackRaidBoss: () => void;
  startRaidBattle: () => void;
  executePlayerAction: (action: BattleAction) => void;
  endBattle: () => void;
  resetGame: () => void;
};

export type GameStoreState = PersistedGameState & UIState & Actions;

const STORAGE_KEY = "study-rpg-state";

function createTaskId() {
  return `task-${crypto.randomUUID()}`;
}

function createTaskMessage(task: Task) {
  return `「${task.title}」を登録しました。`;
}

function getPersistedSlice(state: GameStoreState): PersistedGameState {
  return {
    tasks: state.tasks,
    timer: state.timer,
    monster: state.monster,
    resources: state.resources,
    raid: state.raid,
    equipmentInventory: state.equipmentInventory,
    equippedSlots: state.equippedSlots,
  };
}

function createDefaultStorage(storage?: StateStorage) {
  if (storage) {
    return createJSONStorage<PersistedGameState>(() => storage);
  }

  return createJSONStorage<PersistedGameState>(() => localStorage);
}

function maybeAutoEquip(
  equipmentInventory: Equipment[],
  equippedSlots: GameStoreState["equippedSlots"],
  droppedEquipment: Equipment | null,
) {
  if (!droppedEquipment) {
    return equippedSlots;
  }

  if (equippedSlots[droppedEquipment.slot]) {
    return equippedSlots;
  }

  return {
    ...equippedSlots,
    [droppedEquipment.slot]: droppedEquipment.id,
  };
}

export function createGameStore(dependencies: StoreDependencies = {}) {
  const random = dependencies.random ?? Math.random;
  const now = dependencies.now ?? (() => new Date());

  return createStore<GameStoreState>()(
    persist(
      (set) => ({
        ...createInitialGameState(),
        activeView: "tasks",
        lastActionMessage: "勉強タスクを登録して、最初の育成ループを始めましょう。",

        setActiveView: (view) => set({ activeView: view }),

        clearLastActionMessage: () => set({ lastActionMessage: null }),

        addTask: (input) =>
          set((state) => {
            const task: Task = {
              id: createTaskId(),
              title: input.title.trim(),
              subject: input.subject?.trim() || undefined,
              durationMinutes: input.durationMinutes,
              difficulty: input.difficulty,
              status: "idle",
              createdAt: now().toISOString(),
              completedAt: null,
            };

            return {
              tasks: [task, ...state.tasks],
              lastActionMessage: createTaskMessage(task),
            };
          }),

        deleteTask: (taskId) =>
          set((state) => {
            const isActive = state.timer.activeTaskId === taskId;

            return {
              tasks: state.tasks.filter((task) => task.id !== taskId),
              timer: isActive ? createEmptyTimer() : state.timer,
              lastActionMessage: "タスクを削除しました。",
            };
          }),

        startTaskTimer: (taskId) =>
          set((state) => {
            if (state.timer.activeTaskId) {
              return {
                lastActionMessage: "進行中のタイマーを先に止めてください。",
              };
            }

            const task = state.tasks.find((currentTask) => currentTask.id === taskId);
            if (!task || task.status === "completed") {
              return {
                lastActionMessage: "開始できるタスクが見つかりません。",
              };
            }

            const startDate = now();
            const snapshot = createTimerBonusSnapshot(state.monster);
            const durationMs = getTaskDurationMs(task, state.monster, snapshot);
            const targetEndsAt = new Date(startDate.getTime() + durationMs).toISOString();

            return {
              tasks: state.tasks.map((currentTask) =>
                currentTask.id === taskId
                  ? { ...currentTask, status: "running" }
                  : currentTask.status === "running"
                    ? { ...currentTask, status: "idle" }
                    : currentTask,
              ),
              timer: {
                activeTaskId: taskId,
                startedAt: startDate.toISOString(),
                targetEndsAt,
                bonusSnapshot: snapshot,
              },
              lastActionMessage: `「${task.title}」のタイマーを開始しました。`,
            };
          }),

        stopTaskTimer: () =>
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === state.timer.activeTaskId ? { ...task, status: "idle" } : task,
            ),
            timer: createEmptyTimer(),
            lastActionMessage: "タイマーを停止しました。",
          })),

        completeTask: (taskId) =>
          set((state) => {
            const task = state.tasks.find((currentTask) => currentTask.id === taskId);
            if (!task || task.status === "completed") {
              return {
                lastActionMessage: "このタスクはすでに処理済みです。",
              };
            }

            const snapshot: TimerBonusSnapshot | null =
              state.timer.activeTaskId === taskId ? state.timer.bonusSnapshot : null;
            const reward = calculateTaskCompletionReward(task, state.monster, snapshot);
            const gainedMonster = grantMonsterExperience(state.monster, reward.exp, random).monster;
            const nextEnergy = clamp(
              state.resources.energy + reward.energy,
              0,
              getEnergyCap(gainedMonster),
            );
            const actualEnergyGain = nextEnergy - state.resources.energy;

            return {
              tasks: state.tasks.map((currentTask) =>
                currentTask.id === taskId
                  ? { ...currentTask, status: "completed", completedAt: now().toISOString() }
                  : currentTask,
              ),
              timer: state.timer.activeTaskId === taskId ? createEmptyTimer() : state.timer,
              monster: gainedMonster,
              resources: {
                sp: state.resources.sp + reward.sp,
                energy: nextEnergy,
              },
              lastActionMessage: `タスク達成: EXP +${reward.exp}, SP +${reward.sp}, Energy +${actualEnergyGain}`,
            };
          }),

        claimLevelChoice: (choiceId) =>
          set((state) => {
            const currentChoiceSet = state.monster.pendingLevelChoices[0];
            if (!currentChoiceSet) {
              return {
                lastActionMessage: "現在選べる強化候補はありません。",
              };
            }

            const selectedChoice = currentChoiceSet.choices.find((choice) => choice.id === choiceId);
            if (!selectedChoice) {
              return {
                lastActionMessage: "選択した候補が見つかりません。",
              };
            }

            const nextMonster = {
              ...applyLevelChoice(
                {
                  ...state.monster,
                  pendingLevelChoices: state.monster.pendingLevelChoices.slice(1),
                },
                selectedChoice,
              ),
            };

            return {
              monster: nextMonster,
              resources: {
                ...state.resources,
                energy: clamp(state.resources.energy, 0, getEnergyCap(nextMonster)),
              },
              lastActionMessage: "レベルアップ強化を適用しました。",
            };
          }),

        rerollLevelChoices: () =>
          set((state) => {
            const currentChoiceSet = state.monster.pendingLevelChoices[0];
            const cost = getLevelChoiceRerollCost();

            if (!currentChoiceSet) {
              return {
                lastActionMessage: "リロールできる候補がありません。",
              };
            }

            if (state.resources.sp < cost) {
              return {
                lastActionMessage: `SP が足りません。必要: ${cost}`,
              };
            }

            return {
              monster: {
                ...state.monster,
                pendingLevelChoices: [
                  rerollChoiceSet(state.monster, currentChoiceSet, random),
                  ...state.monster.pendingLevelChoices.slice(1),
                ],
              },
              resources: {
                ...state.resources,
                sp: state.resources.sp - cost,
              },
              lastActionMessage: `強化候補をリロールしました。SP -${cost}`,
            };
          }),

        equipItem: (equipmentId) =>
          set((state) => {
            const equipment = state.equipmentInventory.find((item) => item.id === equipmentId);
            if (!equipment) {
              return {
                lastActionMessage: "装備が見つかりません。",
              };
            }

            return {
              equippedSlots: {
                ...state.equippedSlots,
                [equipment.slot]: equipment.id,
              },
              lastActionMessage: `${getSlotLabel(equipment.slot)} に ${equipment.name} を装備しました。`,
            };
          }),

        rerollEquipmentSkill: (equipmentId, skillType) =>
          set((state) => {
            const equipment = state.equipmentInventory.find((item) => item.id === equipmentId);
            const cost = getEquipmentSkillRerollCost();

            if (!equipment) {
              return {
                lastActionMessage: "装備が見つかりません。",
              };
            }

            if (state.resources.sp < cost) {
              return {
                lastActionMessage: `SP が足りません。必要: ${cost}`,
              };
            }

            const rerolled =
              skillType === "active"
                ? rerollEquipmentActiveSkill(equipment, random)
                : rerollEquipmentPassiveSkill(equipment, random);

            return {
              equipmentInventory: state.equipmentInventory.map((item) =>
                item.id === equipmentId ? rerolled : item,
              ),
              resources: {
                ...state.resources,
                sp: state.resources.sp - cost,
              },
              lastActionMessage: `${equipment.name} の${skillType === "active" ? "アクティブ" : "パッシブ"}スキルをリロールしました。`,
            };
          }),

        attackRaidBoss: () =>
          set((state) => {
            const actionTime = now();
            const raidCheck = canAttemptRaid(state.raid.boss, state.resources.energy, actionTime);
            if (!raidCheck.allowed) {
              return {
                lastActionMessage: raidCheck.reason,
              };
            }

            const battle = simulateRaidBattle(
              state.monster,
              state.raid.boss,
              state.equipmentInventory,
              state.equippedSlots,
              random,
              actionTime,
            );

            let nextMonster = state.monster;
            let nextSp = state.resources.sp;
            let nextEnergy = state.resources.energy - state.raid.boss.energyCost;
            const nextInventory = battle.summary.equipmentDrop
              ? [battle.summary.equipmentDrop, ...state.equipmentInventory]
              : state.equipmentInventory;
            const nextEquippedSlots = maybeAutoEquip(
              nextInventory,
              state.equippedSlots,
              battle.summary.equipmentDrop,
            );
            const nextLog = [
              `Stage ${battle.previousStage}: ${battle.summary.outcome} / ${battle.summary.damageToBoss} total damage`,
              ...battle.summary.log.map((entry) => entry.text),
            ];
            let rewardSummary =
              battle.summary.equipmentDrop !== null
                ? `装備ドロップ: ${battle.summary.equipmentDrop.name}`
                : null;

            if (battle.defeated) {
              const bossExp = 150 * battle.previousStage;
              const bossSp = 15 * battle.previousStage;
              const bonusEnergy = 20;
              let grantedSkillName: string | null = null;

              nextMonster = grantMonsterExperience(nextMonster, bossExp, random).monster;
              nextSp += bossSp;

              if (random() < 0.6) {
                const skillGrant = grantRandomSkill(nextMonster, random);
                nextMonster = skillGrant.monster;
                grantedSkillName = skillGrant.skill?.name ?? null;
              }

              const nextEnergyAfterReward = clamp(
                nextEnergy + bonusEnergy,
                0,
                getEnergyCap(nextMonster),
              );
              const actualEnergyGain = nextEnergyAfterReward - nextEnergy;
              nextEnergy = nextEnergyAfterReward;

              rewardSummary = [
                `Stage ${battle.previousStage} 撃破`,
                `EXP +${bossExp}`,
                `SP +${bossSp}`,
                `Energy +${actualEnergyGain}`,
                battle.summary.equipmentDrop ? `Drop: ${battle.summary.equipmentDrop.name}` : null,
                grantedSkillName ? `Bonus skill: ${grantedSkillName}` : null,
              ]
                .filter(Boolean)
                .join(" / ");
            } else {
              nextEnergy = clamp(nextEnergy, 0, getEnergyCap(nextMonster));
            }

            return {
              monster: nextMonster,
              resources: {
                sp: nextSp,
                energy: nextEnergy,
              },
              raid: {
                boss: battle.boss,
                lastDamage: battle.summary.damageToBoss,
                lastRewardSummary: rewardSummary,
                lastBattle: battle.summary,
                log: nextLog.slice(0, 18),
                battleInProgress: false,
                currentTurn: 0,
                monsterBattleState: null,
                bossBattleState: null,
                battleLog: [],
              },
              equipmentInventory: nextInventory,
              equippedSlots: nextEquippedSlots,
              lastActionMessage: battle.defeated
                ? `レイド勝利。${rewardSummary ?? ""}`
                : `レイド結果: ${battle.summary.outcome} / ${battle.summary.damageToBoss} ダメージ / Drop ${
                    battle.summary.equipmentDrop?.name ?? "なし"
                  }`,
            };
          }),

        startRaidBattle: () =>
          set((state) => {
            const actionTime = now();
            const raidCheck = canAttemptRaid(state.raid.boss, state.resources.energy, actionTime);
            if (!raidCheck.allowed) {
              return {
                lastActionMessage: raidCheck.reason,
              };
            }

            const { monsterState, bossState, battleLog } = initializeBattleState(
              state.monster,
              state.raid.boss,
              state.equipmentInventory,
              state.equippedSlots,
            );

            return {
              resources: {
                ...state.resources,
                energy: state.resources.energy - state.raid.boss.energyCost,
              },
              raid: {
                ...state.raid,
                battleInProgress: true,
                currentTurn: 1,
                monsterBattleState: monsterState,
                bossBattleState: bossState,
                battleLog,
              },
              lastActionMessage: "バトルを開始しました。",
            };
          }),

        executePlayerAction: (action) =>
          set((state) => {
            if (!state.raid.battleInProgress || !state.raid.monsterBattleState || !state.raid.bossBattleState) {
              return {
                lastActionMessage: "バトルが進行中ではありません。",
              };
            }

            const actionTime = now();
            const equippedItems = getEquippedItems(state.equipmentInventory, state.equippedSlots);
            const { monsterState, bossState, battleLog } = executeBattleTurn(
              state.raid.monsterBattleState,
              state.raid.bossBattleState,
              action,
              state.raid.boss.activeSkills,
              equippedItems,
              random,
              state.raid.currentTurn,
            );

            const battleEnded = monsterState.hp <= 0 || bossState.hp <= 0 || state.raid.currentTurn >= MAX_BATTLE_TURNS;
            const defeated = bossState.hp <= 0;

            if (battleEnded) {
              const bossStartingHp = state.raid.boss.maxHp;
              const damageToBoss = bossStartingHp - bossState.hp;
              const outcome = bossState.hp <= 0 ? "victory" : monsterState.hp <= 0 ? "defeat" : "stalled";
              const equipmentDrop = generateEquipment(defeated ? state.raid.boss.stage + 1 : state.raid.boss.stage, random);

              let nextMonster = state.monster;
              let nextSp = state.resources.sp;
              let rewardSummary = equipmentDrop ? `装備ドロップ: ${equipmentDrop.name}` : null;

              if (defeated) {
                const bossExp = 150 * state.raid.boss.stage;
                const bossSp = 15 * state.raid.boss.stage;
                const bonusEnergy = 20;
                let grantedSkillName: string | null = null;

                nextMonster = grantMonsterExperience(nextMonster, bossExp, random).monster;
                nextSp += bossSp;

                if (random() < 0.6) {
                  const skillGrant = grantRandomSkill(nextMonster, random);
                  nextMonster = skillGrant.monster;
                  grantedSkillName = skillGrant.skill?.name ?? null;
                }

                const nextEnergy = clamp(
                  state.resources.energy + bonusEnergy,
                  0,
                  getEnergyCap(nextMonster),
                );

                rewardSummary = [
                  `Stage ${state.raid.boss.stage} 撃破`,
                  `EXP +${bossExp}`,
                  `SP +${bossSp}`,
                  `Energy +${nextEnergy - state.resources.energy}`,
                  equipmentDrop ? `Drop: ${equipmentDrop.name}` : null,
                  grantedSkillName ? `Bonus skill: ${grantedSkillName}` : null,
                ]
                  .filter(Boolean)
                  .join(" / ");

                const nextBoss = createNextRaidBoss(state.raid.boss, toLocalDateKey(actionTime), random);
                const nextInventory = equipmentDrop ? [equipmentDrop, ...state.equipmentInventory] : state.equipmentInventory;
                const nextEquippedSlots = maybeAutoEquip(nextInventory, state.equippedSlots, equipmentDrop);

                return {
                  monster: nextMonster,
                  resources: {
                    sp: nextSp,
                    energy: nextEnergy,
                  },
                  raid: {
                    boss: nextBoss,
                    lastDamage: damageToBoss,
                    lastRewardSummary: rewardSummary,
                    lastBattle: {
                      outcome,
                      turns: state.raid.currentTurn,
                      damageToBoss,
                      bossRemainingHp: bossState.hp,
                      monsterRemainingHp: monsterState.hp,
                      monsterRemainingMp: monsterState.mp,
                      equipmentDrop,
                      log: [...state.raid.battleLog, ...battleLog].slice(-24),
                    },
                    log: [
                      `Stage ${state.raid.boss.stage}: ${outcome} / ${damageToBoss} total damage`,
                      ...battleLog.map((entry) => entry.text),
                    ],
                    battleInProgress: false,
                    currentTurn: 0,
                    monsterBattleState: null,
                    bossBattleState: null,
                    battleLog: [],
                  },
                  equipmentInventory: nextInventory,
                  equippedSlots: nextEquippedSlots,
                  lastActionMessage: `レイド${outcome === "victory" ? "勝利" : "終了"}。${rewardSummary ?? ""}`,
                };
              }

              const nextInventory = equipmentDrop ? [equipmentDrop, ...state.equipmentInventory] : state.equipmentInventory;
              const nextEquippedSlots = maybeAutoEquip(nextInventory, state.equippedSlots, equipmentDrop);

              return {
                equipmentInventory: nextInventory,
                equippedSlots: nextEquippedSlots,
                raid: {
                  ...state.raid,
                  boss: {
                    ...state.raid.boss,
                    currentHp: bossState.hp,
                    lastAttemptDate: toLocalDateKey(actionTime),
                  },
                  lastDamage: damageToBoss,
                  lastBattle: {
                    outcome,
                    turns: state.raid.currentTurn,
                    damageToBoss,
                    bossRemainingHp: bossState.hp,
                    monsterRemainingHp: monsterState.hp,
                    monsterRemainingMp: monsterState.mp,
                    equipmentDrop,
                    log: [...state.raid.battleLog, ...battleLog].slice(-24),
                  },
                  battleInProgress: false,
                  currentTurn: 0,
                  monsterBattleState: null,
                  bossBattleState: null,
                  battleLog: [],
                },
                lastActionMessage: `バトル${outcome === "victory" ? "勝利" : "終了"}。${rewardSummary ?? ""}`,
              };
            }

            return {
              raid: {
                ...state.raid,
                currentTurn: state.raid.currentTurn + 1,
                monsterBattleState: monsterState,
                bossBattleState: bossState,
                battleLog: [...state.raid.battleLog, ...battleLog],
              },
              lastActionMessage: `${action.name}を使用しました。`,
            };
          }),

        endBattle: () =>
          set((state) => ({
            raid: {
              ...state.raid,
              battleInProgress: false,
              currentTurn: 0,
              monsterBattleState: null,
              bossBattleState: null,
              battleLog: [],
            },
            lastActionMessage: "バトルを中断しました。",
          })),

        resetGame: () =>
          set(() => ({
            ...createInitialGameState(),
            activeView: "tasks",
            lastActionMessage: "データを初期化しました。新しい周回を始めましょう。",
          })),
      }),
      {
        name: STORAGE_KEY,
        partialize: getPersistedSlice,
        storage: createDefaultStorage(dependencies.storage),
        merge: (persistedState, currentState) => ({
          ...currentState,
          ...normalizePersistedGameState(persistedState as Partial<PersistedGameState> | undefined),
        }),
      },
    ),
  );
}

export const defaultGameStore = createGameStore();

export function useGameStore<T>(selector: (state: GameStoreState) => T) {
  return useStore(defaultGameStore, selector);
}

export function getGameStore() {
  return defaultGameStore;
}

export function getRemainingLevelExp(state: GameStoreState) {
  return expToNextLevel(state.monster.level) - state.monster.exp;
}
