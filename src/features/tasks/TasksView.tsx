import { type FormEvent, useMemo, useState } from "react";
import { Play, Square, CheckCircle2, Trash2, TimerReset } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Meter } from "@/components/ui/Meter";
import { Panel } from "@/components/ui/Panel";
import { formatCountdown, formatDateTime, formatNumber } from "@/lib/formatters";
import {
  calculateTaskCompletionReward,
  createTimerBonusSnapshot,
  getRemainingMs,
  getTaskDurationMs,
  isTimerComplete,
} from "@/lib/gameRules";
import { useNow } from "@/lib/useNow";
import { useGameStore } from "@/store/gameStore";

function getTaskBaseReward(durationMinutes: number, difficulty: number) {
  return durationMinutes * difficulty;
}

function buildTaskPreview(durationMinutes: number, difficulty: number) {
  return {
    id: "preview-task",
    title: "Preview",
    durationMinutes,
    difficulty,
    status: "idle" as const,
    createdAt: new Date(0).toISOString(),
    completedAt: null,
  };
}

export function TasksView() {
  const tasks = useGameStore((state) => state.tasks);
  const timer = useGameStore((state) => state.timer);
  const addTask = useGameStore((state) => state.addTask);
  const deleteTask = useGameStore((state) => state.deleteTask);
  const startTaskTimer = useGameStore((state) => state.startTaskTimer);
  const stopTaskTimer = useGameStore((state) => state.stopTaskTimer);
  const completeTask = useGameStore((state) => state.completeTask);
  const monster = useGameStore((state) => state.monster);
  const nowMs = useNow();

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [difficulty, setDifficulty] = useState(3);

  const activeTask = useMemo(
    () => tasks.find((task) => task.id === timer.activeTaskId) ?? null,
    [tasks, timer.activeTaskId],
  );
  const activeRemainingMs = getRemainingMs(timer.targetEndsAt, nowMs);
  const timerDone = isTimerComplete(timer.targetEndsAt, nowMs);

  const pendingTasks = tasks.filter((task) => task.status !== "completed");
  const completedTasks = tasks.filter((task) => task.status === "completed");
  const rewardPreview = getTaskBaseReward(durationMinutes, difficulty);
  const formPreviewTask = buildTaskPreview(durationMinutes, difficulty);
  const formSnapshot = createTimerBonusSnapshot(monster);
  const formRewardPreview = calculateTaskCompletionReward(formPreviewTask, monster, formSnapshot);
  const formDurationPreviewMinutes = Math.max(
    1,
    Math.round(getTaskDurationMs(formPreviewTask, monster, formSnapshot) / 60_000),
  );
  const nextTaskSkillNames = monster.skills
    .filter((skill) => skill.target === "nextTask")
    .map((skill) => skill.name);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    addTask({
      title,
      subject,
      durationMinutes,
      difficulty,
    });

    setTitle("");
    setSubject("");
    setDurationMinutes(30);
    setDifficulty(3);
  };

  return (
    <div className="space-y-5">
      <Panel
        eyebrow="Task Loop"
        title="勉強タスクを回して報酬を稼ぐ"
        description="タスク完了で経験値、SP、Energy を獲得します。タイマー経由のタスクには nextTask 系スキルが乗ります。"
      >
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <form className="grid gap-4 rounded-[24px] border border-[var(--line-soft)] bg-white/60 p-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[var(--ink-soft)]" htmlFor="task-title">
                タイトル
              </label>
              <input
                id="task-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="h-12 text-[var(--ink-soft)] rounded-2xl border border-[var(--line-soft)] bg-white px-4 outline-none transition focus:border-[var(--accent-sky)]"
                placeholder="例: 英単語を50個覚える"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2 sm:col-span-1">
                <label className="text-sm font-medium text-[var(--ink-soft)]" htmlFor="task-subject">
                  科目
                </label>
                <select
                  id="task-subject"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  className="h-12 text-[var(--ink-strong)] rounded-2xl border border-[var(--line-soft)] bg-white px-4 outline-none transition focus:border-[var(--accent-sky)]"
                >
                  {["英語", "数学", "国語", "社会", "理科", "その他"].map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-[var(--ink-soft)]" htmlFor="task-duration">
                  時間 (分)
                </label>
                <input
                  id="task-duration"
                  type="number"
                  min={5}
                  step={5}
                  value={durationMinutes}
                  onChange={(event) => setDurationMinutes(Number(event.target.value))}
                  className="h-12 text-[var(--ink-strong)] rounded-2xl border border-[var(--line-soft)] bg-white px-4 outline-none transition focus:border-[var(--accent-sky)]"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-[var(--ink-soft)]" htmlFor="task-difficulty">
                  難易度
                </label>
                <select
                  id="task-difficulty"
                  value={difficulty}
                  onChange={(event) => setDifficulty(Number(event.target.value))}
                  className="h-12 text-[var(--ink-strong)] rounded-2xl border border-[var(--line-soft)] bg-white px-4 outline-none transition focus:border-[var(--accent-sky)]"
                >
                  {[1, 2, 3, 4, 5].map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-[var(--line-soft)] bg-[var(--bg-panel-strong)] px-4 py-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">Reward Preview</p>
                <p className="text-xl font-semibold text-[var(--ink-strong)]">
                  Base Reward {formatNumber(rewardPreview)}
                </p>
                <p className="text-sm text-[var(--ink-soft)]">
                  Timer {formatNumber(formDurationPreviewMinutes)} min / EXP {formatNumber(formRewardPreview.exp)} / SP{" "}
                  {formatNumber(formRewardPreview.sp)} / Energy {formatNumber(formRewardPreview.energy)}
                </p>
              </div>
              <Button type="submit">タスクを登録</Button>
            </div>
            {nextTaskSkillNames.length > 0 ? (
              <div className="flex flex-wrap gap-2 rounded-[20px] border border-[var(--line-soft)] bg-white/60 px-4 py-3">
                <p className="w-full text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
                  Applied When Timer Starts
                </p>
                {nextTaskSkillNames.map((name) => (
                  <Badge key={name} tone="sky">
                    {name}
                  </Badge>
                ))}
              </div>
            ) : null}
          </form>

          <div className="rounded-[24px] border border-[var(--line-soft)] bg-[var(--bg-panel-strong)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">Active Timer</p>
            {activeTask ? (
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-2xl font-semibold text-[var(--ink-strong)]">{activeTask.title}</h3>
                    <Badge tone={timerDone ? "ember" : "sky"}>{timerDone ? "報酬受取可能" : "進行中"}</Badge>
                  </div>
                    <p className="text-sm text-[var(--ink-soft)]">
                      終了予定: {formatDateTime(timer.targetEndsAt)}
                    </p>
                    {activeTask.status === "running" && timer.bonusSnapshot?.sourceSkillIds.length ? (
                      <div className="flex flex-wrap gap-2">
                        {monster.skills
                          .filter((skill) => timer.bonusSnapshot?.sourceSkillIds.includes(skill.id))
                          .map((skill) => (
                            <Badge key={skill.id} tone="sky">
                              {skill.name}
                            </Badge>
                          ))}
                      </div>
                    ) : null}
                  </div>
                <div className="space-y-2">
                  <p className="text-4xl font-display text-[var(--ink-strong)]">{formatCountdown(activeRemainingMs)}</p>
                  <Meter
                    tone={timerDone ? "ember" : "sky"}
                    value={
                      timer.startedAt && timer.targetEndsAt
                        ? new Date(timer.targetEndsAt).getTime() - new Date(timer.startedAt).getTime() - activeRemainingMs
                        : 0
                    }
                    max={
                      timer.startedAt && timer.targetEndsAt
                        ? new Date(timer.targetEndsAt).getTime() - new Date(timer.startedAt).getTime()
                        : 1
                    }
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button type="button" variant="secondary" onClick={() => completeTask(activeTask.id)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {timerDone ? "報酬を受け取る" : "このまま完了"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={stopTaskTimer}>
                    <Square className="mr-2 h-4 w-4" />
                    タイマー停止
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-[20px] border border-dashed border-[var(--line-strong)] px-4 py-6 text-sm leading-7 text-[var(--ink-soft)]">
                タイマー未起動です。nextTask 系のスキルを活かすなら、タスクカードから開始してください。
              </div>
            )}
          </div>
        </div>
      </Panel>

      <Panel
        eyebrow="Queue"
        title="進行中・未完了タスク"
        description="タイマーは1つだけ同時進行できます。タスクを直接完了すれば、すぐ報酬へ変換されます。"
      >
        <div className="space-y-4">
          {pendingTasks.length > 0 ? (
            pendingTasks.map((task) => {
              const baseReward = getTaskBaseReward(task.durationMinutes, task.difficulty);
              const isActive = timer.activeTaskId === task.id;
              const lockedByAnotherTask = Boolean(timer.activeTaskId && !isActive);
              const previewTask = buildTaskPreview(task.durationMinutes, task.difficulty);
              const previewSnapshot = createTimerBonusSnapshot(monster);
              const rewardPreviewForTask = calculateTaskCompletionReward(
                previewTask,
                monster,
                previewSnapshot,
              );
              const durationPreviewMinutes = Math.max(
                1,
                Math.round(getTaskDurationMs(previewTask, monster, previewSnapshot) / 60_000),
              );

              return (
                <article
                  key={task.id}
                  className="grid gap-4 rounded-[22px] border border-[var(--line-soft)] bg-white/65 p-4 lg:grid-cols-[1fr_auto]"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-semibold text-[var(--ink-strong)]">{task.title}</h3>
                      {task.subject ? <Badge>{task.subject}</Badge> : null}
                      <Badge tone={isActive ? "sky" : "neutral"}>{isActive ? "running" : task.status}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-[var(--ink-soft)]">
                      <Badge tone="moss">{task.durationMinutes} min</Badge>
                      <Badge tone="ember">Difficulty {task.difficulty}</Badge>
                      <Badge tone="sky">Base {formatNumber(baseReward)}</Badge>
                      <Badge tone="neutral">Timer {formatNumber(durationPreviewMinutes)} min</Badge>
                      <Badge tone="moss">EXP {formatNumber(rewardPreviewForTask.exp)}</Badge>
                      <Badge tone="sky">SP {formatNumber(rewardPreviewForTask.sp)}</Badge>
                      <Badge tone="ember">Energy {formatNumber(rewardPreviewForTask.energy)}</Badge>
                    </div>
                    {isActive ? (
                      <p className="text-sm text-[var(--ink-soft)]">
                        残り {formatCountdown(getRemainingMs(timer.targetEndsAt, nowMs))}
                      </p>
                    ) : (
                      <p className="text-sm text-[var(--ink-soft)]">
                        作成日時: {formatDateTime(task.createdAt)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 lg:w-[240px] lg:justify-end">
                    {isActive ? (
                      <Button type="button" variant="ghost" onClick={stopTaskTimer}>
                        <Square className="mr-2 h-4 w-4" />
                        Stop
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={lockedByAnotherTask}
                        onClick={() => startTaskTimer(task.id)}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Start
                      </Button>
                    )}
                    <Button type="button" onClick={() => completeTask(task.id)}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Complete
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => deleteTask(task.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-[22px] border border-dashed border-[var(--line-strong)] px-4 py-8 text-sm text-[var(--ink-soft)]">
              まだ未完了タスクがありません。上のフォームから最初の勉強クエストを登録しましょう。
            </div>
          )}
        </div>
      </Panel>

      <Panel
        eyebrow="Archive"
        title="完了済みタスク"
        description="達成したタスクの記録です。報酬は付与済みなので、削除しても巻き戻りません。"
      >
        <div className="space-y-3">
          {completedTasks.length > 0 ? (
            completedTasks.map((task) => (
              <article
                key={task.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-[var(--line-soft)] bg-white/55 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-[var(--ink-strong)]">{task.title}</p>
                  <p className="text-sm text-[var(--ink-soft)]">
                    完了: {formatDateTime(task.completedAt)} / {task.durationMinutes} min / difficulty {task.difficulty}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="moss">
                    Reward {formatNumber(getTaskBaseReward(task.durationMinutes, task.difficulty))}
                  </Badge>
                  <Button type="button" variant="ghost" size="sm" onClick={() => deleteTask(task.id)}>
                    <TimerReset className="mr-2 h-4 w-4" />
                    削除
                  </Button>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[22px] border border-dashed border-[var(--line-strong)] px-4 py-8 text-sm text-[var(--ink-soft)]">
              まだ完了済みタスクはありません。
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
