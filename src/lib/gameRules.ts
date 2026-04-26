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
};

type CombatantState = {
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
};

type BattleAction = {
  kind: "basic" | "skill";
  name: string;
  element: Element;
  powerPct: number | null;
  mpCost: number;
  statusEffect: EquipmentActiveSkill["statusEffect"];
  guardEffect: EquipmentActiveSkill["guardEffect"];
};

const ELEMENTS: Element[] = ["physical", "fire", "ice", "lightning"];
const STATUS_TYPES: StatusEffectType[] = ["burn", "shock", "frostbite"];
const EQUIPMENT_SLOTS: EquipmentSlot[] = ["weapon", "armor", "relic"];
const RARITIES: EquipmentRarity[] = ["common", "rare", "epic", "legendary"];

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
};

const SLOT_LABELS: Record<EquipmentSlot, string> = {
  weapon: "武器",
  armor: "防具",
  relic: "遺物",
};

const RARITY_LABELS: Record<EquipmentRarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
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
const MAX_BATTLE_TURNS = 12;

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
  },
  mpRegenPct: 0,
};

const RARITY_MULTIPLIER: Record<EquipmentRarity, number> = {
  common: 1,
  rare: 1.3,
  epic: 1.65,
  legendary: 2.05,
};

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
    common: Math.max(22, 68 - stage * 3),
    rare: 20 + stage * 2,
    epic: Math.max(4, stage - 1) * 2,
    legendary: Math.max(0, stage - 4),
  };

  const total = RARITIES.reduce((sum, rarity) => sum + weights[rarity], 0);
  let roll = rng() * total;

  for (const rarity of RARITIES) {
    roll -= weights[rarity];
    if (roll <= 0) {
      return rarity;
    }
  }

  return "common";
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

function generateAttackActiveSkill(rarity: EquipmentRarity, rng: RandomFn): EquipmentActiveSkill {
  const element = pickOne(ELEMENTS, rng);
  const rarityBias = rarity === "legendary" ? 25 : rarity === "epic" ? 15 : rarity === "rare" ? 8 : 0;
  const minPower = Math.min(160, 100 + Math.floor(rarityBias / 2));
  const maxPower = Math.min(200, 170 + rarityBias);
  const powerPct = roundToStep(randomInt(minPower, maxPower, rng), 10);
  const statusType = mapElementToStatus(element);
  const shouldAddStatus = statusType !== null && rng() < 0.55;
  const statusEffect = shouldAddStatus
    ? {
        type: statusType!,
        durationTurns: randomInt(1, 3, rng),
        potencyPct: roundToStep(randomInt(10, 20, rng), 5),
      }
    : null;
  const mpCost = clamp(Math.round(powerPct / 14) + (element === "physical" ? 3 : 6), 8, 22);
  const suffix = statusEffect
    ? `+${STATUS_LABELS[statusEffect.type]}${statusEffect.durationTurns}ターン`
    : "";
  const description = `${ELEMENT_LABELS[element]}属性${powerPct}%ダメージ${suffix}`;

  return {
    id: createId("active"),
    generatorSignature: ["attack", element, powerPct, statusEffect?.type ?? "none", statusEffect?.durationTurns ?? 0].join(":"),
    family: "attack",
    name: `${ELEMENT_LABELS[element]}アーツ`,
    description,
    mpCost,
    element,
    powerPct,
    statusEffect,
    guardEffect: null,
  };
}

function generateGuardActiveSkill(rng: RandomFn): EquipmentActiveSkill {
  const physicalReductionPct = roundToStep(randomInt(70, 90, rng), 5);
  const elementalReductionPct = roundToStep(randomInt(35, 60, rng), 5);
  const mpCost = clamp(Math.round((physicalReductionPct + elementalReductionPct) / 10), 10, 20);
  const description = `次に受ける物理ダメージを${physicalReductionPct}%軽減、物理以外のダメージは${elementalReductionPct}%軽減`;

  return {
    id: createId("active"),
    generatorSignature: ["guard", physicalReductionPct, elementalReductionPct].join(":"),
    family: "guard",
    name: "ガードシフト",
    description,
    mpCost,
    element: "physical",
    powerPct: null,
    statusEffect: null,
    guardEffect: {
      physicalReductionPct,
      elementalReductionPct,
      durationHits: 1,
    },
  };
}

function generateEquipmentActiveSkill(rarity: EquipmentRarity, rng: RandomFn) {
  return rng() < 0.72 ? generateAttackActiveSkill(rarity, rng) : generateGuardActiveSkill(rng);
}

function generateEquipmentPassiveSkill(rarity: EquipmentRarity, rng: RandomFn): EquipmentPassiveSkill {
  const categoryRoll = rng();
  const rarityBias = rarity === "legendary" ? 10 : rarity === "epic" ? 6 : rarity === "rare" ? 3 : 0;

  if (categoryRoll < 0.35) {
    const element = pickOne(ELEMENTS, rng);
    const valuePct = roundToStep(randomInt(10 + rarityBias, 25 + rarityBias, rng), 5);
    return {
      id: createId("passive"),
      generatorSignature: ["elementBoost", element, valuePct].join(":"),
      category: "elementBoost",
      name: `${ELEMENT_LABELS[element]}共鳴`,
      description: `与える${ELEMENT_LABELS[element]}属性ダメージ+${valuePct}%`,
      valuePct,
      element,
    };
  }

  if (categoryRoll < 0.62) {
    const statusType = pickOne(STATUS_TYPES, rng);
    const valuePct = roundToStep(randomInt(20 + rarityBias, 40 + rarityBias, rng), 5);
    return {
      id: createId("passive"),
      generatorSignature: ["statusResist", statusType, valuePct].join(":"),
      category: "statusResist",
      name: `${STATUS_LABELS[statusType]}耐性`,
      description: `${STATUS_LABELS[statusType]}を受ける確率-${valuePct}%`,
      valuePct,
      statusType,
    };
  }

  if (categoryRoll < 0.8) {
    const valuePct = roundToStep(randomInt(10 + rarityBias, 30 + rarityBias, rng), 5);
    return {
      id: createId("passive"),
      generatorSignature: ["mpRegen", valuePct].join(":"),
      category: "mpRegen",
      name: "魔力循環",
      description: `ターン終了時のMP回復量+${valuePct}%`,
      valuePct,
    };
  }

  const stat = pickOne<StatKey>(["hp", "mp", "attack", "defense", "speed"], rng);
  const valuePct = roundToStep(randomInt(8 + rarityBias, 18 + rarityBias, rng), 5);
  const statLabel = stat.toUpperCase();
  return {
    id: createId("passive"),
    generatorSignature: ["statBoost", stat, valuePct].join(":"),
    category: "statBoost",
    name: `${statLabel}ブースト`,
    description: `${statLabel}+${valuePct}%`,
    valuePct,
    stat,
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

function aggregateEquipmentPassives(items: Equipment[]): EquipmentPassiveBonuses {
  return items.reduce<EquipmentPassiveBonuses>((accumulator, item) => {
    const passive = item.passiveSkill;

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

  return Math.max(1, Math.round(actor.defense * (1 - clamp(shockPenalty, 0, 50) / 100)));
}

function getAdjustedSpeed(actor: CombatantState) {
  const shockPenalty = actor.statuses
    .filter((status) => status.type === "shock")
    .reduce((sum, status) => sum + status.potencyPct / 2, 0);
  const frostPenalty = actor.statuses
    .filter((status) => status.type === "frostbite")
    .reduce((sum, status) => sum + status.potencyPct, 0);

  const totalPenalty = clamp(shockPenalty + frostPenalty, 0, 60);
  return Math.max(1, Math.round(actor.speed * (1 - totalPenalty / 100)));
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
) {
  const attackerElementBonus = attacker.elementDamagePct[element] ?? 0;
  const attackBonusPct = attacker.actor === "monster" ? attacker.raidDamagePct : 0;
  const defenseValue = getAdjustedDefense(defender);
  const triangle = getElementTriangleBonus(element, defender.element);
  const guardReduction = consumeGuardReduction(defender, element);
  const raw = attacker.attack * (powerPct / 100);
  const boosted = raw * (1 + attackerElementBonus / 100) * (1 + attackBonusPct / 100);
  const defended = Math.max(1, boosted - defenseValue * 0.58);
  const guarded = defended * (1 - guardReduction / 100);
  return Math.max(1, Math.round(guarded * triangle));
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
}

function createMonsterBattleState(profile: CombatProfile): CombatantState {
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
  };
}

function createBossBattleState(boss: RaidBoss): CombatantState {
  return {
    actor: "boss",
    name: `Boss Lv.${boss.level}`,
    maxHp: boss.maxHp,
    hp: boss.currentHp,
    maxMp: 0,
    mp: 0,
    attack: boss.attack,
    defense: boss.defense,
    speed: boss.speed,
    element: boss.element,
    statuses: [],
    guard: null,
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
    },
    mpRegenPct: 0,
    raidDamagePct: 0,
  };
}

function chooseMonsterAction(
  monster: CombatantState,
  boss: CombatantState,
  equipment: Equipment[],
): BattleAction {
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

function chooseBossAction(boss: CombatantState, stage: number, rng: RandomFn): BattleAction {
  const useHeavyAttack = (boss.hp / boss.maxHp < 0.55 && rng() < 0.45) || rng() < 0.18;
  const statusType = mapElementToStatus(boss.element);
  const shouldAddStatus = statusType !== null && rng() * 100 < getBossStatusChance(stage);

  return {
    kind: "basic",
    name: useHeavyAttack ? `${ELEMENT_LABELS[boss.element]}バースト` : `${ELEMENT_LABELS[boss.element]}攻撃`,
    element: boss.element,
    powerPct: useHeavyAttack ? 145 : 105,
    mpCost: 0,
    statusEffect: shouldAddStatus
      ? {
          type: statusType!,
          durationTurns: randomInt(1, 2, rng),
          potencyPct: useHeavyAttack ? 15 : 10,
        }
      : null,
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

  if (action.guardEffect) {
    applyGuard(attacker, action.guardEffect);
    log.push({
      turn,
      actor: attacker.actor,
      text: `${attacker.name} は ${action.name} を使用。${action.guardEffect.physicalReductionPct}% / ${action.guardEffect.elementalReductionPct}% の防壁を展開した。`,
    });
    return 0;
  }

  const damage = calculateDamage(attacker, defender, action.element, action.powerPct ?? 100);
  defender.hp = Math.max(0, defender.hp - damage);
  const triangle = getElementTriangleBonus(action.element, defender.element);
  const triangleText =
    triangle > 1 ? " 有利属性!" : triangle < 1 ? " 不利属性..." : "";

  log.push({
    turn,
    actor: attacker.actor,
    text: `${attacker.name} の ${action.name}。${defender.name} に ${damage} ダメージ。${triangleText}`.trim(),
  });

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

  return damage;
}

function finishTurn(
  actor: CombatantState,
  log: RaidBattleLogEntry[],
  turn: number,
) {
  tickStatuses(actor, log, turn);
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

export function createInitialRaidBoss(): RaidBoss {
  return {
    stage: 1,
    level: 1,
    maxHp: 120,
    currentHp: 120,
    attack: 14,
    defense: 8,
    speed: 10,
    element: getBossElementForStage(1),
    energyCost: 20,
    lastAttemptDate: null,
  };
}

function createStarterEquipment(): { inventory: Equipment[]; equippedSlots: EquippedSlots } {
  const inventory = EQUIPMENT_SLOTS.map((slot, index) =>
    generateEquipment(1, createSeededRandom(index + 11), slot, "common"),
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
  const passiveBonuses = aggregateEquipmentPassives(equippedItems);
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

export function createNextRaidBoss(previousBoss: RaidBoss, lastAttemptDate: string): RaidBoss {
  const nextStage = previousBoss.stage + 1;
  const nextMaxHp = Math.round(previousBoss.maxHp * 1.5);

  return {
    stage: nextStage,
    level: previousBoss.level + 1,
    maxHp: nextMaxHp,
    currentHp: nextMaxHp,
    attack: Math.round(previousBoss.attack * 1.15),
    defense: Math.round(previousBoss.defense * 1.13),
    speed: Math.round(previousBoss.speed * 1.1),
    element: getBossElementForStage(nextStage),
    energyCost: previousBoss.energyCost,
    lastAttemptDate,
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
  const monsterState = createMonsterBattleState(monsterProfile);
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
          : chooseBossAction(current, boss.stage, rng);

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
    ? createNextRaidBoss(boss, today)
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
