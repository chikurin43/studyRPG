import { Sparkles, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Meter } from "@/components/ui/Meter";
import { Panel } from "@/components/ui/Panel";
import { formatNumber } from "@/lib/formatters";
import { expToNextLevel, getEnergyCap, getRaidReadyStats } from "@/lib/gameRules";
import { useGameStore } from "@/store/gameStore";

const perkLabels = {
  taskRewardMultiplier: "Task reward",
  raidDamageMultiplier: "Raid damage",
  energyCap: "Energy cap",
} as const;

export function MonsterView() {
  const monster = useGameStore((state) => state.monster);
  const resources = useGameStore((state) => state.resources);
  const claimLevelChoice = useGameStore((state) => state.claimLevelChoice);
  const rerollLevelChoices = useGameStore((state) => state.rerollLevelChoices);

  const nextChoiceSet = monster.pendingLevelChoices[0];
  const nextLevelExp = expToNextLevel(monster.level);
  const raidStats = getRaidReadyStats(monster);

  return (
    <div className="space-y-5">
      <Panel
        eyebrow="Companion"
        title={`${monster.name} を育てる`}
        description="勉強で経験値を稼ぎ、レベルアップごとに3択から成長方針を選びます。"
      >
        <div className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
          <div className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--bg-panel-strong)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--ink-soft)]">Monster</p>
                <h3 className="mt-2 font-display text-4xl text-[var(--ink-strong)]">{monster.name}</h3>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">
                  Level {monster.level} / pending choices {monster.pendingLevelChoices.length}
                </p>
              </div>
              <div className="rounded-[20px] bg-stone-950/5 px-4 py-3 text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">EXP</p>
                <p className="mt-1 text-2xl font-semibold text-[var(--ink-strong)]">
                  {formatNumber(monster.exp)} / {formatNumber(nextLevelExp)}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Meter value={monster.exp} max={nextLevelExp} tone="moss" />
              <p className="text-sm text-[var(--ink-soft)]">
                次のレベルまで {formatNumber(Math.max(0, nextLevelExp - monster.exp))} EXP
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {([
                ["HP", monster.stats.hp],
                ["Attack", monster.stats.attack],
                ["Defense", monster.stats.defense],
                ["Speed", monster.stats.speed],
              ] as const).map(([label, value]) => (
                <div key={label} className="rounded-[18px] border border-[var(--line-soft)] bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--ink-strong)]">{formatNumber(value)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--bg-panel-strong)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">Raid Ready</p>
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
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="sky">Raid damage +{raidStats.raidDamagePct}%</Badge>
                <Badge tone="moss">Energy cap {getEnergyCap(monster)}</Badge>
                <Badge tone="ember">SP {resources.sp}</Badge>
              </div>
            </div>

            <div className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--bg-panel-strong)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">Perks</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(monster.perks).map(([key, level]) => (
                  <Badge key={key} tone={level > 0 ? "moss" : "neutral"}>
                    {perkLabels[key as keyof typeof perkLabels]} Lv.{level}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel
        eyebrow="Choices"
        title="レベルアップの3択"
        description="候補は常に3件。SP 10 を使ってリロールできます。複数レベル分が溜まった場合は先頭から順番に解決します。"
        actions={
          <Button
            type="button"
            variant="ghost"
            disabled={!nextChoiceSet || resources.sp < 10}
            onClick={rerollLevelChoices}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reroll (10 SP)
          </Button>
        }
      >
        {nextChoiceSet ? (
          <div className="grid gap-4 xl:grid-cols-3">
            {nextChoiceSet.choices.map((choice) => (
              <article
                key={choice.id}
                className="rounded-[24px] border border-[var(--line-soft)] bg-white/70 p-5"
              >
                <div className="flex items-center gap-2">
                  <Badge tone={choice.kind === "skill" ? "ember" : choice.kind === "special" ? "sky" : "moss"}>
                    {choice.kind}
                  </Badge>
                  <p className="text-sm text-[var(--ink-soft)]">for Lv.{nextChoiceSet.sourceLevel}</p>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-[var(--ink-strong)]">{choice.label}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                  {choice.kind === "skill"
                    ? choice.skill.description
                    : choice.kind === "special"
                      ? `Perk ${perkLabels[choice.perkKey]} を Lv.${choice.levelAfter} にします。`
                      : `${choice.stat} を ${choice.amount} 上昇させます。`}
                </p>
                <Button className="mt-5 w-full" onClick={() => claimLevelChoice(choice.id)}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  この強化を選ぶ
                </Button>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-[var(--line-strong)] px-4 py-8 text-sm text-[var(--ink-soft)]">
            いまは未解決のレベルアップ候補がありません。タスク達成やレイド撃破で経験値を集めましょう。
          </div>
        )}
      </Panel>

      <Panel
        eyebrow="Skills"
        title="保持スキル"
        description="重複は発生しません。reward / efficiency / raid 各系統が混ざり、育成ごとにプレイ感が変わります。"
      >
        <div className="space-y-3">
          {monster.skills.length > 0 ? (
            monster.skills.map((skill) => (
              <article
                key={skill.signature}
                className="rounded-[20px] border border-[var(--line-soft)] bg-white/65 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-[var(--ink-strong)]">{skill.name}</h3>
                  <Badge tone="ember">{skill.template}</Badge>
                  <Badge tone="sky">{skill.target}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{skill.description}</p>
              </article>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-[var(--line-strong)] px-4 py-8 text-sm text-[var(--ink-soft)]">
              まだスキルはありません。レベルアップやボス撃破でビルドが開きます。
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
