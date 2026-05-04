import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Badge } from "./Badge";
import { Button } from "./Button";
import type { Attachment, EquipmentSlot } from "@/types/game";
import { getAttachmentRarityLabel, getSlotLabel } from "@/lib/gameRules";

const RARITY_COLORS: Record<string, { bg: string; text: string }> = {
  C: { bg: "rgba(160,160,160,0.15)", text: "#a0a0a0" },
  B: { bg: "rgba(89,115,79,0.15)", text: "#59734f" },
  A: { bg: "rgba(61,102,125,0.15)", text: "#3d667d" },
  S: { bg: "rgba(205,167,95,0.15)", text: "#cda75f" },
  SS: { bg: "rgba(166,68,50,0.15)", text: "#a64432" },
  SSS: { bg: "rgba(140,100,180,0.15)", text: "#8c64b4" },
};

interface AttachmentCardProps {
  attachment: Attachment;
  isEquipped?: boolean;
  onEquip?: () => void;
  onUnequip?: () => void;
  disabled?: boolean;
}

export function AttachmentCard({
  attachment,
  isEquipped,
  onEquip,
  onUnequip,
  disabled,
}: AttachmentCardProps) {
  return (
    <div
      className={`rounded-[16px] border bg-white/5 p-3 transition-all ${
        isEquipped ? "border-[rgba(205,167,95,0.4)] bg-[rgba(205,167,95,0.08)]" : "border-white/10"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge tone="ember">{getSlotLabel(attachment.slot)}</Badge>
            <span
              className="rounded-full px-1.5 py-0.5 text-xs font-bold"
              style={{
                backgroundColor: RARITY_COLORS[attachment.rarity].bg,
                color: RARITY_COLORS[attachment.rarity].text,
              }}
            >
              {getAttachmentRarityLabel(attachment.rarity)}
            </span>
          </div>
          <p className="text-sm font-medium text-stone-200 truncate">{attachment.name}</p>
        </div>
        <div className="flex items-center gap-1">
          {onEquip && !isEquipped && (
            <Button variant="ghost" size="sm" onClick={onEquip} disabled={disabled} className="h-8 w-8 p-0">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          )}
          {onUnequip && isEquipped && (
            <Button variant="ghost" size="sm" onClick={onUnequip} className="h-8 w-8 p-0">
              <Minus className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="mt-2 space-y-1">
        {attachment.effects.map((effect) => (
          <div key={effect.id} className="text-xs text-stone-300">
            • {effect.description}
          </div>
        ))}
      </div>
    </div>
  );
}

interface AttachmentSlotProps {
  slot: EquipmentSlot;
  equippedIds: string[];
  inventory: Attachment[];
  onEquip: (attachmentId: string, slot: EquipmentSlot) => void;
  onUnequip: (attachmentId: string, slot: EquipmentSlot) => void;
}

export function AttachmentSlotSection({
  slot,
  equippedIds,
  inventory,
  onEquip,
  onUnequip,
}: AttachmentSlotProps) {
  const equippedAttachments = equippedIds
    .map((id) => inventory.find((a) => a.id === id))
    .filter((a): a is Attachment => Boolean(a));

  const availableAttachments = inventory.filter(
    (a) => a.slot === slot && !equippedIds.includes(a.id),
  );

  const [showAvailable, setShowAvailable] = useState(false);

  return (
    <div className="rounded-[20px] border border-white/10 bg-white/5 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-stone-200">{getSlotLabel(slot)}</span>
          <span className="text-xs text-stone-400">({equippedIds.length}/3)</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAvailable(!showAvailable)}
          disabled={equippedIds.length >= 3 || availableAttachments.length === 0}
          className="h-7 px-2 text-xs"
        >
          {showAvailable ? "閉じる" : "装着"}
        </Button>
      </div>

      {equippedAttachments.length > 0 ? (
        <div className="space-y-2">
          {equippedAttachments.map((attachment) => (
            <AttachmentCard
              key={attachment.id}
              attachment={attachment}
              isEquipped={true}
              onUnequip={() => onUnequip(attachment.id, slot)}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-stone-500 py-2">装着中のアタッチメントなし</p>
      )}

      {showAvailable && availableAttachments.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-stone-400 mb-2">装着可能なアタッチメント:</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableAttachments.map((attachment) => (
              <AttachmentCard
                key={attachment.id}
                attachment={attachment}
                onEquip={() => {
                  onEquip(attachment.id, slot);
                  if (equippedIds.length + 1 >= 3) {
                    setShowAvailable(false);
                  }
                }}
                disabled={equippedIds.length >= 3}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
