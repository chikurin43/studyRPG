import type {
  Attachment,
  AttachmentEffect,
  AttachmentCombatState,
  AttachmentCondition,
  StatKey,
  Element,
} from "@/types/game";
import type { CombatantState } from "./gameRules";

export type RandomFn = () => number;

// 空のAttachmentCombatStateを生成
export function createEmptyAttachmentCombatState(): AttachmentCombatState {
  return {
    // ステータス増減
    statBoosts: { flat: { hp: 0, mp: 0, attack: 0, defense: 0, speed: 0 }, percent: { hp: 0, mp: 0, attack: 0, defense: 0, speed: 0 } },
    critDamageBonus: 0,
    // スキルパラメータ
    skillPowerBoost: 0,
    elementSkillBoost: { physical: 0, fire: 0, ice: 0, lightning: 0 },
    mpCostReduction: 0,
    tagMpCostReduction: {},
    // 確率操作
    critRateBonus: 0,
    allProbabilityBonus: 0,
    allProbabilityMultiplier: 1,
    evasionNextSureHit: false,
    highProbabilityThreshold: 100,
    doubleRollEnabled: false,
    critGuaranteesProbability: false,
    // 計算式介入
    statToAttackPct: {},
    critDamageStatBased: null,
    healAddStatPct: {},
    ignoreDef: false,
    lowHpDamageUp: false,
    // ルール書き換え
    doubleSkillUse: false,
    deathAction: false,
    doubleAction: false,
    damageDelay: false,
    hp1Protection: false,
    healToDamagePct: 0,
    mpFirstDamage: false,
    mpShortageHpCost: 0,
    ghostState: false,
    buffConsumeDamagePct: 0,
    debuffAttackUpPct: 0,
  };
}

// 条件評価関数
export function evaluateCondition(
  condition: AttachmentCondition,
  context: {
    monsterHpPercent: number;
    monsterMpPercent: number;
    enemyHpPercent: number;
    currentTurn: number;
    isBeforeEnemy: boolean;
    attackCountThisTurn: number;
    consecutiveSameSkillCount: number;
    consecutiveNormalAttackCount: number;
    consecutiveMpConsumeCount: number;
    lastSkillElement?: Element;
    consecutiveSameElementCount: number;
    tookDamageLastEnemyTurn: boolean;
    enemyHasStatus: boolean;
    enemyStatusType?: string;
    selfHasStatus: boolean;
    selfStatusType?: string;
  },
): boolean {
  switch (condition.type) {
    // リソース系
    case "hpBelow":
      return context.monsterHpPercent <= (condition.threshold ?? 50);
    case "hpAbove":
      return context.monsterHpPercent >= (condition.threshold ?? 80);
    case "mpZero":
      return context.monsterMpPercent === 0;
    case "mpBelow":
      return context.monsterMpPercent <= (condition.threshold ?? 50);
    case "mpAbove":
      return context.monsterMpPercent >= (condition.threshold ?? 50);
    case "mpCostHpInstead":
      // 常に評価時に適用（消費時のフラグとして使用）
      return true;

    // 状態系
    case "enemyHasStatus":
      return context.enemyHasStatus;
    case "enemyHasSpecificStatus":
      return context.enemyHasStatus && context.enemyStatusType === condition.statusType;
    case "nullifiedStatus":
      // 状態異常を解除したターンのみtrue（外部で管理）
      return false; // デフォルトはfalse、イベント駆動で更新
    case "sameStatusAsEnemy":
      return context.selfHasStatus && context.enemyHasStatus && context.selfStatusType === context.enemyStatusType;
    case "sameElementChain":
      return context.consecutiveSameElementCount >= (condition.value ?? 3);

    // 行動系
    case "actBeforeEnemy":
      return context.isBeforeEnemy;
    case "actAfterEnemy":
      return !context.isBeforeEnemy;
    case "secondAttackOnward":
      return context.attackCountThisTurn >= 2;
    case "mpConsumeChain":
      return context.consecutiveMpConsumeCount >= (condition.value ?? 3);
    case "normalAttackChain":
      return context.consecutiveNormalAttackCount >= (condition.value ?? 3);
    case "sameSkillChain":
      return context.consecutiveSameSkillCount >= (condition.value ?? 3);

    // ターン系
    case "turnWithin":
      return context.currentTurn <= (condition.threshold ?? 3);
    case "turnAfter":
      return context.currentTurn >= (condition.threshold ?? 5);
    case "turnEven":
      return context.currentTurn % 2 === 0;
    case "turnOdd":
      return context.currentTurn % 2 === 1;
    case "noDamageLastTurn":
      return !context.tookDamageLastEnemyTurn;

    default:
      return false;
  }
}

// アタッチメントリストから戦闘状態を計算
export function calculateAttachmentCombatState(
  attachments: Attachment[],
  context: {
    monsterHpPercent: number;
    monsterMpPercent: number;
    enemyHpPercent: number;
    currentTurn: number;
    isBeforeEnemy: boolean;
    attackCountThisTurn: number;
    consecutiveSameSkillCount: number;
    consecutiveNormalAttackCount: number;
    consecutiveMpConsumeCount: number;
    lastSkillElement?: Element;
    consecutiveSameElementCount: number;
    tookDamageLastEnemyTurn: boolean;
    enemyHasStatus: boolean;
    enemyStatusType?: string;
    selfHasStatus: boolean;
    selfStatusType?: string;
  },
): AttachmentCombatState {
  const state = createEmptyAttachmentCombatState();

  attachments.forEach((attachment) => {
    attachment.effects.forEach((effect) => {
      // 条件評価
      let conditionMet = true;
      if (effect.condition) {
        conditionMet = evaluateCondition(effect.condition, context);
      }

      if (!conditionMet) return;

      // 効果を適用
      applyEffectToState(state, effect);
    });
  });

  // MPコスト削減の上限は100%
  state.mpCostReduction = Math.min(100, state.mpCostReduction);

  return state;
}

// 個別の効果を状態に適用
function applyEffectToState(state: AttachmentCombatState, effect: AttachmentEffect): void {
  switch (effect.type) {
    // ステータス増減
    case "statFlat":
      if (effect.stat && effect.flatValue) {
        state.statBoosts.flat[effect.stat] += effect.flatValue;
      }
      break;
    case "statPercent":
      if (effect.stat && effect.percentValue) {
        state.statBoosts.percent[effect.stat] += effect.percentValue;
      }
      break;
    case "statTradeOff":
      if (effect.stat && effect.flatValue) {
        state.statBoosts.flat[effect.stat] += effect.flatValue;
      }
      if (effect.statSecondary && effect.percentValue) {
        state.statBoosts.flat[effect.statSecondary] -= effect.percentValue;
      }
      break;
    case "allStatsPercent":
      if (effect.percentValue) {
        state.statBoosts.percent.attack += effect.percentValue;
        state.statBoosts.percent.defense += effect.percentValue;
        state.statBoosts.percent.speed += effect.percentValue;
      }
      break;
    case "hpDownAllUp":
      if (effect.percentValue && effect.skillPowerBoost) {
        state.statBoosts.percent.hp -= effect.percentValue;
        state.statBoosts.percent.attack += effect.skillPowerBoost;
        state.statBoosts.percent.defense += effect.skillPowerBoost;
        state.statBoosts.percent.speed += effect.skillPowerBoost;
      }
      break;
    case "critDamageUp":
      if (effect.percentValue) {
        state.critDamageBonus += effect.percentValue;
      }
      break;

    // スキルパラメータ
    case "skillPowerUp":
      if (effect.skillPowerBoost) {
        state.skillPowerBoost += effect.skillPowerBoost;
      }
      break;
    case "skillElementUp":
      if (effect.element && effect.skillPowerBoost) {
        state.elementSkillBoost[effect.element] += effect.skillPowerBoost;
      }
      break;
    case "skillMpCostFlat":
    case "skillMpCostPercent":
      if (effect.mpCostReduction) {
        state.mpCostReduction += effect.mpCostReduction;
      }
      break;
    case "skillTagMpCost":
      if (effect.tag && effect.mpCostReduction) {
        state.tagMpCostReduction[effect.tag] = (state.tagMpCostReduction[effect.tag] || 0) + effect.mpCostReduction;
      }
      break;

    // 確率操作
    case "critRateUp":
      if (effect.probabilityValue) {
        state.critRateBonus += effect.probabilityValue;
      }
      break;
    case "allProbabilityUp":
      if (effect.probabilityValue) {
        state.allProbabilityBonus += effect.probabilityValue;
      }
      break;
    case "allProbabilityMult":
      if (effect.probabilityValue) {
        state.allProbabilityMultiplier *= effect.probabilityValue;
      }
      break;
    case "critRateCritDamageConvert":
      // 戦闘開始時にクリティカル率とダメージを変換（別途処理）
      break;
    case "evasionNextSureHit":
      state.evasionNextSureHit = true;
      break;
    case "highProbGuarantee":
      if (effect.probabilityThreshold) {
        state.highProbabilityThreshold = Math.min(state.highProbabilityThreshold, effect.probabilityThreshold);
      }
      break;
    case "doubleRoll":
      state.doubleRollEnabled = true;
      break;
    case "critGuaranteesProb":
      state.critGuaranteesProbability = true;
      break;

    // 計算式介入
    case "statToAttack":
      if (effect.sourceStat && effect.percentValue) {
        state.statToAttackPct[effect.sourceStat] = (state.statToAttackPct[effect.sourceStat] || 0) + effect.percentValue;
      }
      break;
    case "critDamageStatBased":
      if (effect.sourceStat && effect.percentValue) {
        state.critDamageStatBased = {
          enabled: true,
          sourceStat: effect.sourceStat,
          percent: effect.percentValue,
        };
      }
      break;
    case "healAddStat":
      if (effect.sourceStat && effect.percentValue) {
        state.healAddStatPct[effect.sourceStat] = (state.healAddStatPct[effect.sourceStat] || 0) + effect.percentValue;
      }
      break;
    case "ignoreDef":
      state.ignoreDef = true;
      break;
    case "lowHpDamageUp":
      state.lowHpDamageUp = true;
      break;

    // ルール書き換え
    case "doubleSkillUse":
      state.doubleSkillUse = true;
      break;
    case "deathAction":
      state.deathAction = true;
      break;
    case "doubleAction":
      state.doubleAction = true;
      break;
    case "damageDelay":
      state.damageDelay = true;
      break;
    case "hp1Protection":
      state.hp1Protection = true;
      break;
    case "healToDamage":
      if (effect.ruleValue) {
        state.healToDamagePct += effect.ruleValue;
      }
      break;
    case "mpFirstDamage":
      state.mpFirstDamage = true;
      break;
    case "mpShortageHp":
      if (effect.ruleValue) {
        state.mpShortageHpCost = effect.ruleValue;
      }
      break;
    case "ghostState":
      state.ghostState = true;
      break;
    case "buffConsumeDamage":
      if (effect.ruleValue) {
        state.buffConsumeDamagePct += effect.ruleValue;
      }
      break;
    case "debuffAttackUp":
      if (effect.ruleValue) {
        state.debuffAttackUpPct += effect.ruleValue;
      }
      break;
  }
}

// CombatantStateにアタッチメント効果を適用
export function applyAttachmentToCombatant(
  combatant: CombatantState,
  attachmentState: AttachmentCombatState,
): CombatantState {
  // ステータス増減を適用
  const modifiedCombatant = { ...combatant };

  // 固定値増減
  modifiedCombatant.maxHp += attachmentState.statBoosts.flat.hp;
  modifiedCombatant.maxMp += attachmentState.statBoosts.flat.mp;
  modifiedCombatant.attack += attachmentState.statBoosts.flat.attack;
  modifiedCombatant.defense += attachmentState.statBoosts.flat.defense;
  modifiedCombatant.speed += attachmentState.statBoosts.flat.speed;

  // 割合増減（基準値に対して適用）
  const baseHp = modifiedCombatant.maxHp - attachmentState.statBoosts.flat.hp;
  const baseMp = modifiedCombatant.maxMp - attachmentState.statBoosts.flat.mp;
  const baseAttack = modifiedCombatant.attack - attachmentState.statBoosts.flat.attack;
  const baseDefense = modifiedCombatant.defense - attachmentState.statBoosts.flat.defense;
  const baseSpeed = modifiedCombatant.speed - attachmentState.statBoosts.flat.speed;

  modifiedCombatant.maxHp = Math.round(baseHp * (1 + attachmentState.statBoosts.percent.hp / 100)) + attachmentState.statBoosts.flat.hp;
  modifiedCombatant.maxMp = Math.round(baseMp * (1 + attachmentState.statBoosts.percent.mp / 100)) + attachmentState.statBoosts.flat.mp;
  modifiedCombatant.attack = Math.round(baseAttack * (1 + attachmentState.statBoosts.percent.attack / 100)) + attachmentState.statBoosts.flat.attack;
  modifiedCombatant.defense = Math.round(baseDefense * (1 + attachmentState.statBoosts.percent.defense / 100)) + attachmentState.statBoosts.flat.defense;
  modifiedCombatant.speed = Math.round(baseSpeed * (1 + attachmentState.statBoosts.percent.speed / 100)) + attachmentState.statBoosts.flat.speed;

  // HP/MPは最大値を超えないように調整
  modifiedCombatant.hp = Math.min(modifiedCombatant.hp, modifiedCombatant.maxHp);
  modifiedCombatant.mp = Math.min(modifiedCombatant.mp, modifiedCombatant.maxMp);

  // クリティカル関連
  modifiedCombatant.criticalRate += attachmentState.critRateBonus;
  modifiedCombatant.criticalDamage += attachmentState.critDamageBonus;

  // 属性ダメージ増加
  Object.keys(attachmentState.elementSkillBoost).forEach((element) => {
    const el = element as Element;
    modifiedCombatant.elementDamagePct[el] += attachmentState.elementSkillBoost[el];
  });

  return modifiedCombatant;
}

// ダメージ計算にアタッチメント効果を適用
export function applyAttachmentToDamage(
  baseDamage: number,
  attacker: CombatantState,
  defender: CombatantState,
  attachmentState: AttachmentCombatState,
  defenderHpPercent: number,
  isCritical: boolean,
): number {
  let damage = baseDamage;

  // statToAttack効果は既にattackに加算されているので、damage計算には影響済み

  // クリティカルダメージの特殊計算
  if (isCritical && attachmentState.critDamageStatBased?.enabled) {
    const { sourceStat, percent } = attachmentState.critDamageStatBased;
    const sourceValue = attacker[sourceStat];
    const statBasedDamage = sourceValue * (percent / 100);
    // 通常のクリティカル計算を上書き
    damage = Math.round(statBasedDamage);
  }

  // 敵のHPが低いほどダメージ上昇
  if (attachmentState.lowHpDamageUp) {
    // 敵HPが0%に近いほどダメージ増加（最大50%増加）
    const hpRatio = (100 - defenderHpPercent) / 100;
    const damageBonus = 1 + hpRatio * 0.5;
    damage = Math.round(damage * damageBonus);
  }

  // デバフ時攻撃力増加（attackerのバフ値を参照）
  if (attachmentState.debuffAttackUpPct > 0) {
    // デバフを受けているかどうかは外部で判定
    // この関数では単純に攻撃力が既に増加していることを前提とする
  }

  return damage;
}

// MPコストにアタッチメント効果を適用
export function applyAttachmentToMpCost(
  baseMpCost: number,
  skillElement: Element,
  skillTags: string[],
  attachmentState: AttachmentCombatState,
): number {
  let mpCost = baseMpCost;

  // 基本MPコスト削減
  mpCost = Math.round(mpCost * (1 - attachmentState.mpCostReduction / 100));

  // タグ別MPコスト削減
  skillTags.forEach((tag) => {
    const tagReduction = attachmentState.tagMpCostReduction[tag] || 0;
    mpCost = Math.round(mpCost * (1 - tagReduction / 100));
  });

  // タグ別固定値削減（もしあれば）
  skillTags.forEach((tag) => {
    const tagFlatReduction = attachmentState.tagMpCostReduction[tag];
    if (tagFlatReduction && tagFlatReduction < 20) {
      // 20以下は固定値削減と見なす
      mpCost -= tagFlatReduction;
    }
  });

  return Math.max(0, mpCost);
}

// 確率判定にアタッチメント効果を適用
export function applyAttachmentToProbability(
  baseProbability: number,
  attachmentState: AttachmentCombatState,
  isCritical: boolean,
  rng: RandomFn,
): { finalProbability: number; isGuaranteed: boolean } {
  let probability = baseProbability;

  // 全確率ボーナス
  probability += attachmentState.allProbabilityBonus;

  // 全確率倍率
  probability *= attachmentState.allProbabilityMultiplier;

  // 高確率確定発動
  if (probability >= attachmentState.highProbabilityThreshold) {
    return { finalProbability: 100, isGuaranteed: true };
  }

  // クリティカル時確定発動
  if (isCritical && attachmentState.critGuaranteesProbability) {
    return { finalProbability: 100, isGuaranteed: true };
  }

  // 2回振って有利採用
  if (attachmentState.doubleRollEnabled) {
    const roll1 = rng() * 100;
    const roll2 = rng() * 100;
    // 判定に通る方を採用（有利な方）
    const betterRoll = Math.min(roll1, roll2);
    return { finalProbability: probability, isGuaranteed: betterRoll < probability };
  }

  return { finalProbability: probability, isGuaranteed: false };
}

// 受けるダメージにアタッチメント効果を適用（防御側）
export function applyAttachmentToIncomingDamage(
  damage: number,
  defender: CombatantState,
  attachmentState: AttachmentCombatState,
  currentHp: number,
): {
  finalDamage: number;
  delayedDamage: number;
  hpProtected: boolean;
  mpDamage: number;
  hpDamage: number;
} {
  let finalDamage = damage;
  let delayedDamage = 0;
  let hpProtected = false;
  let mpDamage = 0;
  let hpDamage = 0;

  // MPで先に受ける
  if (attachmentState.mpFirstDamage) {
    const mpPool = defender.mp;
    if (mpPool >= finalDamage) {
      mpDamage = finalDamage;
      finalDamage = 0;
    } else {
      mpDamage = mpPool;
      finalDamage -= mpPool;
    }
  }

  // HP1保護
  if (attachmentState.hp1Protection && currentHp - finalDamage <= 0 && currentHp > 1) {
    finalDamage = currentHp - 1;
    hpProtected = true;
  }

  // ダメージ遅延
  if (attachmentState.damageDelay && finalDamage > 0) {
    // 即死はしない（残りHPより少ないダメージのみ遅延可能）
    if (currentHp - finalDamage > 0) {
      delayedDamage = finalDamage;
      finalDamage = 0;
    }
  }

  hpDamage = finalDamage;

  return { finalDamage, delayedDamage, hpProtected, mpDamage, hpDamage };
}

// スキル威力にアタッチメント効果を適用
export function applyAttachmentToSkillPower(
  basePowerPct: number,
  skillElement: Element,
  attachmentState: AttachmentCombatState,
): number {
  let power = basePowerPct;

  // 基礎効果増加
  power += attachmentState.skillPowerBoost;

  // 属性別効果増加
  power += attachmentState.elementSkillBoost[skillElement];

  return power;
}

// クリティカル率とダメージの1:2変換
export function convertCritRateAndDamage(
  critRate: number,
  critDamage: number,
): { critRate: number; critDamage: number } {
  // (Cダメ - 100%) / 2 = 追加C率
  const damageOver100 = critDamage - 100;
  if (damageOver100 <= 0) return { critRate, critDamage };

  const bonusRate = Math.floor(damageOver100 / 2);
  const newCritRate = critRate + bonusRate;
  const newCritDamage = 100 + (damageOver100 % 2);

  return { critRate: newCritRate, critDamage: newCritDamage };
}

// 回復量にアタッチメント効果を適用
export function applyAttachmentToHeal(
  baseHeal: number,
  healer: CombatantState,
  attachmentState: AttachmentCombatState,
): { healAmount: number; damageToEnemy: number } {
  let heal = baseHeal;

  // ステータス加算
  Object.keys(attachmentState.healAddStatPct).forEach((stat) => {
    const statKey = stat as StatKey;
    const percent = attachmentState.healAddStatPct[statKey] || 0;
    heal += healer[statKey] * (percent / 100);
  });

  heal = Math.round(heal);

  // 回復時ダメージ
  const damageToEnemy = Math.round(heal * (attachmentState.healToDamagePct / 100));

  return { healAmount: heal, damageToEnemy };
}
