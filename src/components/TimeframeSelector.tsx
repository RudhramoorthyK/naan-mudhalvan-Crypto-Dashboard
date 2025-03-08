
import { TimeFrame } from "@/types/crypto";
import { cn } from "@/lib/utils";

interface TimeframeSelectorProps {
  value: TimeFrame;
  onChange: (value: TimeFrame) => void;
}

const TIMEFRAMES: TimeFrame[] = ['1D', '1W', '1M', '3M', '1Y', '5Y'];

export function TimeframeSelector({ value, onChange }: TimeframeSelectorProps) {
  return (
    <div className="flex items-center space-x-1 bg-secondary/50 rounded-lg p-1 animate-scale-in">
      {TIMEFRAMES.map((timeframe) => (
        <button
          key={timeframe}
          onClick={() => onChange(timeframe)}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-300",
            timeframe === value 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          )}
        >
          {timeframe}
        </button>
      ))}
    </div>
  );
}
