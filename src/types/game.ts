export type ViewId = "tasks" | "monster" | "raid";
export type TaskStatus = "idle" | "running" | "completed";
export type StatKey = "hp" | "attack" | "defense" | "speed";
export type SkillTemplate = "attack" | "buff" | "reward" | "efficiency";
export type SkillTarget = "self" | "nextTask" | "raid" | "passive";
export type SkillEffectKey =
  | "raidDamagePct"
  | "attackPct"
  | "defensePct"
  | "speedPct"
  | "taskRewardPct"
  | "expGainPct"
  | "energyGainPct"
  | "timerReductionPct";
export type PerkKey = "taskRewardMultiplier" | "raidDamageMultiplier" | "energyCap";

export interface MonsterStats {
  hp: number;
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
}

export interface TimerBonusSnapshot {
  taskRewardPct: number;
  expGainPct: number;
  energyGainPct: number;
  timerReductionPct: number;
  sourceSkillIds: string[];
}

export interface ActiveTimer {
  activeTaskId: string | null;
  startedAt: string | null;
  targetEndsAt: string | null;
  bonusSnapshot: TimerBonusSnapshot | null;
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

export interface RaidBoss {
  stage: number;
  level: number;
  maxHp: number;
  currentHp: number;
  attack: number;
  energyCost: number;
  lastAttemptDate: string | null;
}

export interface RaidState {
  boss: RaidBoss;
  lastDamage: number;
  lastRewardSummary: string | null;
  log: string[];
}

export interface PersistedGameState {
  tasks: Task[];
  timer: ActiveTimer;
  monster: Monster;
  resources: Resources;
  raid: RaidState;
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

export interface RaidAttackResult {
  damage: number;
  defeated: boolean;
  today: string;
  previousStage: number;
}
