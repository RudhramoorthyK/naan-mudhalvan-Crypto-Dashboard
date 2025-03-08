
import { CryptoAsset } from "@/types/crypto";
import { PriceChange } from "./PriceChange";
import { formatCurrency } from "@/lib/utils";

interface CryptoCardProps {
  asset: CryptoAsset;
  isSelected?: boolean;
  onClick?: () => void;
}

export function CryptoCard({ asset, isSelected = false, onClick }: CryptoCardProps) {
  return (
    <div 
      className={cn(
        "neo-card p-4 transition-all duration-300 cursor-pointer hover:shadow-md animate-scale-in",
        isSelected && "ring-2 ring-primary/20"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
          {asset.image ? (
            <img 
              src={asset.image} 
              alt={asset.name} 
              className="h-8 w-8 object-contain"
              loading="lazy"
            />
          ) : (
            <div className="h-8 w-8 flex items-center justify-center text-xs text-muted-foreground">
              {asset.symbol.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-sm">{asset.name}</h3>
            <span className="text-xs text-muted-foreground">{asset.symbol.toUpperCase()}</span>
          </div>
          
          <div className="flex justify-between items-center mt-1">
            <span className="font-semibold">{formatCurrency(asset.current_price)}</span>
            <PriceChange value={asset.price_change_percentage_24h} />
          </div>
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

