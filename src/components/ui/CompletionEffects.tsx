import { useEffect, useState } from "react";
import { CheckCircle2, Star, Zap, Trophy, Sparkles } from "lucide-react";
import { formatNumber } from "@/lib/formatters";
import type { TaskCompletionReward } from "@/types/game";

interface CompletionEffectsProps {
  isVisible: boolean;
  taskTitle: string;
  reward: TaskCompletionReward | null;
  monsterLevelUp?: boolean;
  droppedAttachment?: import("@/types/game").Attachment | null;
  onComplete: () => void;
}

export function CompletionEffects({ 
  isVisible, 
  taskTitle, 
  reward, 
  monsterLevelUp = false,
  droppedAttachment = null,
  onComplete 
}: CompletionEffectsProps) {
  const [showReward, setShowReward] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setShowReward(false);
      setShowParticles(false);
      setShowLevelUp(false);
      return;
    }

    // Stagger the animation sequence
    const timer1 = setTimeout(() => setShowParticles(true), 100);
    const timer2 = setTimeout(() => setShowReward(true), 600);
    const timer3 = setTimeout(() => {
      if (monsterLevelUp) {
        setShowLevelUp(true);
      }
    }, 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isVisible, monsterLevelUp]);

  const handleClick = () => {
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer" onClick={handleClick}>
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Main completion container */}
      <div className="relative z-10 text-center space-y-8 animate-in fade-in zoom-in duration-500">
        {/* Success icon with glow effect */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-green-400/30 rounded-full blur-xl animate-pulse" />
          <CheckCircle2 className="relative h-24 w-24 text-green-400 drop-shadow-2xl" />
        </div>

        {/* Task completion message */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white drop-shadow-lg">
            タスク完了！
          </h2>
          <p className="text-xl text-white/90 max-w-md mx-auto">
            {taskTitle}
          </p>
        </div>

        {/* Reward display */}
        <div className={`space-y-4 transition-all duration-700 ${
          showReward ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center gap-2">
              <Trophy className="h-5 w-5" />
              獲得報酬
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-300">
                  +{formatNumber(reward?.exp || 0)}
                </div>
                <div className="text-sm text-white/70">EXP</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-purple-300">
                  +{formatNumber(reward?.sp || 0)}
                </div>
                <div className="text-sm text-white/70">SP</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-orange-300">
                  +{formatNumber(reward?.energy || 0)}
                </div>
                <div className="text-sm text-white/70">Energy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Attachment drop celebration */}
        {droppedAttachment && (
          <div className={`space-y-4 transition-all duration-700 ${
            showReward ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="bg-gradient-to-r from-purple-400/20 to-pink-400/20 backdrop-blur-md rounded-2xl p-6 border border-purple-400/30">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5" />
                アタッチメント獲得！
              </h3>
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium text-purple-300">
                    {droppedAttachment.slot === "weapon" ? "武器" : 
                     droppedAttachment.slot === "armor" ? "防具" : "遺物"}
                  </span>
                  <span 
                    className="rounded-full px-2 py-1 text-xs font-bold text-purple-300"
                    style={{
                      backgroundColor: droppedAttachment.rarity === "SSS" ? "rgba(140,100,180,0.15)" :
                                       droppedAttachment.rarity === "SS" ? "rgba(166,68,50,0.15)" :
                                       droppedAttachment.rarity === "S" ? "rgba(205,167,95,0.15)" :
                                       droppedAttachment.rarity === "A" ? "rgba(61,102,125,0.15)" :
                                       droppedAttachment.rarity === "B" ? "rgba(89,115,79,0.15)" :
                                       "rgba(160,160,160,0.15)",
                    }}
                  >
                    {droppedAttachment.rarity}
                  </span>
                </div>
                <p className="text-white font-medium mb-2">{droppedAttachment.name}</p>
                <div className="space-y-1">
                  {droppedAttachment.effects.map((effect) => (
                    <div key={effect.id} className="text-xs text-purple-200">
                      • {effect.description}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Level up celebration */}
        {monsterLevelUp && (
          <div className={`transition-all duration-700 ${
            showLevelUp ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}>
            <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-md rounded-2xl p-6 border border-yellow-400/30">
              <div className="flex items-center justify-center gap-3">
                <Star className="h-8 w-8 text-yellow-400 animate-spin" />
                <h3 className="text-2xl font-bold text-yellow-300">
                  レベルアップ！
                </h3>
                <Star className="h-8 w-8 text-yellow-400 animate-spin" />
              </div>
            </div>
          </div>
        )}

        {/* Click to complete message */}
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <p className="text-xs text-white/60 animate-pulse">
            画面をクリックして完了
          </p>
        </div>
      </div>

      {/* Particle effects */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <Particle key={i} delay={i * 100} />
          ))}
        </div>
      )}
    </div>
  );
}

function Particle({ delay }: { delay: number }) {
  const [position] = useState(() => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
  }));

  const icons = [Star, Zap, Sparkles];
  const Icon = icons[Math.floor(Math.random() * icons.length)];
  const colors = ['text-yellow-400', 'text-blue-400', 'text-purple-400', 'text-green-400'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <div
      className="absolute animate-bounce"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        animationDelay: `${delay}ms`,
        animationDuration: '2s',
      }}
    >
      <Icon className={`h-4 w-4 ${color} opacity-60`} />
    </div>
  );
}
