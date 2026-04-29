import { RefreshCw, Shield, Sparkles, Swords, WandSparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Meter } from "@/components/ui/Meter";
import { Panel } from "@/components/ui/Panel";
import { formatNumber } from "@/lib/formatters";
import {
  expToNextLevel,
  getElementLabel,
  getEnergyCap,
  getEquipmentSkillRerollCost,
  getLevelChoiceRerollCost,
  getRaidReadyStats,
  getRarityLabel,
  getSkillRarityFromSignature,
  getSlotLabel,
} from "@/lib/gameRules";
import { useGameStore } from "@/store/gameStore";

const perkLabels = {
  taskRewardMultiplier: "Task reward",
  raidDamageMultiplier: "Raid damage",
  energyCap: "Energy cap",
} as const;

export function MonsterView() {
  const monster = useGameStore((state) => state.monster);
  const resources = useGameStore((state) => state.resources);
  const equipmentInventory = useGameStore((state) => state.equipmentInventory);
  const equippedSlots = useGameStore((state) => state.equippedSlots);
  const claimLevelChoice = useGameStore((state) => state.claimLevelChoice);
  const rerollLevelChoices = useGameStore((state) => state.rerollLevelChoices);
  const equipItem = useGameStore((state) => state.equipItem);
  const rerollEquipmentSkill = useGameStore((state) => state.rerollEquipmentSkill);

  const nextChoiceSet = monster.pendingLevelChoices[0];
  const nextLevelExp = expToNextLevel(monster.level);
  const raidProfile = getRaidReadyStats(monster, equipmentInventory, equippedSlots);
  const equipmentRerollCost = getEquipmentSkillRerollCost();
  const levelChoiceRerollCost = getLevelChoiceRerollCost();
  const equippedItems = equipmentInventory.filter((item) => equippedSlots[item.slot] === item.id);

  return (
    <div className="space-y-5">
      <Panel
        eyebrow="Companion"
        title={`${monster.name} の育成と装備構成`}
        description="基礎ステータスに加えて、装備のステ補正・パッシブ・アクティブスキルがレイド戦闘の挙動を変えます。"
      >
        <div className="grid gap-5 xl:grid-cols-[1fr_0.92fr]">
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

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {([
                ["HP", monster.stats.hp],
                ["MP", monster.stats.mp],
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
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">Raid Profile</p>
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
                <Badge tone="moss">Energy cap {getEnergyCap(monster)}</Badge>
                <Badge tone="ember">SP {resources.sp}</Badge>
                <Badge>MP regen +{raidProfile.mpRegenPct}%</Badge>
                <Badge tone="ember">Crit {raidProfile.criticalRate}%</Badge>
                <Badge tone="ember">CritDmg {raidProfile.criticalDamage}%</Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(raidProfile.elementDamagePct)
                  .filter(([, value]) => value > 0)
                  .map(([element, value]) => (
                    <Badge key={element} tone="ember">
                      {getElementLabel(element as keyof typeof raidProfile.elementDamagePct)} +{value}%
                    </Badge>
                  ))}
                {Object.entries(raidProfile.statusResistPct)
                  .filter(([, value]) => value > 0)
                  .map(([status, value]) => (
                    <Badge key={status} tone="sky">
                      {status} resist {value}%
                    </Badge>
                  ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--bg-panel-strong)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">Companion Traits</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(monster.perks).map(([key, level]) => (
                  <Badge key={key} tone={level > 0 ? "moss" : "neutral"}>
                    {perkLabels[key as keyof typeof perkLabels]} Lv.{level}
                  </Badge>
                ))}
                <Badge tone="neutral">Equipped {equippedItems.length} / 3</Badge>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel
        eyebrow="Choices"
        title="レベルアップの3択"
        description="候補は常に3件。SP を使ってリロールできます。HP/MP/ATK/DEF/SPD 強化と既存モンスタースキルはここで伸ばします。"
        actions={
          <Button
            type="button"
            variant="ghost"
            disabled={!nextChoiceSet || resources.sp < levelChoiceRerollCost}
            onClick={rerollLevelChoices}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reroll ({levelChoiceRerollCost} SP)
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
                      : `${choice.stat.toUpperCase()} を ${choice.amount} 上昇させます。`}
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
        eyebrow="Loadout"
        title="装備中のアイテム"
        description="各装備にはステ補正、アクティブスキル、パッシブスキルが1つずつ付きます。レイド中は MP の範囲で最適なアクティブを自動使用します。"
      >
        <div className="grid gap-4 xl:grid-cols-3">
          {(["weapon", "armor", "relic"] as const).map((slot) => {
            const item = equipmentInventory.find((equipment) => equippedSlots[slot] === equipment.id) ?? null;

            return (
              <article key={slot} className="rounded-[24px] border border-[var(--line-soft)] bg-white/70 p-5">
                <div className="flex items-center gap-2">
                  <Badge tone="sky">{getSlotLabel(slot)}</Badge>
                  {item ? <Badge tone={item.rarity === "SSS" ? "ember" : item.rarity === "SS" || item.rarity === "S" ? "sky" : "moss"}>{getRarityLabel(item.rarity)}</Badge> : null}
                </div>
                {item ? (
                  <>
                    <h3 className="mt-4 text-xl font-semibold text-[var(--ink-strong)]">{item.name}</h3>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm">
                      <Badge tone="moss">HP +{item.statBonuses.hp}</Badge>
                      <Badge tone="moss">MP +{item.statBonuses.mp}</Badge>
                      <Badge tone="moss">ATK +{item.statBonuses.attack}</Badge>
                      <Badge tone="moss">DEF +{item.statBonuses.defense}</Badge>
                      <Badge tone="moss">SPD +{item.statBonuses.speed}</Badge>
                    </div>
                    <div className="mt-4 rounded-[18px] bg-stone-950/5 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Swords className="h-4 w-4 text-[var(--accent-ember)]" />
                          <p className="font-medium text-[var(--ink-strong)]">{item.activeSkill.name}</p>
                        </div>
                        {(() => {
                          const skillRarity = getSkillRarityFromSignature(item.activeSkill.generatorSignature);
                          return skillRarity ? (
                            <Badge tone={skillRarity === "SSS" ? "ember" : skillRarity === "SS" || skillRarity === "S" ? "sky" : "moss"}>
                              {getRarityLabel(skillRarity)}
                            </Badge>
                          ) : null;
                        })()}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                        {item.activeSkill.description} / MP {item.activeSkill.mpCost}
                      </p>
                      <Button
                        className="mt-4 w-full"
                        variant="ghost"
                        size="sm"
                        disabled={resources.sp < equipmentRerollCost}
                        onClick={() => rerollEquipmentSkill(item.id, "active")}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Active reroll ({equipmentRerollCost} SP)
                      </Button>
                    </div>
                    <div className="mt-4 rounded-[18px] bg-stone-950/5 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-[var(--accent-sky)]" />
                          <p className="font-medium text-[var(--ink-strong)]">{item.passiveSkill.name}</p>
                        </div>
                        {(() => {
                          const skillRarity = getSkillRarityFromSignature(item.passiveSkill.generatorSignature);
                          return skillRarity ? (
                            <Badge tone={skillRarity === "SSS" ? "ember" : skillRarity === "SS" || skillRarity === "S" ? "sky" : "moss"}>
                              {getRarityLabel(skillRarity)}
                            </Badge>
                          ) : null;
                        })()}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{item.passiveSkill.description}</p>
                      <Button
                        className="mt-4 w-full"
                        variant="ghost"
                        size="sm"
                        disabled={resources.sp < equipmentRerollCost}
                        onClick={() => rerollEquipmentSkill(item.id, "passive")}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Passive reroll ({equipmentRerollCost} SP)
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="mt-4 rounded-[20px] border border-dashed border-[var(--line-strong)] px-4 py-8 text-sm text-[var(--ink-soft)]">
                    このスロットは空です。レイドでドロップした装備を下のインベントリから装着できます。
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </Panel>

      <Panel
        eyebrow="Inventory"
        title="装備インベントリ"
        description="ステージが進むほどレア装備が出やすくなります。気に入ったアクティブ/パッシブが出るまで SP で回せます。"
      >
        <div className="space-y-3">
          {equipmentInventory.map((item) => {
            const isEquipped = equippedSlots[item.slot] === item.id;

            return (
              <article
                key={item.id}
                className="rounded-[22px] border border-[var(--line-soft)] bg-white/65 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-semibold text-[var(--ink-strong)]">{item.name}</h3>
                      <Badge tone="sky">{getSlotLabel(item.slot)}</Badge>
                      <Badge tone={item.rarity === "SSS" ? "ember" : item.rarity === "SS" || item.rarity === "S" ? "sky" : "moss"}>
                        {getRarityLabel(item.rarity)}
                      </Badge>
                      {isEquipped ? <Badge tone="moss">装備中</Badge> : null}
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <Badge tone="neutral">Stage {item.dropStage}</Badge>
                      <Badge tone="moss">HP +{item.statBonuses.hp}</Badge>
                      <Badge tone="moss">MP +{item.statBonuses.mp}</Badge>
                      <Badge tone="moss">ATK +{item.statBonuses.attack}</Badge>
                      <Badge tone="moss">DEF +{item.statBonuses.defense}</Badge>
                      <Badge tone="moss">SPD +{item.statBonuses.speed}</Badge>
                    </div>
                    <div className="grid gap-3 lg:grid-cols-2">
                      <div className="rounded-[18px] bg-stone-950/5 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Swords className="h-4 w-4 text-[var(--accent-ember)]" />
                            <p className="font-medium text-[var(--ink-strong)]">
                              {item.activeSkill.name} / MP {item.activeSkill.mpCost}
                            </p>
                          </div>
                          {(() => {
                            const skillRarity = getSkillRarityFromSignature(item.activeSkill.generatorSignature);
                            return skillRarity ? (
                              <Badge tone={skillRarity === "SSS" ? "ember" : skillRarity === "SS" || skillRarity === "S" ? "sky" : "moss"}>
                                {getRarityLabel(skillRarity)}
                              </Badge>
                            ) : null;
                          })()}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{item.activeSkill.description}</p>
                      </div>
                      <div className="rounded-[18px] bg-stone-950/5 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <WandSparkles className="h-4 w-4 text-[var(--accent-sky)]" />
                            <p className="font-medium text-[var(--ink-strong)]">{item.passiveSkill.name}</p>
                          </div>
                          {(() => {
                            const skillRarity = getSkillRarityFromSignature(item.passiveSkill.generatorSignature);
                            return skillRarity ? (
                              <Badge tone={skillRarity === "SSS" ? "ember" : skillRarity === "SS" || skillRarity === "S" ? "sky" : "moss"}>
                                {getRarityLabel(skillRarity)}
                              </Badge>
                            ) : null;
                          })()}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{item.passiveSkill.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full flex-wrap items-center gap-2 lg:w-[260px] lg:justify-end">
                    <Button variant={isEquipped ? "ghost" : "secondary"} onClick={() => equipItem(item.id)}>
                      {isEquipped ? "再装備" : "装備する"}
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={resources.sp < equipmentRerollCost}
                      onClick={() => rerollEquipmentSkill(item.id, "active")}
                    >
                      Active reroll
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={resources.sp < equipmentRerollCost}
                      onClick={() => rerollEquipmentSkill(item.id, "passive")}
                    >
                      Passive reroll
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Panel>

      <Panel
        eyebrow="Traits"
        title="保持モンスタースキル"
        description="レベルアップ由来の既存モンスタースキルはそのまま残り、装備と重ねてビルドされます。"
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
              まだモンスタースキルはありません。レベルアップやボス撃破で開いていきます。
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
