import type {
  AttachmentEffect,
  AttachmentEffectType,
  AttachmentCondition,
  StatKey,
  Element,
  StatusEffectType,
  AttachmentRarity,
} from "@/types/game";

export type RandomFn = () => number;

// ランクごとの効果値スケール
const RARITY_VALUE_SCALE: Record<AttachmentRarity, number> = {
  C: 1,
  B: 1.5,
  A: 2,
  S: 3,
  SS: 4.5,
  SSS: 6,
};

// ステータスラベル
const STAT_LABELS: Record<StatKey, string> = {
  hp: "HP",
  mp: "MP",
  attack: "ATK",
  defense: "DEF",
  speed: "SPD",
};

// 属性ラベル
const ELEMENT_LABELS: Record<Element, string> = {
  physical: "物理",
  fire: "炎",
  ice: "氷",
  lightning: "雷",
};

// 状態異常ラベル
const STATUS_LABELS: Record<StatusEffectType, string> = {
  burn: "炎上",
  shock: "感電",
  frostbite: "凍傷",
  stun: "スタン",
  slow: "スロウ",
  defenseDown: "防御ダウン",
  darkness: "暗闇",
  seal: "封印",
  bleed: "出血",
};

// 乱数生成ヘルパー
function randomInt(min: number, max: number, rng: RandomFn): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pickOne<T>(items: readonly T[], rng: RandomFn): T {
  return items[randomInt(0, items.length - 1, rng)];
}

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

// ====================
// ステータス増減効果
// ====================

// (HP/MP/ATK/DEF/SPD)+n 固定値
export function generateStatFlatEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  const stats: StatKey[] = ["hp", "mp", "attack", "defense", "speed"];
  const stat = pickOne(stats, rng);
  const scale = RARITY_VALUE_SCALE[rarity];

  let baseValue: number;
  switch (stat) {
    case "hp":
      baseValue = randomInt(5, 8, rng);
      break;
    case "mp":
      baseValue = randomInt(3, 6, rng);
      break;
    case "attack":
      baseValue = randomInt(2, 5, rng);
      break;
    case "defense":
      baseValue = randomInt(2, 4, rng);
      break;
    case "speed":
      baseValue = randomInt(1, 3, rng);
      break;
  }

  const value = Math.round(baseValue * scale);

  return {
    id: createId("att-effect"),
    category: "statBoost",
    type: "statFlat",
    stat,
    flatValue: value,
    description: `${STAT_LABELS[stat]}+${value}`,
  };
}

// (HP/MP/ATK/DEF/SPD)+n% 割合
export function generateStatPercentEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  const stats: StatKey[] = ["hp", "mp", "attack", "defense", "speed"];
  const stat = pickOne(stats, rng);
  const scale = RARITY_VALUE_SCALE[rarity];

  const basePercent = randomInt(2, 5, rng);
  const percent = Math.round(basePercent * scale);

  return {
    id: createId("att-effect"),
    category: "statBoost",
    type: "statPercent",
    stat,
    percentValue: percent,
    description: `${STAT_LABELS[stat]}+${percent}%`,
  };
}

// (HP/MP/ATK/DEF/SPD)+n、(HP/MP/ATK/DEF/SPD)-n マイナス効果がある分プラス効果が大きい
export function generateStatTradeOffEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  const stats: StatKey[] = ["hp", "mp", "attack", "defense", "speed"];
  const positiveStat = pickOne(stats, rng);
  const negativeStat = pickOne(stats.filter((s) => s !== positiveStat), rng);
  const scale = RARITY_VALUE_SCALE[rarity];

  let basePositive: number;
  let baseNegative: number;
  switch (positiveStat) {
    case "hp":
      basePositive = randomInt(8, 12, rng);
      break;
    case "mp":
      basePositive = randomInt(5, 8, rng);
      break;
    case "attack":
      basePositive = randomInt(4, 7, rng);
      break;
    case "defense":
      basePositive = randomInt(3, 6, rng);
      break;
    case "speed":
      basePositive = randomInt(2, 4, rng);
      break;
  }

  switch (negativeStat) {
    case "hp":
      baseNegative = randomInt(3, 6, rng);
      break;
    case "mp":
      baseNegative = randomInt(2, 4, rng);
      break;
    case "attack":
      baseNegative = randomInt(1, 3, rng);
      break;
    case "defense":
      baseNegative = randomInt(1, 2, rng);
      break;
    case "speed":
      baseNegative = randomInt(1, 2, rng);
      break;
  }

  const positiveValue = Math.round(basePositive * scale);
  const negativeValue = Math.round(baseNegative * scale);

  return {
    id: createId("att-effect"),
    category: "statBoost",
    type: "statTradeOff",
    stat: positiveStat,
    statSecondary: negativeStat,
    flatValue: positiveValue,
    percentValue: negativeValue, // マイナス効果の値として使用
    description: `${STAT_LABELS[positiveStat]}+${positiveValue}、${STAT_LABELS[negativeStat]}-${negativeValue}`,
  };
}

// 全ステータス+n% (HP/MP/ATK/DEF/SPDは除く) - ATK/DEF/SPDのみ
export function generateAllStatsPercentEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  const scale = RARITY_VALUE_SCALE[rarity];
  const basePercent = randomInt(1, 3, rng);
  const percent = Math.round(basePercent * scale * 0.7); // 全ステータスなので個別より少し低め

  return {
    id: createId("att-effect"),
    category: "statBoost",
    type: "allStatsPercent",
    percentValue: percent,
    description: `ATK/DEF/SPD+${percent}%`,
  };
}

// 最大HP-n%、全ステータス+n% (HPは除く)
export function generateHpDownAllUpEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  const scale = RARITY_VALUE_SCALE[rarity];
  const hpDownBase = randomInt(5, 10, rng);
  const allUpBase = randomInt(3, 6, rng);

  const hpDown = Math.round(hpDownBase * scale);
  const allUp = Math.round(allUpBase * scale);

  return {
    id: createId("att-effect"),
    category: "statBoost",
    type: "hpDownAllUp",
    percentValue: hpDown, // HP減少値
    skillPowerBoost: allUp, // 全ステータス増加値として借用
    description: `最大HP-${hpDown}%、ATK/DEF/SPD+${allUp}%`,
  };
}

// クリティカルダメージ+n%
export function generateCritDamageUpEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  const scale = RARITY_VALUE_SCALE[rarity];
  const baseBonus = randomInt(5, 15, rng);
  const bonus = Math.round(baseBonus * scale);

  return {
    id: createId("att-effect"),
    category: "statBoost",
    type: "critDamageUp",
    percentValue: bonus,
    description: `クリティカルダメージ+${bonus}%`,
  };
}

// ====================
// スキルパラメータ改変効果
// ====================

// スキルの基礎効果+n%
export function generateSkillPowerUpEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  const scale = RARITY_VALUE_SCALE[rarity];
  const baseBoost = randomInt(8, 20, rng);
  const boost = Math.round(baseBoost * scale);

  return {
    id: createId("att-effect"),
    category: "skillParam",
    type: "skillPowerUp",
    skillPowerBoost: boost,
    description: `スキルの基礎効果+${boost}%`,
  };
}

// (物理/炎/雷/氷)属性のスキルのみ効果+n%
export function generateSkillElementUpEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  const elements: Element[] = ["physical", "fire", "lightning", "ice"];
  const element = pickOne(elements, rng);
  const scale = RARITY_VALUE_SCALE[rarity];
  const baseBoost = randomInt(12, 25, rng);
  const boost = Math.round(baseBoost * scale);

  return {
    id: createId("att-effect"),
    category: "skillParam",
    type: "skillElementUp",
    element,
    skillPowerBoost: boost,
    description: `${ELEMENT_LABELS[element]}属性スキルの効果+${boost}%`,
  };
}

// スキルのMPコスト-n
export function generateSkillMpCostFlatEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  const scale = RARITY_VALUE_SCALE[rarity];
  const baseReduction = randomInt(3, 8, rng);
  const reduction = Math.round(baseReduction * scale);

  return {
    id: createId("att-effect"),
    category: "skillParam",
    type: "skillMpCostFlat",
    mpCostReduction: reduction,
    description: `スキルのMPコスト-${reduction}`,
  };
}

// スキルのMPコスト-n%
export function generateSkillMpCostPercentEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  const scale = RARITY_VALUE_SCALE[rarity];
  const baseReduction = randomInt(8, 20, rng);
  const reduction = Math.min(50, Math.round(baseReduction * scale)); // 上限50%

  return {
    id: createId("att-effect"),
    category: "skillParam",
    type: "skillMpCostPercent",
    mpCostReduction: reduction,
    description: `スキルのMPコスト-${reduction}%`,
  };
}

// [特定のタグ]をもつスキルのMPコスト-n(%)
export function generateSkillTagMpCostEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  const tags = ["単体攻撃", "二連撃", "三連撃", "継続ダメージ", "HP吸収", "カウンター", "反射"];
  const tag = pickOne(tags, rng);
  const scale = RARITY_VALUE_SCALE[rarity];
  const isPercent = rng() > 0.5;

  if (isPercent) {
    const baseReduction = randomInt(15, 30, rng);
    const reduction = Math.min(60, Math.round(baseReduction * scale)); // 条件付きなので強め、上限60%
    return {
      id: createId("att-effect"),
      category: "skillParam",
      type: "skillTagMpCost",
      tag,
      mpCostReduction: reduction,
      description: `[${tag}]スキルのMPコスト-${reduction}%`,
    };
  } else {
    const baseReduction = randomInt(5, 12, rng);
    const reduction = Math.round(baseReduction * scale);
    return {
      id: createId("att-effect"),
      category: "skillParam",
      type: "skillTagMpCost",
      tag,
      mpCostReduction: reduction, // 固定値として使用（解釈は別）
      description: `[${tag}]スキルのMPコスト-${reduction}`,
    };
  }
}

// ====================
// 確率操作効果
// ====================

// クリティカル率+n%
export function generateCritRateUpEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  const scale = RARITY_VALUE_SCALE[rarity];
  const baseBonus = randomInt(3, 10, rng);
  const bonus = Math.round(baseBonus * scale);

  return {
    id: createId("att-effect"),
    category: "probability",
    type: "critRateUp",
    probabilityValue: bonus,
    description: `クリティカル率+${bonus}%`,
  };
}

// スキル内の全ての確率+n%
export function generateAllProbabilityUpEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  const scale = RARITY_VALUE_SCALE[rarity];
  const baseBonus = randomInt(10, 25, rng);
  const bonus = Math.round(baseBonus * scale);

  return {
    id: createId("att-effect"),
    category: "probability",
    type: "allProbabilityUp",
    probabilityValue: bonus,
    description: `スキル内の全ての確率+${bonus}%`,
  };
}

// スキル内の全ての確率n倍
export function generateAllProbabilityMultEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  const scale = RARITY_VALUE_SCALE[rarity];
  const baseMult = 1.2 + rng() * 0.8; // 1.2-2.0
  const multiplier = Math.round(baseMult * scale * 10) / 10;
  const displayMult = Math.round(multiplier * 10) / 10;

  return {
    id: createId("att-effect"),
    category: "probability",
    type: "allProbabilityMult",
    probabilityValue: displayMult,
    description: `スキル内の全ての確率${displayMult.toFixed(1)}倍`,
  };
}

// クリティカル率と(クリティカルダメージ-100%)の比が1:2になるように変換
export function generateCritRateCritDamageConvertEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  return {
    id: createId("att-effect"),
    category: "probability",
    type: "critRateCritDamageConvert",
    description: `クリティカル率と(クリティカルダメージ-100%)を1:2の比率に変換`,
  };
}

// 回避されたとき、次の攻撃は必中
export function generateEvasionNextSureHitEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  return {
    id: createId("att-effect"),
    category: "probability",
    type: "evasionNextSureHit",
    description: `回避されたとき、次の攻撃は必中`,
  };
}

// 確率がn%以上のとき、その確率で発動する効果は全て確定発動
export function generateHighProbGuaranteeEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  const thresholds = [30, 40, 50, 60];
  const threshold = pickOne(thresholds, rng);

  return {
    id: createId("att-effect"),
    category: "probability",
    type: "highProbGuarantee",
    probabilityThreshold: threshold,
    description: `確率が${threshold}%以上の効果は確定発動`,
  };
}

// 全ての確率判定を「2回振って有利な方を採用」に変更
export function generateDoubleRollEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  return {
    id: createId("att-effect"),
    category: "probability",
    type: "doubleRoll",
    description: `全ての確率判定を「2回振って有利な方を採用」に変更`,
  };
}

// クリティカル発生時、そのスキルにある確率で発動する効果は確定発動
export function generateCritGuaranteesProbEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  return {
    id: createId("att-effect"),
    category: "probability",
    type: "critGuaranteesProb",
    description: `クリティカル発生時、そのスキルの確率効果は確定発動`,
  };
}

// ====================
// 計算式介入効果
// ====================

// ダメージ計算時、(HP/MP/DEF/SPD)のn%をATKに加算
export function generateStatToAttackEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  const sourceStats: StatKey[] = ["hp", "mp", "defense", "speed"];
  const sourceStat = pickOne(sourceStats, rng);
  const scale = RARITY_VALUE_SCALE[rarity];

  // ステータスによる調整 (HP/MPは低め、DEF/SPDは高め)
  let basePercent: number;
  if (sourceStat === "hp") {
    basePercent = randomInt(1, 3, rng);
  } else if (sourceStat === "mp") {
    basePercent = randomInt(2, 4, rng);
  } else {
    basePercent = randomInt(5, 12, rng);
  }

  const percent = Math.round(basePercent * scale);

  return {
    id: createId("att-effect"),
    category: "calculation",
    type: "statToAttack",
    sourceStat,
    percentValue: percent,
    description: `ダメージ計算時、${STAT_LABELS[sourceStat]}の${percent}%をATKに加算`,
  };
}

// クリティカルダメージはダメージに対する割合ではなく(HP/MP/ATK/DEF/SPD)のn%に対する割合で計算する
export function generateCritDamageStatBasedEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  const sourceStats: StatKey[] = ["hp", "mp", "attack", "defense", "speed"];
  const sourceStat = pickOne(sourceStats, rng);
  const scale = RARITY_VALUE_SCALE[rarity];

  let basePercent: number;
  switch (sourceStat) {
    case "hp":
      basePercent = randomInt(3, 6, rng);
      break;
    case "mp":
      basePercent = randomInt(4, 8, rng);
      break;
    case "attack":
      basePercent = randomInt(10, 20, rng);
      break;
    case "defense":
      basePercent = randomInt(8, 15, rng);
      break;
    case "speed":
      basePercent = randomInt(6, 12, rng);
      break;
  }

  const percent = Math.round(basePercent * scale);

  return {
    id: createId("att-effect"),
    category: "calculation",
    type: "critDamageStatBased",
    sourceStat,
    percentValue: percent,
    description: `クリティカルダメージを${STAT_LABELS[sourceStat]}の${percent}%基準で計算`,
  };
}

// 回復量計算時、(HP/MP/ATK/DEF/SPD)のn%を加算
export function generateHealAddStatEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  const sourceStats: StatKey[] = ["hp", "mp", "attack", "defense", "speed"];
  const sourceStat = pickOne(sourceStats, rng);
  const scale = RARITY_VALUE_SCALE[rarity];

  let basePercent: number;
  switch (sourceStat) {
    case "hp":
      basePercent = randomInt(2, 5, rng);
      break;
    case "mp":
      basePercent = randomInt(3, 6, rng);
      break;
    case "attack":
      basePercent = randomInt(5, 10, rng);
      break;
    case "defense":
      basePercent = randomInt(4, 8, rng);
      break;
    case "speed":
      basePercent = randomInt(3, 7, rng);
      break;
  }

  const percent = Math.round(basePercent * scale);

  return {
    id: createId("att-effect"),
    category: "calculation",
    type: "healAddStat",
    sourceStat,
    percentValue: percent,
    description: `回復量に${STAT_LABELS[sourceStat]}の${percent}%を加算`,
  };
}

// 敵味方両方のダメージ計算時、DEFを計算に入れないようにする
export function generateIgnoreDefEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  return {
    id: createId("att-effect"),
    category: "calculation",
    type: "ignoreDef",
    description: `敵味方両方のダメージ計算時、DEFを無視`,
  };
}

// 敵のHPが低いほどダメージ上昇
export function generateLowHpDamageUpEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  return {
    id: createId("att-effect"),
    category: "calculation",
    type: "lowHpDamageUp",
    description: `敵のHPが低いほどダメージ上昇`,
  };
}

// ====================
// ルール書き換え効果
// ====================

// 1ターンに同じスキルを2回使える(MPも2回消費)
export function generateDoubleSkillUseEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  return {
    id: createId("att-effect"),
    category: "ruleOverride",
    type: "doubleSkillUse",
    description: `1ターンに同じスキルを2回使える(MPも2回消費)`,
  };
}

// 戦闘不能時に1回だけ行動できる
export function generateDeathActionEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  return {
    id: createId("att-effect"),
    category: "ruleOverride",
    type: "deathAction",
    description: `戦闘不能時に1回だけ行動できる`,
  };
}

// 2回行動を可能にする(厳しい条件付きで)
export function generateDoubleActionEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  return {
    id: createId("att-effect"),
    category: "ruleOverride",
    type: "doubleAction",
    description: `2回行動を可能にする(厳しい条件付き)`,
  };
}

// 受けたダメージを次のターンまで遅延させる(即死しない)
export function generateDamageDelayEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  return {
    id: createId("att-effect"),
    category: "ruleOverride",
    type: "damageDelay",
    description: `受けたダメージを次のターンまで遅延させる(即死しない)`,
  };
}

// HP1以下になるダメージを全てHP1で止める(1回のみ)
export function generateHp1ProtectionEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  return {
    id: createId("att-effect"),
    category: "ruleOverride",
    type: "hp1Protection",
    description: `HP1以下になるダメージを全てHP1で止める(1回のみ)`,
  };
}

// 回復時にそのn%のダメージを敵に与える
export function generateHealToDamageEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  const scale = RARITY_VALUE_SCALE[rarity];
  const basePercent = randomInt(20, 50, rng);
  const percent = Math.round(basePercent * scale);

  return {
    id: createId("att-effect"),
    category: "ruleOverride",
    type: "healToDamage",
    ruleValue: percent,
    description: `回復時にその${percent}%のダメージを敵に与える`,
  };
}

// ダメージを先にMPで受ける(MPがなくなったらHPが減る)
export function generateMpFirstDamageEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  return {
    id: createId("att-effect"),
    category: "ruleOverride",
    type: "mpFirstDamage",
    description: `ダメージを先にMPで受ける(MPがなくなったらHPが減る)`,
  };
}

// MP不足時、HPをn%消費する
export function generateMpShortageHpEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  const scale = RARITY_VALUE_SCALE[rarity];
  const basePercent = randomInt(30, 60, rng);
  const percent = Math.min(100, Math.round(basePercent * scale));

  return {
    id: createId("att-effect"),
    category: "ruleOverride",
    type: "mpShortageHp",
    ruleValue: percent,
    description: `MP不足時、HPを${percent}%消費する`,
  };
}

// 死亡後「幽霊状態」となり次の1ターンだけ行動可能
export function generateGhostStateEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  return {
    id: createId("att-effect"),
    category: "ruleOverride",
    type: "ghostState",
    description: `死亡後「幽霊状態」となり次の1ターンだけ行動可能`,
  };
}

// 攻撃時、自身のバフの残りターン数を消費してダメージn%上昇
export function generateBuffConsumeDamageEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  const scale = RARITY_VALUE_SCALE[rarity];
  const basePercent = randomInt(15, 30, rng);
  const percent = Math.round(basePercent * scale);

  return {
    id: createId("att-effect"),
    category: "ruleOverride",
    type: "buffConsumeDamage",
    ruleValue: percent,
    description: `攻撃時、自身のバフの残りターン数を消費してダメージ${percent}%上昇`,
  };
}

// デバフを受けたターンは攻撃力がn%増加
export function generateDebuffAttackUpEffect(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentEffect {
  const scale = RARITY_VALUE_SCALE[rarity];
  const basePercent = randomInt(20, 40, rng);
  const percent = Math.round(basePercent * scale);

  return {
    id: createId("att-effect"),
    category: "ruleOverride",
    type: "debuffAttackUp",
    ruleValue: percent,
    description: `デバフを受けたターンは攻撃力が${percent}%増加`,
  };
}

// ====================
// 全効果ジェネレーターリスト
// ====================

export const ALL_EFFECT_GENERATORS = [
  // ステータス増減
  generateStatFlatEffect,
  generateStatPercentEffect,
  generateStatTradeOffEffect,
  generateAllStatsPercentEffect,
  generateHpDownAllUpEffect,
  generateCritDamageUpEffect,
  // スキルパラメータ
  generateSkillPowerUpEffect,
  generateSkillElementUpEffect,
  generateSkillMpCostFlatEffect,
  generateSkillMpCostPercentEffect,
  generateSkillTagMpCostEffect,
  // 確率操作
  generateCritRateUpEffect,
  generateAllProbabilityUpEffect,
  generateAllProbabilityMultEffect,
  generateCritRateCritDamageConvertEffect,
  generateEvasionNextSureHitEffect,
  generateHighProbGuaranteeEffect,
  generateDoubleRollEffect,
  generateCritGuaranteesProbEffect,
  // 計算式介入
  generateStatToAttackEffect,
  generateCritDamageStatBasedEffect,
  generateHealAddStatEffect,
  generateIgnoreDefEffect,
  generateLowHpDamageUpEffect,
  // ルール書き換え
  generateDoubleSkillUseEffect,
  generateDeathActionEffect,
  generateDoubleActionEffect,
  generateDamageDelayEffect,
  generateHp1ProtectionEffect,
  generateHealToDamageEffect,
  generateMpFirstDamageEffect,
  generateMpShortageHpEffect,
  generateGhostStateEffect,
  generateBuffConsumeDamageEffect,
  generateDebuffAttackUpEffect,
];

// カテゴリ別ジェネレーター
export const EFFECT_GENERATORS_BY_CATEGORY: Record<
  AttachmentEffect["category"],
  ((rarity: AttachmentRarity, rng: RandomFn) => AttachmentEffect)[]
> = {
  statBoost: [
    generateStatFlatEffect,
    generateStatPercentEffect,
    generateStatTradeOffEffect,
    generateAllStatsPercentEffect,
    generateHpDownAllUpEffect,
    generateCritDamageUpEffect,
  ],
  skillParam: [
    generateSkillPowerUpEffect,
    generateSkillElementUpEffect,
    generateSkillMpCostFlatEffect,
    generateSkillMpCostPercentEffect,
    generateSkillTagMpCostEffect,
  ],
  probability: [
    generateCritRateUpEffect,
    generateAllProbabilityUpEffect,
    generateAllProbabilityMultEffect,
    generateCritRateCritDamageConvertEffect,
    generateEvasionNextSureHitEffect,
    generateHighProbGuaranteeEffect,
    generateDoubleRollEffect,
    generateCritGuaranteesProbEffect,
  ],
  calculation: [
    generateStatToAttackEffect,
    generateCritDamageStatBasedEffect,
    generateHealAddStatEffect,
    generateIgnoreDefEffect,
    generateLowHpDamageUpEffect,
  ],
  ruleOverride: [
    generateDoubleSkillUseEffect,
    generateDeathActionEffect,
    generateDoubleActionEffect,
    generateDamageDelayEffect,
    generateHp1ProtectionEffect,
    generateHealToDamageEffect,
    generateMpFirstDamageEffect,
    generateMpShortageHpEffect,
    generateGhostStateEffect,
    generateBuffConsumeDamageEffect,
    generateDebuffAttackUpEffect,
  ],
};

// ランクによる効果出現確率
export function getEffectCategoryChanceByRarity(
  rarity: AttachmentRarity,
  category: AttachmentEffect["category"],
): number {
  const baseChances: Record<AttachmentEffect["category"], number> = {
    statBoost: 1.0,      // 常に出現
    skillParam: 0.7,
    probability: 0.5,
    calculation: 0.4,
    ruleOverride: 0.3,
  };

  // ランクによる補正
  const rarityMultiplier: Record<AttachmentRarity, number> = {
    C: 0.3,
    B: 0.5,
    A: 0.7,
    S: 1.0,
    SS: 1.3,
    SSS: 1.6,
  };

  // 高ランクほど複雑な効果が出現しやすい
  const complexityBonus: Record<AttachmentEffect["category"], number> = {
    statBoost: 0,
    skillParam: 0.1,
    probability: 0.15,
    calculation: 0.2,
    ruleOverride: 0.25,
  };

  const base = baseChances[category];
  const multiplier = rarityMultiplier[rarity];
  const bonus = complexityBonus[category] * (rarityMultiplier[rarity] - 0.5);

  return Math.min(1, base * multiplier + bonus);
}
