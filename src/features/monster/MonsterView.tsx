import { useState, useMemo } from "react";
import { RefreshCw, Shield, Sparkles, Swords, WandSparkles, Filter, ArrowUpDown, X, Combine, Puzzle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Meter } from "@/components/ui/Meter";
import { Panel } from "@/components/ui/Panel";
import { SynthesisModal } from "@/components/ui/SynthesisModal";
import { AttachmentCard, AttachmentSlotSection } from "@/components/ui/AttachmentCard";
import { AttachmentSynthesisModal } from "@/components/ui/AttachmentSynthesisModal";
import { formatNumber } from "@/lib/formatters";
import {
  expToNextLevel,
  getElementLabel,
  getEnergyCap,
  getEquipmentSkillRerollCost,
  getLevelChoiceRerollCost,
  getRaidReadyStats,
  getRarityLabel,
  getScaledEquipmentStats,
  getSkillRarityFromSignature,
  getSlotLabel,
  getTagColor,
  getAllEquipmentTags,
  filterEquipment,
  sortEquipment,
  groupTagsByCategory,
  canSynthesize,
  getAllAttachmentEffectCategories,
  getAllAttachmentEffectTypes,
  filterAttachments,
  sortAttachments,
  getAttachmentEffectCategoryLabel,
  getAttachmentEffectTypeLabel,
  type EquipmentSortKey,
  type EquipmentFilterOptions,
  type AttachmentSortKey,
  type AttachmentFilterOptions,
  type TagCategory,
  RARITIES,
  EQUIPMENT_SLOTS,
} from "@/lib/gameRules";
import { useGameStore } from "@/store/gameStore";
import type { Equipment, EquipmentRarity, EquipmentSlot, Attachment, AttachmentRarity, AttachmentEffectCategory, AttachmentEffectType } from "@/types/game";

const perkLabels = {
  taskRewardMultiplier: "Task reward",
  raidDamageMultiplier: "Raid damage",
  energyCap: "Energy cap",
} as const;

function TagPill({ tag, onClick, selected }: { tag: string; onClick?: () => void; selected?: boolean }) {
  const color = getTagColor(tag);
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium transition-colors ${
        selected ? "ring-1 ring-offset-1" : ""
      }`}
      style={{
        backgroundColor: color.bg,
        color: color.text,
        borderColor: color.bg.replace(/[\d.]+\)/, "0.24)"),
        ["--tw-ring-color" as string]: selected ? color.text : undefined,
      }}
    >
      {tag}
    </button>
  );
}

const SORT_OPTIONS: { key: EquipmentSortKey; label: string }[] = [
  { key: "dropStageDesc", label: "ステージ（高→低）" },
  { key: "rarityDesc", label: "レア度（高→低）" },
  { key: "rarityAsc", label: "レア度（低→高）" },
  { key: "attackDesc", label: "攻撃力（高→低）" },
  { key: "defenseDesc", label: "防御力（高→低）" },
  { key: "hpDesc", label: "HP（高→低）" },
  { key: "mpDesc", label: "MP（高→低）" },
  { key: "speedDesc", label: "速度（高→低）" },
  { key: "mpCostAsc", label: "MP消費（低→高）" },
  { key: "powerDesc", label: "スキル威力（高→低）" },
];

const ATTACHMENT_SORT_OPTIONS: { key: AttachmentSortKey; label: string }[] = [
  { key: "dropStageDesc", label: "ステージ（高→低）" },
  { key: "rarityDesc", label: "レア度（高→低）" },
  { key: "rarityAsc", label: "レア度（低→高）" },
  { key: "effectCountDesc", label: "効果数（多→少）" },
  { key: "effectCountAsc", label: "効果数（少→多）" },
  { key: "nameAsc", label: "名前（あ→ん）" },
  { key: "nameDesc", label: "名前（ん→あ）" },
];

export function MonsterView() {
  const monster = useGameStore((state) => state.monster);
  const resources = useGameStore((state) => state.resources);
  const equipmentInventory = useGameStore((state) => state.equipmentInventory);
  const equippedSlots = useGameStore((state) => state.equippedSlots);
  const attachmentInventory = useGameStore((state) => state.attachmentInventory);
  const equippedAttachments = useGameStore((state) => state.equippedAttachments);
  const claimLevelChoice = useGameStore((state) => state.claimLevelChoice);
  const rerollLevelChoices = useGameStore((state) => state.rerollLevelChoices);
  const equipItem = useGameStore((state) => state.equipItem);
  const rerollEquipmentSkill = useGameStore((state) => state.rerollEquipmentSkill);
  const previewSynthesis = useGameStore((state) => state.previewSynthesis);
  const executeSynthesis = useGameStore((state) => state.executeSynthesis);
  const equipAttachment = useGameStore((state) => state.equipAttachment);
  const unequipAttachment = useGameStore((state) => state.unequipAttachment);
  const previewAttachmentSynth = useGameStore((state) => state.previewAttachmentSynth);
  const executeAttachmentSynth = useGameStore((state) => state.executeAttachmentSynth);

  // Synthesis state
  const [isSynthesisMode, setIsSynthesisMode] = useState(false);
  const [synthesisBase, setSynthesisBase] = useState<Equipment | null>(null);
  const [synthesisMaterial, setSynthesisMaterial] = useState<Equipment | null>(null);
  const [isSynthesisModalOpen, setIsSynthesisModalOpen] = useState(false);

  // Attachment synthesis state
  const [isAttachmentSynthMode, setIsAttachmentSynthMode] = useState(false);
  const [attachmentSynthBase, setAttachmentSynthBase] = useState<Attachment | null>(null);
  const [attachmentSynthMaterial, setAttachmentSynthMaterial] = useState<Attachment | null>(null);
  const [isAttachmentSynthModalOpen, setIsAttachmentSynthModalOpen] = useState(false);
  const [showAttachmentInventory, setShowAttachmentInventory] = useState(false);

  // Filter & Sort state
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<EquipmentRarity[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<EquipmentSlot[]>([]);
  const [sortKey, setSortKey] = useState<EquipmentSortKey>("dropStageDesc");
  const [showFilters, setShowFilters] = useState(false);

  // Attachment Filter & Sort state
  const [selectedAttachmentRarities, setSelectedAttachmentRarities] = useState<AttachmentRarity[]>([]);
  const [selectedAttachmentSlots, setSelectedAttachmentSlots] = useState<EquipmentSlot[]>([]);
  const [selectedAttachmentCategories, setSelectedAttachmentCategories] = useState<AttachmentEffectCategory[]>([]);
  const [selectedAttachmentTypes, setSelectedAttachmentTypes] = useState<AttachmentEffectType[]>([]);
  const [attachmentSortKey, setAttachmentSortKey] = useState<AttachmentSortKey>("dropStageDesc");
  const [showAttachmentFilters, setShowAttachmentFilters] = useState(false);

  const nextChoiceSet = monster.pendingLevelChoices[0];
  const nextLevelExp = expToNextLevel(monster.level);
  const raidProfile = getRaidReadyStats(monster, equipmentInventory, equippedSlots);
  const equipmentRerollCost = getEquipmentSkillRerollCost();
  const levelChoiceRerollCost = getLevelChoiceRerollCost();
  const equippedItems = equipmentInventory.filter((item) => equippedSlots[item.slot] === item.id);

  // Get all unique tags from inventory
  const allTags = useMemo(() => getAllEquipmentTags(equipmentInventory), [equipmentInventory]);

  // Apply filters and sort
  const filteredAndSortedEquipment = useMemo(() => {
    const filters: EquipmentFilterOptions = {
      selectedTags,
      selectedRarities,
      selectedSlots,
    };
    const filtered = filterEquipment(equipmentInventory, filters);
    return sortEquipment(filtered, sortKey, monster.level);
  }, [equipmentInventory, selectedTags, selectedRarities, selectedSlots, sortKey, monster.level]);

  // Get all unique attachment effect categories and types from inventory
  const allAttachmentCategories = useMemo(() => getAllAttachmentEffectCategories(attachmentInventory), [attachmentInventory]);
  const allAttachmentTypes = useMemo(() => getAllAttachmentEffectTypes(attachmentInventory), [attachmentInventory]);

  // Apply attachment filters and sort
  const filteredAndSortedAttachments = useMemo(() => {
    const filters: AttachmentFilterOptions = {
      selectedRarities: selectedAttachmentRarities,
      selectedSlots: selectedAttachmentSlots,
      selectedCategories: selectedAttachmentCategories,
      selectedTypes: selectedAttachmentTypes,
    };
    const filtered = filterAttachments(attachmentInventory, filters);
    return sortAttachments(filtered, attachmentSortKey);
  }, [attachmentInventory, selectedAttachmentRarities, selectedAttachmentSlots, selectedAttachmentCategories, selectedAttachmentTypes, attachmentSortKey]);

  // Create a map to check if items have synthesis partners
  const synthesisPartnerMap = useMemo(() => {
    const map = new Map<string, boolean>();
    equipmentInventory.forEach((item) => {
      const hasPartner = equipmentInventory.some(
        other => other.id !== item.id && 
                 other.slot === item.slot && 
                 other.rarity === item.rarity
      );
      map.set(item.id, hasPartner);
    });
    return map;
  }, [equipmentInventory]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const toggleRarity = (rarity: EquipmentRarity) => {
    setSelectedRarities((prev) =>
      prev.includes(rarity) ? prev.filter((r) => r !== rarity) : [...prev, rarity],
    );
  };

  const toggleSlot = (slot: EquipmentSlot) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot],
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSelectedRarities([]);
    setSelectedSlots([]);
  };

  const hasActiveFilters = selectedTags.length > 0 || selectedRarities.length > 0 || selectedSlots.length > 0;

  // Attachment filter functions
  const toggleAttachmentRarity = (rarity: AttachmentRarity) => {
    setSelectedAttachmentRarities((prev) =>
      prev.includes(rarity) ? prev.filter((r) => r !== rarity) : [...prev, rarity],
    );
  };

  const toggleAttachmentSlot = (slot: EquipmentSlot) => {
    setSelectedAttachmentSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot],
    );
  };

  const toggleAttachmentCategory = (category: AttachmentEffectCategory) => {
    setSelectedAttachmentCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  };

  const toggleAttachmentType = (type: AttachmentEffectType) => {
    setSelectedAttachmentTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const clearAttachmentFilters = () => {
    setSelectedAttachmentRarities([]);
    setSelectedAttachmentSlots([]);
    setSelectedAttachmentCategories([]);
    setSelectedAttachmentTypes([]);
  };

  const hasActiveAttachmentFilters = selectedAttachmentRarities.length > 0 || selectedAttachmentSlots.length > 0 || selectedAttachmentCategories.length > 0 || selectedAttachmentTypes.length > 0;

  // Synthesis handlers
  const handleSynthesisModeToggle = () => {
    setIsSynthesisMode(!isSynthesisMode);
    setSynthesisBase(null);
    setSynthesisMaterial(null);
  };

  const handleSelectSynthesisItem = (item: Equipment) => {
    if (!isSynthesisMode) return;

    if (!synthesisBase) {
      setSynthesisBase(item);
      return;
    }

    if (synthesisBase.id === item.id) {
      // Deselect if clicking base again
      setSynthesisBase(null);
      return;
    }

    // Check if can be material (same slot and rarity)
    if (synthesisBase.slot === item.slot && synthesisBase.rarity === item.rarity) {
      setSynthesisMaterial(item);
      setIsSynthesisModalOpen(true);
    }
  };

  const handleCloseSynthesisModal = () => {
    setIsSynthesisModalOpen(false);
    setSynthesisMaterial(null);
    if (!isSynthesisMode) {
      setSynthesisBase(null);
    }
  };

  const handleSynthesisComplete = () => {
    setIsSynthesisModalOpen(false);
    setSynthesisBase(null);
    setSynthesisMaterial(null);
    setIsSynthesisMode(false);
  };

  // Attachment synthesis handlers
  const handleAttachmentSynthModeToggle = () => {
    setIsAttachmentSynthMode(!isAttachmentSynthMode);
    setAttachmentSynthBase(null);
    setAttachmentSynthMaterial(null);
  };

  const handleSelectAttachmentSynthItem = (attachment: Attachment) => {
    if (!isAttachmentSynthMode) return;

    if (!attachmentSynthBase) {
      setAttachmentSynthBase(attachment);
      return;
    }

    if (attachmentSynthBase.id === attachment.id) {
      setAttachmentSynthBase(null);
      return;
    }

    // Check if can be material (same slot)
    if (attachmentSynthBase.slot === attachment.slot) {
      setAttachmentSynthMaterial(attachment);
      setIsAttachmentSynthModalOpen(true);
    }
  };

  const handleCloseAttachmentSynthModal = () => {
    setIsAttachmentSynthModalOpen(false);
    setAttachmentSynthMaterial(null);
    if (!isAttachmentSynthMode) {
      setAttachmentSynthBase(null);
    }
  };

  const handleAttachmentSynthComplete = () => {
    setIsAttachmentSynthModalOpen(false);
    setAttachmentSynthBase(null);
    setAttachmentSynthMaterial(null);
    setIsAttachmentSynthMode(false);
  };

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
                      <Badge tone="moss">HP +{getScaledEquipmentStats(item, monster.level).hp}</Badge>
                      <Badge tone="moss">MP +{getScaledEquipmentStats(item, monster.level).mp}</Badge>
                      <Badge tone="moss">ATK +{getScaledEquipmentStats(item, monster.level).attack}</Badge>
                      <Badge tone="moss">DEF +{getScaledEquipmentStats(item, monster.level).defense}</Badge>
                      <Badge tone="moss">SPD +{getScaledEquipmentStats(item, monster.level).speed}</Badge>
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
                      {/* Active Skill Tags */}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.activeSkill.tags.map((tag) => (
                          <TagPill key={`active-${item.id}-${tag}`} tag={tag} />
                        ))}
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
                      {/* Passive Skill Tags */}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.passiveSkill.tags.map((tag) => (
                          <TagPill key={`passive-${item.id}-${tag}`} tag={tag} />
                        ))}
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
                    {/* Random Statuses */}
                    {item.randomStatuses?.length > 0 && (
                      <div className="mt-4 rounded-[18px] bg-stone-950/5 p-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-[var(--accent-amber)]" />
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">Random Statuses</p>
                        </div>
                        <div className="mt-3 space-y-2">
                          {item.randomStatuses.map((status, index) => (
                            <div key={status.id} className="flex items-center justify-between gap-2">
                              <p className="text-sm text-[var(--ink-strong)]">{status.description}</p>
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

      {/* Attachments Panel */}
      <Panel
        eyebrow="Attachments"
        title="アタッチメント"
        description="各装備スロットに最大3つまで装着可能。タスク完了時に低確率でドロップ。"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={isAttachmentSynthMode ? "primary" : "ghost"}
              size="sm"
              onClick={handleAttachmentSynthModeToggle}
              disabled={attachmentInventory.length < 2}
            >
              <Combine className="mr-2 h-4 w-4" />
              {isAttachmentSynthMode ? "合成モードON" : "合成モード"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAttachmentInventory(!showAttachmentInventory)}
            >
              <Puzzle className="mr-2 h-4 w-4" />
              インベントリ ({attachmentInventory.length})
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {EQUIPMENT_SLOTS.map((slot) => (
            <AttachmentSlotSection
              key={slot}
              slot={slot}
              equippedIds={equippedAttachments[slot]}
              inventory={attachmentInventory}
              onEquip={equipAttachment}
              onUnequip={unequipAttachment}
            />
          ))}
        </div>

        {/* Attachment Inventory */}
        {showAttachmentInventory && (
          <div className="mt-4 rounded-[20px] border border-[var(--line-soft)] bg-[var(--bg-panel-strong)] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[var(--ink-strong)]">アタッチメントインベントリ</span>
                {attachmentSynthBase && (
                  <Badge tone="ember">ベース: {attachmentSynthBase.name}</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowAttachmentFilters(!showAttachmentFilters)}>
                  <Filter className="mr-2 h-4 w-4" />
                  フィルター {hasActiveAttachmentFilters && `(${selectedAttachmentRarities.length + selectedAttachmentSlots.length + selectedAttachmentCategories.length + selectedAttachmentTypes.length})`}
                </Button>
                <select
                  value={attachmentSortKey}
                  onChange={(e) => setAttachmentSortKey(e.target.value as AttachmentSortKey)}
                  className="rounded-lg border border-[var(--line-soft)] bg-white/70 px-3 py-1.5 text-sm text-[var(--ink-strong)]"
                >
                  {ATTACHMENT_SORT_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {attachmentSynthBase && (
                  <Button variant="ghost" size="sm" onClick={() => setAttachmentSynthBase(null)}>
                    解除
                  </Button>
                )}
              </div>
            </div>

            {isAttachmentSynthMode && !attachmentSynthBase && (
              <p className="mb-3 text-sm text-[var(--accent-amber)]">
                ベースにするアタッチメントを選択してください
              </p>
            )}
            {isAttachmentSynthMode && attachmentSynthBase && (
              <p className="mb-3 text-sm text-[var(--accent-amber)]">
                同じスロットの素材を選択してください
              </p>
            )}

            {/* Attachment Filter Panel */}
            {showAttachmentFilters && (
              <div className="mb-4 rounded-[18px] border border-[var(--line-soft)] bg-[var(--bg-panel-strong)] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[var(--ink-strong)]">アタッチメントフィルター設定</span>
                  {hasActiveAttachmentFilters && (
                    <Button variant="ghost" size="sm" onClick={clearAttachmentFilters}>
                      <X className="mr-1 h-4 w-4" />
                      クリア
                    </Button>
                  )}
                </div>

                {/* Slot Filter */}
                <div className="mb-3">
                  <span className="mb-2 block text-xs font-medium text-[var(--ink-soft)]">スロット</span>
                  <div className="flex flex-wrap gap-2">
                    {EQUIPMENT_SLOTS.map((slot) => (
                      <TagPill
                        key={slot}
                        tag={getSlotLabel(slot)}
                        selected={selectedAttachmentSlots.includes(slot)}
                        onClick={() => toggleAttachmentSlot(slot)}
                      />
                    ))}
                  </div>
                </div>

                {/* Rarity Filter */}
                <div className="mb-3">
                  <span className="mb-2 block text-xs font-medium text-[var(--ink-soft)]">レア度</span>
                  <div className="flex flex-wrap gap-2">
                    {RARITIES.map((rarity) => {
                      const color = getTagColor(rarity);
                      return (
                        <button
                          key={rarity}
                          onClick={() => toggleAttachmentRarity(rarity)}
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
                            selectedAttachmentRarities.includes(rarity) ? "ring-1 ring-offset-1" : ""
                          }`}
                          style={{
                            backgroundColor: color.bg,
                            color: color.text,
                            borderColor: color.bg.replace(/[\d.]+\)/, "0.24)"),
                            ["--tw-ring-color" as string]: selectedAttachmentRarities.includes(rarity) ? color.text : undefined,
                          }}
                        >
                          {rarity}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Effect Category Filter */}
                {allAttachmentCategories.length > 0 && (
                  <div className="mb-3">
                    <span className="mb-2 block text-xs font-medium text-[var(--ink-soft)]">
                      効果カテゴリ（{allAttachmentCategories.length}種類）
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {allAttachmentCategories.map((category) => (
                        <TagPill
                          key={category}
                          tag={getAttachmentEffectCategoryLabel(category)}
                          selected={selectedAttachmentCategories.includes(category)}
                          onClick={() => toggleAttachmentCategory(category)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Effect Type Filter */}
                {allAttachmentTypes.length > 0 && (
                  <div>
                    <span className="mb-2 block text-xs font-medium text-[var(--ink-soft)]">
                      効果タイプ（{allAttachmentTypes.length}種類）
                    </span>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {allAttachmentTypes.map((type) => (
                        <TagPill
                          key={type}
                          tag={getAttachmentEffectTypeLabel(type)}
                          selected={selectedAttachmentTypes.includes(type)}
                          onClick={() => toggleAttachmentType(type)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Results count */}
            <div className="mb-3 flex items-center justify-between text-sm text-[var(--ink-soft)]">
              <span>
                {filteredAndSortedAttachments.length} / {attachmentInventory.length} 件表示
              </span>
              {hasActiveAttachmentFilters && <span className="text-[var(--accent-ember)]">フィルター適用中</span>}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedAttachments.map((attachment) => {
                const isEquipped = equippedAttachments[attachment.slot].includes(attachment.id);
                const isBase = attachmentSynthBase?.id === attachment.id;
                const canBeMaterial = attachmentSynthBase &&
                  attachment.slot === attachmentSynthBase.slot &&
                  attachment.id !== attachmentSynthBase.id;

                return (
                  <div
                    key={attachment.id}
                    onClick={() => isAttachmentSynthMode && handleSelectAttachmentSynthItem(attachment)}
                    className={`cursor-pointer transition-all ${
                      isAttachmentSynthMode ? "hover:ring-2 hover:ring-[var(--accent-amber)]" : ""
                    } ${isBase ? "ring-2 ring-[var(--accent-ember)]" : ""}`}
                  >
                    <AttachmentCard
                      attachment={attachment}
                      isEquipped={isEquipped}
                      onEquip={!isAttachmentSynthMode ? () => equipAttachment(attachment.id, attachment.slot) : undefined}
                      onUnequip={!isAttachmentSynthMode ? () => unequipAttachment(attachment.id, attachment.slot) : undefined}
                      disabled={isAttachmentSynthMode && !canBeMaterial && !isBase}
                    />
                    {isBase && (
                      <div className="mt-1 text-center text-xs text-[var(--accent-ember)]">ベース</div>
                    )}
                    {canBeMaterial && (
                      <div className="mt-1 text-center text-xs text-[var(--accent-moss)]">クリックで素材に選択</div>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredAndSortedAttachments.length === 0 && (
              <div className="rounded-[20px] border border-dashed border-[var(--line-strong)] px-4 py-8 text-center text-[var(--ink-soft)]">
                <p className="text-sm">
                  {attachmentInventory.length === 0 
                    ? "アタッチメントがありません。タスクを完了してドロップを狙いましょう。"
                    : "条件に合うアタッチメントがありません。"
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </Panel>

      <Panel
        eyebrow="Inventory"
        title="装備インベントリ"
        description="ステージが進むほどレア装備が出やすくなります。気に入ったアクティブ/パッシブが出るまで SP で回せます。"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={isSynthesisMode ? "primary" : "ghost"}
              size="sm"
              onClick={handleSynthesisModeToggle}
            >
              <Combine className="mr-2 h-4 w-4" />
              {isSynthesisMode ? "合成モードON" : "合成モード"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              フィルター {hasActiveFilters && `(${selectedTags.length + selectedRarities.length + selectedSlots.length})`}
            </Button>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as EquipmentSortKey)}
              className="rounded-lg border border-[var(--line-soft)] bg-white/70 px-3 py-1.5 text-sm text-[var(--ink-strong)]"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        }
      >
        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-4 rounded-[18px] border border-[var(--line-soft)] bg-[var(--bg-panel-strong)] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--ink-strong)]">フィルター設定</span>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-1 h-4 w-4" />
                  クリア
                </Button>
              )}
            </div>

            {/* Slot Filter */}
            <div className="mb-3">
              <span className="mb-2 block text-xs font-medium text-[var(--ink-soft)]">スロット</span>
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT_SLOTS.map((slot) => (
                  <TagPill
                    key={slot}
                    tag={getSlotLabel(slot)}
                    selected={selectedSlots.includes(slot)}
                    onClick={() => toggleSlot(slot)}
                  />
                ))}
              </div>
            </div>

            {/* Rarity Filter */}
            <div className="mb-3">
              <span className="mb-2 block text-xs font-medium text-[var(--ink-soft)]">レア度</span>
              <div className="flex flex-wrap gap-2">
                {RARITIES.map((rarity) => {
                  const color = getTagColor(rarity);
                  return (
                    <button
                      key={rarity}
                      onClick={() => toggleRarity(rarity)}
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
                        selectedRarities.includes(rarity) ? "ring-1 ring-offset-1" : ""
                      }`}
                      style={{
                        backgroundColor: color.bg,
                        color: color.text,
                        borderColor: color.bg.replace(/[\d.]+\)/, "0.24)"),
                        ["--tw-ring-color" as string]: selectedRarities.includes(rarity) ? color.text : undefined,
                      }}
                    >
                      {rarity}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <div>
                <span className="mb-2 block text-xs font-medium text-[var(--ink-soft)]">
                  タグ（{allTags.length}種類）
                </span>
                <div className="" style={{ margin: "0.5rem" }}>
                  {Object.entries(groupTagsByCategory(allTags)).map(([category, tags]) => (
                    <div key={category} className="mb-3">
                      <span className="mb-1 block text-xs font-medium text-[var(--ink-soft)]">{category}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                          <TagPill
                            key={tag}
                            tag={tag}
                            selected={selectedTags.includes(tag)}
                            onClick={() => toggleTag(tag)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results count */}
        <div className="mb-3 flex items-center justify-between text-sm text-[var(--ink-soft)]">
          <span>
            {filteredAndSortedEquipment.length} / {equipmentInventory.length} 件表示
          </span>
          {hasActiveFilters && <span className="text-[var(--accent-ember)]">フィルター適用中</span>}
        </div>

        {/* Synthesis Mode Status */}
        {isSynthesisMode && (
          <div className="mb-4 rounded-[16px] border border-[rgba(205,167,95,0.3)] bg-[rgba(205,167,95,0.08)] p-4">
            <p className="text-sm text-stone-300">
              {synthesisBase ? (
                <>
                  ベース: <span className="font-medium text-[var(--accent-amber)]">{synthesisBase.name}</span>
                  {" — "}同スロット・同レア度の装備を選択してください
                </>
              ) : (
                <>合成するベース装備を選択してください（同レア度の装備2つが必要）</>
              )}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {filteredAndSortedEquipment.map((item) => {
            const isEquipped = equippedSlots[item.slot] === item.id;
            const activeTags = item.activeSkill.tags;
            const passiveTags = item.passiveSkill.tags;
            const isSynthesisBase = synthesisBase?.id === item.id;
            const canBeMaterial = synthesisBase && 
              synthesisBase.id !== item.id && 
              synthesisBase.slot === item.slot && 
              synthesisBase.rarity === item.rarity;
            const isImpossibleInSynthesis = isSynthesisMode && synthesisBase && 
              synthesisBase.id !== item.id && 
              (synthesisBase.slot !== item.slot || synthesisBase.rarity !== item.rarity);
            
            // Check if this item has any synthesis partners in the inventory
            const hasSynthesisPartner = !isSynthesisMode || synthesisBase ? true : synthesisPartnerMap.get(item.id) || false;
            
            const shouldDisableForNoPartner = isSynthesisMode && !synthesisBase && !hasSynthesisPartner;

            return (
              <article
                key={item.id}
                onClick={() => isSynthesisMode && !isImpossibleInSynthesis && !shouldDisableForNoPartner && handleSelectSynthesisItem(item)}
                className={`rounded-[22px] border p-4 transition ${
                  isSynthesisMode 
                    ? isSynthesisBase
                      ? "border-[var(--accent-amber)] bg-[rgba(205,167,95,0.12)] cursor-pointer"
                      : canBeMaterial
                        ? "border-[var(--accent-moss)] bg-[rgba(89,115,79,0.08)] cursor-pointer hover:bg-[rgba(89,115,79,0.12)]"
                        : isImpossibleInSynthesis || shouldDisableForNoPartner
                          ? "border-stone-400 bg-white/30 opacity-50 cursor-not-allowed"
                          : "border-[var(--line-soft)] bg-white/65 cursor-pointer hover:bg-white/80"
                    : "border-[var(--line-soft)] bg-white/65"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-3">
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
                      <Badge tone="moss">HP +{getScaledEquipmentStats(item, monster.level).hp}</Badge>
                      <Badge tone="moss">MP +{getScaledEquipmentStats(item, monster.level).mp}</Badge>
                      <Badge tone="moss">ATK +{getScaledEquipmentStats(item, monster.level).attack}</Badge>
                      <Badge tone="moss">DEF +{getScaledEquipmentStats(item, monster.level).defense}</Badge>
                      <Badge tone="moss">SPD +{getScaledEquipmentStats(item, monster.level).speed}</Badge>
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
                        {/* Active Skill Tags */}
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {activeTags.map((tag) => (
                            <TagPill key={`active-${item.id}-${tag}`} tag={tag} />
                          ))}
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
                        {/* Passive Skill Tags */}
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {passiveTags.map((tag) => (
                            <TagPill key={`passive-${item.id}-${tag}`} tag={tag} />
                          ))}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{item.passiveSkill.description}</p>
                      </div>
                      {/* Random Statuses */}
                      {item.randomStatuses?.length > 0 && (
                        <div className="mt-4 rounded-[18px] bg-stone-950/5 p-4">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-[var(--accent-amber)]" />
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">Random Statuses</p>
                          </div>
                          <div className="mt-3 space-y-2">
                            {item.randomStatuses.map((status) => (
                              <div key={status.id} className="flex items-center justify-between gap-2">
                                <p className="text-sm text-[var(--ink-strong)]">{status.description}</p>
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
                  </div>

                  {!isSynthesisMode && (
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
                  )}
                  {isSynthesisMode && isSynthesisBase && (
                    <div className="flex items-center gap-2 lg:w-[260px] lg:justify-end">
                      <Badge tone="ember">ベース選択中</Badge>
                      <Button variant="ghost" size="sm" onClick={() => setSynthesisBase(null)}>
                        解除
                      </Button>
                    </div>
                  )}
                  {isSynthesisMode && canBeMaterial && (
                    <div className="flex items-center gap-2 lg:w-[260px] lg:justify-end">
                      <span className="text-xs text-[var(--accent-moss)]">クリックで素材に選択</span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {filteredAndSortedEquipment.length === 0 && (
          <div className="rounded-[20px] border border-dashed border-[var(--line-strong)] px-4 py-12 text-center text-[var(--ink-soft)]">
            <p className="text-sm">条件に合う装備がありません。</p>
          </div>
        )}
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

      {/* Synthesis Modal */}
      <SynthesisModal
        isOpen={isSynthesisModalOpen}
        onClose={handleCloseSynthesisModal}
        base={synthesisBase}
        material={synthesisMaterial}
        availableSP={resources.sp}
        monsterLevel={monster.level}
        onPreview={previewSynthesis}
        onExecute={(baseId, materialId, selection) => {
          executeSynthesis(baseId, materialId, selection);
          handleSynthesisComplete();
        }}
      />

      {/* Attachment Synthesis Modal */}
      <AttachmentSynthesisModal
        isOpen={isAttachmentSynthModalOpen}
        onClose={handleCloseAttachmentSynthModal}
        base={attachmentSynthBase}
        material={attachmentSynthMaterial}
        availableSP={resources.sp}
        onPreview={previewAttachmentSynth}
        onExecute={(baseId, materialId) => {
          executeAttachmentSynth(baseId, materialId);
          handleAttachmentSynthComplete();
        }}
      />
    </div>
  );
}
