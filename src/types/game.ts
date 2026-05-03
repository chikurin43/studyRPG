export type ViewId = "tasks" | "monster" | "raid" | "settings";
export type TaskStatus = "idle" | "running" | "completed";
export type StatKey = "hp" | "mp" | "attack" | "defense" | "speed";
export type Element = "physical" | "fire" | "ice" | "lightning";
export type StatusEffectType = "burn" | "shock" | "frostbite" | "stun" | "slow" | "defenseDown" | "darkness" | "seal" | "bleed";
export type EquipmentSlot = "weapon" | "armor" | "relic";
export type EquipmentRarity = "C" | "B" | "A" | "S" | "SS" | "SSS";

export type SkillTemplate = "attack" | "buff" | "reward";
export type SkillTarget = "self" | "nextTask" | "raid" | "passive";
export type SkillEffectKey =
  | "raidDamagePct"
  | "attackPct"
  | "defensePct"
  | "speedPct"
  | "taskRewardPct"
  | "expGainPct"
  | "energyGainPct";
export type PerkKey = "taskRewardMultiplier" | "raidDamageMultiplier" | "energyCap";

export interface MonsterStats {
  hp: number;
  mp: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface Task {
  id: string;
  title: string;
  subject?: string;
  durationMinutes: number;
  difficulty: number;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string | null;
  locked?: boolean;
  folderId?: string | null;
}

export interface TaskFolder {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  taskIds: string[];
}

export interface TimerBonusSnapshot {
  taskRewardPct: number;
  expGainPct: number;
  energyGainPct: number;
  sourceSkillIds: string[];
}

export interface ActiveTimer {
  activeTaskId: string | null;
  startedAt: string | null;
  targetEndsAt: string | null;
  bonusSnapshot: TimerBonusSnapshot | null;
  isPaused: boolean;
  pausedAt: string | null;
  totalPausedDuration: number; // Total paused time in milliseconds
}

export interface MonsterSkill {
  id: string;
  signature: string;
  name: string;
  description: string;
  template: SkillTemplate;
  target: SkillTarget;
  effectKey: SkillEffectKey;
  valuePct: number;
}

export interface MonsterPerks {
  taskRewardMultiplier: number;
  raidDamageMultiplier: number;
  energyCap: number;
}

export type LevelUpChoice =
  | {
      id: string;
      kind: "stat";
      label: string;
      stat: StatKey;
      amount: number;
    }
  | {
      id: string;
      kind: "skill";
      label: string;
      skill: MonsterSkill;
    }
  | {
      id: string;
      kind: "special";
      label: string;
      perkKey: PerkKey;
      amount: number;
      levelAfter: number;
    };

export interface LevelUpChoiceSet {
  id: string;
  sourceLevel: number;
  choices: LevelUpChoice[];
  rerolls: number;
}

export interface Monster {
  id: string;
  name: string;
  level: number;
  exp: number;
  stats: MonsterStats;
  skills: MonsterSkill[];
  perks: MonsterPerks;
  pendingLevelChoices: LevelUpChoiceSet[];
}

export interface Resources {
  sp: number;
  energy: number;
}

export interface EquipmentStatusEffect {
  type: StatusEffectType;
  durationTurns: number;
  potencyPct: number;
}

export interface EquipmentGuardEffect {
  physicalReductionPct: number;
  elementalReductionPct: number;
  durationHits: number;
}

export interface EquipmentActiveSkill {
  id: string;
  generatorSignature: string;
  family: "attack" | "guard";
  name: string;
  description: string;
  mpCost: number;
  element: Element;
  powerPct: number | null;
  statusEffect: EquipmentStatusEffect | null;
  guardEffect: EquipmentGuardEffect | null;
  tags: string[];
  condition?: string;
  multiplier?: number;
  durationTurns?: number;
  stackable?: boolean;
  piercePct?: number;
  extraDamagePct?: number;
  threshold?: number;
  pierceBonusElement?: Element;
  reflectPct?: number;
  reflectMultiplier?: number;
}

export interface EquipmentPassiveSkill {
  id: string;
  generatorSignature: string;
  category: "elementBoost" | "statusResist" | "mpRegen" | "statBoost";
  name: string;
  description: string;
  valuePct: number;
  element?: Element;
  statusType?: StatusEffectType;
  stat?: StatKey;
  tags: string[];
  condition: string;
  threshold?: number;
  cooldown?: number;
}

export interface Equipment {
  id: string;
  slot: EquipmentSlot;
  name: string;
  rarity: EquipmentRarity;
  dropStage: number;
  statBonuses: MonsterStats;
  activeSkill: EquipmentActiveSkill;
  passiveSkill: EquipmentPassiveSkill;
}

export type EquippedSlots = Record<EquipmentSlot, string | null>;

export interface RaidBoss {
  stage: number;
  level: number;
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
  speed: number;
  element: Element;
  energyCost: number;
  lastAttemptDate: string | null;
  activeSkills: EquipmentActiveSkill[];
  passiveSkills: EquipmentPassiveSkill[];
}

export interface CombatStatusState {
  type: StatusEffectType;
  durationTurns: number;
  potencyPct: number;
}

export interface CombatGuardState {
  physicalReductionPct: number;
  elementalReductionPct: number;
  remainingHits: number;
}

export interface RaidBattleLogEntry {
  turn: number;
  actor: "monster" | "boss" | "system";
  text: string;
}

export interface RaidBattleSummary {
  outcome: "victory" | "defeat" | "stalled";
  turns: number;
  damageToBoss: number;
  bossRemainingHp: number;
  monsterRemainingHp: number;
  monsterRemainingMp: number;
  equipmentDrop: Equipment | null;
  log: RaidBattleLogEntry[];
}

export interface RaidState {
  boss: RaidBoss;
  lastDamage: number;
  lastRewardSummary: string | null;
  log: string[];
  lastBattle: RaidBattleSummary | null;
  battleInProgress: boolean;
  currentTurn: number;
  monsterBattleState: any | null;
  bossBattleState: any | null;
  battleLog: RaidBattleLogEntry[];
}

export interface PersistedGameState {
  tasks: Task[];
  folders: TaskFolder[];
  timer: ActiveTimer;
  monster: Monster;
  resources: Resources;
  raid: RaidState;
  equipmentInventory: Equipment[];
  equippedSlots: EquippedSlots;
}

export interface CompletionReward {
  baseReward: number;
  exp: number;
  sp: number;
  energy: number;
  taskRewardPct: number;
  expGainPct: number;
  energyGainPct: number;
}

export type TaskCompletionReward = {
  exp: number;
  sp: number;
  energy: number;
};

export interface CompletionEffectsState {
  isVisible: boolean;
  taskTitle: string;
  reward: TaskCompletionReward | null;
  monsterLevelUp: boolean;
}

export interface CombatProfile {
  hp: number;
  mp: number;
  attack: number;
  defense: number;
  speed: number;
  raidDamagePct: number;
  mpRegenPct: number;
  elementDamagePct: Record<Element, number>;
  statusResistPct: Record<StatusEffectType, number>;
  criticalRate: number;
  criticalDamage: number;
  thresholdPassives: EquipmentPassiveSkill[];
  conditionPassives: EquipmentPassiveSkill[];
}

export interface SimulatedRaidBattle {
  boss: RaidBoss;
  summary: RaidBattleSummary;
  defeated: boolean;
  today: string;
  previousStage: number;
}
