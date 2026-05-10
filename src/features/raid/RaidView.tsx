import { ShieldAlert, Sparkles, Swords, WandSparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Meter } from "@/components/ui/Meter";
import { Panel } from "@/components/ui/Panel";
import { formatNumber } from "@/lib/formatters";
import {
  canAttemptRaid,
  getElementLabel,
  getAvailableActions,
  getRaidReadyStats,
  getRarityLabel,
  getStatusLabel,
  toLocalDateKey,
  getTagColor,
} from "@/lib/gameRules";
import type {
  CombatStatusState,
  Equipment,
  PersistedGameState,
  Task,
  TimerBonusSnapshot,
  ViewId,
} from "@/types/game";
import type { BattleAction } from "@/lib/gameRules";
import { useGameStore } from "@/store/gameStore";

function TagPill({ tag }: { tag: string }) {
  const color = getTagColor(tag);
  return (
    <span
      className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium"
      style={{
        backgroundColor: color.bg,
        color: color.text,
        borderColor: color.bg.replace(/[\d.]+\)/, "0.24)"),
      }}
    >
      {tag}
    </span>
  );
}

export function RaidView() {
  const raid = useGameStore((state) => state.raid);
  const monster = useGameStore((state) => state.monster);
  const resources = useGameStore((state) => state.resources);
  const equipmentInventory = useGameStore((state) => state.equipmentInventory);
  const equippedSlots = useGameStore((state) => state.equippedSlots);
  const attackRaidBoss = useGameStore((state) => state.attackRaidBoss);
  const startRaidBattle = useGameStore((state) => state.startRaidBattle);
  const executePlayerAction = useGameStore((state) => state.executePlayerAction);
  const endBattle = useGameStore((state) => state.endBattle);

  const raidProfile = getRaidReadyStats(monster, equipmentInventory, equippedSlots);
  const today = toLocalDateKey(new Date());
  const raidAvailability = canAttemptRaid(raid.boss, resources.energy, new Date());
  const raidUsedToday = raid.boss.lastAttemptDate === today;
  const equippedSkills = equipmentInventory.filter((item) => equippedSlots[item.slot] === item.id);

  const availableActions = raid.battleInProgress && raid.monsterBattleState
    ? getAvailableActions(raid.monsterBattleState, equippedSkills)
    : [];

  return (
    <div className="space-y-5">
      {raid.battleInProgress ? (
        <Panel
          eyebrow="Battle in Progress"
          title={`Turn ${raid.currentTurn} / Stage ${raid.boss.stage}`}
          description="ターンごとにアクションを選択してください。"
          actions={
            <Button type="button" onClick={endBattle} variant="danger">
              中断
            </Button>
          }
        >
          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--bg-panel-strong)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">Boss</p>
                  <h3 className="mt-2 font-display text-4xl text-[var(--ink-strong)]">Boss Lv.{raid.boss.level}</h3>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">
                    {getElementLabel(raid.boss.element)}属性
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[var(--ink-strong)]">Boss HP</p>
                  <p className="text-sm text-[var(--ink-soft)]">
                    {formatNumber(raid.bossBattleState?.hp ?? 0)} / {formatNumber(raid.boss.maxHp)}
                  </p>
                </div>
                <Meter value={raid.bossBattleState?.hp ?? 0} max={raid.boss.maxHp} tone="ember" className="h-4" />
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[var(--ink-strong)]">Boss MP</p>
                  <p className="text-sm text-[var(--ink-soft)]">
                    {formatNumber(raid.bossBattleState?.mp ?? 0)} / {formatNumber(raid.bossBattleState?.maxMp ?? 1)}
                  </p>
                </div>
                <Meter value={raid.bossBattleState?.mp ?? 0} max={raid.bossBattleState?.maxMp ?? 1} tone="sky" className="h-4" />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {([
                  ["ATK", raid.boss.attack],
                  ["DEF", raid.boss.defense],
                  ["SPD", raid.boss.speed],
                ] as const).map(([label, value]) => (
                  <div key={label} className="rounded-[18px] bg-stone-950/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">{label}</p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--ink-strong)]">{formatNumber(value)}</p>
                  </div>
                ))}
              </div>

              {(raid.bossBattleState?.statuses?.length ?? 0) > 0 || raid.bossBattleState?.guard ? (
                <div className="mt-5 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">Status Effects</p>
                  <div className="flex flex-wrap gap-2">
                    {raid.bossBattleState?.guard && (
                      <Badge tone="moss">
                        ガード ({raid.bossBattleState.guard.remainingHits}回)
                      </Badge>
                    )}
                    {raid.bossBattleState?.statuses?.map((status: CombatStatusState) => (
                      <Badge key={status.type} tone="ember">
                        {getStatusLabel(status.type)} ({status.durationTurns}ターン)
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-5 space-y-3 max-h-100 overflow-y-auto">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)] sticky top-0 bg-[var(--bg-panel-strong)] py-2">Boss Skills</p>
                {raid.boss.activeSkills.map((skill, index) => (
                  <div key={`${skill.id}-active`} className="rounded-[18px] bg-stone-950/5 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-[var(--ink-strong)]">{skill.name}</p>
                      <Badge tone="ember">MP {skill.mpCost}</Badge>
                      <Badge tone="sky">{getElementLabel(skill.element)}</Badge>
                      <Badge>Active</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{skill.description}</p>
                  </div>
                ))}
                {raid.boss.passiveSkills.map((skill, index) => (
                  <div key={`${skill.id}-passive`} className="rounded-[18px] bg-stone-950/5 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-[var(--ink-strong)]">{skill.name}</p>
                      <Badge tone="moss">Passive</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{skill.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--bg-panel-strong)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">Monster</p>
              
              {/* HP Bar */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[var(--ink-strong)]">Monster HP</p>
                  <p className="text-sm text-[var(--ink-soft)]">
                    {formatNumber(raid.monsterBattleState?.hp ?? 0)} / {formatNumber(raid.monsterBattleState?.maxHp ?? 1)}
                  </p>
                </div>
                <Meter value={raid.monsterBattleState?.hp ?? 0} max={raid.monsterBattleState?.maxHp ?? 1} tone="moss" className="h-4" />
              </div>

              {/* MP Bar */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[var(--ink-strong)]">Monster MP</p>
                  <p className="text-sm text-[var(--ink-soft)]">
                    {formatNumber(raid.monsterBattleState?.mp ?? 0)} / {formatNumber(raid.monsterBattleState?.maxMp ?? 1)}
                  </p>
                </div>
                <Meter value={raid.monsterBattleState?.mp ?? 0} max={raid.monsterBattleState?.maxMp ?? 1} tone="sky" className="h-4" />
              </div>

              {/* Other Stats */}
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {([
                  ["ATK", raid.monsterBattleState?.attack ?? 0],
                  ["DEF", raid.monsterBattleState?.defense ?? 0],
                  ["SPD", raid.monsterBattleState?.speed ?? 0],
                ] as const).map(([label, value]) => (
                  <div key={label} className="rounded-[18px] bg-stone-950/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">{label}</p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--ink-strong)]">
                      {formatNumber(value)}
                    </p>
                  </div>
                ))}
              </div>

              {(raid.monsterBattleState?.statuses?.length ?? 0) > 0 || raid.monsterBattleState?.guard ? (
                <div className="mt-5 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">Status Effects</p>
                  <div className="flex flex-wrap gap-2">
                    {raid.monsterBattleState?.guard && (
                      <Badge tone="moss">
                        ガード ({raid.monsterBattleState.guard.remainingHits}回)
                      </Badge>
                    )}
                    {raid.monsterBattleState?.statuses?.map((status: CombatStatusState) => (
                      <Badge key={status.type} tone="ember">
                        {getStatusLabel(status.type)} ({status.durationTurns}ターン)
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-5 space-y-3 max-h-100 overflow-y-auto">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)] sticky top-0 bg-[var(--bg-panel-strong)] py-2">Monster Skills</p>
                {equippedSkills.map((item) => (
                  <div key={item.id} className="rounded-[18px] bg-stone-950/5 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-[var(--ink-strong)]">{item.activeSkill.name}</p>
                      <Badge tone="sky">{item.slot}</Badge>
                      <Badge tone="ember">MP {item.activeSkill.mpCost}</Badge>
                      <Badge tone="moss">Active</Badge>
                    </div>
                    {/* Active Skill Tags */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.activeSkill.tags.map((tag) => (
                        <TagPill key={`active-${item.id}-${tag}`} tag={tag} />
                      ))}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{item.activeSkill.description}</p>
                    {/* Random Statuses */}
                    {item.randomStatuses?.length > 0 && (
                      <div className="mt-3 rounded-[16px] bg-stone-950/3 p-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-3 w-3 text-[var(--accent-amber)]" />
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">Random Statuses</p>
                        </div>
                        <div className="mt-2 space-y-1">
                          {item.randomStatuses.map((status) => (
                            <div key={status.id} className="flex items-center justify-between gap-2">
                              <p className="text-xs text-[var(--ink-strong)]">{status.description}</p>
                              <Badge 
                                tone={
                                  status.type === "special" ? "ember" :
                                  status.type === "conditional" ? "sky" :
                                  status.type === "statPctBoost" ? "moss" :
                                  "neutral"
                                }
                                className="text-xs"
                              >
                                {status.type === "special" ? "特殊" :
                                 status.type === "conditional" ? "条件" :
                                 status.type === "statPctBoost" ? "%" :
                                 "固定"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {equippedSkills.map((item) => (
                  <div key={`${item.id}-passive`} className="rounded-[18px] bg-stone-950/5 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-[var(--ink-strong)]">{item.passiveSkill.name}</p>
                      <Badge tone="sky">{item.slot}</Badge>
                      <Badge tone="moss">Passive</Badge>
                    </div>
                    {/* Passive Skill Tags */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.passiveSkill.tags.map((tag) => (
                        <TagPill key={`passive-${item.id}-${tag}`} tag={tag} />
                      ))}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{item.passiveSkill.description}</p>
                    {/* Random Statuses */}
                    {item.randomStatuses?.length > 0 && (
                      <div className="mt-3 rounded-[16px] bg-stone-950/3 p-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-3 w-3 text-[var(--accent-amber)]" />
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">Random Statuses</p>
                        </div>
                        <div className="mt-2 space-y-1">
                          {item.randomStatuses.map((status) => (
                            <div key={status.id} className="flex items-center justify-between gap-2">
                              <p className="text-xs text-[var(--ink-strong)]">{status.description}</p>
                              <Badge 
                                tone={
                                  status.type === "special" ? "ember" :
                                  status.type === "conditional" ? "sky" :
                                  status.type === "statPctBoost" ? "moss" :
                                  "neutral"
                                }
                                className="text-xs"
                              >
                                {status.type === "special" ? "特殊" :
                                 status.type === "conditional" ? "条件" :
                                 status.type === "statPctBoost" ? "%" :
                                 "固定"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-[var(--line-soft)] bg-[var(--bg-panel-strong)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">Actions</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {availableActions.map((action, index) => (
                <Button
                  key={index}
                  type="button"
                  onClick={() => executePlayerAction(action)}
                  disabled={action.mpCost > (raid.monsterBattleState?.mp ?? 0)}
                  variant={action.kind === "skill" ? "secondary" : "primary"}
                >
                  {action.name} {action.mpCost > 0 ? `(MP ${action.mpCost})` : ''}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-3 max-h-120 overflow-y-auto">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)] sticky top-0 p-2">Battle Log</p>
            {raid.battleLog.toReversed().map((entry, index) => (
              <article
                key={`${entry.turn}-${index}-${entry.text}`}
                className="flex items-start gap-3 rounded-[20px] border border-[var(--line-soft)] bg-white/65 px-4 py-3"
              >
                <div className="mt-1 rounded-full bg-[rgba(201,106,61,0.12)] p-2 text-[var(--accent-ember)]">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">
                    Turn {entry.turn} / {entry.actor}
                  </p>
                  <p className="mt-1 text-sm leading-7 text-[var(--ink-soft)]">{entry.text}</p>
                </div>
              </article>
            ))}
          </div>
        </Panel>
      ) : (
        <Panel
          eyebrow="Daily Raid"
          title={`Stage ${raid.boss.stage} / 多段レイド戦`}
          description="1日1回だけ、ターンごとにスキルを選択して戦闘を行います。SPEED は行動順と MP 回復に、HP/DEF は生存ターン数に直結します。"
          actions={
            <Button type="button" onClick={startRaidBattle} disabled={!raidAvailability.allowed}>
              <Swords className="mr-2 h-4 w-4" />
              Battle ({raid.boss.energyCost} Energy)
            </Button>
          }
        >
          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--bg-panel-strong)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">Boss Core</p>
                  <h3 className="mt-2 font-display text-4xl text-[var(--ink-strong)]">Boss Lv.{raid.boss.level}</h3>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">
                    {getElementLabel(raid.boss.element)}属性 / daily gate {raidUsedToday ? "used" : "open"}
                  </p>
                </div>
                <div className="rounded-[18px] bg-stone-950/5 px-4 py-3 text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Last Battle</p>
                  <p className="mt-1 text-2xl font-semibold text-[var(--ink-strong)]">{formatNumber(raid.lastDamage)}</p>
                  <p className="text-xs text-[var(--ink-soft)]">damage dealt</p>
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

              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                {([
                  ["ATK", raid.boss.attack],
                  ["DEF", raid.boss.defense],
                  ["SPD", raid.boss.speed],
                  ["Energy", resources.energy],
                ] as const).map(([label, value]) => (
                  <div key={label} className="rounded-[18px] bg-stone-950/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">{label}</p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--ink-strong)]">{formatNumber(value)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Badge tone={raidUsedToday ? "ember" : "moss"}>
                  {raidUsedToday ? "今日の挑戦は使用済み" : "今日の挑戦は残っています"}
                </Badge>
                <Badge tone="sky">Cost {formatNumber(raid.boss.energyCost)}</Badge>
                <Badge tone="moss">Your MP {formatNumber(raidProfile.mp)}</Badge>
                <Badge>Stage drop table active</Badge>
              </div>

              <div className="mt-5 rounded-[20px] border border-[var(--line-soft)] bg-white/70 p-4 text-sm leading-7 text-[var(--ink-soft)]">
                {raidAvailability.allowed
                  ? "ターンごとにスキルを選択して戦闘を行います。MP と相性を見て適切なスキルを選んでください。"
                  : raidAvailability.reason}
              </div>

              <div className="mt-5 space-y-3 max-h-100 overflow-y-auto">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)] sticky top-0 bg-[var(--bg-panel-strong)] py-2">Boss Skills</p>
                {raid.boss.activeSkills.map((skill, index) => (
                  <div key={`${skill.id}-active`} className="rounded-[18px] bg-stone-950/5 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-[var(--ink-strong)]">{skill.name}</p>
                      <Badge tone="ember">MP {skill.mpCost}</Badge>
                      <Badge tone="sky">{getElementLabel(skill.element)}</Badge>
                      <Badge>Active</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{skill.description}</p>
                  </div>
                ))}
                {raid.boss.passiveSkills.map((skill, index) => (
                  <div key={`${skill.id}-passive`} className="rounded-[18px] bg-stone-950/5 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-[var(--ink-strong)]">{skill.name}</p>
                      <Badge tone="moss">Passive</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{skill.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--bg-panel-strong)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">Monster Battle Profile</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-5">
                  {([
                    ["HP", raidProfile.hp],
                    ["MP", raidProfile.mp],
                    ["ATK", raidProfile.attack],
                    ["DEF", raidProfile.defense],
                    ["SPD", raidProfile.speed],
                  ] as const).map(([label, value]) => (
                    <div key={label} className="rounded-[18px] bg-stone-950/5 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">{label}</p>
                      <p className="mt-2 text-2xl font-semibold text-[var(--ink-strong)]">{formatNumber(value)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge tone="sky">Raid damage +{raidProfile.raidDamagePct}%</Badge>
                  <Badge tone="moss">MP regen +{raidProfile.mpRegenPct}%</Badge>
                  <Badge tone="ember">Crit {raidProfile.criticalRate}%</Badge>
                  <Badge tone="ember">CritDmg {raidProfile.criticalDamage}%</Badge>
                  {Object.entries(raidProfile.elementDamagePct)
                    .filter(([, value]) => value > 0)
                    .map(([element, value]) => (
                      <Badge key={element} tone="ember">
                        {getElementLabel(element as keyof typeof raidProfile.elementDamagePct)} +{value}%
                      </Badge>
                    ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--bg-panel-strong)] p-5">
                <div className="mt-4 space-y-3 max-h-100 overflow-y-auto">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)] sticky top-0 bg-[var(--bg-panel-strong)] py-2">Equipped Skills</p>
                  {equippedSkills.map((item) => (
                    <div key={item.id} className="rounded-[18px] bg-stone-950/5 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-[var(--ink-strong)]">{item.activeSkill.name}</p>
                        <Badge tone="sky">{item.slot}</Badge>
                        <Badge tone="ember">MP {item.activeSkill.mpCost}</Badge>
                        <Badge tone="moss">Active</Badge>
                      </div>
                      {/* Active Skill Tags */}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.activeSkill.tags.map((tag) => (
                          <TagPill key={`active-${item.id}-${tag}`} tag={tag} />
                        ))}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{item.activeSkill.description}</p>
                    </div>
                  ))}
                  {equippedSkills.map((item) => (
                    <div key={`${item.id}-passive`} className="rounded-[18px] bg-stone-950/5 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-[var(--ink-strong)]">{item.passiveSkill.name}</p>
                        <Badge tone="sky">{item.slot}</Badge>
                        <Badge tone="moss">Passive</Badge>
                      </div>
                      {/* Passive Skill Tags */}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.passiveSkill.tags.map((tag) => (
                          <TagPill key={`passive-${item.id}-${tag}`} tag={tag} />
                        ))}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{item.passiveSkill.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Panel>
      )}

      <Panel
        eyebrow="Battle Result"
        title="直近のバトル結果"
        description="複数ターン分のログを残しています。装備のアクティブと属性の噛み合いをここで確認できます。"
      >
        {raid.lastBattle ? (
          <div className="space-y-5">
            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[24px] border border-[var(--line-soft)] bg-white/70 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    tone={
                      raid.lastBattle.outcome === "victory"
                        ? "moss"
                        : raid.lastBattle.outcome === "defeat"
                          ? "ember"
                          : "sky"
                    }
                  >
                    {raid.lastBattle.outcome}
                  </Badge>
                  <Badge>Turns {raid.lastBattle.turns}</Badge>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[18px] bg-stone-950/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">Damage to Boss</p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--ink-strong)]">
                      {formatNumber(raid.lastBattle.damageToBoss)}
                    </p>
                  </div>
                  <div className="rounded-[18px] bg-stone-950/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">Remaining HP / MP</p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--ink-strong)]">
                      {formatNumber(raid.lastBattle.monsterRemainingHp)} / {formatNumber(raid.lastBattle.monsterRemainingMp)}
                    </p>
                  </div>
                </div>
                {raid.lastBattle.equipmentDrop ? (
                  <div className="mt-4 rounded-[18px] bg-stone-950/5 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <WandSparkles className="h-4 w-4 text-[var(--accent-ember)]" />
                      <p className="font-medium text-[var(--ink-strong)]">{raid.lastBattle.equipmentDrop.name}</p>
                      <Badge tone="sky">{getRarityLabel(raid.lastBattle.equipmentDrop.rarity)}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                      Drop: {raid.lastBattle.equipmentDrop.activeSkill.description} / {raid.lastBattle.equipmentDrop.passiveSkill.description}
                    </p>
                  </div>
                ) : null}
                {raid.lastRewardSummary ? (
                  <p className="mt-4 rounded-[18px] bg-stone-950/5 px-4 py-3 text-sm leading-6 text-[var(--ink-soft)]">
                    {raid.lastRewardSummary}
                  </p>
                ) : null}
              </div>

              <div className="space-y-3 max-h-120 overflow-y-auto">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)] sticky top-0 p-2">Battle Log</p>
                {raid.lastBattle.log.toReversed().map((entry, index) => (
                  <article
                    key={`${entry.turn}-${index}-${entry.text}`}
                    className="flex items-start gap-3 rounded-[20px] border border-[var(--line-soft)] bg-white/65 px-4 py-3"
                  >
                    <div className="mt-1 rounded-full bg-[rgba(201,106,61,0.12)] p-2 text-[var(--accent-ember)]">
                      <ShieldAlert className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">
                        Turn {entry.turn} / {entry.actor}
                      </p>
                      <p className="mt-1 text-sm leading-7 text-[var(--ink-soft)]">{entry.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-[var(--line-strong)] px-4 py-8 text-sm text-[var(--ink-soft)]">
            まだレイド戦闘はありません。初回のバトルで、装備と属性がどのように働くかを確認できます。
          </div>
        )}
      </Panel>

      <Panel
        eyebrow="History"
        title="レイド履歴"
        description="要点だけを残した短いサマリーです。"
      >
        <div className="space-y-3">
          {raid.log.map((entry, index) => (
            <article
              key={`${entry}-${index}`}
              className="flex items-start gap-3 rounded-[20px] border border-[var(--line-soft)] bg-white/65 px-4 py-3"
            >
              <div className="mt-1 rounded-full bg-[rgba(61,102,125,0.12)] p-2 text-[var(--accent-sky)]">
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
