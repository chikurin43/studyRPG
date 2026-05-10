import { useState, useMemo } from "react";
import { X, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "./Button";
import { Badge } from "./Badge";
import type { Equipment, SynthesisSelection, StatKey, SynthesisPreview } from "@/types/game";
import { getRarityLabel, getSlotLabel, getSynthesisSPCost, getScaledEquipmentStats, getSkillRarityFromSignature } from "@/lib/gameRules";

interface SynthesisModalProps {
  isOpen: boolean;
  onClose: () => void;
  base: Equipment | null;
  material: Equipment | null;
  availableSP: number;
  monsterLevel: number;
  onPreview: (baseId: string, materialId: string, selection: SynthesisSelection) => SynthesisPreview | null;
  onExecute: (baseId: string, materialId: string, selection: SynthesisSelection) => void;
}

const STAT_LABELS: Record<StatKey, string> = {
  hp: "HP",
  mp: "MP",
  attack: "攻撃",
  defense: "防御",
  speed: "速度",
};

const RARITY_COLORS: Record<string, { bg: string; text: string }> = {
  C: { bg: "rgba(160,160,160,0.15)", text: "#a0a0a0" },
  B: { bg: "rgba(89,115,79,0.15)", text: "#59734f" },
  A: { bg: "rgba(61,102,125,0.15)", text: "#3d667d" },
  S: { bg: "rgba(205,167,95,0.15)", text: "#cda75f" },
  SS: { bg: "rgba(166,68,50,0.15)", text: "#a64432" },
  SSS: { bg: "rgba(140,100,180,0.15)", text: "#8c64b4" },
};

export function SynthesisModal({
  isOpen,
  onClose,
  base,
  material,
  availableSP,
  monsterLevel,
  onPreview,
  onExecute,
}: SynthesisModalProps) {
  const [selectedStats, setSelectedStats] = useState<StatKey[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<"active" | "passive" | null>(null);

  const preview = useMemo(() => {
    if (!base || !material) return null;
    return onPreview(base.id, material.id, {
      inheritedStats: selectedStats,
      inheritedSkill: selectedSkill,
    });
  }, [base, material, selectedStats, selectedSkill, onPreview]);

  const spCost = base ? getSynthesisSPCost(base.rarity) : 0;
  const canAfford = availableSP >= spCost;
  const canExecute = preview?.canSynthesize && canAfford;

  const handleStatToggle = (stat: StatKey) => {
    setSelectedStats((prev) => {
      if (prev.includes(stat)) {
        return prev.filter((s) => s !== stat);
      }
      if (prev.length >= 2) {
        return prev;
      }
      return [...prev, stat];
    });
  };

  const handleExecute = () => {
    if (!base || !material || !canExecute) return;
    onExecute(base.id, material.id, {
      inheritedStats: selectedStats,
      inheritedSkill: selectedSkill,
    });
    setSelectedStats([]);
    setSelectedSkill(null);
    onClose();
  };

  if (!isOpen || !base || !material) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-[28px] border border-white/10 bg-[var(--bg-surface)] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-stone-400 hover:bg-white/10 hover:text-stone-200"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-full bg-[rgba(205,167,95,0.15)] p-2 text-[var(--accent-amber)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-semibold text-stone-100">装備合成</h2>
        </div>

        {/* Equipment Display */}
        <div className="mb-6 grid gap-4 sm:grid-cols-[1fr,auto,1fr]">
          {/* Base Equipment */}
          <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-stone-400">ベース装備</p>
            <div className="flex items-center gap-2">
              <Badge tone="ember">{getSlotLabel(base.slot)}</Badge>
              <span className="text-sm font-medium text-stone-200">{base.name}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span
                className="rounded-full px-2 py-0.5 text-xs font-bold"
                style={{
                  backgroundColor: RARITY_COLORS[base.rarity].bg,
                  color: RARITY_COLORS[base.rarity].text,
                }}
              >
                {getRarityLabel(base.rarity)}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              {Object.entries(STAT_LABELS).map(([key, label]) => {
                const statKey = key as StatKey;
                const scaledValue = getScaledEquipmentStats(base, monsterLevel)[statKey];
                return (
                  <div key={key} className="text-stone-400">
                    {label}: <span className="text-stone-200">{scaledValue}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center">
            <ArrowRight className="h-6 w-6 text-stone-500" />
          </div>

          {/* Result Preview */}
          <div className="rounded-[20px] border border-[rgba(205,167,95,0.3)] bg-[rgba(205,167,95,0.08)] p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-stone-400">合成結果</p>
            {preview ? (
              <>
                <div className="flex items-center gap-2">
                  <Badge tone="ember">{getSlotLabel(preview.resultingStats ? base.slot : base.slot)}</Badge>
                  <span className="text-sm font-medium text-stone-200">
                    {base.name.replace(/^(新品|強化|高級|希少|伝説|神話)/, "")}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-bold"
                    style={{
                      backgroundColor: RARITY_COLORS[preview.resultRarity].bg,
                      color: RARITY_COLORS[preview.resultRarity].text,
                    }}
                  >
                    {getRarityLabel(preview.resultRarity)}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  {Object.entries(STAT_LABELS).map(([key, label]) => {
                    const statKey = key as StatKey;
                    const baseScaledValue = getScaledEquipmentStats(base, monsterLevel)[statKey];
                    const resultScaledValue = getScaledEquipmentStats(
                      { 
                        id: "", 
                        name: "", 
                        slot: base.slot, 
                        rarity: preview.resultRarity, 
                        dropStage: Math.max(base.dropStage, material.dropStage),
                        statBonuses: preview.resultingStats,
                        activeSkill: preview.resultingActiveSkill, 
                        passiveSkill: preview.resultingPassiveSkill,
                        randomStatuses: []
                      },
                      monsterLevel
                    )[statKey];
                    const isChanged = baseScaledValue !== resultScaledValue;
                    return (
                      <div key={key} className="text-stone-400">
                        {label}: {" "}
                        <span className={isChanged ? "font-bold text-[var(--accent-moss)]" : "text-stone-200"}>
                          {resultScaledValue}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm text-stone-500">プレビューを計算中...</p>
            )}
          </div>
        </div>

        {/* Material Equipment Info */}
        <div className="mb-6 rounded-[16px] border border-white/10 bg-white/5 p-4">
          <p className="mb-3 text-sm font-medium text-stone-300">素材装備: {material.name}</p>
          
          {/* Stat Selection */}
          <p className="mb-2 text-xs text-stone-400">素材から引き継ぐステータス（最大2つ）:</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {Object.entries(STAT_LABELS).map(([key, label]) => {
              const statKey = key as StatKey;
              const isSelected = selectedStats.includes(statKey);
              const materialScaledValue = getScaledEquipmentStats(material, monsterLevel)[statKey];
              return (
                <button
                  key={key}
                  onClick={() => handleStatToggle(statKey)}
                  disabled={!isSelected && selectedStats.length >= 2}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition ${
                    isSelected
                      ? "border-[var(--accent-moss)] bg-[rgba(89,115,79,0.2)] text-[var(--accent-moss)]"
                      : "border-white/10 bg-white/5 text-stone-400 hover:bg-white/10 disabled:opacity-50"
                  }`}
                >
                  <span>{label}</span>
                  <span className="text-stone-300">({materialScaledValue})</span>
                </button>
              );
            })}
          </div>

          {/* Skill Selection */}
          <p className="mb-2 text-xs text-stone-400">素材から引き継ぐスキル（1つ）:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSkill("active")}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                selectedSkill === "active"
                  ? "border-[var(--accent-moss)] bg-[rgba(89,115,79,0.2)] text-[var(--accent-moss)]"
                  : "border-white/10 bg-white/5 text-stone-400 hover:bg-white/10"
              }`}
            >
              アクティブ: {material.activeSkill.name}
            </button>
            <button
              onClick={() => setSelectedSkill("passive")}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                selectedSkill === "passive"
                  ? "border-[var(--accent-moss)] bg-[rgba(89,115,79,0.2)] text-[var(--accent-moss)]"
                  : "border-white/10 bg-white/5 text-stone-400 hover:bg-white/10"
              }`}
            >
              パッシブ: {material.passiveSkill.name}
            </button>
            <button
              onClick={() => setSelectedSkill(null)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                selectedSkill === null
                  ? "border-stone-500 bg-white/10 text-stone-300"
                  : "border-white/10 bg-white/5 text-stone-400 hover:bg-white/10"
              }`}
            >
              引き継がない
            </button>
          </div>
        </div>

        {/* Cost & Error Display */}
        <div className="mb-6 flex items-center justify-between rounded-[16px] border border-white/10 bg-white/5 p-4">
          <div>
            <p className="text-xs text-stone-400">消費SP</p>
            <p className={`text-lg font-semibold ${canAfford ? "text-stone-200" : "text-[var(--danger)]"}`}>
              {spCost} SP
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-stone-400">所持SP</p>
            <p className="text-lg font-semibold text-stone-200">{availableSP} SP</p>
          </div>
        </div>

        {preview?.reason && (
          <div className="mb-6 flex items-center gap-2 rounded-[12px] bg-[rgba(166,68,50,0.1)] p-3 text-sm text-[var(--danger)]">
            <AlertCircle className="h-4 w-4" />
            {preview.reason}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleExecute} disabled={!canExecute}>
            合成実行
          </Button>
        </div>
      </div>
    </div>
  );
}
