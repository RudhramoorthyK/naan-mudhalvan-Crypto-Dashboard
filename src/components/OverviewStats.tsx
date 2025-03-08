
import { CryptoAsset } from "@/types/crypto";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { PriceChange } from "./PriceChange";

interface OverviewStatsProps {
  asset: CryptoAsset | null;
}

export function OverviewStats({ asset }: OverviewStatsProps) {
  if (!asset) {
    return <div className="h-24 animate-pulse bg-secondary/20 rounded-lg"></div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
      <StatCard
        title="Current Price"
        value={formatCurrency(asset.current_price)}
        change={<PriceChange value={asset.price_change_percentage_24h} showBadge={false} />}
      />
      
      <StatCard
        title="Market Cap"
        value={formatCurrency(asset.market_cap, true)}
        subtitle={`Rank #${asset.market_cap_rank}`}
      />
      
      <StatCard
        title="24h Change"
        value={<PriceChange value={asset.price_change_percentage_24h} showBadge={false} iconSize={18} />}
      />
      
      {asset.price_change_percentage_7d !== undefined && (
        <StatCard
          title="7d Change"
          value={<PriceChange value={asset.price_change_percentage_7d} showBadge={false} iconSize={18} />}
        />
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  change?: React.ReactNode;
}

function StatCard({ title, value, subtitle, change }: StatCardProps) {
  return (
    <div className="neo-card p-4">
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {change && <div>{change}</div>}
      </div>
      <div className="mt-2">
        <div className="text-xl font-semibold">{value}</div>
        {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
      </div>
    </div>
  );
}
