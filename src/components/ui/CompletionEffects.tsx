import { useEffect, useState } from "react";
import { CheckCircle2, Star, Zap, Trophy, Sparkles } from "lucide-react";
import { formatNumber } from "@/lib/formatters";
import type { TaskCompletionReward } from "@/types/game";

interface CompletionEffectsProps {
  isVisible: boolean;
  taskTitle: string;
  reward: TaskCompletionReward | null;
  monsterLevelUp?: boolean;
  onComplete: () => void;
}

export function CompletionEffects({ 
  isVisible, 
  taskTitle, 
  reward, 
  monsterLevelUp = false,
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
