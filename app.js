const MATERIALS = [
  "ゴールド",
  "経験チップ",
  "突破チップα",
  "突破チップβ",
  "経験オーブ(赤)",
  "経験オーブ(黄)",
  "経験オーブ(緑)",
  "経験オーブ(青)",
  "経験オーブ(紫)",
  "突破オーブα(武器)",
  "突破オーブα(防具)",
  "突破オーブα(アクセサリ)",
  "突破オーブβ(物理)",
  "突破オーブβ(炎)",
  "突破オーブβ(雷)",
  "突破オーブβ(氷)",
  "ガチャトークン",
  "エネルギー",
];

const QUEST_REWARDS = [
  { name: "ゴールド", chance: 0.2, base: 1100 },
  { name: "経験チップ", chance: 0.15, base: 167 },
  { name: "突破チップα", chance: 0.05, base: 5 },
  { name: "突破チップβ", chance: 0.05, base: 5 },
  { name: "経験オーブ(赤)", chance: 0.05, base: 12 },
  { name: "経験オーブ(黄)", chance: 0.05, base: 12 },
  { name: "経験オーブ(緑)", chance: 0.05, base: 12 },
  { name: "経験オーブ(青)", chance: 0.05, base: 12 },
  { name: "経験オーブ(紫)", chance: 0.05, base: 12 },
  { name: "突破オーブα(武器)", chance: 0.0333, base: 3 },
  { name: "突破オーブα(防具)", chance: 0.0333, base: 3 },
  { name: "突破オーブα(アクセサリ)", chance: 0.0333, base: 3 },
  { name: "突破オーブβ(物理)", chance: 0.025, base: 3 },
  { name: "突破オーブβ(炎)", chance: 0.025, base: 3 },
  { name: "突破オーブβ(雷)", chance: 0.025, base: 3 },
  { name: "突破オーブβ(氷)", chance: 0.025, base: 3 },
  { name: "ガチャトークン", chance: 0.1, base: 500 },
];

const EQUIPMENT_RANKS = [
  { rank: "D-", weight: 28 },
  { rank: "D", weight: 24 },
  { rank: "D+", weight: 18 },
  { rank: "C-", weight: 12 },
  { rank: "C", weight: 8 },
  { rank: "C+", weight: 5 },
  { rank: "B-", weight: 3 },
  { rank: "B", weight: 2 },
];

const STORAGE_KEY = "studyRpgStateV1";

const defaultState = {
  quests: [],
  completedQuests: [],
  materials: MATERIALS.reduce((acc, name) => ({ ...acc, [name]: name === "ガチャトークン" ? 500 : 0 }), {}),
  equipment: [],
  gachaLog: [],
  studyHours: 0,
  clearedFloors: 0,
  playerPower: 1200,
  gachaLevel: 1,
};

const state = loadState();

const questForm = document.getElementById("questForm");
const questName = document.getElementById("questName");
const questDesire = document.getElementById("questDesire");
const questHours = document.getElementById("questHours");
const questPreview = document.getElementById("questPreview");
const questActiveList = document.getElementById("questActiveList");
const questCompletedList = document.getElementById("questCompletedList");
const materialList = document.getElementById("materialList");
const equipmentList = document.getElementById("equipmentList");
const gachaLog = document.getElementById("gachaLog");
const stageList = document.getElementById("stageList");
const studyHoursInput = document.getElementById("studyHours");
const clearedFloorsInput = document.getElementById("clearedFloors");
const questLevelEl = document.getElementById("questLevel");
const questMultiplierEl = document.getElementById("questMultiplier");
const playerPowerInput = document.getElementById("playerPower");
const gachaLevelInput = document.getElementById("gachaLevel");
const manualSaveButton = document.getElementById("manualSave");
const resetButton = document.getElementById("resetData");

const rollGachaButton = document.getElementById("rollGacha");
const rollAllGachaButton = document.getElementById("rollAllGacha");

const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return structuredClone(defaultState);
  }
  try {
    const parsed = JSON.parse(raw);
    return { ...structuredClone(defaultState), ...parsed };
  } catch (error) {
    console.warn("Failed to parse save data", error);
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function calculateQuestLevel() {
  return Math.max(1, Math.ceil(state.clearedFloors / 3));
}

function calculateMultiplier() {
  const level = calculateQuestLevel();
  return (1 + (level - 1) * 0.25) * (1 + (level - 1) / 100);
}

function formatNumber(value) {
  return Math.ceil(value).toLocaleString("ja-JP");
}

function pickReward() {
  const roll = Math.random();
  let total = 0;
  for (const reward of QUEST_REWARDS) {
    total += reward.chance;
    if (roll <= total) {
      return reward;
    }
  }
  return QUEST_REWARDS[QUEST_REWARDS.length - 1];
}

function generateRewards(desire, hours) {
  const level = calculateQuestLevel();
  const multiplier = calculateMultiplier();
  const rewards = [];
  for (let i = 0; i < desire; i += 1) {
    const reward = pickReward();
    const amount = Math.ceil(reward.base * hours * multiplier);
    rewards.push({
      name: reward.name,
      amount,
      level,
    });
  }
  return rewards;
}

function addQuest(event) {
  event.preventDefault();
  const name = questName.value.trim();
  const desire = Number(questDesire.value);
  const hours = Number(questHours.value);
  if (!name || !hours) {
    return;
  }
  const rewards = generateRewards(desire, hours);
  state.quests.push({
    id: crypto.randomUUID(),
    name,
    desire,
    hours,
    rewards,
    createdAt: Date.now(),
  });
  questForm.reset();
  questDesire.value = "1";
  questHours.value = "1";
  updateUI();
}

function completeQuest(questId) {
  const index = state.quests.findIndex((quest) => quest.id === questId);
  if (index === -1) return;
  const quest = state.quests.splice(index, 1)[0];
  quest.completedAt = Date.now();
  state.completedQuests.unshift(quest);
  quest.rewards.forEach((reward) => {
    state.materials[reward.name] = (state.materials[reward.name] || 0) + reward.amount;
  });
  updateUI();
}

function renderQuestItem(quest, isCompleted = false) {
  const item = document.createElement("div");
  item.className = `quest-item${isCompleted ? " completed" : ""}`;
  const rewardList = quest.rewards
    .map((reward) => `${reward.name} +${formatNumber(reward.amount)}`)
    .map((text) => `<span class="reward">${text}</span>`)
    .join("");
  item.innerHTML = `
    <div>
      <h4>${quest.name}</h4>
      <div class="reward-list">${rewardList}</div>
      <div class="reward-list">
        <span class="pill">やりたい度 ${quest.desire}</span>
        <span class="pill">${quest.hours}h</span>
      </div>
    </div>
    ${isCompleted ? `<span class="pill">完了</span>` : `<button data-id="${quest.id}">完了</button>`}
  `;
  if (!isCompleted) {
    item.querySelector("button").addEventListener("click", () => completeQuest(quest.id));
  }
  return item;
}

function renderQuestLists() {
  questPreview.innerHTML = "";
  questActiveList.innerHTML = "";
  questCompletedList.innerHTML = "";

  if (state.quests.length === 0) {
    questPreview.classList.add("empty");
    questPreview.textContent = "まだクエストがありません。";
    questActiveList.classList.add("empty");
    questActiveList.textContent = "進行中のクエストがありません。";
  } else {
    questPreview.classList.remove("empty");
    questActiveList.classList.remove("empty");
    state.quests.forEach((quest) => {
      questPreview.appendChild(renderQuestItem(quest));
      questActiveList.appendChild(renderQuestItem(quest));
    });
  }

  if (state.completedQuests.length === 0) {
    questCompletedList.classList.add("empty");
    questCompletedList.textContent = "完了済みクエストがありません。";
  } else {
    questCompletedList.classList.remove("empty");
    state.completedQuests.forEach((quest) => {
      questCompletedList.appendChild(renderQuestItem(quest, true));
    });
  }
}

function renderMaterials() {
  materialList.innerHTML = "";
  MATERIALS.forEach((name) => {
    const item = document.createElement("div");
    item.className = "inventory-item";
    item.innerHTML = `<strong>${name}</strong><span>${formatNumber(state.materials[name] || 0)}</span>`;
    materialList.appendChild(item);
  });
}

function renderEquipment() {
  equipmentList.innerHTML = "";
  if (state.equipment.length === 0) {
    equipmentList.classList.add("empty");
    equipmentList.textContent = "装備がありません。";
    return;
  }
  equipmentList.classList.remove("empty");
  state.equipment.forEach((equip) => {
    const item = document.createElement("div");
    item.className = "quest-item";
    item.innerHTML = `
      <div>
        <h4>${equip.name}</h4>
        <div class="reward-list">
          <span class="pill">ランク ${equip.rank}</span>
          <span class="pill">Lv ${equip.level}</span>
          <span class="pill">${equip.type}</span>
        </div>
      </div>
      <span class="pill">${equip.skill}</span>
    `;
    equipmentList.appendChild(item);
  });
}

function rollRank() {
  const levelBoost = Math.min(Math.floor(state.gachaLevel / 5), 6);
  const boosted = EQUIPMENT_RANKS.map((rank, index) => ({
    ...rank,
    weight: rank.weight + (index < levelBoost ? 3 : 0),
  }));
  const totalWeight = boosted.reduce((sum, rank) => sum + rank.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const rank of boosted) {
    roll -= rank.weight;
    if (roll <= 0) {
      return rank.rank;
    }
  }
  return boosted[0].rank;
}

function rollGacha(times = 1) {
  if (state.materials["ガチャトークン"] < 100) {
    alert("ガチャトークンが不足しています。");
    return;
  }
  const rolls = Math.min(times, Math.floor(state.materials["ガチャトークン"] / 100));
  for (let i = 0; i < rolls; i += 1) {
    state.materials["ガチャトークン"] -= 100;
    const rank = rollRank();
    const equipment = {
      id: crypto.randomUUID(),
      name: `試作装備-${state.equipment.length + 1}`,
      rank,
      level: 1,
      type: ["武器", "防具", "アクセサリ"][Math.floor(Math.random() * 3)],
      skill: "アクティブスキル: 連撃",
    };
    state.equipment.push(equipment);
    state.gachaLog.unshift(`【${rank}】${equipment.name} を入手`);
  }
  updateUI();
}

function renderGachaLog() {
  gachaLog.innerHTML = "";
  if (state.gachaLog.length === 0) {
    gachaLog.classList.add("empty");
    gachaLog.textContent = "まだガチャ結果がありません。";
    return;
  }
  gachaLog.classList.remove("empty");
  state.gachaLog.slice(0, 6).forEach((entry) => {
    const item = document.createElement("div");
    item.className = "quest-item";
    item.innerHTML = `<span>${entry}</span><span class="pill">NEW</span>`;
    gachaLog.appendChild(item);
  });
}

function renderStages() {
  stageList.innerHTML = "";
  const floors = Array.from({ length: 30 }, (_, index) => index + 1);
  floors.forEach((floor) => {
    const enemyPower = 800 + floor * 40;
    const reward = Math.ceil(200 + floor * 25);
    const canSkip = state.playerPower >= enemyPower * 1.5;
    const card = document.createElement("div");
    card.className = "stage-card";
    card.innerHTML = `
      <header>
        <strong>ステージ1 - フロア${floor}</strong>
        <span class="pill">敵戦闘力 ${enemyPower}</span>
      </header>
      <p class="muted">報酬: ゴールド ${reward}</p>
      <div class="action-row">
        <button ${state.materials["エネルギー"] < 180 ? "disabled" : ""}>
          挑戦 (エネルギー180)
        </button>
        <button class="ghost" ${canSkip ? "" : "disabled"}>
          ${canSkip ? "スキップ報酬" : "戦闘力不足"}
        </button>
      </div>
    `;
    const challengeButton = card.querySelector("button");
    const skipButton = card.querySelectorAll("button")[1];
    challengeButton.addEventListener("click", () => {
      if (state.materials["エネルギー"] < 180) return;
      state.materials["エネルギー"] -= 180;
      state.materials["ゴールド"] += reward;
      state.clearedFloors = Math.max(state.clearedFloors, floor);
      updateUI();
    });
    skipButton.addEventListener("click", () => {
      if (!canSkip) return;
      state.materials["ゴールド"] += reward;
      state.clearedFloors = Math.max(state.clearedFloors, floor);
      updateUI();
    });
    stageList.appendChild(card);
  });
}

function updateStatus() {
  questLevelEl.textContent = calculateQuestLevel();
  questMultiplierEl.textContent = calculateMultiplier().toFixed(2);
  studyHoursInput.value = state.studyHours;
  clearedFloorsInput.value = state.clearedFloors;
  playerPowerInput.value = state.playerPower;
  gachaLevelInput.value = state.gachaLevel;
}

function updateUI() {
  updateStatus();
  renderQuestLists();
  renderMaterials();
  renderEquipment();
  renderGachaLog();
  renderStages();
  saveState();
}

function handleTabSwitch(event) {
  const tab = event.target.closest(".tab");
  if (!tab) return;
  tabs.forEach((item) => item.classList.remove("active"));
  tab.classList.add("active");
  const target = tab.dataset.tab;
  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === target);
  });
}

questForm.addEventListener("submit", addQuest);
document.querySelector(".tabs").addEventListener("click", handleTabSwitch);

rollGachaButton.addEventListener("click", () => rollGacha(1));
rollAllGachaButton.addEventListener("click", () => {
  const rolls = Math.floor(state.materials["ガチャトークン"] / 100);
  if (rolls === 0) {
    alert("ガチャトークンが不足しています。");
    return;
  }
  rollGacha(rolls);
});

studyHoursInput.addEventListener("input", (event) => {
  state.studyHours = Number(event.target.value);
  updateUI();
});
clearedFloorsInput.addEventListener("input", (event) => {
  state.clearedFloors = Number(event.target.value);
  updateUI();
});
playerPowerInput.addEventListener("input", (event) => {
  state.playerPower = Number(event.target.value);
  updateUI();
});
gachaLevelInput.addEventListener("input", (event) => {
  state.gachaLevel = Number(event.target.value);
  updateUI();
});

manualSaveButton.addEventListener("click", () => {
  saveState();
  alert("手動セーブしました。");
});

resetButton.addEventListener("click", () => {
  if (confirm("セーブデータを初期化しますか？")) {
    Object.assign(state, structuredClone(defaultState));
    updateUI();
  }
});

updateUI();
