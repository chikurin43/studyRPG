export type ViewId = "tasks" | "monster" | "raid" | "settings";
export type TaskStatus = "idle" | "running" | "completed";
export type StatKey = "hp" | "mp" | "attack" | "defense" | "speed";
export type Element = "physical" | "fire" | "ice" | "lightning";
export type StatusEffectType = "burn" | "shock" | "frostbite" | "stun" | "slow" | "defenseDown" | "darkness" | "seal" | "bleed";
export type EquipmentSlot = "weapon" | "armor" | "relic";
export type EquipmentRarity = "C" | "B" | "A" | "S" | "SS" | "SSS";
export type AttachmentRarity = "C" | "B" | "A" | "S" | "SS" | "SSS";

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

// Attachment types
export type AttachmentEffectCategory =
  | "statBoost"          // ステータス増減
  | "skillParam"         // スキルパラメータ改変
  | "probability"        // 確率操作
  | "calculation"        // 計算式への介入
  | "ruleOverride";      // ルール書き換え

export type AttachmentEffectType =
  // ステータス増減
  | "statFlat"           // (HP/MP/ATK/DEF/SPD)+n 固定値
  | "statPercent"        // (HP/MP/ATK/DEF/SPD)+n% 割合
  | "statTradeOff"       // (HP/MP/ATK/DEF/SPD)+n、(HP/MP/ATK/DEF/SPD)-n
  | "allStatsPercent"    // 全ステータス+n% (HP/MP/ATK/DEF/SPDは除く)
  | "hpDownAllUp"        // 最大HP-n%、全ステータス+n%
  | "critDamageUp"       // クリティカルダメージ+n%
  // 旧システムとの互換性
  | "statBoost"          // 旧: 固定値ステータス増加
  | "statPctBoost"       // 旧: 割合ステータス増加
  | "conditional"        // 旧: 条件付き効果
  | "tradeOff"           // 旧: トレードオフ効果
  // スキルパラメータ
  | "skillPowerUp"       // スキルの基礎効果+n%
  | "skillElementUp"     // 特定属性スキルの効果+n%
  | "skillMpCostFlat"    // スキルのMPコスト-n
  | "skillMpCostPercent" // スキルのMPコスト-n%
  | "skillTagMpCost"     // 特定タグスキルのMPコスト-n(%)
  // 確率操作
  | "critRateUp"         // クリティカル率+n%
  | "allProbabilityUp"   // スキル内の全確率+n%
  | "allProbabilityMult" // スキル内の全確率n倍
  | "critRateCritDamageConvert" // C率とCダメの1:2変換
  | "evasionNextSureHit" // 回避時次回必中
  | "highProbGuarantee"  // n%以上確定発動
  | "doubleRoll"         // 2回振って有利採用
  | "critGuaranteesProb" // クリティカル時確率効果確定
  // 計算式介入
  | "statToAttack"       // (HP/MP/DEF/SPD)のn%をATK加算
  | "critDamageStatBased"// クリティカルダメージをステータスn%基準
  | "healAddStat"        // 回復量にステータスn%加算
  | "ignoreDef"          // 敵味方DEF無視
  | "lowHpDamageUp"      // 敵HP低いほどダメージ上昇
  // ルール書き換え
  | "doubleSkillUse"     // 1ターン同じスキル2回使用
  | "deathAction"        // 戦闘不能時1回だけ行動
  | "doubleAction"       // 2回行動可能
  | "damageDelay"        // ダメージ次ターン遅延
  | "hp1Protection"      // HP1以下ダメージをHP1で止める
  | "healToDamage"       // 回復時n%ダメージ敵に
  | "mpFirstDamage"      // ダメージを先にMPで受ける
  | "mpShortageHp"       // MP不足時HPをn%消費
  | "ghostState"         // 死亡後幽霊状態で1ターン行動
  | "buffConsumeDamage"  // バフ消費してダメージn%上昇
  | "debuffAttackUp";    // デバフ受けたターン攻撃力n%増加

export type AttachmentConditionType =
  // リソース系
  | "hpBelow"            // HPn%以下
  | "hpAbove"            // HPn%以上
  | "mpZero"             // MP0
  | "mpBelow"            // MPn%以下
  | "mpAbove"            // MPn%以上
  | "mpCostHpInstead"    // MP消費時HPも消費する代わりに
  // 状態系
  | "enemyHasStatus"     // 状態異常の敵を攻撃
  | "enemyHasSpecificStatus" // 特定状態異常の敵を攻撃
  | "nullifiedStatus"    // 状態異常無効化(解除)時
  | "sameStatusAsEnemy"  // 敵と自分の状態異常が同じ
  | "sameElementChain"   // 同じ属性の攻撃をn回連続
  // 行動系
  | "actBeforeEnemy"     // 敵より先に行動
  | "actAfterEnemy"      // 敵より後に行動
  | "secondAttackOnward" // 同ターン内2回目以降の攻撃
  | "mpConsumeChain"     // MPをn回以上連続消費
  | "normalAttackChain"  // 通常攻撃をn回以上連続
  | "sameSkillChain"     // nターン連続同じスキル
  // ターン系
  | "turnWithin"         // 戦闘開始nターン以内
  | "turnAfter"          // 戦闘開始nターン以降
  | "turnEven"           // 偶数ターン
  | "turnOdd"            // 奇数ターン
  | "noDamageLastTurn";  // 1つ前の敵ターンでダメージを受けなかった

export interface AttachmentCondition {
  type: AttachmentConditionType;
  threshold?: number;      // HP/MP%やターン数など
  stat?: StatKey;          // ステータス関連の条件で使用
  element?: Element;       // 属性関連の条件で使用
  statusType?: StatusEffectType; // 状態異常関連の条件で使用
  tag?: string;            // タグ関連の条件で使用
  value?: number;          // その他の数値パラメータ
  description: string;     // 条件の説明文
}

export interface AttachmentEffect {
  id: string;
  category: AttachmentEffectCategory;
  type: AttachmentEffectType;
  // ステータス関連
  stat?: StatKey;
  statSecondary?: StatKey; // トレードオフなどで使用
  flatValue?: number;
  percentValue?: number;
  // スキル関連
  element?: Element;
  tag?: string;
  skillPowerBoost?: number;
  mpCostReduction?: number;
  // 確率関連
  probabilityValue?: number;
  probabilityThreshold?: number;
  // 計算式関連
  sourceStat?: StatKey;    // 計算に使用するソースステータス
  // ルール関連
  ruleValue?: number;
  // 条件
  condition?: AttachmentCondition;
  // 説明
  description: string;
}

export interface Attachment {
  id: string;
  slot: EquipmentSlot;
  name: string;
  rarity: AttachmentRarity;
  dropStage: number;
  effects: AttachmentEffect[];
}

// アタッチメント効果の戦闘中状態
export interface AttachmentCombatState {
  // ステータス増減
  statBoosts: { flat: MonsterStats; percent: MonsterStats };
  critDamageBonus: number;
  // スキルパラメータ
  skillPowerBoost: number;      // 基礎効果増加%
  elementSkillBoost: Record<Element, number>;
  mpCostReduction: number;      // MPコスト削減% (上限100%)
  tagMpCostReduction: Record<string, number>;
  // 確率操作
  critRateBonus: number;
  allProbabilityBonus: number;
  allProbabilityMultiplier: number;
  evasionNextSureHit: boolean;
  highProbabilityThreshold: number;
  doubleRollEnabled: boolean;
  critGuaranteesProbability: boolean;
  // 計算式介入
  statToAttackPct: Partial<Record<StatKey, number>>;
  critDamageStatBased: { enabled: boolean; sourceStat: StatKey; percent: number } | null;
  healAddStatPct: Partial<Record<StatKey, number>>;
  ignoreDef: boolean;
  lowHpDamageUp: boolean;
  // ルール書き換え
  doubleSkillUse: boolean;
  deathAction: boolean;
  doubleAction: boolean;
  damageDelay: boolean;
  hp1Protection: boolean;
  healToDamagePct: number;
  mpFirstDamage: boolean;
  mpShortageHpCost: number;
  ghostState: boolean;
  buffConsumeDamagePct: number;
  debuffAttackUpPct: number;
}

export interface EquipmentRandomStatus {
  id: string;
  type: "statBoost" | "statPctBoost" | "conditional" | "special";
  stat?: StatKey;
  flatValue?: number;
  percentValue?: number;
  condition?: string;
  threshold?: number;
  description: string;
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
  randomStatuses: EquipmentRandomStatus[];
}

export type EquippedSlots = Record<EquipmentSlot, string | null>;
export type EquippedAttachments = Record<EquipmentSlot, string[]>; // Each slot can have up to 3 attachments

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
  attachmentInventory: Attachment[];
  equippedAttachments: EquippedAttachments;
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
  droppedAttachment: Attachment | null;
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

// Synthesis system types
export interface SynthesisSelection {
  inheritedStats: StatKey[];
  inheritedSkill: "active" | "passive" | null;
}

export interface SynthesisPreview {
  baseEquipment: Equipment;
  materialEquipment: Equipment;
  resultRarity: EquipmentRarity;
  resultingStats: MonsterStats;
  resultingActiveSkill: EquipmentActiveSkill;
  resultingPassiveSkill: EquipmentPassiveSkill;
  spCost: number;
  canSynthesize: boolean;
  reason?: string;
}

// Attachment synthesis types
export interface AttachmentSynthesisPreview {
  baseAttachment: Attachment;
  materialAttachment: Attachment;
  resultRarity: AttachmentRarity;
  resultingEffects: AttachmentEffect[];
  spCost: number;
  canSynthesize: boolean;
  reason?: string;
}
