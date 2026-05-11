import { createStore } from "zustand/vanilla";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { useStore } from "zustand";
import {
  applyLevelChoice,
  calculateReincarnationBonus,
  calculateTaskCompletionReward,
  canAttemptRaid,
  clamp,
  createEmptyTimer,
  createInitialGameState,
  createNextRaidBoss,
  createTimerBonusSnapshot,
  executeBattleTurn,
  executeSynthesis as executeSynthesisCore,
  expToNextLevel,
  generateEquipment,
  generateAttachment,
  EQUIPMENT_SLOTS,
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
  previewSynthesis as previewSynthesisCore,
  previewAttachmentSynthesis,
  executeAttachmentSynthesis,
  getAttachmentSynthesisSPCost,
  rerollChoiceSet,
  rerollEquipmentActiveSkill,
  rerollEquipmentPassiveSkill,
  simulateRaidBattle,
  toLocalDateKey,
} from "@/lib/gameRules";
import type {
  CompletionEffectsState,
  Equipment,
  Attachment,
  AttachmentSynthesisPreview,
  PersistedGameState,
  SynthesisSelection,
  SynthesisPreview,
  Task,
  TaskCompletionReward,
  TimerBonusSnapshot,
  ViewId,
  EquipmentSlot,
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
  completionEffects: CompletionEffectsState;
};

type Actions = {
  setActiveView: (view: ViewId) => void;
  clearLastActionMessage: () => void;
  addTask: (input: {
    title: string;
    subject?: string;
    durationMinutes: number;
    difficulty: number;
    folderId?: string | null;
  }) => void;
  updateTask: (taskId: string, updates: {
    title?: string;
    subject?: string;
    durationMinutes?: number;
    difficulty?: number;
    folderId?: string | null;
  }) => void;
  reorderTasks: (fromIndex: number, toIndex: number) => void;
  createFolder: (input: { name: string; description?: string; color: string }) => void;
  updateFolder: (folderId: string, updates: { name?: string; description?: string; color?: string }) => void;
  deleteFolder: (folderId: string) => void;
  assignTaskToFolder: (taskId: string, folderId: string | null) => void;
  deleteTask: (taskId: string) => void;
  batchDeleteTasks: (taskIds: string[]) => void;
  toggleTaskLock: (taskId: string) => void;
  reverseFolderTasks: (folderId: string | null) => void;
  batchMoveTasks: (taskIds: string[], folderId: string | null) => void;
  startTaskTimer: (taskId: string) => void;
  pauseTaskTimer: () => void;
  resumeTaskTimer: () => void;
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
  showCompletionEffects: (taskTitle: string, reward: TaskCompletionReward, monsterLevelUp: boolean) => void;
  hideCompletionEffects: () => void;
  previewSynthesis: (baseId: string, materialId: string, selection: SynthesisSelection) => SynthesisPreview | null;
  executeSynthesis: (baseId: string, materialId: string, selection: SynthesisSelection) => void;
  // Attachment actions
  equipAttachment: (attachmentId: string, slot: EquipmentSlot) => void;
  unequipAttachment: (attachmentId: string, slot: EquipmentSlot) => void;
  previewAttachmentSynth: (baseId: string, materialId: string) => AttachmentSynthesisPreview | null;
  executeAttachmentSynth: (baseId: string, materialId: string) => void;
  reincarnate: () => void;
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
    folders: state.folders,
    timer: state.timer,
    monster: state.monster,
    resources: state.resources,
    raid: state.raid,
    equipmentInventory: state.equipmentInventory,
    equippedSlots: state.equippedSlots,
    attachmentInventory: state.attachmentInventory,
    equippedAttachments: state.equippedAttachments,
    reincarnationCount: state.reincarnationCount,
    reincarnationBonus: state.reincarnationBonus,
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
      (set, get) => ({
        ...createInitialGameState(),
        activeView: "tasks",
        lastActionMessage: "勉強タスクを登録して、最初の育成ループを始めましょう。",
        completionEffects: {
          isVisible: false,
          taskTitle: "",
          reward: null,
          monsterLevelUp: false,
          droppedAttachment: null,
        },

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
              folderId: input.folderId || null,
            };

            // Update folder taskIds if folderId is provided
            let updatedFolders = state.folders;
            if (input.folderId) {
              updatedFolders = state.folders.map((folder) => {
                if (folder.id === input.folderId) {
                  return {
                    ...folder,
                    taskIds: [...folder.taskIds, task.id],
                  };
                }
                return folder;
              });
            }

            return {
              tasks: [task, ...state.tasks],
              folders: updatedFolders,
              lastActionMessage: createTaskMessage(task),
            };
          }),

        updateTask: (taskId, updates) =>
          set((state) => {
            const taskIndex = state.tasks.findIndex((task) => task.id === taskId);
            if (taskIndex === -1) {
              return {
                lastActionMessage: "タスクが見つかりません。",
              };
            }

            const task = state.tasks[taskIndex];
            if (task.status === "completed") {
              return {
                lastActionMessage: "完了済みタスクは編集できません。",
              };
            }

            if (state.timer.activeTaskId === taskId) {
              return {
                lastActionMessage: "進行中のタイマーがあるタスクは編集できません。",
              };
            }

            const updatedTask: Task = {
              ...task,
              title: updates.title?.trim() !== undefined ? updates.title.trim() : task.title,
              subject: updates.subject !== undefined ? (updates.subject?.trim() || undefined) : task.subject,
              durationMinutes: updates.durationMinutes !== undefined ? updates.durationMinutes : task.durationMinutes,
              difficulty: updates.difficulty !== undefined ? updates.difficulty : task.difficulty,
              folderId: updates.folderId !== undefined ? updates.folderId : task.folderId,
            };

            const updatedTasks = [...state.tasks];
            updatedTasks[taskIndex] = updatedTask;

            // Update folder taskIds
            const updatedFolders = state.folders.map((folder) => {
              // If task moved to this folder
              if (updates.folderId === folder.id && task.folderId !== folder.id) {
                return {
                  ...folder,
                  taskIds: [...folder.taskIds, taskId],
                };
              }
              // If task moved from this folder
              if (task.folderId === folder.id && updates.folderId !== folder.id) {
                return {
                  ...folder,
                  taskIds: folder.taskIds.filter((id) => id !== taskId),
                };
              }
              return folder;
            });

            return {
              tasks: updatedTasks,
              folders: updatedFolders,
              lastActionMessage: `「${updatedTask.title}」を更新しました。`,
            };
          }),

        reorderTasks: (fromIndex, toIndex) =>
          set((state) => {
            const newTasks = [...state.tasks];
            const [movedTask] = newTasks.splice(fromIndex, 1);
            newTasks.splice(toIndex, 0, movedTask);

            return {
              tasks: newTasks,
              lastActionMessage: "タスクの順序を変更しました。",
            };
          }),

        createFolder: (input) =>
          set((state) => {
            const folder = {
              id: `folder-${crypto.randomUUID()}`,
              name: input.name.trim(),
              description: input.description?.trim() || undefined,
              color: input.color,
              createdAt: now().toISOString(),
              taskIds: [],
            };

            return {
              folders: [...state.folders, folder],
              lastActionMessage: `フォルダ「${folder.name}」を作成しました。`,
            };
          }),

        updateFolder: (folderId, updates) =>
          set((state) => {
            const folderIndex = state.folders.findIndex((folder) => folder.id === folderId);
            if (folderIndex === -1) {
              return {
                lastActionMessage: "フォルダが見つかりません。",
              };
            }

            const folder = state.folders[folderIndex];
            const updatedFolder = {
              ...folder,
              name: updates.name?.trim() !== undefined ? updates.name.trim() : folder.name,
              description: updates.description !== undefined ? (updates.description?.trim() || undefined) : folder.description,
              color: updates.color !== undefined ? updates.color : folder.color,
            };

            const updatedFolders = [...state.folders];
            updatedFolders[folderIndex] = updatedFolder;

            return {
              folders: updatedFolders,
              lastActionMessage: `フォルダ「${updatedFolder.name}」を更新しました。`,
            };
          }),

        deleteFolder: (folderId) =>
          set((state) => {
            const folder = state.folders.find((folder) => folder.id === folderId);
            if (!folder) {
              return {
                lastActionMessage: "フォルダが見つかりません。",
              };
            }

            // フォルダ内のタスクを未分類に戻す
            const updatedTasks = state.tasks.map((task) =>
              task.folderId === folderId ? { ...task, folderId: null } : task
            );

            return {
              folders: state.folders.filter((folder) => folder.id !== folderId),
              tasks: updatedTasks,
              lastActionMessage: `フォルダ「${folder.name}」を削除しました。`,
            };
          }),

        assignTaskToFolder: (taskId, folderId) =>
          set((state) => {
            const taskIndex = state.tasks.findIndex((task) => task.id === taskId);
            if (taskIndex === -1) {
              return {
                lastActionMessage: "タスクが見つかりません。",
              };
            }

            const task = state.tasks[taskIndex];
            const updatedTask = { ...task, folderId };

            const updatedTasks = [...state.tasks];
            updatedTasks[taskIndex] = updatedTask;

            // フォルダのtaskIdsを更新
            const updatedFolders = state.folders.map((folder) => {
              if (folder.id === folderId) {
                return {
                  ...folder,
                  taskIds: [...folder.taskIds, taskId],
                };
              }
              // 古いフォルダからtaskIdを削除
              if (folder.taskIds.includes(taskId)) {
                return {
                  ...folder,
                  taskIds: folder.taskIds.filter((id) => id !== taskId),
                };
              }
              return folder;
            });

            const folderName = folderId ? state.folders.find((f) => f.id === folderId)?.name : "未分類";

            return {
              tasks: updatedTasks,
              folders: updatedFolders,
              lastActionMessage: `タスク「${task.title}」を${folderName}に移動しました。`,
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

        batchDeleteTasks: (taskIds) =>
          set((state) => {
            const isActiveDeleted = taskIds.includes(state.timer.activeTaskId || "");
            const updatedTasks = state.tasks.filter((task) => !taskIds.includes(task.id));
            const deletedCount = state.tasks.length - updatedTasks.length;

            // フォルダのtaskIdsから削除されたタスクを削除
            const updatedFolders = state.folders.map((folder) => ({
              ...folder,
              taskIds: folder.taskIds.filter((id) => !taskIds.includes(id)),
            }));

            return {
              tasks: updatedTasks,
              folders: updatedFolders,
              timer: isActiveDeleted ? createEmptyTimer() : state.timer,
              lastActionMessage: `${deletedCount}個のタスクを削除しました。`,
            };
          }),

        toggleTaskLock: (taskId) =>
          set((state) => {
            return {
              tasks: state.tasks.map((task) =>
                task.id === taskId ? { ...task, locked: !task.locked } : task,
              ),
              lastActionMessage: "タスクのロック状態を変更しました。",
            };
          }),

        reverseFolderTasks: (folderId) =>
          set((state) => {
            // 対象フォルダの未完了タスクを取得（完了済みは除外）
            const folderTaskIds = state.tasks
              .filter((task) =>
                task.status !== "completed" &&
                (folderId === null ? !task.folderId : task.folderId === folderId)
              )
              .map((task) => task.id);

            if (folderTaskIds.length <= 1) {
              return { lastActionMessage: "反転するタスクがありません。" };
            }

            // 対象外のタスク（他のフォルダまたは完了済み）
            const otherTasks = state.tasks.filter(
              (task) => !folderTaskIds.includes(task.id)
            );

            // 対象タスクを逆順にして新しい配列を構築
            const reversedFolderTasks = folderTaskIds
              .map((id) => state.tasks.find((task) => task.id === id)!)
              .reverse();

            // 順序を維持しながら配置：otherTasksの中でfolderTaskIdsに該当する位置にreversedを挿入
            const result: typeof state.tasks = [];
            let reversedIndex = 0;

            for (const task of state.tasks) {
              if (folderTaskIds.includes(task.id)) {
                result.push(reversedFolderTasks[reversedIndex++]);
              } else {
                result.push(task);
              }
            }

            return {
              tasks: result,
              lastActionMessage: `${reversedFolderTasks.length}個のタスクの順序を反転しました。`,
            };
          }),

        batchMoveTasks: (taskIds, folderId) =>
          set((state) => {
            const folderName = folderId
              ? state.folders.find((f) => f.id === folderId)?.name
              : "未分類";

            // タスクのfolderIdを更新
            const updatedTasks = state.tasks.map((task) =>
              taskIds.includes(task.id) ? { ...task, folderId } : task
            );

            // フォルダのtaskIdsを更新
            const updatedFolders = state.folders.map((folder) => {
              if (folder.id === folderId) {
                // 移動先フォルダに追加
                const newTaskIds = [...folder.taskIds];
                taskIds.forEach((id) => {
                  if (!newTaskIds.includes(id)) {
                    newTaskIds.push(id);
                  }
                });
                return { ...folder, taskIds: newTaskIds };
              }
              // 他のフォルダからは削除
              if (folder.taskIds.some((id) => taskIds.includes(id))) {
                return {
                  ...folder,
                  taskIds: folder.taskIds.filter((id) => !taskIds.includes(id)),
                };
              }
              return folder;
            });

            return {
              tasks: updatedTasks,
              folders: updatedFolders,
              lastActionMessage: `${taskIds.length}個のタスクを${folderName}に移動しました。`,
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
                isPaused: false,
                pausedAt: null,
                totalPausedDuration: 0,
              },
              lastActionMessage: `「${task.title}」のタイマーを開始しました。`,
            };
          }),

        pauseTaskTimer: () =>
          set((state) => {
            if (!state.timer.activeTaskId || state.timer.isPaused) {
              return {
                lastActionMessage: "一時停止できるタイマーがありません。",
              };
            }

            return {
              timer: {
                ...state.timer,
                isPaused: true,
                pausedAt: now().toISOString(),
              },
              lastActionMessage: "タイマーを一時停止しました。",
            };
          }),

        resumeTaskTimer: () =>
          set((state) => {
            if (!state.timer.activeTaskId || !state.timer.isPaused) {
              return {
                lastActionMessage: "再開できるタイマーがありません。",
              };
            }

            const pausedAt = state.timer.pausedAt;
            const currentPausedDuration = pausedAt 
              ? now().getTime() - new Date(pausedAt).getTime()
              : 0;
            const newTotalPausedDuration = state.timer.totalPausedDuration + currentPausedDuration;

            // Calculate new target end time by adding the pause duration
            const originalTargetEndsAt = state.timer.targetEndsAt;
            const newTargetEndsAt = originalTargetEndsAt
              ? new Date(new Date(originalTargetEndsAt).getTime() + currentPausedDuration).toISOString()
              : null;

            return {
              timer: {
                ...state.timer,
                isPaused: false,
                pausedAt: null,
                totalPausedDuration: newTotalPausedDuration,
                targetEndsAt: newTargetEndsAt,
              },
              lastActionMessage: "タイマーを再開しました。",
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
            const reward = calculateTaskCompletionReward(task, state.monster, snapshot, state.reincarnationBonus);
            const monsterResult = grantMonsterExperience(state.monster, reward.exp, random);
            const gainedMonster = monsterResult.monster;
            const monsterLevelUp = gainedMonster.level > state.monster.level;
            const nextEnergy = clamp(
              state.resources.energy + reward.energy,
              0,
              getEnergyCap(gainedMonster),
            );
            const actualEnergyGain = nextEnergy - state.resources.energy;

            const updatedTasks = state.tasks.map((currentTask) =>
              currentTask.id === taskId
                ? { ...currentTask, status: "completed" as const, completedAt: now().toISOString() }
                : currentTask,
            );

            // Attachment drop chance based on task duration (durationMinutes/120, capped at 100%)
            const attachmentDropChance = Math.min(task.durationMinutes / 120, 1.0);
            let droppedAttachment: Attachment | null = null;
            if (random() < attachmentDropChance) {
              // Determine stage based on monster level
              const stage = Math.max(1, Math.floor(state.monster.level / 10));
              droppedAttachment = generateAttachment(stage, random);
            }

            // If task is locked, create a copy and add it back to pending tasks
            let finalTasks: Task[] = updatedTasks;
            if (task.locked) {
              const newTask: Task = {
                id: createTaskId(),
                title: task.title,
                subject: task.subject,
                durationMinutes: task.durationMinutes,
                difficulty: task.difficulty,
                status: "idle" as const,
                createdAt: now().toISOString(),
                completedAt: null,
                locked: true,
              };
              finalTasks = [newTask, ...updatedTasks];
            }

            const attachmentMessage = droppedAttachment
              ? ` アタッチメント「${droppedAttachment.name}」を獲得！`
              : "";

            return {
              tasks: finalTasks,
              timer: state.timer.activeTaskId === taskId ? createEmptyTimer() : state.timer,
              monster: gainedMonster,
              resources: {
                sp: state.resources.sp + reward.sp,
                energy: nextEnergy,
              },
              attachmentInventory: droppedAttachment
                ? [...state.attachmentInventory, droppedAttachment]
                : state.attachmentInventory,
              completionEffects: {
                isVisible: true,
                taskTitle: task.title,
                reward: {
                  exp: reward.exp,
                  sp: reward.sp,
                  energy: actualEnergyGain,
                },
                monsterLevelUp,
                droppedAttachment: droppedAttachment,
              },
              lastActionMessage: `タスク達成: EXP +${reward.exp}, SP +${reward.sp}, Energy +${actualEnergyGain}${attachmentMessage}`,
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
              state.attachmentInventory,
              state.equippedAttachments,
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
              state.attachmentInventory,
              state.equippedAttachments,
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
              state.attachmentInventory,
              state.equippedAttachments,
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
            completionEffects: {
              isVisible: false,
              taskTitle: "",
              reward: null,
              monsterLevelUp: false,
              droppedAttachment: null,
            },
          })),

        showCompletionEffects: (taskTitle, reward, monsterLevelUp) =>
          set(() => ({
            completionEffects: {
              isVisible: true,
              taskTitle,
              reward,
              monsterLevelUp,
              droppedAttachment: null,
            },
          })),

        hideCompletionEffects: () =>
          set((state) => ({
            completionEffects: {
              ...state.completionEffects,
              isVisible: false,
            },
          })),

        previewSynthesis: (baseId: string, materialId: string, selection: SynthesisSelection): SynthesisPreview | null => {
          const state = get();
          const base = state.equipmentInventory.find((e: Equipment) => e.id === baseId);
          const material = state.equipmentInventory.find((e: Equipment) => e.id === materialId);
          if (!base || !material) return null;
          return previewSynthesisCore(base, material, selection, state.resources.sp);
        },

        executeSynthesis: (baseId: string, materialId: string, selection: SynthesisSelection) =>
          set((state: GameStoreState) => {
            const base = state.equipmentInventory.find((e: Equipment) => e.id === baseId);
            const material = state.equipmentInventory.find((e: Equipment) => e.id === materialId);
            if (!base || !material) {
              return { lastActionMessage: "装備が見つかりません。" };
            }

            const result = executeSynthesisCore(base, material, selection, state.resources.sp, random);
            if (!result) {
              return { lastActionMessage: "合成できません。条件を確認してください。" };
            }

            const { newEquipment, spCost } = result;

            // Remove base and material, add new equipment
            const nextInventory = state.equipmentInventory
              .filter((e: Equipment) => e.id !== baseId && e.id !== materialId)
              .concat(newEquipment);

            // Update equipped slots if base or material was equipped
            const nextEquippedSlots = { ...state.equippedSlots };
            if (nextEquippedSlots[base.slot] === baseId || nextEquippedSlots[base.slot] === materialId) {
              nextEquippedSlots[base.slot] = newEquipment.id;
            }

            return {
              equipmentInventory: nextInventory,
              equippedSlots: nextEquippedSlots,
              resources: {
                ...state.resources,
                sp: state.resources.sp - spCost,
              },
              lastActionMessage: `合成成功！ ${newEquipment.name} (${newEquipment.rarity}) を獲得しました。`,
            };
          }),

        // Attachment actions
        equipAttachment: (attachmentId: string, slot: EquipmentSlot) =>
          set((state: GameStoreState) => {
            const attachment = state.attachmentInventory.find((a: Attachment) => a.id === attachmentId);
            if (!attachment) {
              return { lastActionMessage: "アタッチメントが見つかりません。" };
            }
            if (attachment.slot !== slot) {
              return { lastActionMessage: "このスロットには装着できません。" };
            }
            const currentEquipped = state.equippedAttachments[slot];
            if (currentEquipped.length >= 3) {
              return { lastActionMessage: "このスロットにはこれ以上装着できません（最大3つ）。" };
            }
            if (currentEquipped.includes(attachmentId)) {
              return { lastActionMessage: "既に装着済みです。" };
            }

            return {
              equippedAttachments: {
                ...state.equippedAttachments,
                [slot]: [...currentEquipped, attachmentId],
              },
              lastActionMessage: `${attachment.name} を装着しました。`,
            };
          }),

        unequipAttachment: (attachmentId: string, slot: EquipmentSlot) =>
          set((state: GameStoreState) => {
            const attachment = state.attachmentInventory.find((a: Attachment) => a.id === attachmentId);
            return {
              equippedAttachments: {
                ...state.equippedAttachments,
                [slot]: state.equippedAttachments[slot].filter((id: string) => id !== attachmentId),
              },
              lastActionMessage: attachment ? `${attachment.name} を外しました。` : "アタッチメントを外しました。",
            };
          }),

        previewAttachmentSynth: (baseId: string, materialId: string): AttachmentSynthesisPreview | null => {
          const state = get();
          const base = state.attachmentInventory.find((a: Attachment) => a.id === baseId);
          const material = state.attachmentInventory.find((a: Attachment) => a.id === materialId);
          if (!base || !material) return null;
          return previewAttachmentSynthesis(base, material, random);
        },

        executeAttachmentSynth: (baseId: string, materialId: string) =>
          set((state: GameStoreState) => {
            const base = state.attachmentInventory.find((a: Attachment) => a.id === baseId);
            const material = state.attachmentInventory.find((a: Attachment) => a.id === materialId);
            if (!base || !material) {
              return { lastActionMessage: "アタッチメントが見つかりません。" };
            }

            const preview = previewAttachmentSynthesis(base, material, random);
            if (!preview.canSynthesize) {
              return { lastActionMessage: preview.reason || "合成できません。" };
            }

            const spCost = getAttachmentSynthesisSPCost(base.rarity);
            if (state.resources.sp < spCost) {
              return { lastActionMessage: `SPが足りません。必要: ${spCost}` };
            }

            const newAttachment = executeAttachmentSynthesis(base, material, preview, random);

            // Remove base and material, add new attachment
            const nextInventory = state.attachmentInventory
              .filter((a: Attachment) => a.id !== baseId && a.id !== materialId)
              .concat(newAttachment);

            // Update equipped attachments if base or material was equipped
            const nextEquippedAttachments = { ...state.equippedAttachments };
            EQUIPMENT_SLOTS.forEach((slot: EquipmentSlot) => {
              if (nextEquippedAttachments[slot].includes(baseId) || nextEquippedAttachments[slot].includes(materialId)) {
                nextEquippedAttachments[slot] = nextEquippedAttachments[slot]
                  .filter((id: string) => id !== baseId && id !== materialId)
                  .concat(newAttachment.id);
              }
            });

            return {
              attachmentInventory: nextInventory,
              equippedAttachments: nextEquippedAttachments,
              resources: {
                ...state.resources,
                sp: state.resources.sp - spCost,
              },
              lastActionMessage: `アタッチメント合成成功！ ${newAttachment.name} (${newAttachment.rarity}) を獲得しました。`,
            };
          }),

        reincarnate: () =>
          set((state: GameStoreState) => {
            // Check if monster level is at least 5
            if (state.monster.level < 5) {
              return {
                lastActionMessage: "転生するにはモンスターがレベル5以上必要です。",
              };
            }

            // Calculate bonus from current level
            const bonusFromCurrentLevel = calculateReincarnationBonus(state.monster.level);
            const newReincarnationCount = state.reincarnationCount + 1;
            const newReincarnationBonus = state.reincarnationBonus + bonusFromCurrentLevel;

            // Create fresh game state but preserve task data and reincarnation data
            const freshState = createInitialGameState();

            return {
              // Preserve task-related data
              tasks: state.tasks,
              folders: state.folders,
              
              // Reset game-related data
              timer: freshState.timer,
              monster: freshState.monster,
              resources: freshState.resources,
              raid: freshState.raid,
              equipmentInventory: freshState.equipmentInventory,
              equippedSlots: freshState.equippedSlots,
              attachmentInventory: freshState.attachmentInventory,
              equippedAttachments: freshState.equippedAttachments,
              
              // Update reincarnation data
              reincarnationCount: newReincarnationCount,
              reincarnationBonus: newReincarnationBonus,
              
              lastActionMessage: `転生完了！レベル${state.monster.level}で転生し、+${bonusFromCurrentLevel}%の経験値ボーナスを獲得しました。合計+${newReincarnationBonus}%のボーナスが適用されます。`,
            };
          }),

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
