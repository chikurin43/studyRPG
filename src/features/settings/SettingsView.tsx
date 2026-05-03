import { useState, useRef } from "react";
import { Download, Upload, AlertCircle, CheckCircle2, FileDown, FileUp, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { exportSaveData, importSaveData, downloadFile, readFileAsText, getSaveFileExtension } from "@/lib/saveManager";
import { useGameStore } from "@/store/gameStore";
import type { PersistedGameState } from "@/types/game";

export function SettingsView() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get persisted state fields
  const tasks = useGameStore((s) => s.tasks);
  const folders = useGameStore((s) => s.folders);
  const timer = useGameStore((s) => s.timer);
  const monster = useGameStore((s) => s.monster);
  const resources = useGameStore((s) => s.resources);
  const raid = useGameStore((s) => s.raid);
  const equipmentInventory = useGameStore((s) => s.equipmentInventory);
  const equippedSlots = useGameStore((s) => s.equippedSlots);

  // Get store actions
  const resetGame = useGameStore((s) => s.resetGame);

  const [password, setPassword] = useState("");
  const [importPassword, setImportPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Clear message after 5 seconds
  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Export save data
  const handleExport = () => {
    if (!password) {
      showMessage("error", "パスワードを入力してください。");
      return;
    }

    try {
      const state: PersistedGameState = {
        tasks,
        folders,
        timer,
        monster,
        resources,
        raid,
        equipmentInventory,
        equippedSlots,
      };

      const { blob, filename } = exportSaveData(state, password);
      downloadFile(blob, filename);
      showMessage("success", "セーブデータをエクスポートしました。");
      setPassword("");
    } catch (error) {
      showMessage("error", "エクスポートに失敗しました。");
    }
  };

  // Trigger file input click
  const handleImportClick = () => {
    if (!importPassword) {
      showMessage("error", "インポート用パスワードを入力してください。");
      return;
    }
    fileInputRef.current?.click();
  };

  // Handle file selection for import
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!importPassword) {
      showMessage("error", "パスワードを入力してください。");
      return;
    }

    setIsImporting(true);

    try {
      const content = await readFileAsText(file);
      const result = importSaveData(content, importPassword);

      if (result.success && result.data) {
        // Write to localStorage in zustand persist format
        const STORAGE_KEY = "study-rpg-state";
        const persistData = {
          state: result.data,
          version: 0,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(persistData));

        showMessage("success", "セーブデータをインポートしました。ページをリロードします...");
        setImportPassword("");

        // Reload page after a short delay to ensure state is applied
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        showMessage("error", result.error || "インポートに失敗しました。");
      }
    } catch (error) {
      showMessage("error", "ファイルの読み込みに失敗しました。");
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-50">設定</h1>
        <p className="text-sm text-stone-300">
          セーブデータのエクスポート/インポートとその他の設定
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`rounded-xl p-4 ${
            message.type === "success"
              ? "border border-green-200 bg-green-50 text-green-800"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        </div>
      )}

      {/* Export Section */}
      <Panel
        title="セーブデータをエクスポート"
        description="現在のゲーム状態を暗号化してファイルとして保存します。パスワードは復号に必要です。"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink-strong)]">
              暗号化パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              className="w-full rounded-xl border border-[var(--line-soft)] bg-white/60 px-4 py-3 text-sm text-[var(--ink-strong)] placeholder:text-[var(--ink-faint)] focus:border-[var(--accent-moss)] focus:outline-none"
            />
            <p className="mt-1 text-xs text-[var(--ink-soft)]">
              このパスワードはインポート時にも必要です。忘れないように注意してください。
            </p>
          </div>

          <Button onClick={handleExport} className="w-full gap-2">
            <FileDown size={18} />
            エクスポート ({getSaveFileExtension()})
          </Button>
        </div>
      </Panel>

      {/* Import Section */}
      <Panel
        title="セーブデータをインポート"
        description="以前にエクスポートしたセーブデータを読み込みます。現在のデータは上書きされます。"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--ink-strong)]">
              復号パスワード
            </label>
            <input
              type="password"
              value={importPassword}
              onChange={(e) => setImportPassword(e.target.value)}
              placeholder="エクスポート時のパスワードを入力"
              className="w-full rounded-xl border border-[var(--line-soft)] bg-white/60 px-4 py-3 text-sm text-[var(--ink-strong)] placeholder:text-[var(--ink-faint)] focus:border-[var(--accent-moss)] focus:outline-none"
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={getSaveFileExtension()}
            onChange={handleFileSelect}
            className="hidden"
          />

          <Button
            onClick={handleImportClick}
            disabled={isImporting}
            variant="secondary"
            className="w-full gap-2"
          >
            <FileUp size={18} />
            {isImporting ? "インポート中..." : `インポート (${getSaveFileExtension()})`}
          </Button>

          <p className="text-xs text-[var(--ink-soft)]">
            ⚠️ インポートすると現在のゲームデータは上書きされます。
          </p>
        </div>
      </Panel>

      {/* Reset Section */}
      <Panel
        title="ゲームデータをリセット"
        description="すべてのゲームデータを初期状態に戻します。この操作は元に戻せません。"
      >
        <div className="space-y-4">
          <Button
            onClick={() => setShowResetConfirm(true)}
            variant="danger"
            className="w-full gap-2"
          >
            <RotateCcw size={18} />
            ゲームをリセット
          </Button>
          
          <p className="text-xs text-[var(--ink-soft)]">
            ⚠️ この操作はすべてのデータを永久に削除します。復元できません。
          </p>
        </div>
      </Panel>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 max-w-md rounded-xl border border-[var(--line-soft)] bg-[var(--bg-panel)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-[var(--ink-strong)]">ゲームデータのリセット</h3>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">
                  すべてのゲームデータが削除され、初期状態に戻ります。この操作は元に戻せません。
                  本当にリセットしますか？
                </p>
              </div>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="rounded-lg p-1 text-[var(--ink-soft)] hover:bg-[var(--line-soft)]"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => setShowResetConfirm(false)}
                variant="ghost"
                className="flex-1"
              >
                キャンセル
              </Button>
              <Button
                onClick={() => {
                  resetGame();
                  setShowResetConfirm(false);
                  showMessage("success", "ゲームデータをリセットしました。");
                }}
                variant="danger"
                className="flex-1 gap-2"
              >
                <RotateCcw size={16} />
                リセットする
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
