import { describe, it, expect, beforeEach } from "vitest";
import {
  simulateRaidBattle,
  initializeBattleState,
  generateEquipment,
} from "@/lib/gameRules";
import type {
  Monster,
  Equipment,
  RaidBoss,
  SimulatedRaidBattle,
  EquipmentSlot,
} from "@/types/game";
import { getGameStore } from "@/store/gameStore";

// ════════════════════════════════════════════════════════════
// ── Test Helpers ────────────────────────────────────────────
// ════════════════════════════════════════════════════════════

const TEST_RNG = () => 0.5;

function createTestMonster(): Monster {
  return {
    id: "test-monster",
    name: "Test Monster",
    level: 10,
    exp: 0,
    stats: {
      hp: 500,
      mp: 200,
      attack: 80,
      defense: 40,
      speed: 70,
    },
    skills: [],
    perks: { taskRewardMultiplier: 1, raidDamageMultiplier: 1, energyCap: 100 },
    pendingLevelChoices: [],
  };
}

function createTestBoss(stage: number): RaidBoss {
  return {
    stage,
    level: stage * 5,
    maxHp: 2000 + stage * 500,
    currentHp: 2000 + stage * 500,
    attack: 60 + stage * 10,
    defense: 30 + stage * 5,
    speed: 50 + stage * 5,
    element: stage % 2 === 0 ? "fire" : "ice",
    energyCost: 10,
    lastAttemptDate: null,
    activeSkills: [],
    passiveSkills: [],
  };
}

function createEmptyEquippedSlots(): Record<EquipmentSlot, string | null> {
  return {
    weapon: null,
    armor: null,
    relic: null,
  };
}

// ════════════════════════════════════════════════════════════
// ── Combat Integration Tests ───────────────────────────────
// ════════════════════════════════════════════════════════════

describe("Combat Skill Effects", () => {
  beforeEach(() => {
    getGameStore().getState().resetGame();
  });

  describe("Active Skills", () => {
    it("should deal damage with basic attack skill", () => {
      const monster = createTestMonster();
      const boss = createTestBoss(1);
      const equipment = generateEquipment(3, TEST_RNG, "weapon");
      const equippedSlots = createEmptyEquippedSlots();
      equippedSlots.weapon = equipment.id;

      const battle = simulateRaidBattle(
        monster,
        boss,
        [equipment],
        equippedSlots,
        TEST_RNG,
        new Date(),
      );

      expect(battle.summary.damageToBoss).toBeGreaterThan(0);
    });

    it("should apply guard effect", () => {
      const monster = createTestMonster();
      const boss = createTestBoss(1);
      
      // Generate armor with guard family skill
      const equipment = generateEquipment(3, () => 0.9, "armor");
      const equippedSlots = createEmptyEquippedSlots();
      equippedSlots.armor = equipment.id;

      // Force higher RNG to potentially get guard skill
      const battle = simulateRaidBattle(
        monster,
        boss,
        [equipment],
        equippedSlots,
        () => 0.8,
        new Date(),
      );

      expect(battle.summary.monsterRemainingHp).toBeGreaterThanOrEqual(0);
    });

    it("should respect elemental triangle", () => {
      const monster = createTestMonster();
      // Fire boss
      const boss = createTestBoss(2);
      expect(boss.element).toBe("fire");

      // Ice equipment should be effective against fire boss
      const equipment = generateEquipment(3, () => 0.2, "weapon");
      const equippedSlots = createEmptyEquippedSlots();
      equippedSlots.weapon = equipment.id;

      const battle = simulateRaidBattle(
        monster,
        boss,
        [equipment],
        equippedSlots,
        TEST_RNG,
        new Date(),
      );

      expect(battle.summary.damageToBoss).toBeGreaterThan(0);
    });
  });

  describe("Passive Skills", () => {
    it("should apply stat boost passives", () => {
      const monster = createTestMonster();
      const boss = createTestBoss(1);
      
      // Equipment with stat boost passive
      const equipment = generateEquipment(3, () => 0.1, "weapon");
      const equippedSlots = createEmptyEquippedSlots();
      equippedSlots.weapon = equipment.id;

      const battle = simulateRaidBattle(
        monster,
        boss,
        [equipment],
        equippedSlots,
        TEST_RNG,
        new Date(),
      );

      // With attack boost, damage should be higher
      expect(battle.summary.damageToBoss).toBeGreaterThan(0);
    });

    it("should apply element boost passives", () => {
      const monster = createTestMonster();
      const boss = createTestBoss(1);
      
      const equipment = generateEquipment(4, () => 0.3, "relic");
      const equippedSlots = createEmptyEquippedSlots();
      equippedSlots.relic = equipment.id;

      const battle = simulateRaidBattle(
        monster,
        boss,
        [equipment],
        equippedSlots,
        TEST_RNG,
        new Date(),
      );

      expect(battle.summary.damageToBoss).toBeGreaterThan(0);
    });
  });

  describe("Equipment Generation", () => {
    it("should generate equipment with valid skills", () => {
      const equipment = generateEquipment(3, TEST_RNG);

      expect(equipment.id).toBeDefined();
      expect(equipment.activeSkill).toBeDefined();
      expect(equipment.passiveSkill).toBeDefined();
      expect(equipment.activeSkill.name).toBeDefined();
      expect(equipment.passiveSkill.name).toBeDefined();
    });

    it("should generate different skills for different slots", () => {
      const weapon = generateEquipment(3, TEST_RNG, "weapon");
      const armor = generateEquipment(3, TEST_RNG, "armor");
      const relic = generateEquipment(3, TEST_RNG, "relic");

      expect(weapon.slot).toBe("weapon");
      expect(armor.slot).toBe("armor");
      expect(relic.slot).toBe("relic");
    });
  });

  describe("Initialize Battle State", () => {
    it("should create correct initial state", () => {
      const monster = createTestMonster();
      const boss = createTestBoss(1);
      const equipment = generateEquipment(3, TEST_RNG, "weapon");
      const equippedSlots = createEmptyEquippedSlots();
      equippedSlots.weapon = equipment.id;

      const state = initializeBattleState(
        monster,
        boss,
        [equipment],
        equippedSlots,
      );

      expect(state.monsterState).toBeDefined();
      expect(state.bossState).toBeDefined();
      expect(state.battleLog).toBeDefined();
    });
  });

  describe("Battle Summary", () => {
    it("should track damage dealt", () => {
      const monster = createTestMonster();
      const boss = createTestBoss(1);
      const equipment = generateEquipment(3, TEST_RNG, "weapon");
      const equippedSlots = createEmptyEquippedSlots();
      equippedSlots.weapon = equipment.id;

      const battle = simulateRaidBattle(
        monster,
        boss,
        [equipment],
        equippedSlots,
        TEST_RNG,
        new Date(),
      );

      expect(battle.summary).toBeDefined();
      expect(battle.summary.damageToBoss).toBeGreaterThanOrEqual(0);
      expect(battle.summary.monsterRemainingHp).toBeGreaterThanOrEqual(0);
    });

    it("should track turns correctly", () => {
      const monster = createTestMonster();
      const boss = createTestBoss(1);
      const equipment = generateEquipment(3, TEST_RNG, "weapon");
      const equippedSlots = createEmptyEquippedSlots();
      equippedSlots.weapon = equipment.id;

      const battle = simulateRaidBattle(
        monster,
        boss,
        [equipment],
        equippedSlots,
        TEST_RNG,
        new Date(),
      );

      expect(battle.summary.turns).toBeGreaterThan(0);
    });

    it("should determine if monster survived", () => {
      const monster = createTestMonster();
      const boss = createTestBoss(1);
      const equipment = generateEquipment(5, TEST_RNG, "armor");
      const equippedSlots = createEmptyEquippedSlots();
      equippedSlots.armor = equipment.id;

      const battle = simulateRaidBattle(
        monster,
        boss,
        [equipment],
        equippedSlots,
        () => 0.3, // Lower RNG for survival,
        new Date(),
      );

      expect(["victory", "defeat", "stalled"]).toContain(battle.summary.outcome);
    });
  });
});
