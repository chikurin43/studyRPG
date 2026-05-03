import { type FormEvent, useMemo, useState } from "react";
import { Play, Square, CheckCircle2, Trash2, TimerReset, Lock, Unlock, Edit, X, GripVertical, Folder, FolderPlus, FolderOpen, ArrowUpDown, CheckSquare, Maximize2, Pause } from "lucide-react";
import {
  DndContext,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  useDroppable,
  CollisionDetection,
  ClientRect,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Meter } from "@/components/ui/Meter";
import { Panel } from "@/components/ui/Panel";
import { formatCountdown, formatDateTime, formatNumber } from "@/lib/formatters";
import {
  calculateTaskCompletionReward,
  createTimerBonusSnapshot,
  getRemainingMs,
  getRemainingMsForTimer,
  getTaskDurationMs,
  isTimerComplete,
  isTimerCompleteForTimer,
} from "@/lib/gameRules";
import { useNow } from "@/lib/useNow";
import { useGameStore } from "@/store/gameStore";
import type { Task, TaskFolder, TimerBonusSnapshot } from "@/types/game";
import { FullscreenTimer } from "./FullscreenTimer";

function getTaskBaseReward(durationMinutes: number, difficulty: number) {
  return durationMinutes * difficulty;
}

// Custom collision detection for precise folder targeting
const customCollisionDetection: CollisionDetection = ({
  pointerCoordinates,
  droppableContainers,
}) => {
  if (!pointerCoordinates) {
    return [];
  }

  const { x, y } = pointerCoordinates;
  
  return droppableContainers.filter((container) => {
    const rect = container.rect.current;
    if (!rect) return false;
    
    // Check if pointer is within the bounds of the droppable element
    return (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    );
  });
};

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

interface SortableTaskCardProps {
  task: Task;
  isActive: boolean;
  lockedByAnotherTask: boolean;
  baseReward: number;
  previewTask: Task;
  previewSnapshot: TimerBonusSnapshot;
  rewardPreviewForTask: { exp: number; sp: number; energy: number };
  durationPreviewMinutes: number;
  timer: { activeTaskId: string | null; targetEndsAt: string | null; isPaused: boolean; pausedAt: string | null };
  nowMs: number;
  startTaskTimer: (taskId: string) => void;
  stopTaskTimer: () => void;
  completeTask: (taskId: string) => void;
  toggleTaskLock: (taskId: string) => void;
  handleEditStart: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  folders: TaskFolder[];
  assignTaskToFolder: (taskId: string, folderId: string | null) => void;
  isSelected: boolean;
  onToggleSelect: (taskId: string) => void;
}

function SortableTaskCard({
  task,
  isActive,
  lockedByAnotherTask,
  baseReward,
  previewTask,
  previewSnapshot,
  rewardPreviewForTask,
  durationPreviewMinutes,
  timer,
  nowMs,
  startTaskTimer,
  stopTaskTimer,
  completeTask,
  toggleTaskLock,
  handleEditStart,
  deleteTask,
  folders,
  assignTaskToFolder,
  isSelected,
  onToggleSelect,
}: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`grid gap-4 rounded-[22px] border p-4 lg:grid-cols-[1fr_auto] ${
        isSelected ? 'border-blue-400 bg-blue-50/50' : 'border-[var(--line-soft)] bg-white/65'
      }`}
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(task.id)}
            className="h-4 w-4 rounded border-gray-300 cursor-pointer"
          />
          <div className="flex items-center gap-2 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
            <GripVertical className="h-4 w-4 text-[var(--ink-soft)]" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--ink-strong)]">{task.title}</h3>
          {task.subject ? <Badge>{task.subject}</Badge> : null}
          <Badge tone={isActive ? "sky" : "neutral"}>{isActive ? "running" : task.status}</Badge>
          {task.folderId && (() => {
            const folder = folders.find((f: any) => f.id === task.folderId);
            return folder ? (
              <div 
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border-2"
                style={{ 
                  backgroundColor: folder.color + '20', 
                  borderColor: folder.color,
                  color: folder.color 
                }}
              >
                <Folder className="h-3 w-3" />
                {folder.name}
              </div>
            ) : null;
          })()}
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
            残り {formatCountdown(
              timer.isPaused && timer.pausedAt && timer.targetEndsAt
                ? Math.max(0, new Date(timer.targetEndsAt).getTime() - new Date(timer.pausedAt).getTime())
                : getRemainingMs(timer.targetEndsAt, nowMs)
            )}
          </p>
        ) : (
          <p className="text-sm text-[var(--ink-soft)]">
            作成日時: {formatDateTime(task.createdAt)}
          </p>
        )}
      </div>
      <div className="flex flex-col items-end gap-2 lg:w-[360px]">
        <div className="flex flex-wrap items-center gap-2">
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
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="ghost" onClick={() => toggleTaskLock(task.id)}>
            {task.locked ? <Lock className="mr-2 h-4 w-4" /> : <Unlock className="mr-2 h-4 w-4" />}
            {task.locked ? "Locked" : "Lock"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => handleEditStart(task)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button type="button" variant="ghost" onClick={() => deleteTask(task.id)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
    </article>
  );
}

interface FolderDropZoneProps {
  folder: {
    id: string;
    name: string;
    description?: string;
    color: string;
    taskIds: string[];
  };
  isSelected: boolean;
  onSelect: () => void;
  children?: React.ReactNode;
  isDragOver?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

function FolderDropZone({ folder, isSelected, onSelect, children, isDragOver, onEdit, onDelete }: FolderDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: folder.id,
  });

  const actuallyIsDragOver = isDragOver || isOver;

  return (
    <div
      ref={setNodeRef}
      className={`relative transition-all duration-200 ${
        actuallyIsDragOver ? 'scale-[1.02] shadow-lg' : ''
      }`}
    >
      <div
        className={`flex items-center gap-1 w-full justify-start p-2 rounded-lg cursor-pointer transition-colors min-h-12 ${
          isSelected 
            ? "bg-[var(--bg-panel-strong)] border border-[var(--line-soft)]" 
            : "hover:bg-[var(--bg-panel-soft)]"
        } ${
          actuallyIsDragOver ? 'ring-2 ring-blue-400 ring-offset-2' : ''
        }`}
        onClick={onSelect}
      >
        <div
          className="h-3 w-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: folder.color }}
        />
        <div className="flex-1 text-left min-w-0">
          <div className="font-medium text-[var(--ink-strong)]">{folder.name} ({folder.taskIds.length})</div>
          {folder.description && (
            <div className="text-xs text-[var(--ink-soft)] opacity-75 truncate">
              {folder.description}
            </div>
          )}
        </div>
        {folder.id !== 'uncategorized' && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            {onEdit && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="h-6 w-6 p-0 hover:bg-[var(--bg-panel-strong)]"
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
            {onDelete && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="h-6 w-6 p-0 hover:bg-[var(--bg-panel-strong)]"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

export function TasksView() {
  const tasks = useGameStore((state) => state.tasks);
  const folders = useGameStore((state) => state.folders);
  const timer = useGameStore((state) => state.timer);
  const addTask = useGameStore((state) => state.addTask);
  const updateTask = useGameStore((state) => state.updateTask);
  const reorderTasks = useGameStore((state) => state.reorderTasks);
  const createFolder = useGameStore((state) => state.createFolder);
  const updateFolder = useGameStore((state) => state.updateFolder);
  const deleteFolder = useGameStore((state) => state.deleteFolder);
  const assignTaskToFolder = useGameStore((state) => state.assignTaskToFolder);
  const deleteTask = useGameStore((state) => state.deleteTask);
  const batchDeleteTasks = useGameStore((state) => state.batchDeleteTasks);
  const toggleTaskLock = useGameStore((state) => state.toggleTaskLock);
  const reverseFolderTasks = useGameStore((state) => state.reverseFolderTasks);
  const batchMoveTasks = useGameStore((state) => state.batchMoveTasks);
  const startTaskTimer = useGameStore((state) => state.startTaskTimer);
  const pauseTaskTimer = useGameStore((state) => state.pauseTaskTimer);
  const resumeTaskTimer = useGameStore((state) => state.resumeTaskTimer);
  const stopTaskTimer = useGameStore((state) => state.stopTaskTimer);
  const completeTask = useGameStore((state) => state.completeTask);
  const monster = useGameStore((state) => state.monster);
  const nowMs = useNow();

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("英語");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [difficulty, setDifficulty] = useState(3);
  const [selectedFolderForNewTask, setSelectedFolderForNewTask] = useState<string | null>(null);

  // Multiple task registration states
  const [enableMultiple, setEnableMultiple] = useState(false);
  const [taskCount, setTaskCount] = useState(3);

  // Edit form states
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editDurationMinutes, setEditDurationMinutes] = useState(30);
  const [editDifficulty, setEditDifficulty] = useState(3);
  const [editFolderId, setEditFolderId] = useState<string | null>(null);

  // Folder states
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderDescription, setFolderDescription] = useState("");
  const [folderColor, setFolderColor] = useState("#3b82f6");
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Folder edit states
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [editFolderDescription, setEditFolderDescription] = useState("");
  const [editFolderColor, setEditFolderColor] = useState("#3b82f6");

  // Folder deletion confirmation states
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null);
  const [deleteAction, setDeleteAction] = useState<"move" | "delete">("move");
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);

  // Task selection and batch operation states
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [showBatchMoveModal, setShowBatchMoveModal] = useState(false);
  const [batchMoveTargetFolderId, setBatchMoveTargetFolderId] = useState<string | null>(null);

  // Fullscreen timer state
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeTask = useMemo(
    () => tasks.find((task) => task.id === timer.activeTaskId) ?? null,
    [tasks, timer.activeTaskId],
  );
  const activeRemainingMs = getRemainingMsForTimer(timer, nowMs);
  const timerDone = isTimerCompleteForTimer(timer, nowMs);

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

  // Evaluate expressions in title like {5+3i} with given i value
  const evaluateTitleExpressions = (template: string, i: number): string => {
    if (!enableMultiple) {
      return template;
    }
    // Match {expression} where expression can contain i
    return template.replace(/\{([^}]+)\}/g, (_, expr) => {
      try {
        // Replace 'i' with the actual value and evaluate
        const sanitized = expr.replace(/\bi\b/g, String(i));
        // eslint-disable-next-line no-new-func
        const result = Function('"use strict"; return (' + sanitized + ')')();
        return String(result);
      } catch {
        return `{${expr}}`;
      }
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    const count = enableMultiple ? Math.max(1, taskCount) : 1;

    for (let i = 0; i < count; i++) {
      const evaluatedTitle = evaluateTitleExpressions(title.trim(), i);
      addTask({
        title: evaluatedTitle,
        subject,
        durationMinutes,
        difficulty,
        folderId: selectedFolderForNewTask,
      });
    }

    setTitle("");
    setSubject("英語");
    setDurationMinutes(30);
    setDifficulty(3);
    setSelectedFolderForNewTask(null);
  };

  const handleEditStart = (task: any) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditSubject(task.subject || "");
    setEditDurationMinutes(task.durationMinutes);
    setEditDifficulty(task.difficulty);
    setEditFolderId(task.folderId || null);
  };

  const handleEditCancel = () => {
    setEditingTaskId(null);
    setEditTitle("");
    setEditSubject("");
    setEditDurationMinutes(30);
    setEditDifficulty(3);
    setEditFolderId(null);
  };

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editTitle.trim() || !editingTaskId) {
      return;
    }

    updateTask(editingTaskId, {
      title: editTitle,
      subject: editSubject,
      durationMinutes: editDurationMinutes,
      difficulty: editDifficulty,
      folderId: editFolderId,
    });

    handleEditCancel();
  };

  const handleCreateFolder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!folderName.trim()) {
      return;
    }

    createFolder({
      name: folderName,
      description: folderDescription,
      color: folderColor,
    });

    setFolderName("");
    setFolderDescription("");
    setFolderColor("#3b82f6");
    setShowFolderForm(false);
  };

  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolderId(folderId);
  };

  const handleFolderEditStart = (folder: any) => {
    setEditingFolderId(folder.id);
    setEditFolderName(folder.name);
    setEditFolderDescription(folder.description || "");
    setEditFolderColor(folder.color);
  };

  const handleFolderEditCancel = () => {
    setEditingFolderId(null);
    setEditFolderName("");
    setEditFolderDescription("");
    setEditFolderColor("#3b82f6");
  };

  const handleFolderEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editFolderName.trim() || !editingFolderId) {
      return;
    }

    updateFolder(editingFolderId, {
      name: editFolderName,
      description: editFolderDescription,
      color: editFolderColor,
    });

    handleFolderEditCancel();
  };

  const handleFolderDelete = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;
    
    setDeletingFolderId(folderId);
    setDeleteAction("move");
    setTargetFolderId(null);
  };

  const handleFolderDeleteConfirm = () => {
    if (!deletingFolderId) return;

    const folder = folders.find(f => f.id === deletingFolderId);
    if (!folder) return;

    if (deleteAction === "move") {
      // タスクを別のフォルダに移動
      const folderTasks = tasks.filter(task => task.folderId === deletingFolderId);
      folderTasks.forEach(task => {
        assignTaskToFolder(task.id, targetFolderId);
      });
    } else {
      // タスクを削除
      const folderTasks = tasks.filter(task => task.folderId === deletingFolderId);
      folderTasks.forEach(task => {
        deleteTask(task.id);
      });
    }

    // フォルダを削除
    deleteFolder(deletingFolderId);
    
    // 選択中のフォルダをクリア
    if (selectedFolderId === deletingFolderId) {
      setSelectedFolderId(null);
    }

    // モーダルを閉じる
    setDeletingFolderId(null);
    setDeleteAction("move");
    setTargetFolderId(null);
  };

  const handleFolderDeleteCancel = () => {
    setDeletingFolderId(null);
    setDeleteAction("move");
    setTargetFolderId(null);
  };

  // Task selection handlers
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const selectAllTasks = () => {
    const selectableIds = filteredPendingTasks.map((task) => task.id);
    setSelectedTaskIds(selectableIds);
  };

  const clearAllSelections = () => {
    setSelectedTaskIds([]);
  };

  const handleBatchDelete = () => {
    if (selectedTaskIds.length === 0) return;
    batchDeleteTasks(selectedTaskIds);
    setSelectedTaskIds([]);
  };

  const handleBatchReverse = () => {
    reverseFolderTasks(selectedFolderId);
  };

  const handleBatchMove = () => {
    if (selectedTaskIds.length === 0) return;
    setShowBatchMoveModal(true);
    setBatchMoveTargetFolderId(null);
  };

  const handleBatchMoveConfirm = () => {
    if (selectedTaskIds.length === 0) return;
    batchMoveTasks(selectedTaskIds, batchMoveTargetFolderId);
    setSelectedTaskIds([]);
    setShowBatchMoveModal(false);
    setBatchMoveTargetFolderId(null);
  };

  const handleBatchMoveCancel = () => {
    setShowBatchMoveModal(false);
    setBatchMoveTargetFolderId(null);
  };

  // Filter tasks based on selected folder
  const filteredPendingTasks = selectedFolderId
    ? pendingTasks.filter((task) => task.folderId === selectedFolderId)
    : pendingTasks.filter((task) => !task.folderId);

  const folderColors = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#6b7280", // gray
  ];

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setDraggedTaskId(active.id as string);
    setDragOverFolderId(null);
    
    // Add mouse move listener to track cursor position
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    document.addEventListener('mousemove', handleMouseMove);
    
    // Store the handler for cleanup
    (event as any).mouseMoveHandler = handleMouseMove;
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over && over.id !== draggedTaskId) {
      // Check if we're over a folder
      const folder = folders.find(f => f.id === over.id);
      if (folder) {
        setDragOverFolderId(folder.id);
        return;
      }
      
      // Check if we're over the uncategorized folder
      if (over.id === 'uncategorized') {
        setDragOverFolderId('uncategorized');
        return;
      }
    }
    setDragOverFolderId(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Reset drag states
    setDraggedTaskId(null);
    setDragOverFolderId(null);
    
    // Remove mouse move listener if it exists
    if ((event as any).mouseMoveHandler) {
      document.removeEventListener('mousemove', (event as any).mouseMoveHandler);
    }

    if (!over) return;

    const taskId = active.id as string;
    
    // Check if dropping on a folder
    const folder = folders.find(f => f.id === over.id);
    if (folder) {
      // Move task to folder
      assignTaskToFolder(taskId, folder.id);
      return;
    }

    // Check if dropping on "Uncategorized" button
    if (over.id === 'uncategorized') {
      assignTaskToFolder(taskId, null);
      return;
    }

    // Otherwise, handle task reordering within the same folder
    if (active.id !== over.id) {
      const oldIndex = filteredPendingTasks.findIndex((task) => task.id === active.id);
      const newIndex = filteredPendingTasks.findIndex((task) => task.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderTasks(oldIndex, newIndex);
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Drag overlay */}
      {draggedTaskId && dragOverFolderId && (
        <div
          className="fixed z-50 pointer-events-none bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg"
          style={{
            left: `${mousePosition.x + 10}px`,
            top: `${mousePosition.y - 40}px`,
          }}
        >
          ドロップして移動
        </div>
      )}
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

            <div className="grid gap-4 sm:grid-cols-2">
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
                <label className="text-sm font-medium text-[var(--ink-soft)]" htmlFor="task-folder">
                  フォルダ
                </label>
                <select
                  id="task-folder"
                  value={selectedFolderForNewTask || ""}
                  onChange={(event) => setSelectedFolderForNewTask(event.target.value || null)}
                  className="h-12 text-[var(--ink-strong)] rounded-2xl border border-[var(--line-soft)] bg-white px-4 outline-none transition focus:border-[var(--accent-sky)]"
                >
                  <option value="">未分類</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
              <Button type="submit">
                {enableMultiple ? `${taskCount}個のタスクを登録` : "タスクを登録"}
              </Button>
            </div>

            {/* Multiple Registration Options */}
            <div className="rounded-[20px] border border-[var(--line-soft)] bg-white/60 px-4 py-3">
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="checkbox"
                  id="enable-multiple"
                  checked={enableMultiple}
                  onChange={(e) => setEnableMultiple(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="enable-multiple" className="text-sm font-medium text-[var(--ink-soft)]">
                  複数登録を有効にする
                </label>
              </div>
              {enableMultiple && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="grid gap-1">
                    <label className="text-xs text-[var(--ink-soft)]" htmlFor="task-count">
                      登録個数
                    </label>
                    <input
                      id="task-count"
                      type="number"
                      min={1}
                      max={50}
                      value={taskCount}
                      onChange={(e) => setTaskCount(Math.max(1, Math.min(50, Number(e.target.value))))}
                      className="h-10 text-[var(--ink-strong)] rounded-xl border border-[var(--line-soft)] bg-white px-3 outline-none transition focus:border-[var(--accent-sky)]"
                    />
                  </div>
                  <div className="text-xs text-[var(--ink-soft)] self-end">
                    <p>タイトル内で {'{式}'} を使用できます。</p>
                    <p>例: 「数学 p{'{5+3*i}'}」→ p5, p8, p11...</p>
                  </div>
                </div>
              )}
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
                    <Badge tone={timerDone ? "ember" : timer.isPaused ? "moss" : "sky"}>
                    {timerDone ? "報酬受取可能" : timer.isPaused ? "一時停止中" : "進行中"}
                  </Badge>
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
                  {timer.isPaused ? (
                    <Button type="button" variant="ghost" onClick={resumeTaskTimer}>
                      <Play className="mr-2 h-4 w-4" />
                      再開
                    </Button>
                  ) : (
                    <Button type="button" variant="ghost" onClick={pauseTaskTimer}>
                      <Pause className="mr-2 h-4 w-4" />
                      一時停止
                    </Button>
                  )}
                  <Button type="button" variant="ghost" onClick={stopTaskTimer}>
                    <Square className="mr-2 h-4 w-4" />
                    タイマー停止
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setIsFullscreen(true)}>
                    <Maximize2 className="mr-2 h-4 w-4" />
                    全画面表示
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
        {/* Folder Navigation */}
        <div className="mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--ink-soft)]">フォルダ</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowFolderForm(!showFolderForm)}
            >
              <FolderPlus className="mr-1 h-4 w-4" />
              新規作成
            </Button>
          </div>

          {/* Folder Creation Form */}
          {showFolderForm && (
            <form onSubmit={handleCreateFolder} className="rounded-[20px] border border-[var(--line-soft)] bg-white/60 p-4">
              <div className="grid gap-3">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-[var(--ink-soft)]" htmlFor="folder-name">
                    フォルダ名
                  </label>
                  <input
                    id="folder-name"
                    value={folderName}
                    onChange={(event) => setFolderName(event.target.value)}
                    className="h-10 text-[var(--ink-soft)] rounded-xl border border-[var(--line-soft)] bg-white px-3 outline-none transition focus:border-[var(--accent-sky)]"
                    placeholder="例: 数学"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-[var(--ink-soft)]" htmlFor="folder-description">
                    説明（任意）
                  </label>
                  <input
                    id="folder-description"
                    value={folderDescription}
                    onChange={(event) => setFolderDescription(event.target.value)}
                    className="h-10 text-[var(--ink-soft)] rounded-xl border border-[var(--line-soft)] bg-white px-3 outline-none transition focus:border-[var(--accent-sky)]"
                    placeholder="例: 数学関連のタスク"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-[var(--ink-soft)]">色</label>
                  <div className="flex gap-2">
                    {folderColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFolderColor(color)}
                        className="h-8 w-8 rounded-lg border-2 transition"
                        style={{
                          backgroundColor: color,
                          borderColor: folderColor === color ? "var(--ink-strong)" : "transparent",
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setShowFolderForm(false)}>
                    キャンセル
                  </Button>
                  <Button type="submit" size="sm">
                    作成
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={customCollisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {/* Folder Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            <FolderDropZone
              folder={{ id: 'uncategorized', name: '未分類', color: '#6b7280', taskIds: pendingTasks.filter(task => !task.folderId).map(t => t.id) }}
              isSelected={selectedFolderId === null}
              onSelect={() => handleFolderSelect(null)}
              isDragOver={dragOverFolderId === 'uncategorized'}
            />
            {folders.map((folder) => (
              <div key={folder.id} className="group">
                <FolderDropZone
                  folder={folder}
                  isSelected={selectedFolderId === folder.id}
                  onSelect={() => handleFolderSelect(folder.id)}
                  isDragOver={dragOverFolderId === folder.id}
                  onEdit={() => handleFolderEditStart(folder)}
                  onDelete={() => handleFolderDelete(folder.id)}
                />
              </div>
            ))}
          </div>

          {/* Batch Operations Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 rounded-[16px] border border-[var(--line-soft)] bg-white/60 p-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[var(--ink-soft)]">
                {selectedTaskIds.length > 0 ? `${selectedTaskIds.length}個選択中` : "タスクを選択"}
              </span>
              {selectedTaskIds.length > 0 && (
                <>
                  <Button type="button" variant="ghost" size="sm" onClick={selectAllTasks}>
                    <CheckSquare className="mr-1 h-4 w-4" />
                    全選択
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={clearAllSelections}>
                    <X className="mr-1 h-4 w-4" />
                    選択解除
                  </Button>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Reverse Order Button - Always visible */}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleBatchReverse}
                disabled={filteredPendingTasks.length <= 1}
                title="現在のフォルダ内のタスク順序を反転"
              >
                <ArrowUpDown className="mr-1 h-4 w-4" />
                順序を反転
              </Button>

              {selectedTaskIds.length > 0 && (
                <>
                  <Button type="button" variant="ghost" size="sm" onClick={handleBatchMove}>
                    <FolderOpen className="mr-1 h-4 w-4" />
                    移動
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={handleBatchDelete} className="text-red-600 hover:text-red-700">
                    <Trash2 className="mr-1 h-4 w-4" />
                    削除
                  </Button>
                </>
              )}
            </div>
          </div>

          <SortableContext items={filteredPendingTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {filteredPendingTasks.length > 0 ? (
                filteredPendingTasks.map((task) => {
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
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      isActive={isActive}
                      lockedByAnotherTask={lockedByAnotherTask}
                      baseReward={baseReward}
                      previewTask={previewTask}
                      previewSnapshot={previewSnapshot}
                      rewardPreviewForTask={rewardPreviewForTask}
                      durationPreviewMinutes={durationPreviewMinutes}
                      timer={{
                        activeTaskId: timer.activeTaskId,
                        targetEndsAt: timer.targetEndsAt,
                        isPaused: timer.isPaused,
                        pausedAt: timer.pausedAt,
                      }}
                      nowMs={nowMs}
                      startTaskTimer={startTaskTimer}
                      stopTaskTimer={stopTaskTimer}
                      completeTask={completeTask}
                      toggleTaskLock={toggleTaskLock}
                      handleEditStart={handleEditStart}
                      deleteTask={deleteTask}
                      folders={folders}
                      assignTaskToFolder={assignTaskToFolder}
                      isSelected={selectedTaskIds.includes(task.id)}
                      onToggleSelect={toggleTaskSelection}
                    />
                  );
                })
              ) : (
                <div className="rounded-[22px] border border-dashed border-[var(--line-strong)] px-4 py-8 text-sm text-[var(--ink-soft)]">
                  まだ未完了タスクがありません。上のフォームから最初の勉強クエストを登録しましょう。
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
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

      {/* Edit Task Modal */}
      {editingTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-w-md w-full rounded-2xl border border-[var(--line-soft)] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[var(--ink-strong)]">タスクを編集</h2>
              <Button type="button" variant="ghost" size="sm" onClick={handleEditCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-[var(--ink-soft)]" htmlFor="edit-title">
                  タイトル
                </label>
                <input
                  id="edit-title"
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                  className="h-12 text-[var(--ink-soft)] rounded-2xl border border-[var(--line-soft)] bg-white px-4 outline-none transition focus:border-[var(--accent-sky)]"
                  placeholder="例: 英単語を50個覚える"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2 sm:col-span-1">
                  <label className="text-sm font-medium text-[var(--ink-soft)]" htmlFor="edit-subject">
                    科目
                  </label>
                  <select
                    id="edit-subject"
                    value={editSubject}
                    onChange={(event) => setEditSubject(event.target.value)}
                    className="h-12 text-[var(--ink-strong)] rounded-2xl border border-[var(--line-soft)] bg-white px-4 outline-none transition focus:border-[var(--accent-sky)]"
                  >
                    {["", "英語", "数学", "国語", "社会", "理科", "その他"].map((subject) => (
                      <option key={subject} value={subject}>
                        {subject || "なし"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-[var(--ink-soft)]" htmlFor="edit-folder">
                    フォルダ
                  </label>
                  <select
                    id="edit-folder"
                    value={editFolderId || ""}
                    onChange={(event) => setEditFolderId(event.target.value || null)}
                    className="h-12 text-[var(--ink-strong)] rounded-2xl border border-[var(--line-soft)] bg-white px-4 outline-none transition focus:border-[var(--accent-sky)]"
                  >
                    <option value="">未分類</option>
                    {folders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-[var(--ink-soft)]" htmlFor="edit-duration">
                    時間 (分)
                  </label>
                  <input
                    id="edit-duration"
                    type="number"
                    min={5}
                    step={5}
                    value={editDurationMinutes}
                    onChange={(event) => setEditDurationMinutes(Number(event.target.value))}
                    className="h-12 text-[var(--ink-strong)] rounded-2xl border border-[var(--line-soft)] bg-white px-4 outline-none transition focus:border-[var(--accent-sky)]"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-[var(--ink-soft)]" htmlFor="edit-difficulty">
                    難易度
                  </label>
                  <select
                    id="edit-difficulty"
                    value={editDifficulty}
                    onChange={(event) => setEditDifficulty(Number(event.target.value))}
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

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={handleEditCancel} className="flex-1">
                  キャンセル
                </Button>
                <Button type="submit" className="flex-1">
                  更新
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Folder Modal */}
      {editingFolderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-w-md w-full rounded-2xl border border-[var(--line-soft)] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[var(--ink-strong)]">フォルダを編集</h2>
              <Button type="button" variant="ghost" size="sm" onClick={handleFolderEditCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleFolderEditSubmit} className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-[var(--ink-soft)]" htmlFor="edit-folder-name">
                  フォルダ名
                </label>
                <input
                  id="edit-folder-name"
                  value={editFolderName}
                  onChange={(event) => setEditFolderName(event.target.value)}
                  className="h-10 text-[var(--ink-soft)] rounded-xl border border-[var(--line-soft)] bg-white px-3 outline-none transition focus:border-[var(--accent-sky)]"
                  placeholder="例: 数学"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-[var(--ink-soft)]" htmlFor="edit-folder-description">
                  説明（任意）
                </label>
                <input
                  id="edit-folder-description"
                  value={editFolderDescription}
                  onChange={(event) => setEditFolderDescription(event.target.value)}
                  className="h-10 text-[var(--ink-soft)] rounded-xl border border-[var(--line-soft)] bg-white px-3 outline-none transition focus:border-[var(--accent-sky)]"
                  placeholder="例: 数学関連のタスク"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-[var(--ink-soft)]">色</label>
                <div className="flex gap-2">
                  {folderColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEditFolderColor(color)}
                      className="h-8 w-8 rounded-lg border-2 transition"
                      style={{
                        backgroundColor: color,
                        borderColor: editFolderColor === color ? "var(--ink-strong)" : "transparent",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={handleFolderEditCancel} className="flex-1">
                  キャンセル
                </Button>
                <Button type="submit" className="flex-1">
                  更新
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Folder Delete Confirmation Modal */}
      {deletingFolderId && (() => {
        const folder = folders.find(f => f.id === deletingFolderId);
        const folderTasks = tasks.filter(task => task.folderId === deletingFolderId);
        const availableFolders = folders.filter(f => f.id !== deletingFolderId);
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="mx-4 max-w-md w-full rounded-2xl border border-[var(--line-soft)] bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[var(--ink-strong)]">フォルダ削除の確認</h2>
                <Button type="button" variant="ghost" size="sm" onClick={handleFolderDeleteCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="text-sm text-[var(--ink-soft)]">
                  フォルダ「{folder?.name}」を削除します。中に {folderTasks.length} 個のタスクがあります。
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-[var(--ink-soft)]">タスクの処理方法：</label>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="deleteAction"
                        value="move"
                        checked={deleteAction === "move"}
                        onChange={(e) => setDeleteAction(e.target.value as "move" | "delete")}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">別のフォルダに移動する</span>
                    </label>
                    
                    {deleteAction === "move" && (
                      <div className="ml-6">
                        <select
                          value={targetFolderId || ""}
                          onChange={(e) => setTargetFolderId(e.target.value || null)}
                          className="w-full h-10 text-[var(--ink-strong)] rounded-xl border border-[var(--line-soft)] bg-white px-3 outline-none transition focus:border-[var(--accent-sky)]"
                        >
                          <option value="">未分類</option>
                          {availableFolders.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="deleteAction"
                        value="delete"
                        checked={deleteAction === "delete"}
                        onChange={(e) => setDeleteAction(e.target.value as "move" | "delete")}
                        className="h-4 w-4"
                      />
                      <span className="text-sm text-red-600">タスクも削除する</span>
                    </label>
                  </div>
                </div>

                {folderTasks.length > 0 && (
                  <div className="text-xs text-[var(--ink-soft)] bg-[var(--bg-panel-soft)] p-3 rounded-lg">
                    <div className="font-medium mb-1">対象タスク：</div>
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {folderTasks.map((task) => (
                        <div key={task.id} className="truncate">
                          • {task.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={handleFolderDeleteCancel} className="flex-1">
                  キャンセル
                </Button>
                <Button 
                  type="button" 
                  onClick={handleFolderDeleteConfirm} 
                  className="flex-1"
                  disabled={deleteAction === "move" && !targetFolderId && availableFolders.length === 0}
                >
                  削除
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Batch Move Modal */}
      {showBatchMoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-w-md w-full rounded-2xl border border-[var(--line-soft)] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[var(--ink-strong)]">
                {selectedTaskIds.length}個のタスクを移動
              </h2>
              <Button type="button" variant="ghost" size="sm" onClick={handleBatchMoveCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="text-sm text-[var(--ink-soft)]">
                移動先のフォルダを選択してください。
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-[var(--ink-soft)]">移動先フォルダ</label>
                <select
                  value={batchMoveTargetFolderId || ""}
                  onChange={(e) => setBatchMoveTargetFolderId(e.target.value || null)}
                  className="w-full h-12 text-[var(--ink-strong)] rounded-2xl border border-[var(--line-soft)] bg-white px-4 outline-none transition focus:border-[var(--accent-sky)]"
                >
                  <option value="">未分類</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTaskIds.length > 0 && (
                <div className="text-xs text-[var(--ink-soft)] bg-[var(--bg-panel-soft)] p-3 rounded-lg max-h-32 overflow-y-auto">
                  <div className="font-medium mb-1">対象タスク：</div>
                  <div className="space-y-1">
                    {tasks
                      .filter((task) => selectedTaskIds.includes(task.id))
                      .map((task) => (
                        <div key={task.id} className="truncate">
                          • {task.title}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={handleBatchMoveCancel} className="flex-1">
                キャンセル
              </Button>
              <Button type="button" onClick={handleBatchMoveConfirm} className="flex-1">
                移動
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Timer */}
      {isFullscreen && activeTask && (
        <FullscreenTimer
          task={activeTask}
          timer={timer}
          onExit={() => setIsFullscreen(false)}
          onPause={pauseTaskTimer}
          onResume={resumeTaskTimer}
          onStop={stopTaskTimer}
          onComplete={() => completeTask(activeTask.id)}
        />
      )}
    </div>
  );
}
