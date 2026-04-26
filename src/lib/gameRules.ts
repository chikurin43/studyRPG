import type {
  ActiveTimer,
  CompletionReward,
  LevelUpChoice,
  LevelUpChoiceSet,
  Monster,
  MonsterPerks,
  MonsterSkill,
  PersistedGameState,
  RaidAttackResult,
  RaidBoss,
  StatKey,
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

const BASE_LEVEL_UP_STAT_GAIN = {
  hp: 12,
  attack: 4,
  defense: 3,
  speed: 2,
} satisfies Record<StatKey, number>;

const STAT_CHOICE_LIBRARY = [
  { stat: "hp", amount: 20, label: "生命力を鍛える", detail: "HP +20" },
  { stat: "attack", amount: 8, label: "攻撃のキレを磨く", detail: "Attack +8" },
  { stat: "defense", amount: 6, label: "守りを固める", detail: "Defense +6" },
  { stat: "speed", amount: 4, label: "動きを洗練する", detail: "Speed +4" },
] as const;

const SKILL_VALUE_POOL = [5, 10, 15, 20, 25, 30] as const;
const MAX_PERK_LEVEL = 3;

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

function toModifierBucket(skills: MonsterSkill[]) {
  return skills.reduce<ModifierBucket>((accumulator, skill) => {
    accumulator[skill.effectKey] += skill.valuePct;
    return accumulator;
  }, clone(EMPTY_MODIFIERS));
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
  const signature = [
    blueprint.template,
    blueprint.target,
    blueprint.effectKey,
    valuePct,
  ].join(":");

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

function buildFallbackChoice(monster: Monster, seenKeys: Set<string>) {
  for (const statChoice of STAT_CHOICE_LIBRARY) {
    const choice = buildStatChoice(statChoice);
    const key = getChoiceKey(choice);

    if (!seenKeys.has(key)) {
      return choice;
    }
  }

  const specials = buildSpecialChoices(monster.perks);
  for (const choice of specials) {
    const key = getChoiceKey(choice);
    if (!seenKeys.has(key)) {
      return choice;
    }
  }

  return buildStatChoice(STAT_CHOICE_LIBRARY[0]);
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
    (skill) => skill.target === "passive" && (skill.template === "reward" || skill.template === "efficiency"),
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
      (skill.target === "passive" && (skill.template === "attack" || skill.template === "buff")),
  );
  const modifiers = toModifierBucket(raidSkills);
  modifiers.raidDamagePct += monster.perks.raidDamageMultiplier * 10;
  return modifiers;
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
      hp: 100,
      attack: 18,
      defense: 10,
      speed: 10,
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
    maxHp: 80,
    currentHp: 80,
    attack: 12,
    energyCost: 20,
    lastAttemptDate: null,
  };
}

export function createInitialGameState(): PersistedGameState {
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
      log: ["勉強でエネルギーを溜め、レイドへ挑もう。"],
    },
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
    const alreadyOwned = nextMonster.skills.some(
      (skill) => skill.signature === choice.skill.signature,
    );

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
    nextMonster.stats.attack += BASE_LEVEL_UP_STAT_GAIN.attack;
    nextMonster.stats.defense += BASE_LEVEL_UP_STAT_GAIN.defense;
    nextMonster.stats.speed += BASE_LEVEL_UP_STAT_GAIN.speed;

    const choiceSet = generateLevelChoiceSet(nextMonster, nextMonster.level, rng);
    nextMonster.pendingLevelChoices.push(choiceSet);
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

export function getRaidReadyStats(monster: Monster) {
  const modifiers = getRaidModifiers(monster);
  const attack = Math.round(monster.stats.attack * (1 + modifiers.attackPct / 100));
  const defense = Math.round(monster.stats.defense * (1 + modifiers.defensePct / 100));
  const speed = Math.round(monster.stats.speed * (1 + modifiers.speedPct / 100));

  return {
    attack,
    defense,
    speed,
    raidDamagePct: modifiers.raidDamagePct,
  };
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
  return {
    stage: previousBoss.stage + 1,
    level: previousBoss.level + 1,
    maxHp: Math.round(previousBoss.maxHp * 1.5),
    currentHp: Math.round(previousBoss.maxHp * 1.5),
    attack: Math.round(previousBoss.attack * 1.15),
    energyCost: previousBoss.energyCost,
    lastAttemptDate,
  };
}

export function resolveRaidAttack(
  monster: Monster,
  boss: RaidBoss,
  rng: RandomFn = Math.random,
  date = new Date(),
) {
  const today = toLocalDateKey(date);
  const raidStats = getRaidReadyStats(monster);
  const swing = 0.9 + rng() * 0.2;
  const damage = Math.max(1, Math.round(raidStats.attack * (1 + raidStats.raidDamagePct / 100) * swing));
  const defeated = damage >= boss.currentHp;
  const nextBoss = defeated
    ? createNextRaidBoss(boss, today)
    : {
        ...boss,
        currentHp: Math.max(0, boss.currentHp - damage),
        lastAttemptDate: today,
      };

  const result: RaidAttackResult = {
    damage,
    defeated,
    today,
    previousStage: boss.stage,
  };

  return {
    boss: nextBoss,
    result,
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
