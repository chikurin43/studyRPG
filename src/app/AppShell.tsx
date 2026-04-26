import { Sparkles, RotateCcw } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TasksView } from "@/features/tasks/TasksView";
import { MonsterView } from "@/features/monster/MonsterView";
import { RaidView } from "@/features/raid/RaidView";
import { formatNumber } from "@/lib/formatters";
import { getEnergyCap, getRaidReadyStats } from "@/lib/gameRules";
import { useGameStore } from "@/store/gameStore";
import type { ViewId } from "@/types/game";

const navItems: { id: ViewId; label: string; hint: string }[] = [
  { id: "tasks", label: "Tasks", hint: "勉強を報酬へ変える" },
  { id: "monster", label: "Monster", hint: "成長と3択強化" },
  { id: "raid", label: "Raid", hint: "1日1回のボス挑戦" },
];

export function AppShell() {
  const activeView = useGameStore((state) => state.activeView);
  const setActiveView = useGameStore((state) => state.setActiveView);
  const resetGame = useGameStore((state) => state.resetGame);
  const clearLastActionMessage = useGameStore((state) => state.clearLastActionMessage);
  const lastActionMessage = useGameStore((state) => state.lastActionMessage);
  const tasks = useGameStore((state) => state.tasks);
  const monster = useGameStore((state) => state.monster);
  const resources = useGameStore((state) => state.resources);
  const raid = useGameStore((state) => state.raid);
  const equipmentInventory = useGameStore((state) => state.equipmentInventory);
  const equippedSlots = useGameStore((state) => state.equippedSlots);

  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const energyCap = getEnergyCap(monster);
  const raidProfile = getRaidReadyStats(monster, equipmentInventory, equippedSlots);
  const equippedCount = Object.values(equippedSlots).filter(Boolean).length;

  return (
    <div className="min-h-screen px-4 py-5 text-stone-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="overflow-hidden rounded-[36px] border border-white/10 bg-[var(--bg-surface)] shadow-[0_30px_80px_rgba(0,0,0,0.34)]">
          <div className="grid gap-8 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-stone-400">Study Linked RPG</p>
                <h1 className="font-display text-4xl leading-tight text-stone-50 sm:text-5xl">
                  勉強の進捗が
                  <br />
                  そのまま育成になる。
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-stone-300 sm:text-base">
                  タスク完了で経験値と Energy を獲得し、ランダム生成スキルでビルドを伸ばしながら、
                  毎日1回のレイドボスを少しずつ削っていく MVP です。
                </p>
              </div>

              <TopNav activeView={activeView} items={navItems} onSelect={setActiveView} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Monster Lv", formatNumber(monster.level)],
                ["Energy", `${formatNumber(resources.energy)} / ${formatNumber(energyCap)}`],
                ["Battle MP", formatNumber(raidProfile.mp)],
                ["Equipped", `${formatNumber(equippedCount)} / 3`],
                ["SP", formatNumber(resources.sp)],
                ["Completed", formatNumber(completedTasks)],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className={`rounded-[24px] border p-4 ${
                    index === 0
                      ? "border-[rgba(205,167,95,0.24)] bg-[rgba(205,167,95,0.12)]"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-stone-50">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-[var(--line-soft)] bg-[var(--bg-panel)] px-5 py-4 text-[var(--ink-strong)] shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[rgba(89,115,79,0.12)] p-2 text-[var(--accent-moss)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">
                Current Loop
              </p>
              <p className="mt-1 text-sm sm:text-base">{lastActionMessage ?? "準備完了。次の一手を選びましょう。"}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="moss">Pending choices {monster.pendingLevelChoices.length}</Badge>
            {lastActionMessage ? (
              <Button type="button" size="sm" variant="ghost" onClick={clearLastActionMessage}>
                メッセージを閉じる
              </Button>
            ) : null}
            <Button type="button" size="sm" variant="danger" onClick={resetGame}>
              <RotateCcw className="mr-2 h-4 w-4" />
              リセット
            </Button>
          </div>
        </div>

        <main>
          {activeView === "tasks" ? <TasksView /> : null}
          {activeView === "monster" ? <MonsterView /> : null}
          {activeView === "raid" ? <RaidView /> : null}
        </main>
      </div>
    </div>
  );
}
