import {
  calculateTaskCompletionReward,
  canAttemptRaid,
  createInitialMonster,
  createInitialRaidBoss,
  createTimerBonusSnapshot,
  expToNextLevel,
  generateLevelChoiceSet,
  grantMonsterExperience,
  grantRandomSkill,
  resolveRaidAttack,
} from "@/lib/gameRules";
import type { Monster, MonsterSkill, Task } from "@/types/game";

function buildSkill(overrides: Partial<MonsterSkill>): MonsterSkill {
  return {
    id: "skill-id",
    signature: "skill-signature",
    name: "Skill",
    description: "Skill",
    template: "reward",
    target: "passive",
    effectKey: "taskRewardPct",
    valuePct: 10,
    ...overrides,
  };
}

function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    title: "Mock Task",
    durationMinutes: 30,
    difficulty: 3,
    status: "idle",
    createdAt: "2026-04-26T00:00:00.000Z",
    completedAt: null,
    ...overrides,
  };
}

describe("gameRules", () => {
  it("calculates task rewards with passive and nextTask modifiers", () => {
    const monster: Monster = {
      ...createInitialMonster(),
      perks: {
        ...createInitialMonster().perks,
        taskRewardMultiplier: 1,
      },
      skills: [
        buildSkill({
          id: "passive-task",
          signature: "reward:passive:taskRewardPct:20",
          valuePct: 20,
        }),
        buildSkill({
          id: "next-exp",
          signature: "reward:nextTask:expGainPct:10",
          target: "nextTask",
          effectKey: "expGainPct",
          valuePct: 10,
        }),
      ],
    };

    const reward = calculateTaskCompletionReward(
      buildTask({ durationMinutes: 20, difficulty: 5 }),
      monster,
      createTimerBonusSnapshot(monster),
    );

    expect(reward.baseReward).toBe(100);
    expect(reward.taskRewardPct).toBe(30);
    expect(reward.expGainPct).toBe(10);
    expect(reward.exp).toBe(143);
    expect(reward.sp).toBe(13);
    expect(reward.energy).toBe(30);
  });

  it("queues one level-up choice set per level gained", () => {
    const result = grantMonsterExperience(createInitialMonster(), 260, () => 0);

    expect(result.monster.level).toBe(3);
    expect(result.monster.exp).toBe(0);
    expect(result.monster.pendingLevelChoices).toHaveLength(2);
    expect(result.monster.stats.hp).toBe(124);
    expect(result.monster.stats.attack).toBe(26);
    expect(result.monster.stats.defense).toBe(16);
    expect(result.monster.stats.speed).toBe(14);
    expect(expToNextLevel(result.monster.level)).toBe(220);
  });

  it("does not grant duplicate permanent skills", () => {
    const first = grantRandomSkill(createInitialMonster(), () => 0);
    const second = grantRandomSkill(first.monster, () => 0);

    expect(first.skill).not.toBeNull();
    expect(second.skill).not.toBeNull();
    expect(second.skill?.signature).not.toBe(first.skill?.signature);
  });

  it("keeps raid hp between days and locks the same local day", () => {
    const weakResult = resolveRaidAttack(
      createInitialMonster(),
      createInitialRaidBoss(),
      () => 0,
      new Date("2026-04-26T12:00:00+09:00"),
    );

    expect(weakResult.result.defeated).toBe(false);
    expect(weakResult.boss.currentHp).toBeLessThan(weakResult.boss.maxHp);
    expect(weakResult.boss.lastAttemptDate).toBe("2026-04-26");
    expect(
      canAttemptRaid(weakResult.boss, 100, new Date("2026-04-26T21:00:00+09:00")).allowed,
    ).toBe(false);

    const strongMonster = {
      ...createInitialMonster(),
      stats: {
        ...createInitialMonster().stats,
        attack: 200,
      },
    };
    const strongResult = resolveRaidAttack(
      strongMonster,
      createInitialRaidBoss(),
      () => 0.5,
      new Date("2026-04-27T08:00:00+09:00"),
    );

    expect(strongResult.result.defeated).toBe(true);
    expect(strongResult.boss.stage).toBe(2);
    expect(strongResult.boss.maxHp).toBe(120);
    expect(strongResult.boss.attack).toBe(14);
    expect(strongResult.boss.lastAttemptDate).toBe("2026-04-27");
  });

  it("keeps generated skill choices unique inside a level-up set", () => {
    const monster = createInitialMonster();
    monster.skills.push(
      buildSkill({
        id: "owned-skill",
        signature: "attack:raid:raidDamagePct:5",
        template: "attack",
        target: "raid",
        effectKey: "raidDamagePct",
        valuePct: 5,
      }),
    );

    const choiceSet = generateLevelChoiceSet(monster, 2, () => 0);
    const skillChoices = choiceSet.choices.filter((choice) => choice.kind === "skill");
    const signatures = new Set(
      skillChoices.map((choice) => (choice.kind === "skill" ? choice.skill.signature : "")),
    );

    expect(signatures.size).toBe(skillChoices.length);
  });
});
