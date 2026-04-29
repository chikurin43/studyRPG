import type {
  ActiveTimer,
  CombatGuardState,
  CombatProfile,
  CombatStatusState,
  CompletionReward,
  Element,
  Equipment,
  EquipmentActiveSkill,
  EquipmentPassiveSkill,
  EquippedSlots,
  EquipmentRarity,
  EquipmentSlot,
  LevelUpChoice,
  LevelUpChoiceSet,
  Monster,
  MonsterPerks,
  MonsterSkill,
  MonsterStats,
  PersistedGameState,
  RaidBoss,
  RaidBattleLogEntry,
  SimulatedRaidBattle,
  StatKey,
  StatusEffectType,
  Task,
  TimerBonusSnapshot,
} from "@/types/game";

export type RandomFn = () => number;

export type CombatantState = {
  actor: "monster" | "boss";
  name: string;
  maxHp: number;
  hp: number;
  maxMp: number;
  mp: number;
  attack: number;
  defense: number;
  speed: number;
  element: Element;
  statuses: CombatStatusState[];
  guard: CombatGuardState | null;
  elementDamagePct: Record<Element, number>;
  statusResistPct: Record<StatusEffectType, number>;
  mpRegenPct: number;
  raidDamagePct: number;
  attackBuffPct: number;
  defenseBuffPct: number;
  speedBuffPct: number;
  attackBuffTurns: number;
  defenseBuffTurns: number;
  speedBuffTurns: number;
  reflectPct: number;
  reflectElement: Element | null;
  reflectTurns: number;
  reflectMultiplier: number;
  criticalRate: number;
  criticalDamage: number;
  thresholdPassives: EquipmentPassiveSkill[];
};

type SkillBlueprint = {
  template: MonsterSkill["template"];
  target: MonsterSkill["target"];
  effectKey: MonsterSkill["effectKey"];
  createText: (valuePct: number) => string;
};

type ModifierBucket = {
  raidDamagePct: number;
  attackPct: number;
  defensePct: number;
  speedPct: number;
  taskRewardPct: number;
  expGainPct: number;
  energyGainPct: number;
  timerReductionPct: number;
};

type EquipmentPassiveBonuses = {
  statPct: Record<StatKey, number>;
  elementDamagePct: Record<Element, number>;
  statusResistPct: Record<StatusEffectType, number>;
  mpRegenPct: number;
  criticalRate: number;
  criticalDamage: number;
};

export type BattleAction = {
  kind: "basic" | "skill";
  name: string;
  element: Element;
  powerPct: number | null;
  mpCost: number;
  statusEffect: EquipmentActiveSkill["statusEffect"];
  guardEffect: EquipmentActiveSkill["guardEffect"];
  piercePct?: number;
  extraDamagePct?: number;
  threshold?: number;
  pierceBonusElement?: Element;
  multiplier?: number;
  durationTurns?: number;
  condition?: string;
  stackable?: boolean;
  reflectPct?: number;
  reflectMultiplier?: number;
  description?: string;
};

const ELEMENTS: Element[] = ["physical", "fire", "ice", "lightning"];
const STATUS_TYPES: StatusEffectType[] = ["burn", "shock", "frostbite", "stun", "slow", "defenseDown", "darkness", "seal", "bleed"];
const EQUIPMENT_SLOTS: EquipmentSlot[] = ["weapon", "armor", "relic"];
const RARITIES: EquipmentRarity[] = ["C", "B", "A", "S", "SS", "SSS"];

const ELEMENT_LABELS: Record<Element, string> = {
  physical: "物理",
  fire: "炎",
  ice: "氷",
  lightning: "雷",
};

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

const SLOT_LABELS: Record<EquipmentSlot, string> = {
  weapon: "武器",
  armor: "防具",
  relic: "遺物",
};

const RARITY_LABELS: Record<EquipmentRarity, string> = {
  C: "C",
  B: "B",
  A: "A",
  S: "S",
  SS: "SS",
  SSS: "SSS",
};

const BASE_LEVEL_UP_STAT_GAIN = {
  hp: 12,
  mp: 6,
  attack: 4,
  defense: 3,
  speed: 2,
} satisfies Record<StatKey, number>;

const STAT_CHOICE_LIBRARY = [
  { stat: "hp", amount: 20, label: "生命力を鍛える", detail: "HP +20" },
  { stat: "mp", amount: 10, label: "魔力の器を広げる", detail: "MP +10" },
  { stat: "attack", amount: 8, label: "攻撃のキレを磨く", detail: "Attack +8" },
  { stat: "defense", amount: 6, label: "守りを固める", detail: "Defense +6" },
  { stat: "speed", amount: 4, label: "動きを洗練する", detail: "Speed +4" },
] as const;

const SKILL_VALUE_POOL = [5, 10, 15, 20, 25, 30] as const;
const MAX_PERK_LEVEL = 3;
const LEVEL_CHOICE_REROLL_COST = 10;
const EQUIPMENT_SKILL_REROLL_COST = 12;
export const MAX_BATTLE_TURNS = 12;

const EMPTY_MODIFIERS: ModifierBucket = {
  raidDamagePct: 0,
  attackPct: 0,
  defensePct: 0,
  speedPct: 0,
  taskRewardPct: 0,
  expGainPct: 0,
  energyGainPct: 0,
  timerReductionPct: 0,
};

const EMPTY_STATS: MonsterStats = {
  hp: 0,
  mp: 0,
  attack: 0,
  defense: 0,
  speed: 0,
};

const EMPTY_PASSIVE_BONUSES: EquipmentPassiveBonuses = {
  statPct: {
    hp: 0,
    mp: 0,
    attack: 0,
    defense: 0,
    speed: 0,
  },
  elementDamagePct: {
    physical: 0,
    fire: 0,
    ice: 0,
    lightning: 0,
  },
  statusResistPct: {
    burn: 0,
    shock: 0,
    frostbite: 0,
    stun: 0,
    slow: 0,
    defenseDown: 0,
    darkness: 0,
    seal: 0,
    bleed: 0,
  },
  mpRegenPct: 0,
  criticalRate: 0,
  criticalDamage: 0,
};

const RARITY_MULTIPLIER: Record<EquipmentRarity, number> = {
  C: 1,
  B: 1.3,
  A: 1.65,
  S: 2.05,
  SS: 2.5,
  SSS: 3.0,
};

// ════════════════════════════════════════════════════════════
// ── New Skill Generation Constants from skill_gen.jsx ──────
// ════════════════════════════════════════════════════════════

const ATTR_PREFIX: Record<Element, string> = {
  physical: "鋼鉄の",
  fire: "紅蓮の",
  ice: "氷結の",
  lightning: "雷鳴の",
};

const RAR_SCALE: Record<EquipmentRarity, {
  dmgBase: number;
  dmgBonus: number;
  mulLo: number;
  mulHi: number;
  probMax: number;
  turnMax: number;
}> = {
  C: { dmgBase: 60, dmgBonus: 30, mulLo: 11, mulHi: 13, probMax: 30, turnMax: 2 },
  B: { dmgBase: 80, dmgBonus: 40, mulLo: 12, mulHi: 14, probMax: 40, turnMax: 2 },
  A: { dmgBase: 100, dmgBonus: 50, mulLo: 13, mulHi: 16, probMax: 55, turnMax: 3 },
  S: { dmgBase: 130, dmgBonus: 60, mulLo: 14, mulHi: 18, probMax: 65, turnMax: 3 },
  SS: { dmgBase: 160, dmgBonus: 70, mulLo: 16, mulHi: 22, probMax: 75, turnMax: 4 },
  SSS: { dmgBase: 220, dmgBonus: 100, mulLo: 20, mulHi: 30, probMax: 90, turnMax: 4 },
};

const PASS_SCALE: Record<EquipmentRarity, {
  flat: [number, number];
  cond: [number, number];
  prob: [number, number];
  condMul: [number, number];
}> = {
  C: { flat: [3, 6], cond: [6, 10], prob: [10, 20], condMul: [105, 115] },
  B: { flat: [5, 8], cond: [8, 13], prob: [15, 25], condMul: [108, 118] },
  A: { flat: [7, 11], cond: [10, 16], prob: [20, 35], condMul: [110, 125] },
  S: { flat: [9, 14], cond: [13, 20], prob: [25, 45], condMul: [115, 130] },
  SS: { flat: [12, 18], cond: [16, 25], prob: [30, 55], condMul: [120, 140] },
  SSS: { flat: [16, 25], cond: [20, 35], prob: [40, 70], condMul: [130, 150] },
};

const RAR_WEIGHTS: Record<EquipmentRarity, number> = { C: 20, B: 25, A: 25, S: 15, SS: 10, SSS: 5 };

// MP消費設計
const RAR_MP_MUL: Record<EquipmentRarity, number> = { C: 0.8, B: 0.9, A: 1.0, S: 1.2, SS: 1.5, SSS: 2.0 };

const MP_BASE: Record<"low" | "mid" | "midhigh" | "high" | "super", { min: number; max: number }> = {
  low: { min: 15, max: 25 },
  mid: { min: 25, max: 35 },
  midhigh: { min: 30, max: 45 },
  high: { min: 40, max: 55 },
  super: { min: 50, max: 70 },
};

// 状態異常定義
const STATUS_FX: Record<StatusEffectType, (rar: EquipmentRarity) => string> = {
  bleed: (rar) => {
    const v = randomInt(3, 4 + rarIndex(rar), Math.random);
    return `最大HPの${Math.min(v, 8)}%のダメージを毎ターン受ける`;
  },
  burn: (rar) => {
    const v = randomInt(8, 10 + rarIndex(rar) * 2, Math.random);
    return `相手の攻撃力の${Math.min(v, 20)}%相当のダメージを毎ターン受ける`;
  },
  shock: (rar) => {
    const v = randomInt(15, 20 + rarIndex(rar) * 3, Math.random);
    return `受けるダメージが${Math.min(v, 40)}%増加する`;
  },
  frostbite: (rar) => {
    const v = randomInt(15, 20 + rarIndex(rar) * 3, Math.random);
    return `攻撃力が${Math.min(v, 40)}%低下する`;
  },
  stun: () => `1ターン行動不能になる`,
  slow: (rar) => {
    const v = randomInt(20, 25 + rarIndex(rar) * 3, Math.random);
    return `素早さが${Math.min(v, 45)}%低下し行動順が後ろへずれる`;
  },
  defenseDown: (rar) => {
    const v = randomInt(15, 20 + rarIndex(rar) * 2, Math.random);
    return `防御力が${Math.min(v, 35)}%低下する`;
  },
  darkness: (rar) => {
    const v = randomInt(20, 25 + rarIndex(rar) * 3, Math.random);
    return `攻撃の命中率が${Math.min(v, 50)}%低下する`;
  },
  seal: () => `スキルが使用不可になる`,
};

const STATUSES_NORMAL: StatusEffectType[] = ["bleed", "burn", "shock", "frostbite", "slow", "defenseDown", "darkness", "seal"];
const STATUSES_ALL: StatusEffectType[] = [...STATUSES_NORMAL, "stun"];

// Helper functions for skill generation
function rarIndex(rar: EquipmentRarity): number {
  return ["C", "B", "A", "S", "SS", "SSS"].indexOf(rar);
}

function scaleDmg(rar: EquipmentRarity, ratio: number = 1, rng: RandomFn): number {
  const s = RAR_SCALE[rar];
  const base = s.dmgBase + Math.floor(randomInt(0, Math.floor(s.dmgBonus / 5), rng) * 5);
  return Math.round((base * ratio) / 5) * 5;
}

function scaleMul(rar: EquipmentRarity, extraHi: number = 0, rng: RandomFn): number {
  const s = RAR_SCALE[rar];
  return parseFloat((randomInt(s.mulLo * 10, (s.mulHi + extraHi * 10) * 10, rng) / 100).toFixed(1));
}

function scaleProb(rar: EquipmentRarity, cap: number = 100, rng: RandomFn): number {
  const s = RAR_SCALE[rar];
  return Math.min(cap, Math.round(randomInt(10, s.probMax * 10, rng) / 10) * 10);
}

function scaleTurns(rar: EquipmentRarity, min: number = 1, rng: RandomFn): number {
  return randomInt(min, RAR_SCALE[rar].turnMax, rng);
}

function passFlat(rar: EquipmentRarity, rng: RandomFn): number {
  const s = PASS_SCALE[rar];
  return randomInt(s.flat[0], s.flat[1], rng);
}

function passCond(rar: EquipmentRarity, rng: RandomFn): number {
  const s = PASS_SCALE[rar];
  return randomInt(s.cond[0], s.cond[1], rng);
}

function passProb(rar: EquipmentRarity, rng: RandomFn): number {
  const s = PASS_SCALE[rar];
  return Math.round(randomInt(s.prob[0] * 10, s.prob[1] * 10, rng) / 10) * 5;
}

function calcMP(tier: "low" | "mid" | "midhigh" | "high" | "super", rar: EquipmentRarity, rng: RandomFn): number {
  const base = MP_BASE[tier];
  const raw = randomInt(base.min, base.max, rng);
  const mul = RAR_MP_MUL[rar];
  return Math.max(5, Math.round((raw * mul) / 5) * 5);
}

function weightedRar(rng: RandomFn): EquipmentRarity {
  const total = Object.values(RAR_WEIGHTS).reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (const [k, w] of Object.entries(RAR_WEIGHTS)) {
    r -= w;
    if (r <= 0) return k as EquipmentRarity;
  }
  return "C";
}

function stWithProb(st: StatusEffectType, rar: EquipmentRarity, rng: RandomFn): string {
  const fx = STATUS_FX[st](rar);
  if (st === "stun") {
    const p = Math.max(10, scaleProb(rar, 25, rng) - Math.max(0, 20 - rarIndex(rar) * 3));
    return `${p}%の確率で${STATUS_LABELS[st]}（${fx}）を付与する`;
  }
  const t = scaleTurns(rar, 1, rng);
  const p = scaleProb(rar, 100, rng);
  return `${p}%の確率で${STATUS_LABELS[st]}（${fx}、${t}ターン）を付与する`;
}

function stSure(st: StatusEffectType, rar: EquipmentRarity, rng: RandomFn): string {
  if (st === "stun") return `${STATUS_LABELS[st]}（${STATUS_FX[st](rar)}）を付与する（確率15%）`;
  const t = scaleTurns(rar, 1, rng);
  return `${STATUS_LABELS[st]}（${STATUS_FX[st](rar)}、${t}ターン）を付与する`;
}

function pickSt(incap: boolean = false, rng: RandomFn): StatusEffectType {
  return pickOne(incap ? STATUSES_ALL : STATUSES_NORMAL, rng);
}

function otherAttr(attr: Element, rng: RandomFn): Element {
  return pickOne(ELEMENTS.filter((x) => x !== attr), rng);
}

const SKILL_BLUEPRINTS: SkillBlueprint[] = [
  {
    template: "attack",
    target: "raid",
    effectKey: "raidDamagePct",
    createText: (valuePct) => `レイド時の攻撃力+${valuePct}%`,
  },
  {
    template: "attack",
    target: "passive",
    effectKey: "raidDamagePct",
    createText: (valuePct) => `常時レイドダメージ+${valuePct}%`,
  },
  {
    template: "buff",
    target: "self",
    effectKey: "attackPct",
    createText: (valuePct) => `自身の攻撃力+${valuePct}%`,
  },
  {
    template: "buff",
    target: "self",
    effectKey: "defensePct",
    createText: (valuePct) => `自身の防御力+${valuePct}%`,
  },
  {
    template: "buff",
    target: "self",
    effectKey: "speedPct",
    createText: (valuePct) => `自身の速度+${valuePct}%`,
  },
  {
    template: "buff",
    target: "raid",
    effectKey: "attackPct",
    createText: (valuePct) => `レイド時の攻撃力+${valuePct}%`,
  },
  {
    template: "buff",
    target: "raid",
    effectKey: "defensePct",
    createText: (valuePct) => `レイド時の防御力+${valuePct}%`,
  },
  {
    template: "buff",
    target: "raid",
    effectKey: "speedPct",
    createText: (valuePct) => `レイド時の速度+${valuePct}%`,
  },
  {
    template: "reward",
    target: "passive",
    effectKey: "taskRewardPct",
    createText: (valuePct) => `常時タスク報酬+${valuePct}%`,
  },
  {
    template: "reward",
    target: "passive",
    effectKey: "expGainPct",
    createText: (valuePct) => `常時獲得EXP+${valuePct}%`,
  },
  {
    template: "reward",
    target: "passive",
    effectKey: "energyGainPct",
    createText: (valuePct) => `常時獲得Energy+${valuePct}%`,
  },
  {
    template: "reward",
    target: "nextTask",
    effectKey: "taskRewardPct",
    createText: (valuePct) => `次のタスクの報酬+${valuePct}%`,
  },
  {
    template: "reward",
    target: "nextTask",
    effectKey: "expGainPct",
    createText: (valuePct) => `次のタスクのEXP+${valuePct}%`,
  },
  {
    template: "reward",
    target: "nextTask",
    effectKey: "energyGainPct",
    createText: (valuePct) => `次のタスクのEnergy+${valuePct}%`,
  },
  {
    template: "efficiency",
    target: "passive",
    effectKey: "timerReductionPct",
    createText: (valuePct) => `常時タスクタイマー-${valuePct}%`,
  },
  {
    template: "efficiency",
    target: "nextTask",
    effectKey: "timerReductionPct",
    createText: (valuePct) => `次のタスクの時間効率+${valuePct}%`,
  },
];

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function randomInt(min: number, max: number, rng: RandomFn) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pickOne<T>(items: readonly T[], rng: RandomFn): T {
  return items[randomInt(0, items.length - 1, rng)];
}

function roundToStep(value: number, step: number) {
  return Math.round(value / step) * step;
}

function createSeededRandom(seed: number): RandomFn {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function toModifierBucket(skills: MonsterSkill[]) {
  return skills.reduce<ModifierBucket>((accumulator, skill) => {
    accumulator[skill.effectKey] += skill.valuePct;
    return accumulator;
  }, clone(EMPTY_MODIFIERS));
}

function sumStats(left: MonsterStats, right: MonsterStats): MonsterStats {
  return {
    hp: left.hp + right.hp,
    mp: left.mp + right.mp,
    attack: left.attack + right.attack,
    defense: left.defense + right.defense,
    speed: left.speed + right.speed,
  };
}

function mapElementToStatus(element: Element): StatusEffectType | null {
  if (element === "fire") {
    return "burn";
  }
  if (element === "lightning") {
    return "shock";
  }
  if (element === "ice") {
    return "frostbite";
  }
  return null;
}

function getPendingSkillSignatures(monster: Monster, ignoredChoiceSetId?: string) {
  const reserved = new Set(monster.skills.map((skill) => skill.signature));

  monster.pendingLevelChoices.forEach((choiceSet) => {
    if (choiceSet.id === ignoredChoiceSetId) {
      return;
    }

    choiceSet.choices.forEach((choice) => {
      if (choice.kind === "skill") {
        reserved.add(choice.skill.signature);
      }
    });
  });

  return reserved;
}

function createSkillFromBlueprint(blueprint: SkillBlueprint, valuePct: number): MonsterSkill {
  const signature = [blueprint.template, blueprint.target, blueprint.effectKey, valuePct].join(":");
  const name = blueprint.createText(valuePct);

  return {
    id: signature,
    signature,
    name,
    description: name,
    template: blueprint.template,
    target: blueprint.target,
    effectKey: blueprint.effectKey,
    valuePct,
  };
}

function getAvailableSkills(monster: Monster, ignoredChoiceSetId?: string) {
  const reserved = getPendingSkillSignatures(monster, ignoredChoiceSetId);
  const options: MonsterSkill[] = [];

  SKILL_BLUEPRINTS.forEach((blueprint) => {
    SKILL_VALUE_POOL.forEach((valuePct) => {
      const skill = createSkillFromBlueprint(blueprint, valuePct);
      if (!reserved.has(skill.signature)) {
        options.push(skill);
      }
    });
  });

  return options;
}

function buildStatChoice(choice: (typeof STAT_CHOICE_LIBRARY)[number]): LevelUpChoice {
  return {
    id: createId("choice-stat"),
    kind: "stat",
    label: `${choice.label} / ${choice.detail}`,
    stat: choice.stat,
    amount: choice.amount,
  };
}

function buildSpecialChoices(perks: MonsterPerks): LevelUpChoice[] {
  const options: LevelUpChoice[] = [];

  if (perks.taskRewardMultiplier < MAX_PERK_LEVEL) {
    options.push({
      id: createId("choice-special"),
      kind: "special",
      label: "報酬術式 / Task reward +10%",
      perkKey: "taskRewardMultiplier",
      amount: 10,
      levelAfter: perks.taskRewardMultiplier + 1,
    });
  }

  if (perks.raidDamageMultiplier < MAX_PERK_LEVEL) {
    options.push({
      id: createId("choice-special"),
      kind: "special",
      label: "レイド心得 / Raid damage +10%",
      perkKey: "raidDamageMultiplier",
      amount: 10,
      levelAfter: perks.raidDamageMultiplier + 1,
    });
  }

  if (perks.energyCap < MAX_PERK_LEVEL) {
    options.push({
      id: createId("choice-special"),
      kind: "special",
      label: "蓄力拡張 / Energy cap +10",
      perkKey: "energyCap",
      amount: 10,
      levelAfter: perks.energyCap + 1,
    });
  }

  return options;
}

function buildSkillChoice(monster: Monster, rng: RandomFn, ignoredChoiceSetId?: string) {
  const availableSkills = getAvailableSkills(monster, ignoredChoiceSetId);
  if (availableSkills.length === 0) {
    return null;
  }

  const skill = pickOne(availableSkills, rng);

  return {
    id: createId("choice-skill"),
    kind: "skill" as const,
    label: `新スキル習得 / ${skill.name}`,
    skill,
  };
}

function getChoiceKey(choice: LevelUpChoice) {
  if (choice.kind === "skill") {
    return `skill:${choice.skill.signature}`;
  }
  if (choice.kind === "special") {
    return `special:${choice.perkKey}`;
  }
  return `stat:${choice.stat}`;
}

function buildFallbackChoice(monster: Monster, seenKeys: Set<string>) {
  for (const statChoice of STAT_CHOICE_LIBRARY) {
    const choice = buildStatChoice(statChoice);
    if (!seenKeys.has(getChoiceKey(choice))) {
      return choice;
    }
  }

  for (const special of buildSpecialChoices(monster.perks)) {
    if (!seenKeys.has(getChoiceKey(special))) {
      return special;
    }
  }

  return buildStatChoice(STAT_CHOICE_LIBRARY[0]);
}

function rollChoiceType(rng: RandomFn) {
  const roll = rng() * 100;
  if (roll < 50) {
    return "stat";
  }
  if (roll < 80) {
    return "skill";
  }
  return "special";
}

function getActiveTimerModifiers(monster: Monster) {
  return toModifierBucket(
    monster.skills.filter((skill) => skill.target === "nextTask" && skill.template !== "attack"),
  );
}

function getPassiveTaskModifiers(monster: Monster) {
  const passiveSkills = monster.skills.filter(
    (skill) =>
      skill.target === "passive" &&
      (skill.template === "reward" || skill.template === "efficiency"),
  );
  const modifiers = toModifierBucket(passiveSkills);
  modifiers.taskRewardPct += monster.perks.taskRewardMultiplier * 10;
  return modifiers;
}

function getRaidModifiers(monster: Monster) {
  const raidSkills = monster.skills.filter(
    (skill) =>
      skill.target === "self" ||
      skill.target === "raid" ||
      (skill.target === "passive" &&
        (skill.template === "attack" || skill.template === "buff")),
  );
  const modifiers = toModifierBucket(raidSkills);
  modifiers.raidDamagePct += monster.perks.raidDamageMultiplier * 10;
  return modifiers;
}

function getElementTriangleBonus(attackElement: Element, defendElement: Element) {
  if (attackElement === "physical" || defendElement === "physical") {
    return 1;
  }

  if (
    (attackElement === "fire" && defendElement === "ice") ||
    (attackElement === "ice" && defendElement === "lightning") ||
    (attackElement === "lightning" && defendElement === "fire")
  ) {
    return 1.25;
  }

  if (
    (attackElement === "ice" && defendElement === "fire") ||
    (attackElement === "lightning" && defendElement === "ice") ||
    (attackElement === "fire" && defendElement === "lightning")
  ) {
    return 0.8;
  }

  return 1;
}

function rollRarity(stage: number, rng: RandomFn): EquipmentRarity {
  const weights: Record<EquipmentRarity, number> = {
    C: Math.max(20, 60 - stage * 3),
    B: 25 + stage * 2,
    A: 25 + stage,
    S: Math.max(10, stage * 2),
    SS: Math.max(5, stage - 2),
    SSS: Math.max(2, stage - 4),
  };

  const total = RARITIES.reduce((sum, rarity) => sum + weights[rarity], 0);
  let roll = rng() * total;

  for (const rarity of RARITIES) {
    roll -= weights[rarity];
    if (roll <= 0) {
      return rarity;
    }
  }

  return "C";
}

function rollSkillRarity(equipmentRarity: EquipmentRarity, rng: RandomFn): EquipmentRarity {
  const equipmentIndex = rarIndex(equipmentRarity);
  const minIndex = Math.max(0, equipmentIndex - 2);
  const maxIndex = Math.min(RARITIES.length - 1, equipmentIndex + 2);
  const validRarities = RARITIES.slice(minIndex, maxIndex + 1);
  return pickOne(validRarities, rng);
}

function rollStatValue(
  min: number,
  max: number,
  rarity: EquipmentRarity,
  stage: number,
  rng: RandomFn,
) {
  const rolled = min + (max - min) * rng();
  const stageMultiplier = 1 + Math.min(stage, 12) * 0.05;
  return Math.max(0, Math.round(rolled * RARITY_MULTIPLIER[rarity] * stageMultiplier));
}

function rollStatBonuses(
  slot: EquipmentSlot,
  rarity: EquipmentRarity,
  stage: number,
  rng: RandomFn,
): MonsterStats {
  if (slot === "weapon") {
    return {
      hp: rollStatValue(4, 10, rarity, stage, rng),
      mp: rollStatValue(3, 8, rarity, stage, rng),
      attack: rollStatValue(6, 14, rarity, stage, rng),
      defense: rollStatValue(1, 4, rarity, stage, rng),
      speed: rollStatValue(1, 5, rarity, stage, rng),
    };
  }

  if (slot === "armor") {
    return {
      hp: rollStatValue(14, 28, rarity, stage, rng),
      mp: rollStatValue(1, 6, rarity, stage, rng),
      attack: rollStatValue(1, 4, rarity, stage, rng),
      defense: rollStatValue(6, 13, rarity, stage, rng),
      speed: rollStatValue(0, 3, rarity, stage, rng),
    };
  }

  return {
    hp: rollStatValue(5, 12, rarity, stage, rng),
    mp: rollStatValue(4, 12, rarity, stage, rng),
    attack: rollStatValue(2, 7, rarity, stage, rng),
    defense: rollStatValue(1, 5, rarity, stage, rng),
    speed: rollStatValue(3, 8, rarity, stage, rng),
  };
}

// ════════════════════════════════════════════════════════════
// ── Active Skill Generators (24 types) ───────────────────────
// ════════════════════════════════════════════════════════════

type ActiveSkillGenerator = (rar: EquipmentRarity, rng: RandomFn) => Omit<EquipmentActiveSkill, "id" | "generatorSignature">;

const ACTIVE_SKILL_GENERATORS: ActiveSkillGenerator[] = [
  // 1. 基本単体攻撃 [低コスト]
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const at2 = otherAttr(at, rng);
    const st = pickSt(true, rng);
    const d = scaleDmg(rar, 1, rng);
    const m = scaleMul(rar, 0, rng);
    return {
      family: "attack",
      name: `${ATTR_PREFIX[at]}一撃`,
      description: `${ELEMENT_LABELS[at]}属性${d}%のダメージを与える。${stWithProb(st, rar, rng)}。${ELEMENT_LABELS[at2]}属性の敵に対するダメージが${m}倍になる。`,
      mpCost: calcMP("low", rar, rng),
      element: at,
      powerPct: d,
      statusEffect: null,
      guardEffect: null,
      tags: [ELEMENT_LABELS[at], "単体攻撃", STATUS_LABELS[st]],
      multiplier: m,
    };
  },
  // 2. 二連撃 [中コスト]
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const st = pickSt(false, rng);
    const d = scaleDmg(rar, 0.6, rng);
    const bk = randomInt(10, 10 + rarIndex(rar) * 5, rng);
    const t = scaleTurns(rar, 1, rng);
    return {
      family: "attack",
      name: `${ELEMENT_LABELS[at]}の連撃`,
      description: `${ELEMENT_LABELS[at]}属性${d}%のダメージを2回与える（合計${d * 2}%）。${stWithProb(st, rar, rng)}。2ヒット後、自分の攻撃力が${bk}%上昇する（${t}ターン）。`,
      mpCost: calcMP("mid", rar, rng),
      element: at,
      powerPct: d * 2,
      statusEffect: null,
      guardEffect: null,
      tags: [ELEMENT_LABELS[at], "二連撃", STATUS_LABELS[st]],
      durationTurns: t,
    };
  },
  // 3. 三連撃 [中コスト]
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const st = pickSt(false, rng);
    const d = scaleDmg(rar, 0.45, rng);
    const def = randomInt(10, 15 + rarIndex(rar) * 3, rng);
    const t = scaleTurns(rar, 1, rng);
    return {
      family: "attack",
      name: `${ELEMENT_LABELS[at]}の三連撃`,
      description: `${ELEMENT_LABELS[at]}属性${d}%のダメージを3回与える（合計${d * 3}%）。3ヒット後、相手の防御力を${def}%ダウンさせる（${t}ターン）。クリティカル時は必ず${stSure(st, rar, rng)}。`,
      mpCost: calcMP("mid", rar, rng),
      element: at,
      powerPct: d * 3,
      statusEffect: null,
      guardEffect: null,
      tags: [ELEMENT_LABELS[at], "三連撃"],
      durationTurns: t,
    };
  },
  // 4. 継続ダメージ [中高コスト]
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const d = scaleDmg(rar, 1, rng);
    const dot = randomInt(3, 4 + rarIndex(rar), rng);
    const t = scaleTurns(rar, 2, rng);
    const m = scaleMul(rar, 0.1, rng);
    return {
      family: "attack",
      name: `腐食の${ELEMENT_LABELS[at]}`,
      description: `${ELEMENT_LABELS[at]}属性${d}%のダメージを与える。さらに出血（最大HPの${Math.min(dot, 8)}%のダメージ）を${t}ターン付与する。継続ダメージ状態の敵への攻撃ダメージが${m}倍になる。`,
      mpCost: calcMP("midhigh", rar, rng),
      element: at,
      powerPct: d,
      statusEffect: { type: "bleed" as StatusEffectType, durationTurns: t, potencyPct: dot },
      guardEffect: null,
      tags: [ELEMENT_LABELS[at], "継続ダメージ", STATUS_LABELS.bleed],
      multiplier: m,
      durationTurns: t,
    };
  },
  // 5. HP吸収 [中高コスト]
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const at2 = otherAttr(at, rng);
    const d = scaleDmg(rar, 1, rng);
    const drain = Math.min(randomInt(20, 30 + rarIndex(rar) * 5, rng), 60);
    const m = scaleMul(rar, 0.2, rng);
    return {
      family: "attack",
      name: `${ELEMENT_LABELS[at]}吸収打`,
      description: `${ELEMENT_LABELS[at]}属性${d}%のダメージを与え、与えたダメージの${drain}%を自分のHPとして回復する。相手のHPが30%以下の時、吸収量が2倍になる。${ELEMENT_LABELS[at2]}属性の敵には吸収無効の代わりにダメージが${m}倍になる。`,
      mpCost: calcMP("midhigh", rar, rng),
      element: at,
      powerPct: d,
      statusEffect: null,
      guardEffect: null,
      tags: [ELEMENT_LABELS[at], "HP吸収"],
      multiplier: m,
    };
  },
  // 6. カウンター [高コスト]
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const st = pickSt(false, rng);
    const d = scaleDmg(rar, 0.8, rng);
    const m = scaleMul(rar, 0, rng);
    const t = scaleTurns(rar, 1, rng);
    return {
      family: "attack",
      name: `反撃の${ELEMENT_LABELS[at]}`,
      description: `${ELEMENT_LABELS[at]}属性${d}%のダメージを与える。次の${t}ターン間、攻撃を受けた際に自動で反撃し${m}倍のダメージを与える。反撃ヒット時は必ず${stSure(st, rar, rng)}。`,
      mpCost: calcMP("high", rar, rng),
      element: at,
      powerPct: d,
      statusEffect: null,
      guardEffect: null,
      tags: [ELEMENT_LABELS[at], "カウンター", STATUS_LABELS[st]],
      multiplier: m,
      durationTurns: t,
    };
  },
  // 7. リフレクト [高コスト]
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const ref = Math.min(20 + rarIndex(rar) * 10 + randomInt(0, 10, rng), 80);
    const t = scaleTurns(rar, 2, rng);
    const def = randomInt(10, 20, rng);
    const refMul = scaleMul(rar, 0.2, rng);
    return {
      family: "guard",
      name: `${ELEMENT_LABELS[at]}のリフレクト`,
      description: `次の${t}ターン間、受けたダメージの${ref}%を${ELEMENT_LABELS[at]}属性として跳ね返す。反射中は防御力が${def}%上昇する。${ELEMENT_LABELS[at]}属性の攻撃を反射した場合、ダメージが${refMul}倍になる。`,
      mpCost: calcMP("high", rar, rng),
      element: at,
      powerPct: null,
      statusEffect: null,
      guardEffect: { physicalReductionPct: def, elementalReductionPct: def, durationHits: t },
      tags: [ELEMENT_LABELS[at], "反射"],
      durationTurns: t,
      reflectPct: ref,
      reflectMultiplier: refMul,
    };
  },
  // 8. チャージ [超高コスト]
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const st = pickSt(false, rng);
    const st2 = pickOne(STATUSES_NORMAL.filter((x) => x !== st), rng);
    const ch = rar === "SSS" ? 1 : randomInt(1, 2, rng);
    const d = scaleDmg(rar, 1.8, rng);
    const p = scaleProb(rar, 100, rng);
    return {
      family: "attack",
      name: `${ELEMENT_LABELS[at]}の解放`,
      description: `${ch}ターン溜めた後、${ELEMENT_LABELS[at]}属性${d}%の強力なダメージを与える（MP消費は使用ターンに先払い）。${p}%の確率で${stSure(st, rar, rng)}。溜め中は防御力が${randomInt(20, 40, rng)}%上昇し、${STATUS_LABELS[st2]}を無効化する。`,
      mpCost: calcMP("super", rar, rng),
      element: at,
      powerPct: d,
      statusEffect: null,
      guardEffect: null,
      tags: [ELEMENT_LABELS[at], "チャージ", STATUS_LABELS[st]],
      durationTurns: ch,
    };
  },
  // 9. 攻撃＋自己バフ [中高コスト]
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const d = scaleDmg(rar, 1, rng);
    const atk = randomInt(10, 10 + rarIndex(rar) * 5, rng);
    const t = scaleTurns(rar, 2, rng);
    const m = scaleMul(rar, 0.1, rng);
    return {
      family: "attack",
      name: `高揚の${ELEMENT_LABELS[at]}撃`,
      description: `${ELEMENT_LABELS[at]}属性${d}%のダメージを与える。使用後、自分の攻撃力が${atk}%上昇する（${t}ターン）。HPが50%以下の時ダメージが${m}倍・攻撃力上昇量が2倍になる。`,
      mpCost: calcMP("midhigh", rar, rng),
      element: at,
      powerPct: d,
      statusEffect: null,
      guardEffect: null,
      tags: [ELEMENT_LABELS[at], "自己強化", "バフ"],
      multiplier: m,
      durationTurns: t,
    };
  },
  // 10. 攻撃＋デバフ [低コスト]
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const st = pickSt(false, rng);
    const d = scaleDmg(rar, 1, rng);
    const db1 = randomInt(10, 20, rng);
    const db2 = randomInt(5, 15, rng);
    const t = scaleTurns(rar, 2, rng);
    const m = scaleMul(rar, 0, rng);
    return {
      family: "attack",
      name: `${ELEMENT_LABELS[at]}の崩し打`,
      description: `${ELEMENT_LABELS[at]}属性${d}%のダメージを与え、相手の攻撃力を${db1}%・防御力を${db2}%ダウンさせる（${t}ターン）。${stWithProb(st, rar, rng)}。デバフ中の敵へのダメージが${m}倍になる。`,
      mpCost: calcMP("low", rar, rng),
      element: at,
      powerPct: d,
      statusEffect: null,
      guardEffect: null,
      tags: [ELEMENT_LABELS[at], "デバフ", STATUS_LABELS[st]],
      multiplier: m,
      durationTurns: t,
    };
  },
  // 11. 貫通撃 [中コスト]
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const at2 = otherAttr(at, rng);
    const d = scaleDmg(rar, 1, rng);
    const pierce = Math.min(30 + rarIndex(rar) * 10 + randomInt(0, 10, rng), 90);
    const extra = scaleDmg(rar, 0.5, rng);
    return {
      family: "attack",
      name: `${ELEMENT_LABELS[at]}貫通撃`,
      description: `${ELEMENT_LABELS[at]}属性${d}%のダメージを与える。このダメージは相手の防御力の${pierce}%を無視する。${ELEMENT_LABELS[at2]}属性の敵に使用すると無視率が100%になり、追加で${extra}%のダメージが発生する。`,
      mpCost: calcMP("mid", rar, rng),
      element: at,
      powerPct: d,
      statusEffect: null,
      guardEffect: null,
      tags: [ELEMENT_LABELS[at], ELEMENT_LABELS[at2], "貫通"],
      piercePct: pierce,
      extraDamagePct: extra,
      pierceBonusElement: at2,
    };
  },
  // 12. 防御破壊 [中コスト]
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const d = scaleDmg(rar, 1, rng);
    const reduce = randomInt(15, 20 + rarIndex(rar) * 2, rng);
    const t = scaleTurns(rar, 2, rng);
    const m = scaleMul(rar, 0, rng);
    return {
      family: "attack",
      name: `鎧砕きの${ELEMENT_LABELS[at]}`,
      description: `${ELEMENT_LABELS[at]}属性${d}%のダメージを与え、相手の防御力を${reduce}%ダウンさせる（${t}ターン、重複可）。防御ダウン中の敵への次の攻撃ダメージが${m}倍になる。`,
      mpCost: calcMP("mid", rar, rng),
      element: at,
      powerPct: d,
      statusEffect: null,
      guardEffect: null,
      tags: [ELEMENT_LABELS[at], "防御破壊"],
      multiplier: m,
      durationTurns: t,
      stackable: true,
    };
  },
  // 13. 処刑 [超高コスト]
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const st = pickSt(false, rng);
    const d = scaleDmg(rar, 1, rng);
    const threshold = randomInt(20, 35, rng);
    const extra = Math.round((d * 1.5) / 5) * 5;
    return {
      family: "attack",
      name: `${ELEMENT_LABELS[at]}の処刑`,
      description: `${ELEMENT_LABELS[at]}属性${d}%のダメージを与える。相手のHPが${threshold}%以下の場合、追加で${ELEMENT_LABELS[at]}属性${extra}%の特大ダメージを与え、必ず${stSure(st, rar, rng)}。`,
      mpCost: calcMP("super", rar, rng),
      element: at,
      powerPct: d,
      statusEffect: null,
      guardEffect: null,
      tags: [ELEMENT_LABELS[at], "トドメ", STATUS_LABELS[st]],
      condition: `HP${threshold}%以下`,
      threshold: threshold,
      extraDamagePct: extra,
    };
  },
  // 14. 遅延発動 [超高コスト]
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const st = pickSt(false, rng);
    const d1 = scaleDmg(rar, 0.8, rng);
    const d2 = scaleDmg(rar, 0.9, rng);
    const delay = randomInt(1, 2, rng);
    return {
      family: "attack",
      name: `${ELEMENT_LABELS[at]}の遅発弾`,
      description: `${ELEMENT_LABELS[at]}属性${d1}%のダメージを与える。${delay}ターン後、自動で${ELEMENT_LABELS[at]}属性${d2}%の追加攻撃が発動する。追加攻撃は必ず${stSure(st, rar, rng)}、クリティカル率が${randomInt(20, 30 + rarIndex(rar) * 5, rng)}%上昇する。`,
      mpCost: calcMP("super", rar, rng),
      element: at,
      powerPct: d1,
      statusEffect: null,
      guardEffect: null,
      tags: [ELEMENT_LABELS[at], "遅延発動", STATUS_LABELS[st]],
      durationTurns: delay,
    };
  },
  // 15. 封印打 [中コスト]
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const st = pickSt(false, rng);
    const d = scaleDmg(rar, 1, rng);
    const t = scaleTurns(rar, 2, rng);
    const m = scaleMul(rar, 0, rng);
    return {
      family: "attack",
      name: `${ELEMENT_LABELS[at]}の封印打`,
      description: `${ELEMENT_LABELS[at]}属性${d}%のダメージを与え、相手のスキル使用を${t}ターン封印する。封印中の敵へのダメージが${m}倍になる。${stWithProb(st, rar, rng)}。`,
      mpCost: calcMP("mid", rar, rng),
      element: at,
      powerPct: d,
      statusEffect: { type: "seal" as StatusEffectType, durationTurns: t, potencyPct: 100 },
      guardEffect: null,
      tags: [ELEMENT_LABELS[at], "封印", STATUS_LABELS[st]],
      multiplier: m,
      durationTurns: t,
    };
  },
  // 16. 複合属性 [超高コスト]
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const at2 = otherAttr(at, rng);
    const st = pickSt(false, rng);
    const d = scaleDmg(rar, 0.9, rng);
    const m = scaleMul(rar, 0.3, rng);
    const p = scaleProb(rar, 100, rng);
    return {
      family: "attack",
      name: `${ELEMENT_LABELS[at]}・${ELEMENT_LABELS[at2]}複合爆発`,
      description: `${ELEMENT_LABELS[at]}属性と${ELEMENT_LABELS[at2]}属性の混合で${d}%のダメージを与える。両属性に弱点がある場合、ダメージが${m}倍になる。${p}%の確率で${stSure(st, rar, rng)}。`,
      mpCost: calcMP("super", rar, rng),
      element: at,
      powerPct: d,
      statusEffect: null,
      guardEffect: null,
      tags: [ELEMENT_LABELS[at], ELEMENT_LABELS[at2], "複合", STATUS_LABELS[st]],
      multiplier: m,
    };
  },
  // 17. 自己バフ [高コスト]
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const atk = randomInt(15, 15 + rarIndex(rar) * 7, rng);
    const spd = randomInt(10, 25, rng);
    const t = scaleTurns(rar, 2, rng);
    const m = scaleMul(rar, 0.2, rng);
    return {
      family: "guard",
      name: `${ELEMENT_LABELS[at]}の覚醒`,
      description: `自分の攻撃力を${atk}%・素早さを${spd}%上昇させる（${t}ターン）。次の攻撃スキルのダメージが${m}倍になる。${ELEMENT_LABELS[at]}属性のダメージを受けた時、追加で攻撃力が${randomInt(5, 10 + rarIndex(rar) * 3, rng)}%上昇する。`,
      mpCost: calcMP("high", rar, rng),
      element: at,
      powerPct: null,
      statusEffect: null,
      guardEffect: null,
      tags: [ELEMENT_LABELS[at], "バフ", "強化"],
      multiplier: m,
      durationTurns: t,
    };
  },
  // 18. リジェネ [高コスト]
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const heal = Math.min(3 + rarIndex(rar), 10);
    const t = scaleTurns(rar, 2, rng);
    const m = scaleMul(rar, 0.1, rng);
    return {
      family: "guard",
      name: `${ELEMENT_LABELS[at]}の再生`,
      description: `毎ターン最大HPの${heal}%を回復する（${t}ターン）。いずれかの状態異常を受けている時、回復量が${m}倍になる。${ELEMENT_LABELS[at]}属性攻撃を受けた時、ターン数が1追加される。`,
      mpCost: calcMP("high", rar, rng),
      element: at,
      powerPct: null,
      statusEffect: null,
      guardEffect: null,
      tags: [ELEMENT_LABELS[at], "リジェネ", "回復"],
      multiplier: m,
      durationTurns: t,
    };
  },
  // 19. 浄化＋反撃 [中コスト]
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const d = scaleDmg(rar, 1, rng);
    const bonus = randomInt(10, 20, rng);
    const cap = randomInt(80, 100 + rarIndex(rar) * 30, rng);
    const t = scaleTurns(rar, 1, rng);
    return {
      family: "attack",
      name: `浄化の${ELEMENT_LABELS[at]}`,
      description: `自分にかかった状態異常・デバフを全て解除し、${ELEMENT_LABELS[at]}属性${d}%の反撃ダメージを与える。解除した効果の数×${bonus}%ダメージが上昇する（上限+${cap}%）。解除後${t}ターン状態異常無効になる。`,
      mpCost: calcMP("mid", rar, rng),
      element: at,
      powerPct: d,
      statusEffect: null,
      guardEffect: null,
      tags: [ELEMENT_LABELS[at], "浄化", "状態解除"],
      durationTurns: t,
    };
  },
  // 20. 条件付き強化 [中コスト]
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const at2 = otherAttr(at, rng);
    const d = scaleDmg(rar, 1, rng);
    const m = scaleMul(rar, 0, rng);
    const m2 = scaleMul(rar, 0.1, rng);
    const cond = pickOne([`${ELEMENT_LABELS[at2]}属性の敵`, "状態異常中の敵", "HPが50%以下の敵", "デバフ中の敵", "封印中の敵"], rng);
    return {
      family: "attack",
      name: `弱点狙いの${ELEMENT_LABELS[at]}`,
      description: `${ELEMENT_LABELS[at]}属性${d}%のダメージを与える。${cond}に対してダメージが${m}倍になる。${randomInt(20, 30 + rarIndex(rar) * 5, rng)}%の確率でクリティカルヒットし、さらに${m2}倍になる。`,
      mpCost: calcMP("mid", rar, rng),
      element: at,
      powerPct: d,
      statusEffect: null,
      guardEffect: null,
      tags: [ELEMENT_LABELS[at], ELEMENT_LABELS[at2], "条件付き"],
      multiplier: m,
      condition: cond,
    };
  },
  // 21. スロウ打 [低コスト]
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const st = pickSt(false, rng);
    const d = scaleDmg(rar, 1, rng);
    const p = scaleProb(rar, 100, rng);
    const t = scaleTurns(rar, 2, rng);
    const spd = Math.min(randomInt(20, 25 + rarIndex(rar) * 4, rng), 45);
    return {
      family: "attack",
      name: `${ELEMENT_LABELS[at]}の呪縛`,
      description: `${ELEMENT_LABELS[at]}属性${d}%のダメージを与える。${p}%の確率でスロウ（素早さ${spd}%低下・行動順を後ろへ、${t}ターン）を付与する。スロウ成功時、必ず${stSure(st, rar, rng)}。`,
      mpCost: calcMP("low", rar, rng),
      element: at,
      powerPct: d,
      statusEffect: { type: "slow" as StatusEffectType, durationTurns: t, potencyPct: spd },
      guardEffect: null,
      tags: [ELEMENT_LABELS[at], "スロウ", STATUS_LABELS[st]],
      durationTurns: t,
    };
  },
  // 22. バリア破壊 [中高コスト]
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const at2 = otherAttr(at, rng);
    const st = pickSt(false, rng);
    const d = scaleDmg(rar, 1, rng);
    const extra = scaleDmg(rar, 0.5, rng);
    return {
      family: "attack",
      name: `${ELEMENT_LABELS[at]}のシールド割り`,
      description: `${ELEMENT_LABELS[at]}属性${d}%のダメージを与え、相手のバリア・シールドを全て除去する。除去成功時、${ELEMENT_LABELS[at2]}属性${extra}%の追加ダメージを与え、${stSure(st, rar, rng)}。`,
      mpCost: calcMP("midhigh", rar, rng),
      element: at,
      powerPct: d,
      statusEffect: null,
      guardEffect: null,
      tags: [ELEMENT_LABELS[at], "バリア破壊", ELEMENT_LABELS[at2], STATUS_LABELS[st]],
      extraDamagePct: extra,
    };
  },
  // 23. 全ステバフ＋バリア [超高コスト]
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const d = scaleDmg(rar, 1, rng);
    const sp = randomInt(10, 10 + rarIndex(rar) * 5, rng);
    const t = scaleTurns(rar, 1, rng);
    return {
      family: "attack",
      name: `${ELEMENT_LABELS[at]}の覇気`,
      description: `${ELEMENT_LABELS[at]}属性${d}%のダメージを与える。使用後、自分の全ステータスが${sp}%上昇し（${t}ターン）、次に受けるダメージを1回無効化するバリアを張る。`,
      mpCost: calcMP("super", rar, rng),
      element: at,
      powerPct: d,
      statusEffect: null,
      guardEffect: { physicalReductionPct: 100, elementalReductionPct: 100, durationHits: 1 },
      tags: [ELEMENT_LABELS[at], "超強化"],
      durationTurns: t,
    };
  },
  // 24. 蓄積型状態異常 [低コスト]
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const st = pickOne(["bleed", "frostbite", "shock"] as StatusEffectType[], rng);
    const d = scaleDmg(rar, 1, rng);
    const p = scaleProb(rar, 100, rng);
    const t = scaleTurns(rar, 2, rng);
    const stack = randomInt(10, 15 + rarIndex(rar) * 3, rng);
    return {
      family: "attack",
      name: `${ELEMENT_LABELS[at]}の蓄積打`,
      description: `${ELEMENT_LABELS[at]}属性${d}%のダメージを与える。${p}%の確率で${stSure(st, rar, rng)}（同一状態異常は重複不可・更新）。対象がすでに${STATUS_LABELS[st]}状態の時、効果値が${stack}%増加した状態で上書きする。`,
      mpCost: calcMP("low", rar, rng),
      element: at,
      powerPct: d,
      statusEffect: null,
      guardEffect: null,
      tags: [ELEMENT_LABELS[at], STATUS_LABELS[st], "スタック"],
      durationTurns: t,
      stackable: true,
    };
  },
];

function generateEquipmentActiveSkill(equipmentRarity: EquipmentRarity, rng: RandomFn) {
  const skillRarity = rollSkillRarity(equipmentRarity, rng);
  const generator = pickOne(ACTIVE_SKILL_GENERATORS, rng);
  const skill = generator(skillRarity, rng);
  return {
    id: createId("active"),
    generatorSignature: [skill.name, skill.family, skillRarity].join(":"),
    ...skill,
  };
}

// ════════════════════════════════════════════════════════════
// ── Passive Skill Generators (20 types) ──────────────────────
// ════════════════════════════════════════════════════════════

type PassiveSkillGenerator = (rar: EquipmentRarity, rng: RandomFn) => Omit<EquipmentPassiveSkill, "id" | "generatorSignature">;

const PASSIVE_SKILL_GENERATORS: PassiveSkillGenerator[] = [
  // 1. 物理の闘気 (常時攻撃強化)
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const v = passFlat(rar, rng);
    const extra = passCond(rar, rng);
    return {
      category: "elementBoost",
      name: `${ELEMENT_LABELS[at]}の闘気`,
      description: `常時、自分の攻撃力が${v}%上昇する。さらに${ELEMENT_LABELS[at]}属性スキル使用時、その攻撃の与ダメージが追加で${extra}%上昇する。`,
      valuePct: v,
      element: at,
      tags: [ELEMENT_LABELS[at], "常時", "攻撃強化"],
      condition: "常時",
    };
  },
  // 2. 物理の守護 (常時防御強化)
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const v = passFlat(rar, rng);
    const extra = passCond(rar, rng);
    return {
      category: "statBoost",
      name: `${ELEMENT_LABELS[at]}の守護`,
      description: `常時、自分の防御力が${v}%上昇する。${ELEMENT_LABELS[at]}属性の攻撃を受けた時、さらに防御力が${extra}%上昇する（1ターン）。`,
      valuePct: v,
      stat: "defense",
      tags: [ELEMENT_LABELS[at], "常時", "防御強化"],
      condition: "常時",
    };
  },
  // 3. 物理耐性 (常時耐性)
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const at2 = otherAttr(at, rng);
    const v = passFlat(rar, rng);
    return {
      category: "statusResist",
      name: `${ELEMENT_LABELS[at]}耐性`,
      description: `常時、${ELEMENT_LABELS[at]}属性ダメージを${v}%軽減する。${ELEMENT_LABELS[at2]}属性の攻撃を受けた場合も${Math.round(v * 0.5)}%軽減する（属性耐性の副次効果）。`,
      valuePct: v,
      element: at,
      tags: [ELEMENT_LABELS[at], "常時", "耐性"],
      condition: "常時",
    };
  },
  // 4. 疾風の歩 (常時速度強化)
  (rar, rng) => {
    const v = passFlat(rar, rng);
    const prior = passProb(rar, rng);
    return {
      category: "statBoost",
      name: "疾風の歩",
      description: `常時、自分の素早さが${v}%上昇する。${prior}%の確率でバトル開始時に先制を得る（素早さが相手より低い場合でも適用）。`,
      valuePct: v,
      stat: "speed",
      tags: ["常時", "速度強化"],
      condition: "常時",
    };
  },
  // 5. 鋭眼 (常時クリティカル)
  (rar, rng) => {
    const v = passFlat(rar, rng);
    const mul = passCond(rar, rng);
    return {
      category: "statBoost",
      name: "鋭眼",
      description: `常時、クリティカル率が${v}%上昇する。クリティカルヒット時のダメージ倍率が追加で${mul}%上昇する。`,
      valuePct: v,
      stat: "attack",
      tags: ["常時", "クリティカル"],
      condition: "常時",
    };
  },
  // 6. 物理の怒気 (HP閾値攻撃強化)
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const v = passCond(rar, rng);
    const extra = Math.round(passCond(rar, rng) * 0.5);
    return {
      category: "elementBoost",
      name: `${ELEMENT_LABELS[at]}の怒気`,
      description: `自分のHPが50%以下になると、攻撃力が${v}%上昇する（持続）。さらにHPが25%以下になると、攻撃力がさらに${extra}%追加上昇する（最大合計+${v + extra}%）。`,
      valuePct: v,
      element: at,
      tags: [ELEMENT_LABELS[at], "HP閾値", "攻撃強化"],
      condition: "HP50%以下",
      threshold: 50,
    };
  },
  // 7. 不屈の守り (HP閾値防御強化+回復)
  (rar, rng) => {
    const v = passCond(rar, rng);
    const regen = Math.min(passFlat(rar, rng), 5);
    return {
      category: "statBoost",
      name: "不屈の守り",
      description: `自分のHPが50%以下になると、受けるダメージを${v}%軽減する。さらにHPが50%以下の間、毎ターン開始時に最大HPの${regen}%を回復する。`,
      valuePct: v,
      stat: "defense",
      tags: ["HP閾値", "防御強化", "回復"],
      condition: "HP50%以下",
      threshold: 50,
    };
  },
  // 8. 生命の盾 (HP閾値バリア)
  (rar, rng) => {
    const threshold = randomInt(15, 25, rng);
    const cd = Math.max(1, randomInt(3, 5, rng) - rarIndex(rar));
    return {
      category: "statBoost",
      name: "生命の盾",
      description: `HPが${threshold}%以下になった時、自動でダメージを1回無効化するバリアを張る（${cd}ターンに1回のみ発動）。バリアが破壊された時、攻撃力が${passCond(rar, rng)}%上昇する（2ターン）。`,
      valuePct: 0,
      stat: "hp",
      tags: ["HP閾値", "バリア"],
      condition: "HP25%以下",
      threshold: 25,
      cooldown: cd,
    };
  },
  // 9. 物理の覚悟 (HP閾値超強化)
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const v = Math.min(passCond(rar, rng) + passFlat(rar, rng), 40);
    return {
      category: "elementBoost",
      name: `${ELEMENT_LABELS[at]}の覚悟`,
      description: `HPが25%以下になると、${ELEMENT_LABELS[at]}属性スキルのダメージが${v}%上昇する（持続）。この効果中、${ELEMENT_LABELS[at]}属性スキルは必ずクリティカルヒットする。`,
      valuePct: v,
      element: at,
      tags: [ELEMENT_LABELS[at], "HP閾値", "超強化"],
      condition: "HP25%以下",
      threshold: 25,
    };
  },
  // 10. 痛みの覚醒 (被ダメ時攻撃強化スタック)
  (rar, rng) => {
    const v = Math.round(passCond(rar, rng) * 0.4);
    const cap = Math.min(passCond(rar, rng) + passFlat(rar, rng), 35);
    const stack = randomInt(3, 5 + rarIndex(rar), rng);
    return {
      category: "statBoost",
      name: "痛みの覚醒",
      description: `攻撃を受けるたびに攻撃力が${v}%上昇する（スタック可、上限+${cap}%）。${stack}回ヒットされるごとに、次の自分の攻撃が必ずクリティカルになる。`,
      valuePct: v,
      stat: "attack",
      tags: ["被ダメ時", "攻撃強化", "スタック"],
      condition: "被ダメ時",
      stackable: true,
    };
  },
  // 11. 物理の荊棘 (被ダメ時状態異常)
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const st = pickOne(["shock", "frostbite", "bleed"] as StatusEffectType[], rng);
    const p = passProb(rar, rng);
    return {
      category: "statusResist",
      name: `${ELEMENT_LABELS[at]}の荊棘`,
      description: `物理攻撃を受けた時、${p}%の確率で攻撃者に${stSure(st, rar, rng)}。${ELEMENT_LABELS[at]}属性攻撃を受けた場合、確率が2倍になる。`,
      valuePct: p,
      statusType: st,
      tags: [ELEMENT_LABELS[at], "被ダメ時", STATUS_LABELS[st]],
      condition: "被ダメ時",
    };
  },
  // 12. 強靭なる肉体 (被ダメ時回復)
  (rar, rng) => {
    const p = passProb(rar, rng);
    const heal = Math.min(passFlat(rar, rng), 12);
    return {
      category: "statBoost",
      name: "強靭なる肉体",
      description: `攻撃を受けた時、${p}%の確率で最大HPの${heal}%を即座に回復する。回復した場合、そのターンの被ダメージを${passCond(rar, rng)}%軽減する。`,
      valuePct: heal,
      stat: "hp",
      tags: ["被ダメ時", "回復"],
      condition: "被ダメ時",
    };
  },
  // 13. 苦痛の昇華 (自身状態異常時攻撃強化)
  (rar, rng) => {
    const v = passCond(rar, rng);
    return {
      category: "statBoost",
      name: "苦痛の昇華",
      description: `自分がいずれかの状態異常状態の間、攻撃力が${v}%上昇する。状態異常が2種類以上かかっている場合、さらに${Math.round(v * 0.5)}%追加上昇する（重複加算）。`,
      valuePct: v,
      stat: "attack",
      tags: ["状態異常時", "攻撃強化"],
      condition: "自身状態異常時",
    };
  },
  // 14. 弱者狩り (相手状態異常時攻撃強化)
  (rar, rng) => {
    const v = passCond(rar, rng);
    const v2 = Math.round(v * 0.6);
    return {
      category: "statBoost",
      name: "弱者狩り",
      description: `相手がいずれかの状態異常状態の間、与えるダメージが${v}%上昇する。状態異常の種類ごとにさらに${v2}%追加上昇する（上限+${Math.min(v + v2 * 3, 45)}%）。`,
      valuePct: v,
      stat: "attack",
      tags: ["状態異常時", "攻撃強化", "条件付き"],
      condition: "相手状態異常時",
    };
  },
  // 15. 凍傷の捕食者 (状態異常時条件付き)
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const st = pickOne(["frostbite", "darkness", "slow"] as StatusEffectType[], rng);
    const v = passCond(rar, rng);
    return {
      category: "elementBoost",
      name: `${STATUS_LABELS[st]}の捕食者`,
      description: `相手が${STATUS_LABELS[st]}状態の時、${ELEMENT_LABELS[at]}属性ダメージが${v}%上昇する。さらに相手が${STATUS_LABELS[st]}状態の時に与えたダメージの${Math.round(passFlat(rar, rng) * 1.5)}%を自分のHPとして回復する。`,
      valuePct: v,
      element: at,
      statusType: st,
      tags: [ELEMENT_LABELS[at], "状態異常時", "条件付き"],
      condition: "相手状態異常時",
    };
  },
  // 16. 物理の鼓動 (ターン開始バフ)
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const p = passProb(rar, rng);
    const v = passFlat(rar, rng);
    const t = randomInt(1, 2, rng);
    return {
      category: "statBoost",
      name: `${ELEMENT_LABELS[at]}の鼓動`,
      description: `毎ターン開始時、${p}%の確率で自分の攻撃力が${v}%上昇する（${t}ターン、スタック可）。${ELEMENT_LABELS[at]}属性スキルを使用したターンの次のターン開始時、この確率が2倍になる。`,
      valuePct: v,
      stat: "attack",
      tags: [ELEMENT_LABELS[at], "ターン開始", "バフ"],
      condition: "ターン開始時",
      durationTurns: t,
      stackable: true,
    };
  },
  // 17. 物理の圧迫 (ターン開始デバフ)
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const st = pickOne(["defenseDown", "slow", "darkness"] as StatusEffectType[], rng);
    const p = passProb(rar, rng);
    return {
      category: "statusResist",
      name: `${ELEMENT_LABELS[at]}の圧迫`,
      description: `毎ターン開始時、${p}%の確率で相手に${stSure(st, rar, rng)}。${ELEMENT_LABELS[at]}属性の敵に対してはこの確率が${Math.round(p * 1.5)}%に上昇する。`,
      valuePct: p,
      statusType: st,
      tags: [ELEMENT_LABELS[at], "ターン開始", "デバフ"],
      condition: "ターン開始時",
    };
  },
  // 18. 物理の余韻 (命中時状態異常)
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const st = pickSt(false, rng);
    const p = passProb(rar, rng);
    return {
      category: "statusResist",
      name: `${ELEMENT_LABELS[at]}の余韻`,
      description: `スキルが命中した時、${p}%の確率で${stSure(st, rar, rng)}。クリティカルヒット時はこの確率が2倍になる。`,
      valuePct: p,
      statusType: st,
      tags: [ELEMENT_LABELS[at], "命中時", STATUS_LABELS[st]],
      condition: "スキル命中時",
    };
  },
  // 19. 吸命の爪 (命中時HP吸収)
  (rar, rng) => {
    const drain = Math.min(passFlat(rar, rng), 12);
    return {
      category: "statBoost",
      name: "吸命の爪",
      description: `攻撃が命中するたびに、与えたダメージの${drain}%を自分のHPとして回復する。クリティカルヒット時は回復量が2倍になる。`,
      valuePct: drain,
      stat: "hp",
      tags: ["命中時", "HP吸収"],
      condition: "攻撃命中時",
    };
  },
  // 20. 物理の臨界 (複合条件超強化)
  (rar, rng) => {
    const at = pickOne(ELEMENTS, rng);
    const v1 = passCond(rar, rng);
    const v2 = passCond(rar, rng);
    return {
      category: "elementBoost",
      name: `${ELEMENT_LABELS[at]}の臨界`,
      description: `自分のHPが50%以下かつ状態異常状態の時、${ELEMENT_LABELS[at]}属性スキルのダメージが${v1}%上昇し、受けるダメージを${Math.round(v2 * 0.6)}%軽減する。両条件を満たした状態が2ターン続くと、次の${ELEMENT_LABELS[at]}属性スキルが必ずクリティカルになる。`,
      valuePct: v1,
      element: at,
      tags: [ELEMENT_LABELS[at], "HP閾値", "状態異常時", "超強化"],
      condition: "複合条件",
      threshold: 50,
    };
  },
];

function generateEquipmentPassiveSkill(equipmentRarity: EquipmentRarity, rng: RandomFn): EquipmentPassiveSkill {
  const skillRarity = rollSkillRarity(equipmentRarity, rng);
  const generator = pickOne(PASSIVE_SKILL_GENERATORS, rng);
  const skill = generator(skillRarity, rng);
  return {
    id: createId("passive"),
    generatorSignature: [skill.name, skill.category, skillRarity].join(":"),
    ...skill,
  };
}

function createEquipmentName(slot: EquipmentSlot, rarity: EquipmentRarity, activeSkill: EquipmentActiveSkill, rng: RandomFn) {
  const prefixes = {
    physical: ["Iron", "Stone", "Bastion", "Breaker"],
    fire: ["Ash", "Flare", "Cinder", "Blaze"],
    ice: ["Frost", "Glacier", "Mist", "Crystal"],
    lightning: ["Volt", "Spark", "Storm", "Pulse"],
  } satisfies Record<Element, string[]>;
  const slotWords: Record<EquipmentSlot, string[]> = {
    weapon: ["Blade", "Fang", "Drive", "Edge"],
    armor: ["Guard", "Plate", "Shell", "Mail"],
    relic: ["Core", "Sigil", "Ring", "Lens"],
  };

  const prefix = pickOne(prefixes[activeSkill.element], rng);
  const slotWord = pickOne(slotWords[slot], rng);
  return `${RARITY_LABELS[rarity]} ${prefix} ${slotWord}`;
}

function aggregateEquipmentPassives(items: Equipment[]): { bonuses: EquipmentPassiveBonuses; thresholdPassives: EquipmentPassiveSkill[] } {
  const thresholdPassives: EquipmentPassiveSkill[] = [];
  
  const bonuses = items.reduce<EquipmentPassiveBonuses>((accumulator, item) => {
    const passive = item.passiveSkill;

    // Skip threshold-based passives - they'll be applied dynamically
    if (passive.threshold !== undefined) {
      thresholdPassives.push(passive);
      return accumulator;
    }

    if (passive.category === "elementBoost" && passive.element) {
      accumulator.elementDamagePct[passive.element] += passive.valuePct;
    }

    if (passive.category === "statusResist" && passive.statusType) {
      accumulator.statusResistPct[passive.statusType] += passive.valuePct;
    }

    if (passive.category === "mpRegen") {
      accumulator.mpRegenPct += passive.valuePct;
    }

    if (passive.category === "statBoost" && passive.stat) {
      accumulator.statPct[passive.stat] += passive.valuePct;
    }

    // Critical rate boost from "鋭眼" passive
    if (passive.name === "鋭眼") {
      accumulator.criticalRate += passive.valuePct;
      const mulMatch = passive.description.match(/ダメージ倍率が追加で(\d+)%上昇/);
      if (mulMatch) {
        accumulator.criticalDamage += parseInt(mulMatch[1], 10);
      }
    }

    return accumulator;
  }, clone(EMPTY_PASSIVE_BONUSES));

  return { bonuses, thresholdPassives };
}

function aggregateBossPassives(passiveSkills: EquipmentPassiveSkill[]): { bonuses: EquipmentPassiveBonuses; thresholdPassives: EquipmentPassiveSkill[] } {
  const thresholdPassives: EquipmentPassiveSkill[] = [];
  
  const bonuses = passiveSkills.reduce<EquipmentPassiveBonuses>((accumulator, passive) => {
    // Skip threshold-based passives - they'll be applied dynamically
    if (passive.threshold !== undefined) {
      thresholdPassives.push(passive);
      return accumulator;
    }

    if (passive.category === "elementBoost" && passive.element) {
      accumulator.elementDamagePct[passive.element] += passive.valuePct;
    }

    if (passive.category === "statusResist" && passive.statusType) {
      accumulator.statusResistPct[passive.statusType] += passive.valuePct;
    }

    if (passive.category === "mpRegen") {
      accumulator.mpRegenPct += passive.valuePct;
    }

    if (passive.category === "statBoost" && passive.stat) {
      accumulator.statPct[passive.stat] += passive.valuePct;
    }

    return accumulator;
  }, clone(EMPTY_PASSIVE_BONUSES));

  return { bonuses, thresholdPassives };
}

function getBossElementForStage(stage: number): Element {
  return ELEMENTS[(stage - 1) % ELEMENTS.length];
}

function getBossStatusChance(stage: number) {
  return clamp(20 + stage * 3, 20, 55);
}

function getAdjustedDefense(actor: CombatantState) {
  const shockPenalty = actor.statuses
    .filter((status) => status.type === "shock")
    .reduce((sum, status) => sum + status.potencyPct, 0);

  const baseDefense = Math.round(actor.defense * (1 + actor.defenseBuffPct / 100));
  return Math.max(1, Math.round(baseDefense * (1 - clamp(shockPenalty, 0, 50) / 100)));
}

function getAdjustedSpeed(actor: CombatantState) {
  const shockPenalty = actor.statuses
    .filter((status) => status.type === "shock")
    .reduce((sum, status) => sum + status.potencyPct / 2, 0);
  const frostPenalty = actor.statuses
    .filter((status) => status.type === "frostbite")
    .reduce((sum, status) => sum + status.potencyPct, 0);

  const totalPenalty = clamp(shockPenalty + frostPenalty, 0, 60);
  const baseSpeed = Math.round(actor.speed * (1 + actor.speedBuffPct / 100));
  return Math.max(1, Math.round(baseSpeed * (1 - totalPenalty / 100)));
}

function getMpRecovery(actor: CombatantState) {
  if (actor.maxMp <= 0) {
    return 0;
  }

  const frostPenalty = actor.statuses.some((status) => status.type === "frostbite") ? 0.6 : 1;
  return Math.max(
    1,
    Math.round((4 + actor.speed * 0.18) * (1 + actor.mpRegenPct / 100) * frostPenalty),
  );
}

function applyStatus(
  target: CombatantState,
  status: NonNullable<EquipmentActiveSkill["statusEffect"]>,
  rng: RandomFn,
) {
  const resist = clamp(target.statusResistPct[status.type] ?? 0, 0, 85);
  if (rng() * 100 < resist) {
    return false;
  }

  const existing = target.statuses.find((currentStatus) => currentStatus.type === status.type);
  if (existing) {
    existing.durationTurns = Math.max(existing.durationTurns, status.durationTurns);
    existing.potencyPct = Math.max(existing.potencyPct, status.potencyPct);
  } else {
    target.statuses.push({
      type: status.type,
      durationTurns: status.durationTurns,
      potencyPct: status.potencyPct,
    });
  }

  return true;
}

function applyGuard(target: CombatantState, guardEffect: NonNullable<EquipmentActiveSkill["guardEffect"]>) {
  target.guard = {
    physicalReductionPct: guardEffect.physicalReductionPct,
    elementalReductionPct: guardEffect.elementalReductionPct,
    remainingHits: guardEffect.durationHits,
  };
}

function consumeGuardReduction(target: CombatantState, attackElement: Element) {
  if (!target.guard) {
    return 0;
  }

  const reduction =
    attackElement === "physical"
      ? target.guard.physicalReductionPct
      : target.guard.elementalReductionPct;

  target.guard.remainingHits -= 1;
  if (target.guard.remainingHits <= 0) {
    target.guard = null;
  }

  return reduction;
}

function calculateDamage(
  attacker: CombatantState,
  defender: CombatantState,
  element: Element,
  powerPct: number,
  piercePct?: number,
  extraDamagePct?: number,
  threshold?: number,
  pierceBonusElement?: Element,
  multiplier?: number,
  durationTurns?: number,
  forceCritical?: boolean,
  log?: RaidBattleLogEntry[],
  turn?: number,
): { mainDamage: number; extraDamage: number; isCritical: boolean } {
  // Apply threshold-based passive skills for attacker (怒気)
  let dynamicAttackBonus = 0;
  const attackerHpPct = attacker.hp / attacker.maxHp * 100;
  for (const passive of attacker.thresholdPassives) {
    if (passive.category === "elementBoost" && passive.threshold && attackerHpPct <= passive.threshold) {
      dynamicAttackBonus += passive.valuePct;
      if (log && turn) {
        log.push({
          turn,
          actor: "system",
          text: `${attacker.name} のパッシブ「${passive.name}」が発動！攻撃力が${passive.valuePct}%上昇した。`,
        });
      }
      if (passive.threshold === 50 && attackerHpPct <= 25) {
        const extraMatch = passive.description.match(/さらに(\d+)%追加上昇/);
        if (extraMatch) {
          const extraBonus = parseInt(extraMatch[1], 10);
          dynamicAttackBonus += extraBonus;
          if (log && turn) {
            log.push({
              turn,
              actor: "system",
              text: `${attacker.name} のパッシブ「${passive.name}」がさらに発動！攻撃力が追加で${extraBonus}%上昇した。`,
            });
          }
        }
      }
    }
  }

  const attackerElementBonus = (attacker.elementDamagePct[element] ?? 0) + dynamicAttackBonus;
  const attackBonusPct = attacker.actor === "monster" ? attacker.raidDamagePct : 0;

  // Apply threshold-based passive skills for defender (不屈の守り - defense boost)
  let dynamicDefenseBoost = 0;
  const defenderHpPct = defender.hp / defender.maxHp * 100;
  for (const passive of defender.thresholdPassives) {
    if (passive.category === "statBoost" && passive.stat === "defense" && passive.threshold && defenderHpPct <= passive.threshold) {
      dynamicDefenseBoost += passive.valuePct;
      if (log && turn) {
        log.push({
          turn,
          actor: "system",
          text: `${defender.name} のパッシブ「${passive.name}」が発動！防御力が${passive.valuePct}%上昇した。`,
        });
      }
    }
  }
  
  let defenseValue = getAdjustedDefense(defender);
  defenseValue = Math.round(defenseValue * (1 + dynamicDefenseBoost / 100));
  
  const triangle = getElementTriangleBonus(element, defender.element);
  const guardReduction = consumeGuardReduction(defender, element);
  const baseAttack = Math.round(attacker.attack * (1 + attacker.attackBuffPct / 100));
  const raw = baseAttack * (powerPct / 100);
  const boosted = raw * (1 + attackerElementBonus / 100) * (1 + attackBonusPct / 100);

  // Apply defense piercing
  let effectiveDefense = defenseValue;
  if (piercePct) {
    // Check if defender's element matches pierceBonusElement for 100% pierce
    const pierceMultiplier = (pierceBonusElement && defender.element === pierceBonusElement) ? 1.0 : piercePct / 100;
    effectiveDefense = defenseValue * (1 - pierceMultiplier);
  }

  const defended = Math.max(1, boosted - effectiveDefense * 0.58);
  const guarded = defended * (1 - guardReduction / 100);
  let mainDamage = Math.round(Math.max(boosted * 0.2, guarded * triangle));

  // Apply conditional multiplier (threshold-based)
  if (threshold && defender.hp / defender.maxHp * 100 <= threshold) {
    mainDamage = Math.round(mainDamage * (multiplier ?? 1));
  }

  // Apply multiplier against sealed enemies
  if (multiplier && defender.statuses.some((s) => s.type === "seal")) {
    mainDamage = Math.round(mainDamage * multiplier);
  }

  // Apply general multiplier for other conditions
  if (multiplier && !threshold && !defender.statuses.some((s) => s.type === "seal")) {
    mainDamage = Math.round(mainDamage * multiplier);
  }

  // Calculate extra damage separately
  let extraDamage = 0;
  if (extraDamagePct) {
    const extraRaw = baseAttack * (extraDamagePct / 100);
    const extraBoosted = extraRaw * (1 + attackerElementBonus / 100) * (1 + attackBonusPct / 100);
    const extraDefended = Math.max(1, extraBoosted - effectiveDefense * 0.58);
    const extraGuarded = extraDefended * (1 - guardReduction / 100);
    extraDamage = Math.round(Math.max(extraBoosted * 0.2, extraGuarded * triangle));
  }

  // Critical hit calculation
  const isCritical = forceCritical || (Math.random() * 100 < attacker.criticalRate);
  if (isCritical) {
    mainDamage = Math.round(mainDamage * (attacker.criticalDamage / 100));
  }

  return { mainDamage, extraDamage, isCritical };
}

function tickStatuses(actor: CombatantState, log: RaidBattleLogEntry[], turn: number) {
  let burnedDamage = 0;

  actor.statuses = actor.statuses
    .map((status) => {
      if (status.type === "burn") {
        const damage = Math.max(1, Math.round(actor.maxHp * (status.potencyPct / 100)));
        actor.hp = Math.max(0, actor.hp - damage);
        burnedDamage += damage;
      }

      return {
        ...status,
        durationTurns: status.durationTurns - 1,
      };
    })
    .filter((status) => status.durationTurns > 0);

  if (burnedDamage > 0) {
    log.push({
      turn,
      actor: "system",
      text: `${actor.name} は炎上で ${burnedDamage} ダメージを受けた。`,
    });
  }

  // Handle buff turns
  if (actor.attackBuffTurns > 0) {
    actor.attackBuffTurns -= 1;
    if (actor.attackBuffTurns === 0) {
      actor.attackBuffPct = 0;
    }
  }
  if (actor.defenseBuffTurns > 0) {
    actor.defenseBuffTurns -= 1;
    if (actor.defenseBuffTurns === 0) {
      actor.defenseBuffPct = 0;
    }
  }
  if (actor.speedBuffTurns > 0) {
    actor.speedBuffTurns -= 1;
    if (actor.speedBuffTurns === 0) {
      actor.speedBuffPct = 0;
    }
  }
  if (actor.reflectTurns > 0) {
    actor.reflectTurns -= 1;
    if (actor.reflectTurns === 0) {
      actor.reflectPct = 0;
      actor.reflectElement = null;
    }
  }
}

function createMonsterBattleState(profile: CombatProfile, thresholdPassives: EquipmentPassiveSkill[] = []): CombatantState {
  return {
    actor: "monster",
    name: "Monster",
    maxHp: profile.hp,
    hp: profile.hp,
    maxMp: profile.mp,
    mp: profile.mp,
    attack: profile.attack,
    defense: profile.defense,
    speed: profile.speed,
    element: "physical",
    statuses: [],
    guard: null,
    elementDamagePct: profile.elementDamagePct,
    statusResistPct: profile.statusResistPct,
    mpRegenPct: profile.mpRegenPct,
    raidDamagePct: profile.raidDamagePct,
    attackBuffPct: 0,
    defenseBuffPct: 0,
    speedBuffPct: 0,
    attackBuffTurns: 0,
    defenseBuffTurns: 0,
    speedBuffTurns: 0,
    reflectPct: 0,
    reflectElement: null,
    reflectTurns: 0,
    reflectMultiplier: 1.0,
    criticalRate: profile.criticalRate,
    criticalDamage: profile.criticalDamage,
    thresholdPassives,
  };
}

function createBossBattleState(boss: RaidBoss): CombatantState {
  const { bonuses: passiveBonuses, thresholdPassives } = aggregateBossPassives(boss.passiveSkills);
  const baseStats = {
    hp: boss.maxHp,
    mp: 100,
    attack: boss.attack,
    defense: boss.defense,
    speed: boss.speed,
  };

  const hp = Math.round(baseStats.hp * (1 + passiveBonuses.statPct.hp / 100));
  const mp = Math.round(baseStats.mp * (1 + passiveBonuses.statPct.mp / 100));
  const attack = Math.round(baseStats.attack * (1 + (passiveBonuses.statPct.attack) / 100));
  const defense = Math.round(baseStats.defense * (1 + (passiveBonuses.statPct.defense) / 100));
  const speed = Math.round(baseStats.speed * (1 + (passiveBonuses.statPct.speed) / 100));

  return {
    actor: "boss",
    name: `Boss Lv.${boss.level}`,
    maxHp: hp,
    hp: boss.currentHp,
    maxMp: mp,
    mp: mp,
    attack,
    defense,
    speed,
    element: boss.element,
    statuses: [],
    guard: null,
    elementDamagePct: passiveBonuses.elementDamagePct,
    statusResistPct: passiveBonuses.statusResistPct,
    mpRegenPct: passiveBonuses.mpRegenPct,
    raidDamagePct: 0,
    attackBuffPct: 0,
    defenseBuffPct: 0,
    speedBuffPct: 0,
    attackBuffTurns: 0,
    defenseBuffTurns: 0,
    speedBuffTurns: 0,
    reflectPct: 0,
    reflectElement: null,
    reflectTurns: 0,
    reflectMultiplier: 1.0,
    criticalRate: 0,
    criticalDamage: 150,
    thresholdPassives,
  };
}

function chooseMonsterAction(
  monster: CombatantState,
  boss: CombatantState,
  equipment: Equipment[],
): BattleAction {
  const isSealed = monster.statuses.some((status) => status.type === "seal");
  if (isSealed) {
    return {
      kind: "basic",
      name: "基本攻撃",
      element: "physical",
      powerPct: 100,
      mpCost: 0,
      statusEffect: null,
      guardEffect: null,
    };
  }

  const activeSkills = equipment.map((item) => item.activeSkill).filter((skill) => skill.mpCost <= monster.mp);
  const guardSkill =
    monster.guard === null && monster.hp / monster.maxHp <= 0.42
      ? activeSkills.find((skill) => skill.family === "guard")
      : null;

  if (guardSkill) {
    return {
      kind: "skill",
      name: guardSkill.name,
      element: guardSkill.element,
      powerPct: guardSkill.powerPct,
      mpCost: guardSkill.mpCost,
      statusEffect: guardSkill.statusEffect,
      guardEffect: guardSkill.guardEffect,
      piercePct: guardSkill.piercePct,
      extraDamagePct: guardSkill.extraDamagePct,
      threshold: guardSkill.threshold,
      pierceBonusElement: guardSkill.pierceBonusElement,
      multiplier: guardSkill.multiplier,
      durationTurns: guardSkill.durationTurns,
      condition: guardSkill.condition,
      stackable: guardSkill.stackable,
      reflectPct: guardSkill.reflectPct,
      reflectMultiplier: guardSkill.reflectMultiplier,
    };
  }

  const attackSkills = activeSkills
    .filter((skill) => skill.family === "attack" && skill.powerPct !== null)
    .map((skill) => {
      const triangle = getElementTriangleBonus(skill.element, boss.element);
      const elementBonus = monster.elementDamagePct[skill.element] ?? 0;
      const expectedDamage =
        monster.attack *
        ((skill.powerPct ?? 100) / 100) *
        (1 + elementBonus / 100) *
        (1 + monster.raidDamagePct / 100) *
        triangle;

      return {
        skill,
        score: expectedDamage + (skill.statusEffect ? 12 : 0),
      };
    })
    .sort((left, right) => right.score - left.score);

  if (attackSkills.length > 0) {
    const selected = attackSkills[0]!.skill;
    return {
      kind: "skill",
      name: selected.name,
      element: selected.element,
      powerPct: selected.powerPct,
      mpCost: selected.mpCost,
      statusEffect: selected.statusEffect,
      guardEffect: selected.guardEffect,
      piercePct: selected.piercePct,
      extraDamagePct: selected.extraDamagePct,
      threshold: selected.threshold,
      pierceBonusElement: selected.pierceBonusElement,
      multiplier: selected.multiplier,
      durationTurns: selected.durationTurns,
      condition: selected.condition,
      stackable: selected.stackable,
      reflectPct: selected.reflectPct,
      reflectMultiplier: selected.reflectMultiplier,
      description: selected.description,
    };
  }

  return {
    kind: "basic",
    name: "基本攻撃",
    element: "physical",
    powerPct: 100,
    mpCost: 0,
    statusEffect: null,
    guardEffect: null,
  };
}

function chooseBossAction(boss: CombatantState, bossSkills: EquipmentActiveSkill[], rng: RandomFn): BattleAction {
  const isSealed = boss.statuses.some((status) => status.type === "seal");
  if (isSealed) {
    return {
      kind: "basic",
      name: "基本攻撃",
      element: "physical",
      powerPct: 100,
      mpCost: 0,
      statusEffect: null,
      guardEffect: null,
    };
  }

  const availableSkills = bossSkills.filter((skill) => skill.mpCost <= boss.mp);
  const guardSkill =
    boss.guard === null && boss.hp / boss.maxHp <= 0.4
      ? availableSkills.find((skill) => skill.family === "guard")
      : null;

  if (guardSkill) {
    return {
      kind: "skill",
      name: guardSkill.name,
      element: guardSkill.element,
      powerPct: guardSkill.powerPct,
      mpCost: guardSkill.mpCost,
      statusEffect: guardSkill.statusEffect,
      guardEffect: guardSkill.guardEffect,
      piercePct: guardSkill.piercePct,
      extraDamagePct: guardSkill.extraDamagePct,
      threshold: guardSkill.threshold,
      pierceBonusElement: guardSkill.pierceBonusElement,
      multiplier: guardSkill.multiplier,
      durationTurns: guardSkill.durationTurns,
      condition: guardSkill.condition,
      stackable: guardSkill.stackable,
      reflectPct: guardSkill.reflectPct,
      reflectMultiplier: guardSkill.reflectMultiplier,
      description: guardSkill.description,
    };
  }

  const attackSkills = availableSkills
    .filter((skill) => skill.family === "attack" && skill.powerPct !== null)
    .map((skill) => ({
      skill,
      expectedDamage: boss.attack * ((skill.powerPct ?? 100) / 100),
    }))
    .sort((a, b) => b.expectedDamage - a.expectedDamage);

  if (attackSkills.length > 0 && rng() < 0.7) {
    const selected = attackSkills[0]!.skill;
    return {
      kind: "skill",
      name: selected.name,
      element: selected.element,
      powerPct: selected.powerPct,
      mpCost: selected.mpCost,
      statusEffect: selected.statusEffect,
      guardEffect: selected.guardEffect,
      piercePct: selected.piercePct,
      extraDamagePct: selected.extraDamagePct,
      threshold: selected.threshold,
      pierceBonusElement: selected.pierceBonusElement,
      multiplier: selected.multiplier,
      durationTurns: selected.durationTurns,
      condition: selected.condition,
      stackable: selected.stackable,
      reflectPct: selected.reflectPct,
      reflectMultiplier: selected.reflectMultiplier,
      description: selected.description,
    };
  }

  return {
    kind: "basic",
    name: `${ELEMENT_LABELS[boss.element]}攻撃`,
    element: boss.element,
    powerPct: 100,
    mpCost: 0,
    statusEffect: null,
    guardEffect: null,
  };
}

function executeAction(
  attacker: CombatantState,
  defender: CombatantState,
  action: BattleAction,
  rng: RandomFn,
  log: RaidBattleLogEntry[],
  turn: number,
) {
  if (action.kind === "skill") {
    attacker.mp = Math.max(0, attacker.mp - action.mpCost);
  }

  // Handle reflection skills (リフレクト) - must be before guardEffect check
  if (action.name.includes("リフレクト")) {
    const reflectPct = action.reflectPct ?? 20;
    const reflectMultiplier = action.reflectMultiplier ?? 1.0;
    attacker.reflectPct = reflectPct;
    attacker.reflectElement = action.element;
    attacker.reflectTurns = action.durationTurns ?? 2;
    attacker.reflectMultiplier = reflectMultiplier;
    
    // Apply guard effect if present
    if (action.guardEffect) {
      applyGuard(attacker, action.guardEffect);
    }
    
    // Apply defense buff
    const defBuff = action.guardEffect ? (action.guardEffect as any).physicalReductionPct : 15;
    attacker.defenseBuffPct = defBuff;
    attacker.defenseBuffTurns = action.durationTurns ?? 2;
    
    log.push({
      turn,
      actor: attacker.actor,
      text: `${attacker.name} は ${action.name} を使用。${reflectPct}%のダメージを反射し、防御力が${defBuff}%上昇した（${action.durationTurns}ターン）。`,
    });
    return 0;
  }

  if (action.guardEffect) {
    applyGuard(attacker, action.guardEffect);
    log.push({
      turn,
      actor: attacker.actor,
      text: `${attacker.name} は ${action.name} を使用。${action.guardEffect.physicalReductionPct}% / ${action.guardEffect.elementalReductionPct}% の防壁を展開した。`,
    });
    return 0;
  }

  // Handle self-buff skills (高揚の撃, 覚醒, etc.)
  if (action.name.includes("高揚") || action.name.includes("覚醒")) {
    const hpThreshold = attacker.hp / attacker.maxHp <= 0.5;
    let atkBuff = 10;
    let turns = action.durationTurns ?? 2;
    
    if (hpThreshold && action.name.includes("高揚")) {
      atkBuff *= 2;
    }
    
    attacker.attackBuffPct = atkBuff;
    attacker.attackBuffTurns = turns;
    
    if (action.name.includes("覚醒")) {
      const spdBuff = 10 + Math.floor(Math.random() * 15);
      attacker.speedBuffPct = spdBuff;
      attacker.speedBuffTurns = turns;
      log.push({
        turn,
        actor: attacker.actor,
        text: `${attacker.name} は ${action.name} を使用。攻撃力が${atkBuff}%・素早さが${spdBuff}%上昇した（${turns}ターン）。`,
      });
    } else {
      log.push({
        turn,
        actor: attacker.actor,
        text: `${attacker.name} は ${action.name} を使用。攻撃力が${atkBuff}%上昇した（${turns}ターン）。${hpThreshold ? "HP低下で効果倍増！" : ""}`,
      });
    }
  }

  const { mainDamage, extraDamage, isCritical } = calculateDamage(
    attacker,
    defender,
    action.element,
    action.powerPct ?? 100,
    action.piercePct,
    action.extraDamagePct,
    action.threshold,
    action.pierceBonusElement,
    action.multiplier,
    action.durationTurns,
    undefined,
    log,
    turn,
  );
  const totalDamage = mainDamage + extraDamage;
  defender.hp = Math.max(0, defender.hp - totalDamage);
  const triangle = getElementTriangleBonus(action.element, defender.element);
  const triangleText =
    triangle > 1 ? " 有利属性!" : triangle < 1 ? " 不利属性..." : "";
  const criticalText = isCritical ? " クリティカル!" : "";

  log.push({
    turn,
    actor: attacker.actor,
    text: `${attacker.name} の ${action.name}。${defender.name} に ${mainDamage} ダメージ。${triangleText}${criticalText}`.trim(),
  });

  if (extraDamage > 0) {
    log.push({
      turn,
      actor: "system",
      text: `追加ダメージ ${extraDamage}。`,
    });
  }

  if (action.statusEffect && defender.hp > 0) {
    const applied = applyStatus(defender, action.statusEffect, rng);
    log.push({
      turn,
      actor: "system",
      text: applied
        ? `${defender.name} に ${STATUS_LABELS[action.statusEffect.type]} ${action.statusEffect.durationTurns}ターン。`
        : `${defender.name} は ${STATUS_LABELS[action.statusEffect.type]} を防いだ。`,
    });
  }

  // Handle combo skills (連撃) - apply attack buff after hits
  if (action.name.includes("連撃") && action.durationTurns && action.description) {
    const buffMatch = action.description.match(/(\d+)%上昇する/);
    if (buffMatch) {
      const buffPct = parseInt(buffMatch[1], 10);
      const turns = action.durationTurns;
      attacker.attackBuffPct = buffPct;
      attacker.attackBuffTurns = turns;
      log.push({
        turn,
        actor: "system",
        text: `${attacker.name} の ${action.name} が発動！攻撃力が${buffPct}%上昇した（${turns}ターン）。`,
      });
    }
  }

  // Handle reflection damage
  if (defender.reflectPct > 0 && defender.reflectTurns > 0) {
    const reflectDamage = Math.round(totalDamage * (defender.reflectPct / 100));
    if (reflectDamage > 0) {
      const reflectBonus = (defender.reflectElement === action.element) ? defender.reflectMultiplier : 1;
      const finalReflectDamage = Math.round(reflectDamage * reflectBonus);
      attacker.hp = Math.max(0, attacker.hp - finalReflectDamage);
      log.push({
        turn,
        actor: "system",
        text: `${defender.name} の反射！${attacker.name} に ${finalReflectDamage} ダメージ。`,
      });
    }
  }

  return totalDamage;
}

function finishTurn(
  actor: CombatantState,
  log: RaidBattleLogEntry[],
  turn: number,
) {
  tickStatuses(actor, log, turn);
  
  // Apply threshold-based passive HP regeneration (不屈の守り)
  if (actor.hp > 0) {
    const hpPct = actor.hp / actor.maxHp * 100;
    for (const passive of actor.thresholdPassives) {
      if (passive.category === "statBoost" && passive.stat === "defense" && passive.threshold && hpPct <= passive.threshold) {
        const regenMatch = passive.description.match(/最大HPの(\d+)%を回復/);
        if (regenMatch) {
          const regenPct = parseInt(regenMatch[1], 10);
          const recoveredHp = Math.min(actor.maxHp - actor.hp, Math.round(actor.maxHp * regenPct / 100));
          if (recoveredHp > 0) {
            actor.hp += recoveredHp;
            log.push({
              turn,
              actor: "system",
              text: `${actor.name} は ${passive.name} で HP を ${recoveredHp} 回復した。`,
            });
          }
        }
      }
    }
  }
  
  if (actor.actor === "monster" && actor.hp > 0) {
    const recoveredMp = Math.min(actor.maxMp - actor.mp, getMpRecovery(actor));
    if (recoveredMp > 0) {
      actor.mp += recoveredMp;
      log.push({
        turn,
        actor: "system",
        text: `${actor.name} は MP を ${recoveredMp} 回復した。`,
      });
    }
  }
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function toLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getElementLabel(element: Element) {
  return ELEMENT_LABELS[element];
}

export function getStatusLabel(status: StatusEffectType) {
  return STATUS_LABELS[status];
}

export function getSlotLabel(slot: EquipmentSlot) {
  return SLOT_LABELS[slot];
}

export function getRarityLabel(rarity: EquipmentRarity) {
  return RARITY_LABELS[rarity];
}

export function getLevelChoiceRerollCost() {
  return LEVEL_CHOICE_REROLL_COST;
}

export function getEquipmentSkillRerollCost() {
  return EQUIPMENT_SKILL_REROLL_COST;
}

export function createEmptyTimer(): ActiveTimer {
  return {
    activeTaskId: null,
    startedAt: null,
    targetEndsAt: null,
    bonusSnapshot: null,
  };
}

export function createInitialMonster(): Monster {
  return {
    id: "starter-monster",
    name: "Glyph",
    level: 1,
    exp: 0,
    stats: {
      hp: 110,
      mp: 42,
      attack: 18,
      defense: 10,
      speed: 11,
    },
    skills: [],
    perks: {
      taskRewardMultiplier: 0,
      raidDamageMultiplier: 0,
      energyCap: 0,
    },
    pendingLevelChoices: [],
  };
}

function getBossSkillConfig(stage: number): { activeCount: number; passiveCount: number; rarity: EquipmentRarity } {
  if (stage === 1) return { activeCount: 1, passiveCount: 0, rarity: "C" };
  if (stage <= 3) return { activeCount: 1, passiveCount: 1, rarity: "C" };
  if (stage <= 5) return { activeCount: 2, passiveCount: 1, rarity: "B" };
  if (stage <= 7) return { activeCount: 2, passiveCount: 2, rarity: "B" };
  if (stage <= 10) return { activeCount: 3, passiveCount: 2, rarity: "A" };
  if (stage <= 15) return { activeCount: 3, passiveCount: 3, rarity: "A" };
  if (stage <= 20) return { activeCount: 4, passiveCount: 3, rarity: "S" };
  if (stage <= 35) return { activeCount: 4, passiveCount: 4, rarity: "SS" };
  if (stage <= 50) return { activeCount: 5, passiveCount: 4, rarity: "SSS" };
  return { activeCount: 5, passiveCount: 5, rarity: "SSS" };
}

function generateBossSkills(stage: number, element: Element, rng: RandomFn): { activeSkills: EquipmentActiveSkill[]; passiveSkills: EquipmentPassiveSkill[] } {
  const config = getBossSkillConfig(stage);
  const activeSkills: EquipmentActiveSkill[] = [];
  const passiveSkills: EquipmentPassiveSkill[] = [];

  for (let i = 0; i < config.activeCount; i++) {
    const skill = generateEquipmentActiveSkill(config.rarity, rng);
    activeSkills.push({ ...skill, element });
  }

  for (let i = 0; i < config.passiveCount; i++) {
    const skill = generateEquipmentPassiveSkill(config.rarity, rng);
    passiveSkills.push({ ...skill, element });
  }

  return { activeSkills, passiveSkills };
}

export function createInitialRaidBoss(): RaidBoss {
  const { activeSkills, passiveSkills } = generateBossSkills(1, getBossElementForStage(1), Math.random);
  return {
    stage: 1,
    level: 1,
    maxHp: 1200,
    currentHp: 1200,
    attack: 70,
    defense: 40,
    speed: 50,
    element: getBossElementForStage(1),
    energyCost: 20,
    lastAttemptDate: null,
    activeSkills,
    passiveSkills,
  };
}

function createStarterEquipment(): { inventory: Equipment[]; equippedSlots: EquippedSlots } {
  const inventory = EQUIPMENT_SLOTS.map((slot, index) =>
    generateEquipment(1, createSeededRandom(index + 11), slot, "C"),
  );

  return {
    inventory,
    equippedSlots: {
      weapon: inventory.find((item) => item.slot === "weapon")?.id ?? null,
      armor: inventory.find((item) => item.slot === "armor")?.id ?? null,
      relic: inventory.find((item) => item.slot === "relic")?.id ?? null,
    },
  };
}

export function createInitialGameState(): PersistedGameState {
  const starterEquipment = createStarterEquipment();

  return {
    tasks: [],
    timer: createEmptyTimer(),
    monster: createInitialMonster(),
    resources: {
      sp: 0,
      energy: 40,
    },
    raid: {
      boss: createInitialRaidBoss(),
      lastDamage: 0,
      lastRewardSummary: null,
      log: ["勉強でエネルギーを溜め、属性と装備を整えてレイドへ挑もう。"],
      lastBattle: null,
      battleInProgress: false,
      currentTurn: 0,
      monsterBattleState: null,
      bossBattleState: null,
      battleLog: [],
    },
    equipmentInventory: starterEquipment.inventory,
    equippedSlots: starterEquipment.equippedSlots,
  };
}

export function normalizePersistedGameState(
  persistedState?: Partial<PersistedGameState>,
): PersistedGameState {
  const initialState = createInitialGameState();

  return {
    tasks: persistedState?.tasks ?? initialState.tasks,
    timer: {
      ...initialState.timer,
      ...(persistedState?.timer ?? {}),
    },
    monster: {
      ...initialState.monster,
      ...(persistedState?.monster ?? {}),
      stats: {
        ...initialState.monster.stats,
        ...(persistedState?.monster?.stats ?? {}),
      },
      perks: {
        ...initialState.monster.perks,
        ...(persistedState?.monster?.perks ?? {}),
      },
      skills: persistedState?.monster?.skills ?? initialState.monster.skills,
      pendingLevelChoices:
        persistedState?.monster?.pendingLevelChoices ?? initialState.monster.pendingLevelChoices,
    },
    resources: {
      ...initialState.resources,
      ...(persistedState?.resources ?? {}),
    },
    raid: {
      ...initialState.raid,
      ...(persistedState?.raid ?? {}),
      boss: {
        ...initialState.raid.boss,
        ...(persistedState?.raid?.boss ?? {}),
      },
      log: persistedState?.raid?.log ?? initialState.raid.log,
      lastBattle: persistedState?.raid?.lastBattle ?? initialState.raid.lastBattle,
    },
    equipmentInventory: persistedState?.equipmentInventory ?? initialState.equipmentInventory,
    equippedSlots: {
      ...initialState.equippedSlots,
      ...(persistedState?.equippedSlots ?? {}),
    },
  };
}

export function expToNextLevel(level: number) {
  return 100 + (level - 1) * 60;
}

export function getEnergyCap(monster: Monster) {
  return 100 + monster.perks.energyCap * 10;
}

export function createTimerBonusSnapshot(monster: Monster): TimerBonusSnapshot {
  const modifiers = getActiveTimerModifiers(monster);

  return {
    taskRewardPct: modifiers.taskRewardPct,
    expGainPct: modifiers.expGainPct,
    energyGainPct: modifiers.energyGainPct,
    timerReductionPct: modifiers.timerReductionPct,
    sourceSkillIds: monster.skills
      .filter((skill) => skill.target === "nextTask")
      .map((skill) => skill.id),
  };
}

export function getTaskDurationMs(task: Task, monster: Monster, snapshot: TimerBonusSnapshot) {
  const passiveReduction = getPassiveTaskModifiers(monster).timerReductionPct;
  const totalReduction = clamp(passiveReduction + snapshot.timerReductionPct, 0, 80);
  return Math.round(task.durationMinutes * 60_000 * (1 - totalReduction / 100));
}

export function calculateTaskCompletionReward(
  task: Task,
  monster: Monster,
  snapshot: TimerBonusSnapshot | null,
): CompletionReward {
  const passiveModifiers = getPassiveTaskModifiers(monster);
  const baseReward = task.durationMinutes * task.difficulty;
  const taskRewardPct = passiveModifiers.taskRewardPct + (snapshot?.taskRewardPct ?? 0);
  const expGainPct = passiveModifiers.expGainPct + (snapshot?.expGainPct ?? 0);
  const energyGainPct = passiveModifiers.energyGainPct + (snapshot?.energyGainPct ?? 0);
  const scaledBase = Math.round(baseReward * (1 + taskRewardPct / 100));
  const exp = Math.round(scaledBase * (1 + expGainPct / 100));
  const sp = Math.ceil(scaledBase / 10);
  const baseEnergy = clamp(Math.ceil(scaledBase / 4), 5, 30);
  const energy = Math.max(1, Math.round(baseEnergy * (1 + energyGainPct / 100)));

  return {
    baseReward,
    exp,
    sp,
    energy,
    taskRewardPct,
    expGainPct,
    energyGainPct,
  };
}

export function generateLevelChoiceSet(
  monster: Monster,
  sourceLevel: number,
  rng: RandomFn = Math.random,
  ignoredChoiceSetId?: string,
): LevelUpChoiceSet {
  const choices: LevelUpChoice[] = [];
  const seenKeys = new Set<string>();

  while (choices.length < 3) {
    const choiceType = rollChoiceType(rng);
    let candidate: LevelUpChoice | null = null;

    if (choiceType === "stat") {
      candidate = buildStatChoice(pickOne(STAT_CHOICE_LIBRARY, rng));
    } else if (choiceType === "skill") {
      candidate = buildSkillChoice(monster, rng, ignoredChoiceSetId);
    } else {
      const specials = buildSpecialChoices(monster.perks);
      candidate = specials.length > 0 ? pickOne(specials, rng) : null;
    }

    if (!candidate) {
      candidate = buildFallbackChoice(monster, seenKeys);
    }

    const key = getChoiceKey(candidate);
    if (seenKeys.has(key)) {
      candidate = buildFallbackChoice(monster, seenKeys);
    }

    const fallbackKey = getChoiceKey(candidate);
    if (seenKeys.has(fallbackKey)) {
      break;
    }

    seenKeys.add(fallbackKey);
    choices.push(candidate);
  }

  while (choices.length < 3) {
    const fallback = buildFallbackChoice(monster, seenKeys);
    const key = getChoiceKey(fallback);
    if (seenKeys.has(key)) {
      break;
    }
    seenKeys.add(key);
    choices.push(fallback);
  }

  return {
    id: createId("choice-set"),
    sourceLevel,
    choices,
    rerolls: 0,
  };
}

export function rerollChoiceSet(
  monster: Monster,
  choiceSet: LevelUpChoiceSet,
  rng: RandomFn = Math.random,
) {
  const rerolledSet = generateLevelChoiceSet(monster, choiceSet.sourceLevel, rng, choiceSet.id);
  rerolledSet.rerolls = choiceSet.rerolls + 1;
  return rerolledSet;
}

export function applyLevelChoice(monster: Monster, choice: LevelUpChoice) {
  const nextMonster = clone(monster);

  if (choice.kind === "stat") {
    nextMonster.stats[choice.stat] += choice.amount;
    return nextMonster;
  }

  if (choice.kind === "skill") {
    const alreadyOwned = nextMonster.skills.some((skill) => skill.signature === choice.skill.signature);
    if (!alreadyOwned) {
      nextMonster.skills.push(choice.skill);
    }
    return nextMonster;
  }

  nextMonster.perks[choice.perkKey] = clamp(nextMonster.perks[choice.perkKey] + 1, 0, MAX_PERK_LEVEL);
  return nextMonster;
}

export function grantMonsterExperience(
  monster: Monster,
  expGain: number,
  rng: RandomFn = Math.random,
) {
  const nextMonster = clone(monster);
  nextMonster.exp += expGain;
  let gainedLevels = 0;

  while (nextMonster.exp >= expToNextLevel(nextMonster.level)) {
    nextMonster.exp -= expToNextLevel(nextMonster.level);
    nextMonster.level += 1;
    gainedLevels += 1;
    nextMonster.stats.hp += BASE_LEVEL_UP_STAT_GAIN.hp;
    nextMonster.stats.mp += BASE_LEVEL_UP_STAT_GAIN.mp;
    nextMonster.stats.attack += BASE_LEVEL_UP_STAT_GAIN.attack;
    nextMonster.stats.defense += BASE_LEVEL_UP_STAT_GAIN.defense;
    nextMonster.stats.speed += BASE_LEVEL_UP_STAT_GAIN.speed;
    nextMonster.pendingLevelChoices.push(generateLevelChoiceSet(nextMonster, nextMonster.level, rng));
  }

  return { monster: nextMonster, gainedLevels };
}

export function grantRandomSkill(monster: Monster, rng: RandomFn = Math.random) {
  const availableSkills = getAvailableSkills(monster);
  if (availableSkills.length === 0) {
    return { monster, skill: null as MonsterSkill | null };
  }

  const skill = pickOne(availableSkills, rng);
  return {
    monster: {
      ...monster,
      skills: [...monster.skills, skill],
    },
    skill,
  };
}

export function generateEquipment(
  stage: number,
  rng: RandomFn = Math.random,
  forcedSlot?: EquipmentSlot,
  forcedRarity?: EquipmentRarity,
): Equipment {
  const rarity = forcedRarity ?? rollRarity(stage, rng);
  const slot = forcedSlot ?? pickOne(EQUIPMENT_SLOTS, rng);
  const activeSkill = generateEquipmentActiveSkill(rarity, rng);
  const passiveSkill = generateEquipmentPassiveSkill(rarity, rng);
  const statBonuses = rollStatBonuses(slot, rarity, stage, rng);

  return {
    id: createId("equipment"),
    slot,
    name: createEquipmentName(slot, rarity, activeSkill, rng),
    rarity,
    dropStage: stage,
    statBonuses,
    activeSkill,
    passiveSkill,
  };
}

export function rerollEquipmentActiveSkill(
  equipment: Equipment,
  rng: RandomFn = Math.random,
): Equipment {
  return {
    ...equipment,
    activeSkill: generateEquipmentActiveSkill(equipment.rarity, rng),
  };
}

export function rerollEquipmentPassiveSkill(
  equipment: Equipment,
  rng: RandomFn = Math.random,
): Equipment {
  return {
    ...equipment,
    passiveSkill: generateEquipmentPassiveSkill(equipment.rarity, rng),
  };
}

export function getEquippedItems(
  inventory: Equipment[],
  equippedSlots: EquippedSlots,
) {
  return EQUIPMENT_SLOTS.map((slot) =>
    inventory.find((item) => item.id === equippedSlots[slot]),
  ).filter((item): item is Equipment => Boolean(item));
}

export function getMonsterRaidProfile(
  monster: Monster,
  inventory: Equipment[] = [],
  equippedSlots: EquippedSlots = { weapon: null, armor: null, relic: null },
): CombatProfile {
  const raidModifiers = getRaidModifiers(monster);
  const equippedItems = getEquippedItems(inventory, equippedSlots);
  const equipmentStats = equippedItems.reduce<MonsterStats>(
    (stats, item) => sumStats(stats, item.statBonuses),
    clone(EMPTY_STATS),
  );
  const { bonuses: passiveBonuses, thresholdPassives } = aggregateEquipmentPassives(equippedItems);
  const mergedBaseStats = sumStats(monster.stats, equipmentStats);

  const hp = Math.round(mergedBaseStats.hp * (1 + passiveBonuses.statPct.hp / 100));
  const mp = Math.round(mergedBaseStats.mp * (1 + passiveBonuses.statPct.mp / 100));
  const attack = Math.round(
    mergedBaseStats.attack * (1 + (passiveBonuses.statPct.attack + raidModifiers.attackPct) / 100),
  );
  const defense = Math.round(
    mergedBaseStats.defense * (1 + (passiveBonuses.statPct.defense + raidModifiers.defensePct) / 100),
  );
  const speed = Math.round(
    mergedBaseStats.speed * (1 + (passiveBonuses.statPct.speed + raidModifiers.speedPct) / 100),
  );

  return {
    hp,
    mp,
    attack,
    defense,
    speed,
    raidDamagePct: raidModifiers.raidDamagePct,
    mpRegenPct: passiveBonuses.mpRegenPct,
    elementDamagePct: passiveBonuses.elementDamagePct,
    statusResistPct: passiveBonuses.statusResistPct,
    criticalRate: 5 + passiveBonuses.criticalRate,
    criticalDamage: 150 + passiveBonuses.criticalDamage,
    thresholdPassives,
  };
}

export function getRaidReadyStats(
  monster: Monster,
  inventory: Equipment[] = [],
  equippedSlots: EquippedSlots = { weapon: null, armor: null, relic: null },
) {
  return getMonsterRaidProfile(monster, inventory, equippedSlots);
}

export function canAttemptRaid(boss: RaidBoss, energy: number, date = new Date()) {
  const today = toLocalDateKey(date);
  if (boss.lastAttemptDate === today) {
    return {
      allowed: false,
      reason: "今日はすでにレイドへ挑戦済みです。",
    };
  }

  if (energy < boss.energyCost) {
    return {
      allowed: false,
      reason: `Energy が足りません。必要: ${boss.energyCost}`,
    };
  }

  return {
    allowed: true,
    reason: "",
  };
}

export function createNextRaidBoss(previousBoss: RaidBoss, lastAttemptDate: string, rng: RandomFn = Math.random): RaidBoss {
  const nextStage = previousBoss.stage + 1;
  const nextMaxHp = Math.round(previousBoss.maxHp * 1.05 + 600);
  const nextElement = getBossElementForStage(nextStage);
  const { activeSkills, passiveSkills } = generateBossSkills(nextStage, nextElement, rng);

  return {
    stage: nextStage,
    level: previousBoss.level + 1,
    maxHp: nextMaxHp,
    currentHp: nextMaxHp,
    attack: Math.round(previousBoss.attack * 1.015 + 30),
    defense: Math.round(previousBoss.defense * 1.013 + 20),
    speed: Math.round(previousBoss.speed * 1.01 + 10),
    element: nextElement,
    energyCost: previousBoss.energyCost,
    lastAttemptDate,
    activeSkills,
    passiveSkills,
  };
}

export function simulateRaidBattle(
  monster: Monster,
  boss: RaidBoss,
  inventory: Equipment[],
  equippedSlots: EquippedSlots,
  rng: RandomFn = Math.random,
  date = new Date(),
): SimulatedRaidBattle {
  const today = toLocalDateKey(date);
  const monsterProfile = getMonsterRaidProfile(monster, inventory, equippedSlots);
  const equippedItems = getEquippedItems(inventory, equippedSlots);
  const monsterState = createMonsterBattleState(monsterProfile, monsterProfile.thresholdPassives);
  const bossState = createBossBattleState(boss);
  const log: RaidBattleLogEntry[] = [];
  let turn = 1;
  const bossStartingHp = boss.currentHp;

  while (turn <= MAX_BATTLE_TURNS && monsterState.hp > 0 && bossState.hp > 0) {
    const monsterActsFirst = getAdjustedSpeed(monsterState) >= getAdjustedSpeed(bossState);
    const turnOrder = monsterActsFirst
      ? [
          { current: monsterState, target: bossState },
          { current: bossState, target: monsterState },
        ]
      : [
          { current: bossState, target: monsterState },
          { current: monsterState, target: bossState },
        ];

    for (const { current, target } of turnOrder) {
      if (current.hp <= 0 || target.hp <= 0) {
        continue;
      }

      const action =
        current.actor === "monster"
          ? chooseMonsterAction(current, target, equippedItems)
          : chooseBossAction(current, boss.activeSkills, rng);

      executeAction(current, target, action, rng, log, turn);
      finishTurn(current, log, turn);

      if (target.hp <= 0 || current.hp <= 0) {
        break;
      }
    }

    turn += 1;
  }

  const defeated = bossState.hp <= 0;
  const nextBoss = defeated
    ? createNextRaidBoss(boss, today, rng)
    : {
        ...boss,
        currentHp: bossState.hp,
        lastAttemptDate: today,
      };
  const equipmentDrop = generateEquipment(defeated ? boss.stage + 1 : boss.stage, rng);
  const turnsTaken = Math.min(turn - 1, MAX_BATTLE_TURNS);
  const damageToBoss = bossStartingHp - bossState.hp;
  const outcome =
    bossState.hp <= 0 ? "victory" : monsterState.hp <= 0 ? "defeat" : "stalled";

  return {
    boss: nextBoss,
    defeated,
    today,
    previousStage: boss.stage,
    summary: {
      outcome,
      turns: turnsTaken,
      damageToBoss,
      bossRemainingHp: bossState.hp,
      monsterRemainingHp: monsterState.hp,
      monsterRemainingMp: monsterState.mp,
      equipmentDrop,
      log: log.slice(-24),
    },
  };
}

export function initializeBattleState(
  monster: Monster,
  boss: RaidBoss,
  inventory: Equipment[],
  equippedSlots: EquippedSlots,
): {
  monsterState: CombatantState;
  bossState: CombatantState;
  battleLog: RaidBattleLogEntry[];
} {
  const monsterProfile = getMonsterRaidProfile(monster, inventory, equippedSlots);
  const monsterState = createMonsterBattleState(monsterProfile, monsterProfile.thresholdPassives);
  const bossState = createBossBattleState(boss);
  const battleLog: RaidBattleLogEntry[] = [];

  return { monsterState, bossState, battleLog };
}

export function getAvailableActions(
  monsterState: CombatantState,
  equipment: Equipment[],
): BattleAction[] {
  const actions: BattleAction[] = [];

  actions.push({
    kind: "basic",
    name: "基本攻撃",
    element: "physical",
    powerPct: 100,
    mpCost: 0,
    statusEffect: null,
    guardEffect: null,
  });

  const isSealed = monsterState.statuses.some((status) => status.type === "seal");
  if (isSealed) {
    return actions;
  }

  const activeSkills = equipment.map((item) => item.activeSkill).filter((skill) => skill.mpCost <= monsterState.mp);
  for (const skill of activeSkills) {
    actions.push({
      kind: "skill",
      name: skill.name,
      element: skill.element,
      powerPct: skill.powerPct,
      mpCost: skill.mpCost,
      statusEffect: skill.statusEffect,
      guardEffect: skill.guardEffect,
      piercePct: skill.piercePct,
      extraDamagePct: skill.extraDamagePct,
      threshold: skill.threshold,
      pierceBonusElement: skill.pierceBonusElement,
      multiplier: skill.multiplier,
      durationTurns: skill.durationTurns,
      condition: skill.condition,
      stackable: skill.stackable,
      reflectPct: skill.reflectPct,
      reflectMultiplier: skill.reflectMultiplier,
      description: skill.description,
    });
  }

  return actions;
}

export function executeBattleTurn(
  monsterState: CombatantState,
  bossState: CombatantState,
  playerAction: BattleAction,
  bossSkills: EquipmentActiveSkill[],
  equippedItems: Equipment[],
  rng: RandomFn,
  turn: number,
): {
  monsterState: CombatantState;
  bossState: CombatantState;
  battleLog: RaidBattleLogEntry[];
} {
  const battleLog: RaidBattleLogEntry[] = [];
  const monsterActsFirst = getAdjustedSpeed(monsterState) >= getAdjustedSpeed(bossState);
  const turnOrder = monsterActsFirst
    ? [
        { current: monsterState, target: bossState, action: playerAction },
        { current: bossState, target: monsterState, action: null },
      ]
    : [
        { current: bossState, target: monsterState, action: null },
        { current: monsterState, target: bossState, action: playerAction },
      ];

  for (const { current, target, action } of turnOrder) {
    if (current.hp <= 0 || target.hp <= 0) {
      continue;
    }

    const actualAction = action ?? (current.actor === "boss" ? chooseBossAction(current, bossSkills, rng) : null);
    if (actualAction) {
      executeAction(current, target, actualAction, rng, battleLog, turn);
      finishTurn(current, battleLog, turn);
    }

    if (target.hp <= 0 || current.hp <= 0) {
      break;
    }
  }

  return { monsterState, bossState, battleLog };
}

export function isTimerComplete(targetEndsAt: string | null, nowMs: number) {
  if (!targetEndsAt) {
    return false;
  }

  return new Date(targetEndsAt).getTime() <= nowMs;
}

export function getRemainingMs(targetEndsAt: string | null, nowMs: number) {
  if (!targetEndsAt) {
    return 0;
  }

  return Math.max(0, new Date(targetEndsAt).getTime() - nowMs);
}

export function getSkillRarityFromSignature(generatorSignature: string): EquipmentRarity | null {
  const parts = generatorSignature.split(":");
  if (parts.length < 3) {
    return null;
  }
  const rarity = parts[2];
  if (RARITIES.includes(rarity as EquipmentRarity)) {
    return rarity as EquipmentRarity;
  }
  return null;
}
