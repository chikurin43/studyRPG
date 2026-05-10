import type {
  AttachmentCondition,
  AttachmentConditionType,
  AttachmentRarity,
  StatKey,
  Element,
  StatusEffectType,
} from "@/types/game";

export type RandomFn = () => number;

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

// ====================
// リソース系条件
// ====================

// HPn%以下のとき
export function generateHpBelowCondition(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentCondition {
  const thresholds = [20, 30, 40, 50];
  const threshold = pickOne(thresholds, rng);

  return {
    type: "hpBelow",
    threshold,
    description: `HP${threshold}%以下のとき`,
  };
}

// HPn%以上のとき
export function generateHpAboveCondition(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentCondition {
  const thresholds = [70, 80, 90];
  const threshold = pickOne(thresholds, rng);

  return {
    type: "hpAbove",
    threshold,
    description: `HP${threshold}%以上のとき`,
  };
}

// MP0のとき
export function generateMpZeroCondition(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentCondition {
  return {
    type: "mpZero",
    description: `MP0のとき`,
  };
}

// MPがn%以下のとき
export function generateMpBelowCondition(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentCondition {
  const thresholds = [20, 30, 50];
  const threshold = pickOne(thresholds, rng);

  return {
    type: "mpBelow",
    threshold,
    description: `MP${threshold}%以下のとき`,
  };
}

// MPがn%以上のとき
export function generateMpAboveCondition(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentCondition {
  const thresholds = [50, 70, 80];
  const threshold = pickOne(thresholds, rng);

  return {
    type: "mpAbove",
    threshold,
    description: `MP${threshold}%以上のとき`,
  };
}

// MP消費時にHPも消費する代わりに
export function generateMpCostHpInsteadCondition(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentCondition {
  return {
    type: "mpCostHpInstead",
    description: `MP消費時にHPも消費する代わりに`,
  };
}

// ====================
// 状態系条件
// ====================

// 状態異常の敵を攻撃したとき
export function generateEnemyHasStatusCondition(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentCondition {
  return {
    type: "enemyHasStatus",
    description: `状態異常の敵を攻撃したとき`,
  };
}

// [特定の状態異常]の敵を攻撃したとき
export function generateEnemyHasSpecificStatusCondition(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentCondition {
  const statuses: StatusEffectType[] = [
    "burn",
    "shock",
    "frostbite",
    "stun",
    "slow",
    "defenseDown",
    "darkness",
    "seal",
    "bleed",
  ];
  const statusType = pickOne(statuses, rng);

  return {
    type: "enemyHasSpecificStatus",
    statusType,
    description: `${STATUS_LABELS[statusType]}状態の敵を攻撃したとき`,
  };
}

// 状態異常を無効化(解除)したとき
export function generateNullifiedStatusCondition(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentCondition {
  return {
    type: "nullifiedStatus",
    description: `状態異常を無効化(解除)したとき`,
  };
}

// 敵と自分の状態異常が同じ時
export function generateSameStatusAsEnemyCondition(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentCondition {
  return {
    type: "sameStatusAsEnemy",
    description: `敵と自分の状態異常が同じ時`,
  };
}

// 同じ属性の攻撃をn回連続で使用したとき
export function generateSameElementChainCondition(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentCondition {
  const counts = [2, 3, 4];
  const count = pickOne(counts, rng);

  return {
    type: "sameElementChain",
    value: count,
    description: `同じ属性の攻撃を${count}回連続で使用したとき`,
  };
}

// ====================
// 行動系条件
// ====================

// 敵より先に行動しているとき
export function generateActBeforeEnemyCondition(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentCondition {
  return {
    type: "actBeforeEnemy",
    description: `敵より先に行動しているとき`,
  };
}

// 敵より後に行動しているとき
export function generateActAfterEnemyCondition(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentCondition {
  return {
    type: "actAfterEnemy",
    description: `敵より後に行動しているとき`,
  };
}

// 同ターン内の2回目以降の攻撃のとき
export function generateSecondAttackOnwardCondition(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentCondition {
  return {
    type: "secondAttackOnward",
    description: `同ターン内の2回目以降の攻撃のとき`,
  };
}

// MPをn回以上連続で消費しているとき
export function generateMpConsumeChainCondition(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentCondition {
  const counts = [2, 3, 4];
  const count = pickOne(counts, rng);

  return {
    type: "mpConsumeChain",
    value: count,
    description: `MPを${count}回以上連続で消費しているとき`,
  };
}

// 通常攻撃をn回以上連続で行っているとき
export function generateNormalAttackChainCondition(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentCondition {
  const counts = [2, 3, 4];
  const count = pickOne(counts, rng);

  return {
    type: "normalAttackChain",
    value: count,
    description: `通常攻撃を${count}回以上連続で行っているとき`,
  };
}

// nターン連続で同じスキルを使用しているとき
export function generateSameSkillChainCondition(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentCondition {
  const counts = [2, 3, 4];
  const count = pickOne(counts, rng);

  return {
    type: "sameSkillChain",
    value: count,
    description: `${count}ターン連続で同じスキルを使用しているとき`,
  };
}

// ====================
// ターン系条件
// ====================

// 戦闘開始nターン以内なら
export function generateTurnWithinCondition(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentCondition {
  const turns = [2, 3, 4, 5];
  const turn = pickOne(turns, rng);

  return {
    type: "turnWithin",
    threshold: turn,
    description: `戦闘開始${turn}ターン以内なら`,
  };
}

// 戦闘開始nターン以降なら
export function generateTurnAfterCondition(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentCondition {
  const turns = [4, 6, 8, 10];
  const turn = pickOne(turns, rng);

  return {
    type: "turnAfter",
    threshold: turn,
    description: `戦闘開始${turn}ターン以降なら`,
  };
}

// 偶数ターンのとき
export function generateTurnEvenCondition(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentCondition {
  return {
    type: "turnEven",
    description: `偶数ターンのとき`,
  };
}

// 奇数ターンのとき
export function generateTurnOddCondition(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentCondition {
  return {
    type: "turnOdd",
    description: `奇数ターンのとき`,
  };
}

// 1つ前の敵のターンでダメージを受けなかったとき
export function generateNoDamageLastTurnCondition(
  rarity: AttachmentRarity,
  rng: RandomFn,
): AttachmentCondition {
  return {
    type: "noDamageLastTurn",
    description: `1つ前の敵のターンでダメージを受けなかったとき`,
  };
}

// ====================
// 全条件ジェネレーターリスト
// ====================

export const ALL_CONDITION_GENERATORS = [
  // リソース系
  generateHpBelowCondition,
  generateHpAboveCondition,
  generateMpZeroCondition,
  generateMpBelowCondition,
  generateMpAboveCondition,
  generateMpCostHpInsteadCondition,
  // 状態系
  generateEnemyHasStatusCondition,
  generateEnemyHasSpecificStatusCondition,
  generateNullifiedStatusCondition,
  generateSameStatusAsEnemyCondition,
  generateSameElementChainCondition,
  // 行動系
  generateActBeforeEnemyCondition,
  generateActAfterEnemyCondition,
  generateSecondAttackOnwardCondition,
  generateMpConsumeChainCondition,
  generateNormalAttackChainCondition,
  generateSameSkillChainCondition,
  // ターン系
  generateTurnWithinCondition,
  generateTurnAfterCondition,
  generateTurnEvenCondition,
  generateTurnOddCondition,
  generateNoDamageLastTurnCondition,
];

// カテゴリ別ジェネレーター
export const CONDITION_GENERATORS_BY_CATEGORY: Record<
  "resource" | "status" | "action" | "turn",
  ((rarity: AttachmentRarity, rng: RandomFn) => AttachmentCondition)[]
> = {
  resource: [
    generateHpBelowCondition,
    generateHpAboveCondition,
    generateMpZeroCondition,
    generateMpBelowCondition,
    generateMpAboveCondition,
    generateMpCostHpInsteadCondition,
  ],
  status: [
    generateEnemyHasStatusCondition,
    generateEnemyHasSpecificStatusCondition,
    generateNullifiedStatusCondition,
    generateSameStatusAsEnemyCondition,
    generateSameElementChainCondition,
  ],
  action: [
    generateActBeforeEnemyCondition,
    generateActAfterEnemyCondition,
    generateSecondAttackOnwardCondition,
    generateMpConsumeChainCondition,
    generateNormalAttackChainCondition,
    generateSameSkillChainCondition,
  ],
  turn: [
    generateTurnWithinCondition,
    generateTurnAfterCondition,
    generateTurnEvenCondition,
    generateTurnOddCondition,
    generateNoDamageLastTurnCondition,
  ],
};

// ランクによる条件出現確率
export function getConditionChanceByRarity(
  rarity: AttachmentRarity,
  category: "resource" | "status" | "action" | "turn",
): number {
  // 基本確率
  const baseChances: Record<typeof category, number> = {
    resource: 0.3,
    status: 0.25,
    action: 0.2,
    turn: 0.2,
  };

  // ランクによる補正
  const rarityMultiplier: Record<AttachmentRarity, number> = {
    C: 0,
    B: 0.2,
    A: 0.5,
    S: 1.0,
    SS: 1.4,
    SSS: 1.8,
  };

  // 高ランクほど複雑な条件が出現しやすい
  const complexityBonus: Record<typeof category, number> = {
    resource: 0.05,
    status: 0.1,
    action: 0.15,
    turn: 0.1,
  };

  const base = baseChances[category];
  const multiplier = rarityMultiplier[rarity];
  const bonus = complexityBonus[category] * multiplier;

  return Math.min(0.9, base * multiplier + bonus);
}

// 条件が複数つくとさらに効果が増加する倍率
export function getConditionMultiplier(conditionCount: number): number {
  if (conditionCount === 0) return 1;
  if (conditionCount === 1) return 1.3;
  if (conditionCount === 2) return 1.7;
  return 2.2; // 3つ以上
}
