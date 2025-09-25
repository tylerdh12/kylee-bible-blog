import { cn } from "@/lib/utils"
import { ProgressBarProps } from "@/types"

export function ProgressBar({ current, target, className }: ProgressBarProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0
  const isComplete = current >= target

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between text-sm text-muted-foreground mb-2">
        <span>${current.toFixed(2)}</span>
        <span>{percentage.toFixed(1)}%</span>
        <span>${target.toFixed(2)}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={cn(
            "h-3 rounded-full transition-all duration-300 ease-in-out",
            isComplete
              ? "bg-green-500"
              : "bg-gradient-to-r from-blue-500 to-purple-600"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isComplete && (
        <p className="text-sm text-green-600 font-medium mt-2">Goal completed! 🎉</p>
      )}
    </div>
  )
}