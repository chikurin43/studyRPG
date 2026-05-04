import { useEffect } from "react";
import { Square, CheckCircle2, Minimize2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Meter } from "@/components/ui/Meter";
import { formatCountdown, formatDateTime } from "@/lib/formatters";
import { getRemainingMsForTimer, isTimerCompleteForTimer } from "@/lib/gameRules";
import { useNow } from "@/lib/useNow";
import type { Task, ActiveTimer } from "@/types/game";

interface FullscreenTimerProps {
  task: Task;
  timer: ActiveTimer;
  onExit: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onComplete: () => void;
}

export function FullscreenTimer({ task, timer, onExit, onPause, onResume, onStop, onComplete }: FullscreenTimerProps) {
  const nowMs = useNow();
  const activeRemainingMs = getRemainingMsForTimer(timer, nowMs);
  const timerDone = isTimerCompleteForTimer(timer, nowMs);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onExit();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  const totalDuration = timer.startedAt && timer.targetEndsAt
    ? new Date(timer.targetEndsAt).getTime() - new Date(timer.startedAt).getTime()
    : 1;
  const elapsed = totalDuration - activeRemainingMs;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8 text-center">
        {/* Exit button */}
        <div className="absolute top-8 right-8">
          <Button
            type="button"
            variant="ghost"
            onClick={onExit}
            className="text-white/80 hover:text-white hover:bg-white/10 border border-white/20"
          >
            <Minimize2 className="mr-2 h-4 w-4" />
            全画面を終了
          </Button>
        </div>

        {/* Task title */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white">{task.title}</h1>
          {task.subject && (
            <div className="text-xl text-white/80">{task.subject}</div>
          )}
          <div className="text-lg text-white/60">
            終了予定: {formatDateTime(timer.targetEndsAt)}
          </div>
        </div>

        {/* Timer display */}
        <div className="space-y-6">
          <div className="text-8xl md:text-9xl font-display font-bold text-white tabular-nums">
            {formatCountdown(activeRemainingMs)}
          </div>
          
          {/* Progress bar */}
          <div className="w-full max-w-2xl mx-auto">
            <Meter
              tone={timerDone ? "ember" : "sky"}
              value={activeRemainingMs}
              max={totalDuration}
              className="h-4"
            />
          </div>

          {/* Status */}
          <div className="text-2xl font-medium">
            {timerDone ? (
              <span className="text-orange-400">報酬受取可能</span>
            ) : timer.isPaused ? (
              <span className="text-green-400">一時停止中</span>
            ) : (
              <span className="text-sky-400">進行中</span>
            )}
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => onComplete()}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            {timerDone ? "報酬を受け取る" : "このまま完了"}
          </Button>
          {timer.isPaused ? (
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => onResume()}
              className="text-white/80 hover:text-white hover:bg-white/10 border border-white/20"
            >
              <Play className="mr-2 h-5 w-5" />
              再開
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => onPause()}
              className="text-white/80 hover:text-white hover:bg-white/10 border border-white/20"
            >
              <Pause className="mr-2 h-5 w-5" />
              一時停止
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() => onStop()}
            className="text-white/80 hover:text-white hover:bg-white/10 border border-white/20"
          >
            <Square className="mr-2 h-5 w-5" />
            タイマー停止
          </Button>
        </div>

        {/* Task info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white/60 text-sm">
          <div>
            <div className="font-medium">時間</div>
            <div>{task.durationMinutes} 分</div>
          </div>
          <div>
            <div className="font-medium">難易度</div>
            <div>{task.difficulty}</div>
          </div>
          <div>
            <div className="font-medium">科目</div>
            <div>{task.subject || "なし"}</div>
          </div>
          <div>
            <div className="font-medium">ステータス</div>
            <div>{task.status}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
