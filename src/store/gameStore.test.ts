import { createGameStore } from "@/store/gameStore";

function createMemoryStorage() {
  const memory = new Map<string, string>();

  return {
    getItem: (name: string) => memory.get(name) ?? null,
    setItem: (name: string, value: string) => {
      memory.set(name, value);
    },
    removeItem: (name: string) => {
      memory.delete(name);
    },
  };
}

describe("gameStore", () => {
  it("rehydrates persisted state", () => {
    const storage = createMemoryStorage();
    const firstStore = createGameStore({
      storage,
      random: () => 0,
      now: () => new Date("2026-04-26T12:00:00+09:00"),
    });

    firstStore.getState().addTask({
      title: "Deep Work",
      durationMinutes: 60,
      difficulty: 5,
    });

    const createdTask = firstStore.getState().tasks[0];
    firstStore.getState().completeTask(createdTask.id);

    const secondStore = createGameStore({
      storage,
      random: () => 0,
      now: () => new Date("2026-04-26T12:10:00+09:00"),
    });

    expect(secondStore.getState().tasks).toHaveLength(1);
    expect(secondStore.getState().tasks[0]?.status).toBe("completed");
    expect(secondStore.getState().monster.level).toBeGreaterThan(1);
  });

  it("does not award rewards twice for the same task", () => {
    const store = createGameStore({
      storage: createMemoryStorage(),
      random: () => 0,
      now: () => new Date("2026-04-26T12:00:00+09:00"),
    });

    store.getState().addTask({
      title: "Single Reward",
      durationMinutes: 30,
      difficulty: 4,
    });

    const taskId = store.getState().tasks[0]!.id;
    store.getState().completeTask(taskId);
    const firstSnapshot = {
      sp: store.getState().resources.sp,
      energy: store.getState().resources.energy,
      exp: store.getState().monster.exp,
      level: store.getState().monster.level,
    };

    store.getState().completeTask(taskId);

    expect(store.getState().resources.sp).toBe(firstSnapshot.sp);
    expect(store.getState().resources.energy).toBe(firstSnapshot.energy);
    expect(store.getState().monster.exp).toBe(firstSnapshot.exp);
    expect(store.getState().monster.level).toBe(firstSnapshot.level);
  });

  it("persists an active timer across store recreation", () => {
    const storage = createMemoryStorage();
    const firstStore = createGameStore({
      storage,
      random: () => 0,
      now: () => new Date("2026-04-26T09:00:00+09:00"),
    });

    firstStore.getState().addTask({
      title: "Timer Task",
      durationMinutes: 25,
      difficulty: 2,
    });
    const taskId = firstStore.getState().tasks[0]!.id;
    firstStore.getState().startTaskTimer(taskId);

    const secondStore = createGameStore({
      storage,
      random: () => 0,
      now: () => new Date("2026-04-26T09:05:00+09:00"),
    });

    expect(secondStore.getState().timer.activeTaskId).toBe(taskId);
    expect(secondStore.getState().timer.targetEndsAt).not.toBeNull();
    expect(secondStore.getState().tasks[0]?.status).toBe("running");
  });
});
