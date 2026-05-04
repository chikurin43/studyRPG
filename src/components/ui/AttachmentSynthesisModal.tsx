import { useMemo } from "react";
import { X, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "./Button";
import type { Attachment, AttachmentSynthesisPreview } from "@/types/game";
import { getSlotLabel, getAttachmentRarityLabel, getAttachmentSynthesisSPCost } from "@/lib/gameRules";

const RARITY_COLORS: Record<string, { bg: string; text: string }> = {
  C: { bg: "rgba(160,160,160,0.15)", text: "#a0a0a0" },
  B: { bg: "rgba(89,115,79,0.15)", text: "#59734f" },
  A: { bg: "rgba(61,102,125,0.15)", text: "#3d667d" },
  S: { bg: "rgba(205,167,95,0.15)", text: "#cda75f" },
  SS: { bg: "rgba(166,68,50,0.15)", text: "#a64432" },
  SSS: { bg: "rgba(140,100,180,0.15)", text: "#8c64b4" },
};

interface AttachmentSynthesisModalProps {
  isOpen: boolean;
  onClose: () => void;
  base: Attachment | null;
  material: Attachment | null;
  availableSP: number;
  onPreview: (baseId: string, materialId: string) => AttachmentSynthesisPreview | null;
  onExecute: (baseId: string, materialId: string) => void;
}

export function AttachmentSynthesisModal({
  isOpen,
  onClose,
  base,
  material,
  availableSP,
  onPreview,
  onExecute,
}: AttachmentSynthesisModalProps) {
  const preview = useMemo(() => {
    if (!base || !material) return null;
    return onPreview(base.id, material.id);
  }, [base, material, onPreview]);

  const spCost = base ? getAttachmentSynthesisSPCost(base.rarity) : 0;
  const canAfford = availableSP >= spCost;
  const canExecute = preview?.canSynthesize && canAfford;

  const handleExecute = () => {
    if (!base || !material || !canExecute) return;
    onExecute(base.id, material.id);
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
          <h2 className="text-xl font-semibold text-stone-100">アタッチメント合成</h2>
        </div>

        {/* Attachments Display */}
        <div className="mb-6 grid gap-4 sm:grid-cols-[1fr,auto,1fr]">
          {/* Base Attachment */}
          <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-stone-400">ベース</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400">{getSlotLabel(base.slot)}</span>
              <span className="text-sm font-medium text-stone-200">{base.name}</span>
            </div>
            <div className="mt-2">
              <span
                className="rounded-full px-2 py-0.5 text-xs font-bold"
                style={{
                  backgroundColor: RARITY_COLORS[base.rarity].bg,
                  color: RARITY_COLORS[base.rarity].text,
                }}
              >
                {getAttachmentRarityLabel(base.rarity)}
              </span>
            </div>
            <div className="mt-3 space-y-1">
              {base.effects.slice(0, 3).map((effect) => (
                <div key={effect.id} className="text-xs text-stone-400">
                  • {effect.description}
                </div>
              ))}
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
                  <span className="text-xs text-stone-400">{getSlotLabel(base.slot)}</span>
                  <span className="text-sm font-medium text-stone-200">{base.name}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-bold"
                    style={{
                      backgroundColor: RARITY_COLORS[preview.resultRarity].bg,
                      color: RARITY_COLORS[preview.resultRarity].text,
                    }}
                  >
                    {getAttachmentRarityLabel(preview.resultRarity)}
                  </span>
                  {preview.resultRarity !== base.rarity && (
                    <span className="text-xs text-green-400">レア度アップ！</span>
                  )}
                </div>
                <div className="mt-3 space-y-1">
                  {preview.resultingEffects.slice(0, 4).map((effect, index) => (
                    <div key={`${effect.id}-${index}`} className="text-xs text-stone-400">
                      • {effect.description}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-stone-500">プレビューできません</p>
            )}
          </div>
        </div>

        {/* Material Info */}
        <div className="mb-6 rounded-[16px] border border-white/10 bg-white/5 p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-stone-400">素材</p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <span className="text-sm font-medium text-stone-200">{material.name}</span>
              <div className="mt-1">
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-bold"
                  style={{
                    backgroundColor: RARITY_COLORS[material.rarity].bg,
                    color: RARITY_COLORS[material.rarity].text,
                  }}
                >
                  {getAttachmentRarityLabel(material.rarity)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cost & Errors */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between rounded-[12px] border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-sm text-stone-400">消費SP</span>
            <span className={`font-semibold ${canAfford ? "text-stone-200" : "text-red-400"}`}>
              {spCost} SP
            </span>
          </div>

          {!canAfford && (
            <div className="flex items-center gap-2 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span>SPが不足しています</span>
            </div>
          )}

          {preview && !preview.canSynthesize && preview.reason && (
            <div className="flex items-center gap-2 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span>{preview.reason}</span>
            </div>
          )}
        </div>

        {/* Actions */}
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
