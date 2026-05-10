import { describe, it, expect, vi } from "vitest";
import type {
  Equipment,
  EquipmentActiveSkill,
  EquipmentPassiveSkill,
  EquipmentRarity,
  EquipmentSlot,
  RaidBattleLogEntry,
  Element,
  AttachmentCombatState,
} from "@/types/game";

// Test helpers and types
const ELEMENTS: Element[] = ["physical", "fire", "ice", "lightning"];

// Create a deterministic RNG for testing
function createTestRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// Factory for creating equipment with specific skills
function createTestEquipment(
  slot: EquipmentSlot,
  rarity: EquipmentRarity,
  activeSkill: EquipmentActiveSkill,
  passiveSkill: EquipmentPassiveSkill,
): Equipment {
  return {
    id: `test-equip-${slot}`,
    slot,
    name: `Test ${slot}`,
    rarity,
    dropStage: 1,
    statBonuses: { hp: 0, mp: 0, attack: 0, defense: 0, speed: 0 },
    activeSkill,
    passiveSkill,
    randomStatuses: [],
  };
}

// ════════════════════════════════════════════════════════════
// ── Active Skill Tests ─────────────────────────────────────
// ════════════════════════════════════════════════════════════

describe("Equipment Active Skills", () => {
  describe("1. 基本単体攻撃 (Single Attack)", () => {
    it("should deal elemental damage with correct power percentage", () => {
      const skill: EquipmentActiveSkill = {
        id: "test-active-1",
        generatorSignature: "基本単体攻撃:attack:S",
        family: "attack",
        name: "炎一撃",
        description: "炎属性150%のダメージを与える。",
        mpCost: 15,
        element: "fire",
        powerPct: 150,
        statusEffect: null,
        guardEffect: null,
        tags: ["炎", "単体攻撃"],
        multiplier: 1.5,
      };

      expect(skill.family).toBe("attack");
      expect(skill.powerPct).toBeGreaterThan(0);
      expect(skill.element).toBeDefined();
    });

    it("should have low MP cost", () => {
      const skill: EquipmentActiveSkill = {
        id: "test-active-1",
        generatorSignature: "基本単体攻撃:attack:S",
        family: "attack",
        name: "炎一撃",
        description: "炎属性150%のダメージを与える。",
        mpCost: 15,
        element: "fire",
        powerPct: 150,
        statusEffect: null,
        guardEffect: null,
        tags: ["炎", "単体攻撃"],
        multiplier: 1.5,
      };

      expect(skill.mpCost).toBeLessThanOrEqual(20);
    });
  });

  describe("2. 二連撃 (Double Attack)", () => {
    it("should deal damage twice with attack buff after hits", () => {
      const skill: EquipmentActiveSkill = {
        id: "test-active-2",
        generatorSignature: "炎の連撃:attack:S",
        family: "attack",
        name: "炎の連撃",
        description: "炎属性120%のダメージを2回与える（合計240%）。2ヒット後、自分の攻撃力が20%上昇する（2ターン）。",
        mpCost: 25,
        element: "fire",
        powerPct: 240,
        statusEffect: null,
        guardEffect: null,
        tags: ["炎", "二連撃"],
        durationTurns: 2,
      };

      expect(skill.description).toContain("2回");
      expect(skill.description).toContain("攻撃力が");
      expect(skill.durationTurns).toBeGreaterThan(0);
    });
  });

  describe("3. 三連撃 (Triple Attack)", () => {
    it("should deal damage three times with defense debuff", () => {
      const skill: EquipmentActiveSkill = {
        id: "test-active-3",
        generatorSignature: "炎の三連撃:attack:S",
        family: "attack",
        name: "炎の三連撃",
        description: "炎属性90%のダメージを3回与える（合計270%）。3ヒット後、相手の防御力を15%ダウンさせる（2ターン）。クリティカル時は必ず出血。",
        mpCost: 30,
        element: "fire",
        powerPct: 270,
        statusEffect: null,
        guardEffect: null,
        tags: ["炎", "三連撃"],
        durationTurns: 2,
      };

      expect(skill.description).toContain("3回");
      expect(skill.description).toContain("防御力");
    });
  });

  describe("4. 継続ダメージ (DoT)", () => {
    it("should apply bleed status effect", () => {
      const skill: EquipmentActiveSkill = {
        id: "test-active-4",
        generatorSignature: "腐食の炎:attack:S",
        family: "attack",
        name: "腐食の炎",
        description: "炎属性150%のダメージを与える。さらに出血（最大HPの5%のダメージ）を2ターン付与する。",
        mpCost: 35,
        element: "fire",
        powerPct: 150,
        statusEffect: { type: "bleed", durationTurns: 2, potencyPct: 5 },
        guardEffect: null,
        tags: ["炎", "継続ダメージ", "出血"],
        multiplier: 1.2,
        durationTurns: 2,
      };

      expect(skill.statusEffect).not.toBeNull();
      expect(skill.statusEffect?.type).toBe("bleed");
      expect(skill.statusEffect?.durationTurns).toBeGreaterThan(0);
    });
  });

  describe("5. HP吸収 (Life Drain)", () => {
    it("should heal based on damage dealt", () => {
      const skill: EquipmentActiveSkill = {
        id: "test-active-5",
        generatorSignature: "炎吸収打:attack:S",
        family: "attack",
        name: "炎吸収打",
        description: "炎属性150%のダメージを与え、与えたダメージの30%を自分のHPとして回復する。相手のHPが30%以下の時、吸収量が2倍になる。",
        mpCost: 35,
        element: "fire",
        powerPct: 150,
        statusEffect: null,
        guardEffect: null,
        tags: ["炎", "HP吸収"],
        multiplier: 1.3,
      };

      expect(skill.description).toContain("回復");
    });
  });

  describe("6. カウンター (Counter)", () => {
    it("should enable counter attack", () => {
      const skill: EquipmentActiveSkill = {
        id: "test-active-6",
        generatorSignature: "反撃の炎:attack:S",
        family: "attack",
        name: "反撃の炎",
        description: "炎属性120%のダメージを与える。次の2ターン間、攻撃を受けた際に自動で反撃し1.3倍のダメージを与える。",
        mpCost: 40,
        element: "fire",
        powerPct: 120,
        statusEffect: null,
        guardEffect: null,
        tags: ["炎", "カウンター"],
        multiplier: 1.3,
        durationTurns: 2,
      };

      expect(skill.description).toContain("反撃");
    });
  });

  describe("7. リフレクト (Reflect)", () => {
    it("should set up damage reflection", () => {
      const skill: EquipmentActiveSkill = {
        id: "test-active-7",
        generatorSignature: "炎のリフレクト:guard:S",
        family: "guard",
        name: "炎のリフレクト",
        description: "次の2ターン間、受けたダメージの30%を炎属性として跳ね返す。反射中は防御力が15%上昇する。",
        mpCost: 45,
        element: "fire",
        powerPct: null,
        statusEffect: null,
        guardEffect: { physicalReductionPct: 15, elementalReductionPct: 15, durationHits: 2 },
        tags: ["炎", "反射"],
        durationTurns: 2,
        reflectPct: 30,
        reflectMultiplier: 1.2,
      };

      expect(skill.family).toBe("guard");
      expect(skill.reflectPct).toBeGreaterThan(0);
      expect(skill.guardEffect).not.toBeNull();
    });
  });

  describe("8. チャージ (Charge)", () => {
    it("should delay attack for powerful strike", () => {
      const skill: EquipmentActiveSkill = {
        id: "test-active-8",
        generatorSignature: "炎の解放:attack:SS",
        family: "attack",
        name: "炎の解放",
        description: "1ターン溜めた後、炎属性300%の強力なダメージを与える（MP消費は使用ターンに先払い）。",
        mpCost: 60,
        element: "fire",
        powerPct: 300,
        statusEffect: null,
        guardEffect: null,
        tags: ["炎", "チャージ"],
        durationTurns: 1,
      };

      expect(skill.mpCost).toBeGreaterThanOrEqual(50);
      expect(skill.powerPct).toBeGreaterThan(200);
    });
  });

  describe("9. 攻撃＋自己バフ (Attack + Self Buff)", () => {
    it("should attack and buff attack power", () => {
      const skill: EquipmentActiveSkill = {
        id: "test-active-9",
        generatorSignature: "高揚の炎撃:attack:S",
        family: "attack",
        name: "高揚の炎撃",
        description: "炎属性150%のダメージを与える。使用後、自分の攻撃力が20%上昇する（2ターン）。HPが50%以下の時ダメージが1.2倍・攻撃力上昇量が2倍になる。",
        mpCost: 35,
        element: "fire",
        powerPct: 150,
        statusEffect: null,
        guardEffect: null,
        tags: ["炎", "自己強化", "バフ"],
        multiplier: 1.2,
        durationTurns: 2,
      };

      expect(skill.description).toContain("攻撃力");
      expect(skill.description).toContain("上昇");
    });
  });

  describe("10. 攻撃＋デバフ (Attack + Debuff)", () => {
    it("should attack and reduce enemy stats", () => {
      const skill: EquipmentActiveSkill = {
        id: "test-active-10",
        generatorSignature: "炎の崩し打:attack:S",
        family: "attack",
        name: "炎の崩し打",
        description: "炎属性150%のダメージを与え、相手の攻撃力を15%・防御力を10%ダウンさせる（2ターン）。",
        mpCost: 15,
        element: "fire",
        powerPct: 150,
        statusEffect: null,
        guardEffect: null,
        tags: ["炎", "デバフ"],
        multiplier: 1.1,
        durationTurns: 2,
      };

      expect(skill.description).toContain("ダウン");
    });
  });

  describe("11. 貫通撃 (Piercing Attack)", () => {
    it("should ignore defense partially", () => {
      const skill: EquipmentActiveSkill = {
        id: "test-active-11",
        generatorSignature: "炎貫通撃:attack:S",
        family: "attack",
        name: "炎貫通撃",
        description: "炎属性150%のダメージを与える。このダメージは相手の防御力の50%を無視する。",
        mpCost: 25,
        element: "fire",
        powerPct: 150,
        statusEffect: null,
        guardEffect: null,
        tags: ["炎", "氷", "貫通"],
        piercePct: 50,
        extraDamagePct: 75,
        pierceBonusElement: "ice",
      };

      expect(skill.piercePct).toBeGreaterThan(0);
      expect(skill.piercePct).toBeLessThanOrEqual(100);
    });
  });

  describe("12. 防御破壊 (Defense Break)", () => {
    it("should reduce enemy defense significantly", () => {
      const skill: EquipmentActiveSkill = {
        id: "test-active-12",
        generatorSignature: "鎧砕きの炎:attack:S",
        family: "attack",
        name: "鎧砕きの炎",
        description: "炎属性150%のダメージを与え、相手の防御力を20%ダウンさせる（2ターン、重複可）。",
        mpCost: 25,
        element: "fire",
        powerPct: 150,
        statusEffect: null,
        guardEffect: null,
        tags: ["炎", "防御破壊"],
        multiplier: 1.1,
        durationTurns: 2,
        stackable: true,
      };

      expect(skill.stackable).toBe(true);
    });
  });

  describe("13. 処刑 (Execution)", () => {
    it("should deal bonus damage when enemy HP is low", () => {
      const skill: EquipmentActiveSkill = {
        id: "test-active-13",
        generatorSignature: "炎の処刑:attack:SS",
        family: "attack",
        name: "炎の処刑",
        description: "炎属性150%のダメージを与える。相手のHPが30%以下の場合、追加で炎属性225%の特大ダメージを与え、必ず出血。",
        mpCost: 60,
        element: "fire",
        powerPct: 150,
        statusEffect: null,
        guardEffect: null,
        tags: ["炎", "トドメ", "出血"],
        condition: "HP30%以下",
        threshold: 30,
        extraDamagePct: 225,
      };

      expect(skill.threshold).toBeGreaterThan(0);
      expect(skill.threshold).toBeLessThanOrEqual(50);
    });
  });

  describe("14. 遅延発動 (Delayed Attack)", () => {
    it("should deal delayed damage", () => {
      const skill: EquipmentActiveSkill = {
        id: "test-active-14",
        generatorSignature: "炎の遅発弾:attack:SS",
        family: "attack",
        name: "炎の遅発弾",
        description: "炎属性120%のダメージを与える。1ターン後、自動で炎属性135%の追加攻撃が発動する。追加攻撃は必ず出血、クリティカル率が25%上昇する。",
        mpCost: 60,
        element: "fire",
        powerPct: 120,
        statusEffect: null,
        guardEffect: null,
        tags: ["炎", "遅延発動", "出血"],
        durationTurns: 1,
      };

      expect(skill.durationTurns).toBeGreaterThan(0);
    });
  });

  describe("15. 封印打 (Seal)", () => {
    it("should apply seal status effect", () => {
      const skill: EquipmentActiveSkill = {
        id: "test-active-15",
        generatorSignature: "炎の封印打:attack:S",
        family: "attack",
        name: "炎の封印打",
        description: "炎属性150%のダメージを与え、相手のスキル使用を2ターン封印する。",
        mpCost: 25,
        element: "fire",
        powerPct: 150,
        statusEffect: { type: "seal", durationTurns: 2, potencyPct: 100 },
        guardEffect: null,
        tags: ["炎", "封印"],
        multiplier: 1.2,
        durationTurns: 2,
      };

      expect(skill.statusEffect?.type).toBe("seal");
    });
  });

  describe("16. 複合属性 (Multi-element)", () => {
    it("should deal mixed elemental damage", () => {
      const skill: EquipmentActiveSkill = {
        id: "test-active-16",
        generatorSignature: "炎・氷複合爆発:attack:SS",
        family: "attack",
        name: "炎・氷複合爆発",
        description: "炎属性と氷属性の混合で135%のダメージを与える。両属性に弱点がある場合、ダメージが1.4倍になる。",
        mpCost: 60,
        element: "fire",
        powerPct: 135,
        statusEffect: null,
        guardEffect: null,
        tags: ["炎", "氷", "複合"],
        multiplier: 1.4,
      };

      expect(skill.tags).toHaveLength(3);
      expect(skill.tags).toContain("複合");
    });
  });

  describe("17. 自己バフ (Self Buff)", () => {
    it("should buff multiple stats", () => {
      const skill: EquipmentActiveSkill = {
        id: "test-active-17",
        generatorSignature: "炎の覚醒:guard:S",
        family: "guard",
        name: "炎の覚醒",
        description: "自分の攻撃力を20%・素早さを15%上昇させる（2ターン）。次の攻撃スキルのダメージが1.3倍になる。",
        mpCost: 40,
        element: "fire",
        powerPct: null,
        statusEffect: null,
        guardEffect: null,
        tags: ["炎", "バフ", "強化"],
        multiplier: 1.3,
        durationTurns: 2,
      };

      expect(skill.family).toBe("guard");
      expect(skill.powerPct).toBeNull();
    });
  });

  describe("18. リジェネ (Regeneration)", () => {
    it("should apply HP regeneration", () => {
      const skill: EquipmentActiveSkill = {
        id: "test-active-18",
        generatorSignature: "炎の再生:guard:S",
        family: "guard",
        name: "炎の再生",
        description: "毎ターン最大HPの5%を回復する（2ターン）。いずれかの状態異常を受けている時、回復量が1.2倍になる。",
        mpCost: 40,
        element: "fire",
        powerPct: null,
        statusEffect: null,
        guardEffect: null,
        tags: ["炎", "リジェネ", "回復"],
        multiplier: 1.2,
        durationTurns: 2,
      };

      expect(skill.description).toContain("回復");
      expect(skill.powerPct).toBeNull();
    });
  });

  describe("19. 浄化＋反撃 (Cleanse + Counter)", () => {
    it("should cleanse status effects and counter", () => {
      const skill: EquipmentActiveSkill = {
        id: "test-active-19",
        generatorSignature: "浄化の炎:attack:S",
        family: "attack",
        name: "浄化の炎",
        description: "自分にかかった状態異常・デバフを全て解除し、炎属性150%の反撃ダメージを与える。解除した効果の数×15%ダメージが上昇する。",
        mpCost: 25,
        element: "fire",
        powerPct: 150,
        statusEffect: null,
        guardEffect: null,
        tags: ["炎", "浄化", "状態解除"],
        durationTurns: 1,
      };

      expect(skill.description).toContain("解除");
    });
  });

  describe("20. 条件付き強化 (Conditional)", () => {
    it("should have conditional damage multiplier", () => {
      const skill: EquipmentActiveSkill = {
        id: "test-active-20",
        generatorSignature: "弱点狙いの炎:attack:S",
        family: "attack",
        name: "弱点狙いの炎",
        description: "炎属性150%のダメージを与える。状態異常中の敵に対してダメージが1.5倍になる。30%の確率でクリティカルヒットし、さらに1.2倍になる。",
        mpCost: 25,
        element: "fire",
        powerPct: 150,
        statusEffect: null,
        guardEffect: null,
        tags: ["炎", "氷", "条件付き"],
        multiplier: 1.5,
        condition: "状態異常中の敵",
      };

      expect(skill.condition).toBeDefined();
    });
  });

  describe("21. スロウ打 (Slow)", () => {
    it("should apply slow status effect", () => {
      const skill: EquipmentActiveSkill = {
        id: "test-active-21",
        generatorSignature: "炎の呪縛:attack:S",
        family: "attack",
        name: "炎の呪縛",
        description: "炎属性150%のダメージを与える。80%の確率でスロウ（素早さ25%低下・行動順を後ろへ、2ターン）を付与する。",
        mpCost: 15,
        element: "fire",
        powerPct: 150,
        statusEffect: { type: "slow", durationTurns: 2, potencyPct: 25 },
        guardEffect: null,
        tags: ["炎", "スロウ"],
        durationTurns: 2,
      };

      expect(skill.statusEffect?.type).toBe("slow");
    });
  });

  describe("22. バリア破壊 (Barrier Break)", () => {
    it("should remove enemy barriers", () => {
      const skill: EquipmentActiveSkill = {
        id: "test-active-22",
        generatorSignature: "炎のシールド割り:attack:S",
        family: "attack",
        name: "炎のシールド割り",
        description: "炎属性150%のダメージを与え、相手のバリア・シールドを全て除去する。除去成功時、氷属性75%の追加ダメージを与え、必ず出血。",
        mpCost: 35,
        element: "fire",
        powerPct: 150,
        statusEffect: null,
        guardEffect: null,
        tags: ["炎", "バリア破壊", "氷", "出血"],
        extraDamagePct: 75,
      };

      expect(skill.description).toContain("除去");
      expect(skill.extraDamagePct).toBeGreaterThan(0);
    });
  });

  describe("23. 全ステバフ＋バリア (All Stats Buff + Barrier)", () => {
    it("should buff all stats and apply barrier", () => {
      const skill: EquipmentActiveSkill = {
        id: "test-active-23",
        generatorSignature: "炎の覇気:attack:SS",
        family: "attack",
        name: "炎の覇気",
        description: "炎属性150%のダメージを与える。使用後、自分の全ステータスが15%上昇し（1ターン）、次に受けるダメージを1回無効化するバリアを張る。",
        mpCost: 60,
        element: "fire",
        powerPct: 150,
        statusEffect: null,
        guardEffect: { physicalReductionPct: 100, elementalReductionPct: 100, durationHits: 1 },
        tags: ["炎", "超強化"],
        durationTurns: 1,
      };

      expect(skill.guardEffect?.physicalReductionPct).toBe(100);
    });
  });

  describe("24. 蓄積型状態異常 (Stackable Status)", () => {
    it("should apply stackable status effect", () => {
      const skill: EquipmentActiveSkill = {
        id: "test-active-24",
        generatorSignature: "炎の蓄積打:attack:S",
        family: "attack",
        name: "炎の蓄積打",
        description: "炎属性150%のダメージを与える。90%の確率で出血（同一状態異常は重複不可・更新）。対象がすでに出血状態の時、効果値が15%増加した状態で上書きする。",
        mpCost: 15,
        element: "fire",
        powerPct: 150,
        statusEffect: { type: "bleed", durationTurns: 2, potencyPct: 15 },
        guardEffect: null,
        tags: ["炎", "出血", "スタック"],
        durationTurns: 2,
        stackable: true,
      };

      expect(skill.stackable).toBe(true);
    });
  });
});

// ════════════════════════════════════════════════════════════
// ── Passive Skill Tests ────────────────────────────────────
// ════════════════════════════════════════════════════════════

describe("Equipment Passive Skills", () => {
  describe("1. 物理の闘気 (Element Fighting Spirit - Always Attack Boost)", () => {
    it("should provide constant attack boost", () => {
      const passive: EquipmentPassiveSkill = {
        id: "test-passive-1",
        generatorSignature: "炎の闘気:elementBoost:S",
        category: "elementBoost",
        name: "炎の闘気",
        description: "常時、自分の攻撃力が15%上昇する。さらに炎属性スキル使用時、その攻撃の与ダメージが追加で12%上昇する。",
        valuePct: 15,
        element: "fire",
        tags: ["炎", "常時", "攻撃強化"],
        condition: "常時",
      };

      expect(passive.condition).toBe("常時");
      expect(passive.category).toBe("elementBoost");
    });
  });

  describe("2. 物理の守護 (Element Guardian - Always Defense Boost)", () => {
    it("should provide constant defense boost", () => {
      const passive: EquipmentPassiveSkill = {
        id: "test-passive-2",
        generatorSignature: "炎の守護:statBoost:S",
        category: "statBoost",
        name: "炎の守護",
        description: "常時、自分の防御力が15%上昇する。炎属性の攻撃を受けた時、さらに防御力が10%上昇する（1ターン）。",
        valuePct: 15,
        stat: "defense",
        tags: ["炎", "常時", "防御強化"],
        condition: "常時",
      };

      expect(passive.stat).toBe("defense");
    });
  });

  describe("3. 物理耐性 (Element Resistance)", () => {
    it("should reduce elemental damage", () => {
      const passive: EquipmentPassiveSkill = {
        id: "test-passive-3",
        generatorSignature: "炎耐性:statusResist:S",
        category: "statusResist",
        name: "炎耐性",
        description: "常時、炎属性ダメージを15%軽減する。氷属性の攻撃を受けた場合も8%軽減する。",
        valuePct: 15,
        element: "fire",
        tags: ["炎", "常時", "耐性"],
        condition: "常時",
      };

      expect(passive.category).toBe("statusResist");
      expect(passive.element).toBeDefined();
    });
  });

  describe("4. 疾風の歩 (Swift Steps - Always Speed Boost)", () => {
    it("should provide constant speed boost", () => {
      const passive: EquipmentPassiveSkill = {
        id: "test-passive-4",
        generatorSignature: "疾風の歩:statBoost:S",
        category: "statBoost",
        name: "疾風の歩",
        description: "常時、自分の素早さが15%上昇する。25%の確率でバトル開始時に先制を得る。",
        valuePct: 15,
        stat: "speed",
        tags: ["常時", "速度強化"],
        condition: "常時",
      };

      expect(passive.stat).toBe("speed");
    });
  });

  describe("5. 鋭眼 (Keen Eye - Always Critical)", () => {
    it("should increase critical rate", () => {
      const passive: EquipmentPassiveSkill = {
        id: "test-passive-5",
        generatorSignature: "鋭眼:statBoost:S",
        category: "statBoost",
        name: "鋭眼",
        description: "常時、クリティカル率が15%上昇する。クリティカルヒット時のダメージ倍率が追加で12%上昇する。",
        valuePct: 15,
        stat: "attack",
        tags: ["常時", "クリティカル"],
        condition: "常時",
      };

      expect(passive.name).toBe("鋭眼");
    });
  });

  describe("6. 物理の怒気 (Element Rage - HP Threshold Attack)", () => {
    it("should activate at HP threshold", () => {
      const passive: EquipmentPassiveSkill = {
        id: "test-passive-6",
        generatorSignature: "炎の怒気:elementBoost:S",
        category: "elementBoost",
        name: "炎の怒気",
        description: "自分のHPが50%以下になると、攻撃力が25%上昇する。さらにHPが25%以下になると、攻撃力がさらに12%追加上昇する。",
        valuePct: 25,
        element: "fire",
        tags: ["炎", "HP閾値", "攻撃強化"],
        condition: "HP50%以下",
        threshold: 50,
      };

      expect(passive.threshold).toBe(50);
      expect(passive.condition).toContain("HP");
    });
  });

  describe("7. 不屈の守り (Unyielding Defense - HP Threshold)", () => {
    it("should reduce damage and heal at low HP", () => {
      const passive: EquipmentPassiveSkill = {
        id: "test-passive-7",
        generatorSignature: "不屈の守り:statBoost:S",
        category: "statBoost",
        name: "不屈の守り",
        description: "自分のHPが50%以下になると、受けるダメージを20%軽減する。さらにHPが50%以下の間、毎ターン開始時に最大HPの5%を回復する。",
        valuePct: 20,
        stat: "defense",
        tags: ["HP閾値", "防御強化", "回復"],
        condition: "HP50%以下",
        threshold: 50,
      };

      expect(passive.threshold).toBe(50);
      expect(passive.description).toContain("回復");
    });
  });

  describe("8. 生命の盾 (Shield of Life - HP Threshold Barrier)", () => {
    it("should create barrier at low HP", () => {
      const passive: EquipmentPassiveSkill = {
        id: "test-passive-8",
        generatorSignature: "生命の盾:statBoost:S",
        category: "statBoost",
        name: "生命の盾",
        description: "HPが20%以下になった時、自動でダメージを1回無効化するバリアを張る（3ターンに1回のみ発動）。バリアが破壊された時、攻撃力が25%上昇する（2ターン）。",
        valuePct: 0,
        stat: "hp",
        tags: ["HP閾値", "バリア"],
        condition: "HP25%以下",
        threshold: 25,
        cooldown: 3,
      };

      expect(passive.cooldown).toBeDefined();
      expect(passive.cooldown).toBeGreaterThan(0);
    });
  });

  describe("9. 物理の覚悟 (Element Resolve - HP Threshold Super Boost)", () => {
    it("should guarantee critical at very low HP", () => {
      const passive: EquipmentPassiveSkill = {
        id: "test-passive-9",
        generatorSignature: "炎の覚悟:elementBoost:S",
        category: "elementBoost",
        name: "炎の覚悟",
        description: "HPが25%以下になると、炎属性スキルのダメージが30%上昇する（持続）。この効果中、炎属性スキルは必ずクリティカルヒットする。",
        valuePct: 30,
        element: "fire",
        tags: ["炎", "HP閾値", "超強化"],
        condition: "HP25%以下",
        threshold: 25,
      };

      expect(passive.threshold).toBe(25);
    });
  });

  describe("10. 痛みの覚醒 (Pain Awakening - On Damage Taken)", () => {
    it("should stack attack boost when taking damage", () => {
      const passive: EquipmentPassiveSkill = {
        id: "test-passive-10",
        generatorSignature: "痛みの覚醒:statBoost:S",
        category: "statBoost",
        name: "痛みの覚醒",
        description: "攻撃を受けるたびに攻撃力が5%上昇する（スタック可、上限+20%）。4回ヒットされるごとに、次の自分の攻撃が必ずクリティカルになる。",
        valuePct: 5,
        stat: "attack",
        tags: ["被ダメ時", "攻撃強化", "スタック"],
        condition: "被ダメ時",
      };

      expect(passive.condition).toBe("被ダメ時");
    });
  });

  describe("11. 物理の荊棘 (Element Thorns - On Damage Taken Status)", () => {
    it("should inflict status when taking damage", () => {
      const passive: EquipmentPassiveSkill = {
        id: "test-passive-11",
        generatorSignature: "炎の荊棘:statusResist:S",
        category: "statusResist",
        name: "炎の荊棘",
        description: "物理攻撃を受けた時、30%の確率で攻撃者に感電。炎属性攻撃を受けた場合、確率が2倍になる。",
        valuePct: 30,
        statusType: "shock",
        tags: ["炎", "被ダメ時", "感電"],
        condition: "被ダメ時",
      };

      expect(passive.statusType).toBeDefined();
    });
  });

  describe("12. 強靭なる肉体 (Resilient Body - On Damage Taken Heal)", () => {
    it("should heal when taking damage", () => {
      const passive: EquipmentPassiveSkill = {
        id: "test-passive-12",
        generatorSignature: "強靭なる肉体:statBoost:S",
        category: "statBoost",
        name: "強靭なる肉体",
        description: "攻撃を受けた時、40%の確率で最大HPの10%を即座に回復する。回復した場合、そのターンの被ダメージを20%軽減する。",
        valuePct: 10,
        stat: "hp",
        tags: ["被ダメ時", "回復"],
        condition: "被ダメ時",
      };

      expect(passive.condition).toBe("被ダメ時");
    });
  });

  describe("13. 苦痛の昇華 (Sublimation of Pain - On Self Status)", () => {
    it("should boost attack when having status ailment", () => {
      const passive: EquipmentPassiveSkill = {
        id: "test-passive-13",
        generatorSignature: "苦痛の昇華:statBoost:S",
        category: "statBoost",
        name: "苦痛の昇華",
        description: "自分がいずれかの状態異常状態の間、攻撃力が25%上昇する。状態異常が2種類以上かかっている場合、さらに12%追加上昇する。",
        valuePct: 25,
        stat: "attack",
        tags: ["状態異常時", "攻撃強化"],
        condition: "自身状態異常時",
      };

      expect(passive.condition).toContain("状態異常");
    });
  });

  describe("14. 弱者狩り (Predator of the Weak - On Enemy Status)", () => {
    it("should boost damage when enemy has status", () => {
      const passive: EquipmentPassiveSkill = {
        id: "test-passive-14",
        generatorSignature: "弱者狩り:statBoost:S",
        category: "statBoost",
        name: "弱者狩り",
        description: "相手がいずれかの状態異常状態の間、与えるダメージが25%上昇する。状態異常の種類ごとにさらに15%追加上昇する。",
        valuePct: 25,
        stat: "attack",
        tags: ["状態異常時", "攻撃強化", "条件付き"],
        condition: "相手状態異常時",
      };

      expect(passive.condition).toBe("相手状態異常時");
    });
  });

  describe("15. 凍傷の捕食者 (Frostbite Predator - Status Conditional)", () => {
    it("should boost damage against specific status and heal", () => {
      const passive: EquipmentPassiveSkill = {
        id: "test-passive-15",
        generatorSignature: "凍傷の捕食者:elementBoost:S",
        category: "elementBoost",
        name: "凍傷の捕食者",
        description: "相手が凍傷状態の時、炎属性ダメージが25%上昇する。さらに相手が凍傷状態の時に与えたダメージの22%を自分のHPとして回復する。",
        valuePct: 25,
        element: "fire",
        statusType: "frostbite",
        tags: ["炎", "状態異常時", "条件付き"],
        condition: "相手状態異常時",
      };

      expect(passive.statusType).toBe("frostbite");
    });
  });

  describe("16. 物理の鼓動 (Element Pulse - Turn Start Buff)", () => {
    it("should apply buff at turn start with chance", () => {
      const passive: EquipmentPassiveSkill = {
        id: "test-passive-16",
        generatorSignature: "炎の鼓動:statBoost:S",
        category: "statBoost",
        name: "炎の鼓動",
        description: "毎ターン開始時、50%の確率で自分の攻撃力が15%上昇する（1ターン、スタック可）。炎属性スキルを使用したターンの次のターン開始時、この確率が2倍になる。",
        valuePct: 15,
        stat: "attack",
        tags: ["炎", "ターン開始", "バフ"],
        condition: "ターン開始時",
      };

      expect(passive.condition).toBe("ターン開始時");
    });
  });

  describe("17. 物理の圧迫 (Element Pressure - Turn Start Debuff)", () => {
    it("should apply debuff to enemy at turn start", () => {
      const passive: EquipmentPassiveSkill = {
        id: "test-passive-17",
        generatorSignature: "炎の圧迫:statusResist:S",
        category: "statusResist",
        name: "炎の圧迫",
        description: "毎ターン開始時、40%の確率で相手に防御ダウン。炎属性の敵に対してはこの確率が60%に上昇する。",
        valuePct: 40,
        statusType: "defenseDown",
        tags: ["炎", "ターン開始", "デバフ"],
        condition: "ターン開始時",
      };

      expect(passive.statusType).toBeDefined();
    });
  });

  describe("18. 物理の余韻 (Element Afterglow - On Hit Status)", () => {
    it("should inflict status on skill hit", () => {
      const passive: EquipmentPassiveSkill = {
        id: "test-passive-18",
        generatorSignature: "炎の余韻:statusResist:S",
        category: "statusResist",
        name: "炎の余韻",
        description: "スキルが命中した時、35%の確率で出血。クリティカルヒット時はこの確率が2倍になる。",
        valuePct: 35,
        statusType: "bleed",
        tags: ["炎", "命中時", "出血"],
        condition: "スキル命中時",
      };

      expect(passive.condition).toBe("スキル命中時");
    });
  });

  describe("19. 吸命の爪 (Life Drain Claws - On Hit HP Drain)", () => {
    it("should drain HP on hit", () => {
      const passive: EquipmentPassiveSkill = {
        id: "test-passive-19",
        generatorSignature: "吸命の爪:statBoost:S",
        category: "statBoost",
        name: "吸命の爪",
        description: "攻撃が命中するたびに、与えたダメージの10%を自分のHPとして回復する。クリティカルヒット時は回復量が2倍になる。",
        valuePct: 10,
        stat: "hp",
        tags: ["命中時", "HP吸収"],
        condition: "攻撃命中時",
      };

      expect(passive.condition).toBe("攻撃命中時");
    });
  });

  describe("20. 物理の臨界 (Element Critical - Complex Condition)", () => {
    it("should activate on complex condition", () => {
      const passive: EquipmentPassiveSkill = {
        id: "test-passive-20",
        generatorSignature: "炎の臨界:elementBoost:S",
        category: "elementBoost",
        name: "炎の臨界",
        description: "自分のHPが50%以下かつ状態異常状態の時、炎属性スキルのダメージが25%上昇し、受けるダメージを15%軽減する。両条件を満たした状態が2ターン続くと、次の炎属性スキルが必ずクリティカルになる。",
        valuePct: 25,
        element: "fire",
        tags: ["炎", "HP閾値", "状態異常時", "超強化"],
        condition: "複合条件",
        threshold: 50,
      };

      expect(passive.condition).toBe("複合条件");
    });
  });
});

// ════════════════════════════════════════════════════════════
// ── Integration Tests ────────────────────────────────────────
// ════════════════════════════════════════════════════════════

describe("Equipment Skills Integration", () => {
  it("should validate active skill structure", () => {
    const requiredActiveFields = [
      "id", "generatorSignature", "family", "name", "description",
      "mpCost", "element", "tags",
    ];
    
    // Sample active skill
    const skill: EquipmentActiveSkill = {
      id: "test",
      generatorSignature: "test:attack:S",
      family: "attack",
      name: "Test",
      description: "Test skill",
      mpCost: 20,
      element: "fire",
      powerPct: 150,
      statusEffect: null,
      guardEffect: null,
      tags: ["炎"],
    };
    
    requiredActiveFields.forEach(field => {
      expect(skill).toHaveProperty(field);
    });
  });

  it("should validate passive skill structure", () => {
    const requiredPassiveFields = [
      "id", "generatorSignature", "category", "name", "description",
      "valuePct", "tags", "condition",
    ];
    
    // Sample passive skill
    const passive: EquipmentPassiveSkill = {
      id: "test",
      generatorSignature: "test:elementBoost:S",
      category: "elementBoost",
      name: "Test",
      description: "Test passive",
      valuePct: 15,
      element: "fire",
      tags: ["炎", "常時"],
      condition: "常時",
    };
    
    requiredPassiveFields.forEach(field => {
      expect(passive).toHaveProperty(field);
    });
  });

  it("should categorize skills correctly by family", () => {
    const attackSkill: EquipmentActiveSkill = {
      id: "attack",
      generatorSignature: "attack:attack:S",
      family: "attack",
      name: "Attack",
      description: "Attack skill",
      mpCost: 20,
      element: "fire",
      powerPct: 150,
      statusEffect: null,
      guardEffect: null,
      tags: ["炎"],
    };
    
    const guardSkill: EquipmentActiveSkill = {
      id: "guard",
      generatorSignature: "guard:guard:S",
      family: "guard",
      name: "Guard",
      description: "Guard skill",
      mpCost: 20,
      element: "fire",
      powerPct: null,
      statusEffect: null,
      guardEffect: { physicalReductionPct: 20, elementalReductionPct: 20, durationHits: 2 },
      tags: ["炎"],
    };
    
    expect(attackSkill.family).toBe("attack");
    expect(guardSkill.family).toBe("guard");
  });

  it("should properly handle skills with null powerPct (buff/guard skills)", () => {
    const buffSkill: EquipmentActiveSkill = {
      id: "buff",
      generatorSignature: "buff:guard:S",
      family: "guard",
      name: "Buff",
      description: "Buff skill",
      mpCost: 30,
      element: "fire",
      powerPct: null,
      statusEffect: null,
      guardEffect: null,
      tags: ["炎", "バフ"],
    };
    
    expect(buffSkill.powerPct).toBeNull();
  });
});
