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
  createTimerBonusSnapshot,
  expToNextLevel,
  getEnergyCap,
  getTaskDurationMs,
  grantMonsterExperience,
  grantRandomSkill,
  normalizePersistedGameState,
  rerollChoiceSet,
  resolveRaidAttack,
} from "@/lib/gameRules";
import type { PersistedGameState, Task, TimerBonusSnapshot, ViewId } from "@/types/game";

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
  attackRaidBoss: () => void;
  resetGame: () => void;
};

export type GameStoreState = PersistedGameState & UIState & Actions;

const STORAGE_KEY = "study-rpg-state";
const REROLL_COST = 10;

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
  };
}

function createDefaultStorage(storage?: StateStorage) {
  if (storage) {
    return createJSONStorage<PersistedGameState>(() => storage);
  }

  return createJSONStorage<PersistedGameState>(() => localStorage);
}

export function createGameStore(dependencies: StoreDependencies = {}) {
  const random = dependencies.random ?? Math.random;
  const now = dependencies.now ?? (() => new Date());

  return createStore<GameStoreState>()(
    persist(
      (set, get) => ({
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
              lastActionMessage: `レベルアップ強化を適用しました。`,
            };
          }),

        rerollLevelChoices: () =>
          set((state) => {
            const currentChoiceSet = state.monster.pendingLevelChoices[0];
            if (!currentChoiceSet) {
              return {
                lastActionMessage: "リロールできる候補がありません。",
              };
            }

            if (state.resources.sp < REROLL_COST) {
              return {
                lastActionMessage: `SP が足りません。必要: ${REROLL_COST}`,
              };
            }

            const nextMonster = { ...state.monster };
            nextMonster.pendingLevelChoices = [
              rerollChoiceSet(nextMonster, currentChoiceSet, random),
              ...state.monster.pendingLevelChoices.slice(1),
            ];

            return {
              monster: nextMonster,
              resources: {
                ...state.resources,
                sp: state.resources.sp - REROLL_COST,
              },
              lastActionMessage: "強化候補をリロールしました。",
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

            const { boss, result } = resolveRaidAttack(
              state.monster,
              state.raid.boss,
              random,
              actionTime,
            );
            let nextMonster = state.monster;
            let nextSp = state.resources.sp;
            let nextEnergy = state.resources.energy - state.raid.boss.energyCost;
            let rewardSummary: string | null = null;
            const nextLog = [...state.raid.log];

            nextLog.unshift(`Stage ${result.previousStage}: ${result.damage} ダメージを与えた。`);

            if (result.defeated) {
              const bossExp = 150 * result.previousStage;
              const bossSp = 15 * result.previousStage;
              const bonusEnergy = 20;
              const raidSkillRoll = random();
              let grantedSkillName: string | null = null;

              if (raidSkillRoll < 0.6) {
                const skillGrant = grantRandomSkill(nextMonster, random);
                nextMonster = skillGrant.monster;
                grantedSkillName = skillGrant.skill?.name ?? null;
              }

              nextMonster = grantMonsterExperience(nextMonster, bossExp, random).monster;
              nextSp += bossSp;
              const nextEnergyAfterReward = clamp(
                nextEnergy + bonusEnergy,
                0,
                getEnergyCap(nextMonster),
              );
              const actualEnergyGain = nextEnergyAfterReward - nextEnergy;
              nextEnergy = nextEnergyAfterReward;
              rewardSummary = `Stage ${result.previousStage} 撃破 / EXP +${bossExp}, SP +${bossSp}, Energy +${actualEnergyGain}`;
              nextLog.unshift(`Stage ${result.previousStage} を撃破。次のボスが出現した。`);
              if (grantedSkillName) {
                nextLog.unshift(`ボーナススキル獲得: ${grantedSkillName}`);
              }
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
                boss,
                lastDamage: result.damage,
                lastRewardSummary: rewardSummary,
                log: nextLog.slice(0, 12),
              },
              lastActionMessage: result.defeated
                ? `レイド勝利。${rewardSummary ?? ""}`
                : `レイド攻撃で ${result.damage} ダメージ。`,
            };
          }),

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
