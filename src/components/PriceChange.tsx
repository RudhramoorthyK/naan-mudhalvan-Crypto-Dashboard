
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceChangeProps {
  value: number;
  className?: string;
  showBadge?: boolean;
  iconSize?: number;
}

export function PriceChange({ 
  value, 
  className, 
  showBadge = true,
  iconSize = 14
}: PriceChangeProps) {
  const isPositive = value >= 0;
  const formattedValue = `${isPositive ? '+' : ''}${value.toFixed(2)}%`;
  
  const content = (
    <span className="flex items-center gap-1">
      {isPositive ? 
        <ArrowUp size={iconSize} className="text-success" /> : 
        <ArrowDown size={iconSize} className="text-destructive" />
      }
      <span className={cn(
        isPositive ? "text-success" : "text-destructive",
        className
      )}>
        {formattedValue}
      </span>
    </span>
  );
  
  if (showBadge) {
    return (
      <Badge 
        variant={isPositive ? "success" : "destructive"} 
        className="py-1 px-2"
      >
        {content}
      </Badge>
    );
  }
  
  return content;
}
