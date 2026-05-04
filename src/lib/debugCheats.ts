import { getGameStore } from "@/store/gameStore";
import type { GameStoreState } from "@/store/gameStore";
import { createInitialGameState, generateEquipment, generateAttachment } from "@/lib/gameRules";

declare global {
  interface Window {
    debugCheats: DebugCheats;
  }
}

export interface DebugCheats {
  // Resource cheats
  addSp(amount: number): void;
  addEnergy(amount: number): void;
  maxResources(): void;
  
  // Monster cheats
  addExp(amount: number): void;
  setLevel(level: number): void;
  maxMonster(): void;
  
  // Task cheats
  completeAllTasks(): void;
  addTestTask(): void;
  
  // Equipment cheats
  addRandomEquipment(): void;
  maxEquipment(): void;
  
  // Attachment cheats
  addRandomAttachments(): void;
  
  // Raid cheats
  instantRaidWin(): void;
  skipRaidEnergyCost(): void;
  
  // Utility cheats
  getState(): GameStoreState;
  resetGame(): void;
  saveState(): void;
  loadState(): void;
}

export function createDebugCheats(): DebugCheats {
  const store = getGameStore();
  
  return {
    // Resource cheats
    addSp(amount: number) {
      const currentState = store.getState();
      store.setState({
        resources: {
          ...currentState.resources,
          sp: currentState.resources.sp + amount
        },
        lastActionMessage: `デバッグ: SP +${amount}`
      });
      console.log(`Added ${amount} SP`);
    },

    addEnergy(amount: number) {
      const currentState = store.getState();
      store.setState({
        resources: {
          ...currentState.resources,
          energy: currentState.resources.energy + amount
        },
        lastActionMessage: `デバッグ: Energy +${amount}`
      });
      console.log(`Added ${amount} Energy`);
    },

    maxResources() {
      store.setState({
        resources: {
          sp: 999999,
          energy: 999999
        },
        lastActionMessage: "デバッグ: リソースを最大にしました"
      });
      console.log("Maxed out resources");
    },

    // Monster cheats
    addExp(amount: number) {
      const currentState = store.getState();
      // This would need proper exp calculation, for now just add to current exp
      store.setState({
        monster: {
          ...currentState.monster,
          exp: currentState.monster.exp + amount
        },
        lastActionMessage: `デバッグ: EXP +${amount}`
      });
      console.log(`Added ${amount} EXP`);
    },

    setLevel(level: number) {
      const currentState = store.getState();
      store.setState({
        monster: {
          ...currentState.monster,
          level: Math.max(1, Math.min(100, level))
        },
        lastActionMessage: `デバッグ: レベルを ${level} に設定`
      });
      console.log(`Set level to ${level}`);
    },

    maxMonster() {
      const currentState = store.getState();
      store.setState({
        monster: {
          ...currentState.monster,
          level: 100,
          exp: 999999,
          stats: {
            hp: 9999,
            mp: 999,
            attack: 999,
            defense: 999,
            speed: 999
          },
          perks: {
            taskRewardMultiplier: 10,
            raidDamageMultiplier: 10,
            energyCap: 9999
          }
        },
        lastActionMessage: "デバッグ: モンスターを最大強化しました"
      });
      console.log("Maxed out monster stats");
    },

    // Task cheats
    completeAllTasks() {
      const currentState = store.getState();
      const now = new Date().toISOString();
      const updatedTasks = currentState.tasks.map(task => ({
        ...task,
        status: "completed" as const,
        completedAt: now
      }));
      
      store.setState({
        tasks: updatedTasks,
        timer: { activeTaskId: null, startedAt: null, targetEndsAt: null, bonusSnapshot: null, isPaused: false, pausedAt: null, totalPausedDuration: 0 },
        lastActionMessage: "デバッグ: 全タスクを完了しました"
      });
      console.log("Completed all tasks");
    },

    addTestTask() {
      const currentState = store.getState();
      const testTask = {
        id: `task-${crypto.randomUUID()}`,
        title: "デバッグタスク",
        subject: "テスト",
        durationMinutes: 60,
        difficulty: 3,
        status: "idle" as const,
        createdAt: new Date().toISOString(),
        completedAt: null,
        locked: false
      };

      store.setState({
        tasks: [testTask, ...currentState.tasks],
        lastActionMessage: "デバッグ: テストタスクを追加しました"
      });
      console.log("Added test task");
    },

    // Equipment cheats
    addRandomEquipment() {
      const currentState = store.getState();
      const equipment = generateEquipment(currentState.monster.level, Math.random);
      store.setState({
        equipmentInventory: [equipment, ...currentState.equipmentInventory],
        lastActionMessage: `デバッグ: ${equipment.name} を追加しました`
      });
      console.log(`Added random equipment: ${equipment.name}`);
    },

    maxEquipment() {
      const currentState = store.getState();
      const newEquipment = [];
      for (let i = 0; i < 10; i++) {
        const equipment = generateEquipment(100, Math.random);
        newEquipment.push(equipment);
      }
      store.setState({
        equipmentInventory: [...newEquipment, ...currentState.equipmentInventory],
        lastActionMessage: "デバッグ: 装備を10個追加しました"
      });
      console.log("Added 10 random high-level equipment");
    },

    // Attachment cheats
    addRandomAttachments() {
      const currentState = store.getState();
      const newAttachments = [];
      for (let i = 0; i < 10; i++) {
        const attachment = generateAttachment(currentState.monster.level, Math.random);
        newAttachments.push(attachment);
      }
      store.setState({
        attachmentInventory: [...newAttachments, ...currentState.attachmentInventory],
        lastActionMessage: "デバッグ: アタッチメントを10個追加しました"
      });
      console.log("Added 10 random attachments");
    },

    // Raid cheats
    instantRaidWin() {
      const currentState = store.getState();
      store.setState({
        raid: {
          ...currentState.raid,
          boss: {
            ...currentState.raid.boss,
            currentHp: 0
          }
        },
        lastActionMessage: "デバッグ: レイドを即座に勝利しました"
      });
      console.log("Instant raid win");
    },

    skipRaidEnergyCost() {
      const currentState = store.getState();
      store.setState({
        raid: {
          ...currentState.raid,
          boss: {
            ...currentState.raid.boss,
            energyCost: 0
          }
        },
        lastActionMessage: "デバッグ: レイドのエネルギーコストを0にしました"
      });
      console.log("Removed raid energy cost");
    },

    // Utility cheats
    getState() {
      return store.getState();
    },

    resetGame() {
      store.setState({
        ...createInitialGameState(),
        activeView: "tasks",
        lastActionMessage: "デバッグ: ゲームをリセットしました"
      });
      console.log("Game reset");
    },

    saveState() {
      const state = store.getState();
      localStorage.setItem('debug-save-state', JSON.stringify(state));
      console.log("State saved to localStorage");
    },

    loadState() {
      const savedState = localStorage.getItem('debug-save-state');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          store.setState(state);
          console.log("State loaded from localStorage");
        } catch (error) {
          console.error("Failed to load saved state:", error);
        }
      } else {
        console.log("No saved state found");
      }
    }
  };
}

export function attachDebugCheats() {
  if (typeof window !== 'undefined') {
    window.debugCheats = createDebugCheats();
    console.log("Debug cheats attached to window.debugCheats");
    console.log("Available cheats:", Object.keys(window.debugCheats));
  }
}
