import { ShieldAlert, Swords } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Meter } from "@/components/ui/Meter";
import { Panel } from "@/components/ui/Panel";
import { formatNumber } from "@/lib/formatters";
import { canAttemptRaid, getRaidReadyStats, toLocalDateKey } from "@/lib/gameRules";
import { useGameStore } from "@/store/gameStore";

export function RaidView() {
  const raid = useGameStore((state) => state.raid);
  const monster = useGameStore((state) => state.monster);
  const resources = useGameStore((state) => state.resources);
  const attackRaidBoss = useGameStore((state) => state.attackRaidBoss);

  const raidStats = getRaidReadyStats(monster);
  const today = toLocalDateKey(new Date());
  const raidAvailability = canAttemptRaid(raid.boss, resources.energy, new Date());
  const raidUsedToday = raid.boss.lastAttemptDate === today;

  return (
    <div className="space-y-5">
      <Panel
        eyebrow="Daily Raid"
        title={`Stage ${raid.boss.stage} / レイドボスへ挑戦`}
        description="1日1回のみ挑戦できます。ボス HP は持ち越しなので、数日かけて削り切る進行です。"
        actions={
          <Button type="button" onClick={attackRaidBoss} disabled={!raidAvailability.allowed}>
            <Swords className="mr-2 h-4 w-4" />
            Attack ({raid.boss.energyCost} Energy)
          </Button>
        }
      >
        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--bg-panel-strong)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">Boss Core</p>
                <h3 className="mt-2 font-display text-4xl text-[var(--ink-strong)]">Boss Lv.{raid.boss.level}</h3>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">
                  Attack {formatNumber(raid.boss.attack)} / daily gate {raidUsedToday ? "used" : "open"}
                </p>
              </div>
              <div className="rounded-[18px] bg-stone-950/5 px-4 py-3 text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Last Hit</p>
                <p className="mt-1 text-2xl font-semibold text-[var(--ink-strong)]">{formatNumber(raid.lastDamage)}</p>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-[var(--ink-strong)]">Boss HP</p>
                <p className="text-sm text-[var(--ink-soft)]">
                  {formatNumber(raid.boss.currentHp)} / {formatNumber(raid.boss.maxHp)}
                </p>
              </div>
              <Meter value={raid.boss.currentHp} max={raid.boss.maxHp} tone="ember" className="h-4" />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Badge tone={raidUsedToday ? "ember" : "moss"}>
                {raidUsedToday ? "今日の挑戦は使用済み" : "今日の挑戦は残っています"}
              </Badge>
              <Badge tone="sky">Energy {formatNumber(resources.energy)}</Badge>
              <Badge tone="neutral">Cost {formatNumber(raid.boss.energyCost)}</Badge>
              <Badge tone="moss">Raid damage bonus +{raidStats.raidDamagePct}%</Badge>
            </div>

            <div className="mt-5 rounded-[20px] border border-[var(--line-soft)] bg-white/70 p-4 text-sm leading-7 text-[var(--ink-soft)]">
              {raidAvailability.allowed
                ? "挑戦可能です。今日の一撃でどこまで削れるかを見ながら、勉強タスクで次の Energy を溜めていきます。"
                : raidAvailability.reason}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--bg-panel-strong)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">Monster Output</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[18px] bg-stone-950/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">Attack</p>
                  <p className="mt-2 text-[var(--ink-strong)] text-2xl font-semibold">{formatNumber(raidStats.attack)}</p>
                </div>
                <div className="rounded-[18px] bg-stone-950/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">Defense</p>
                  <p className="mt-2 text-[var(--ink-strong)] text-2xl font-semibold">{formatNumber(raidStats.defense)}</p>
                </div>
                <div className="rounded-[18px] bg-stone-950/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">Speed</p>
                  <p className="mt-2 text-[var(--ink-strong)] text-2xl font-semibold">{formatNumber(raidStats.speed)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--bg-panel-strong)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">Reward Window</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="moss">Boss EXP {formatNumber(150 * raid.boss.stage)}</Badge>
                <Badge tone="ember">Boss SP {formatNumber(15 * raid.boss.stage)}</Badge>
                <Badge tone="sky">Energy +20</Badge>
                <Badge>Skill chance 60%</Badge>
              </div>
              {raid.lastRewardSummary ? (
                <p className="mt-4 rounded-[18px] bg-stone-950/5 px-4 py-3 text-sm leading-6 text-[var(--ink-soft)]">
                  {raid.lastRewardSummary}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </Panel>

      <Panel
        eyebrow="Raid Log"
        title="最近の戦況"
        description="持ち越し前提のため、毎日の1回を記録として見返せます。"
      >
        <div className="space-y-3">
          {raid.log.map((entry, index) => (
            <article
              key={`${entry}-${index}`}
              className="flex items-start gap-3 rounded-[20px] border border-[var(--line-soft)] bg-white/65 px-4 py-3"
            >
              <div className="mt-1 rounded-full bg-[rgba(201,106,61,0.12)] p-2 text-[var(--accent-ember)]">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <p className="text-sm leading-7 text-[var(--ink-soft)]">{entry}</p>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}
