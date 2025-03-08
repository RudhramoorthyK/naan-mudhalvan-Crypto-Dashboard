
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchTopCryptoAssets, fetchHistoricalData } from "@/lib/api";
import { CryptoAsset, HistoricalData, TimeFrame } from "@/types/crypto";
import { TimeframeSelector } from "@/components/TimeframeSelector";
import { PriceChart } from "@/components/PriceChart";
import { OverviewStats } from "@/components/OverviewStats";
import { CryptoSearch } from "@/components/CryptoSearch";
import { CryptoCard } from "@/components/CryptoCard";
import { ComparisonView } from "@/components/ComparisonView";
import { Badge } from "@/components/ui/badge";
import { ChartLine } from "lucide-react";

const Index = () => {
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);
  const [timeframe, setTimeframe] = useState<TimeFrame>("1M");
  const [comparisonAssets, setComparisonAssets] = useState<CryptoAsset[]>([]);
  const [historicalDataMap, setHistoricalDataMap] = useState<Record<string, HistoricalData | null>>({});
  
  // Fetch top crypto assets
  const { 
    data: assets = [], 
    isLoading: isLoadingAssets,
    error: assetsError
  } = useQuery({
    queryKey: ["topCryptoAssets"],
    queryFn: () => fetchTopCryptoAssets(20),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
  
  // Set initial selected asset when assets are loaded
  useEffect(() => {
    if (assets.length > 0 && !selectedAsset) {
      setSelectedAsset(assets[0]);
    }
  }, [assets, selectedAsset]);
  
  // Fetch historical data for selected asset
  const { 
    data: historicalData,
    isLoading: isLoadingHistorical,
    error: historicalError
  } = useQuery({
    queryKey: ["historicalData", selectedAsset?.id, timeframe],
    queryFn: () => selectedAsset ? fetchHistoricalData(selectedAsset.id, timeframe) : null,
    enabled: !!selectedAsset,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      if (data && selectedAsset) {
        setHistoricalDataMap(prev => ({
          ...prev,
          [selectedAsset.id]: data
        }));
      }
    }
  });
  
  // Fetch historical data for comparison assets
  const { 
    isLoading: isLoadingComparison,
    error: comparisonError
  } = useQuery({
    queryKey: ["comparisonData", comparisonAssets.map(a => a.id).join(","), timeframe],
    queryFn: async () => {
      const results = await Promise.all(
        comparisonAssets.map(asset => fetchHistoricalData(asset.id, timeframe))
      );
      
      const newDataMap: Record<string, HistoricalData | null> = {};
      comparisonAssets.forEach((asset, index) => {
        newDataMap[asset.id] = results[index];
      });
      
      setHistoricalDataMap(prev => ({
        ...prev,
        ...newDataMap
      }));
      
      return newDataMap;
    },
    enabled: comparisonAssets.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
  
  // Handle errors
  useEffect(() => {
    if (assetsError) {
      toast.error("Failed to load crypto assets. Please try again later.");
    }
    
    if (historicalError) {
      toast.error("Failed to load historical data. Please try again later.");
    }
    
    if (comparisonError) {
      toast.error("Failed to load comparison data. Please try again later.");
    }
  }, [assetsError, historicalError, comparisonError]);
  
  const handleSelectAsset = (asset: CryptoAsset) => {
    setSelectedAsset(asset);
  };
  
  const handleAddToComparison = (asset: CryptoAsset) => {
    // Check if already in comparison list
    if (comparisonAssets.some(a => a.id === asset.id)) {
      toast.error(`${asset.name} is already in your comparison list`);
      return;
    }
    
    // Limit to 4 assets for comparison
    if (comparisonAssets.length >= 4) {
      toast.error("You can compare up to 4 cryptocurrencies at once");
      return;
    }
    
    setComparisonAssets(prev => [...prev, asset]);
    toast.success(`Added ${asset.name} to comparison`);
  };
  
  const handleRemoveFromComparison = (assetId: string) => {
    setComparisonAssets(prev => prev.filter(a => a.id !== assetId));
  };
  
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <header className="border-b border-border">
        <div className="container py-6 px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <ChartLine size={28} className="text-foreground" />
              <h1 className="text-2xl font-semibold">CryptoHistorica</h1>
            </div>
            <CryptoSearch assets={assets} onSelect={handleSelectAsset} />
          </div>
        </div>
      </header>
      
      <main className="container py-8 px-4 md:px-8 space-y-10">
        {isLoadingAssets ? (
          <div className="h-96 flex items-center justify-center animate-pulse">
            <div className="text-xl text-muted-foreground">Loading crypto assets...</div>
          </div>
        ) : (
          <>
            {/* Selected Crypto Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 animate-slide-up">
                <Badge variant="secondary" className="text-xs px-3 py-1">Overview</Badge>
                <h2 className="text-2xl font-semibold">
                  {selectedAsset?.name || "Select an asset"}
                </h2>
              </div>
              
              <OverviewStats asset={selectedAsset} />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex gap-2 items-center">
                  <h3 className="text-lg font-medium">Price Chart</h3>
                  {selectedAsset && (
                    <button
                      className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-primary/10 hover:bg-primary/20 text-foreground transition-colors"
                      onClick={() => selectedAsset && handleAddToComparison(selectedAsset)}
                    >
                      + Add to Comparison
                    </button>
                  )}
                </div>
                <TimeframeSelector value={timeframe} onChange={setTimeframe} />
              </div>
              
              <div className="border border-border rounded-lg p-4 bg-card">
                <PriceChart
                  data={historicalData}
                  timeframe={timeframe}
                  isLoading={isLoadingHistorical || !selectedAsset}
                  symbol={selectedAsset?.symbol || ""}
                />
              </div>
            </section>
            
            {/* Top Cryptocurrencies */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 animate-slide-up">
                <Badge variant="secondary" className="text-xs px-3 py-1">Popular</Badge>
                <h2 className="text-2xl font-semibold">Top Cryptocurrencies</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {assets.slice(0, 10).map((asset, index) => (
                  <div key={asset.id} className="animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <CryptoCard
                      asset={asset}
                      isSelected={selectedAsset?.id === asset.id}
                      onClick={() => handleSelectAsset(asset)}
                    />
                  </div>
                ))}
              </div>
            </section>
            
            {/* Comparison Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 animate-slide-up">
                <Badge variant="secondary" className="text-xs px-3 py-1">Analysis</Badge>
                <h2 className="text-2xl font-semibold">Compare Cryptocurrencies</h2>
              </div>
              
              <ComparisonView
                selectedAssets={comparisonAssets}
                historicalDataMap={historicalDataMap}
                timeframe={timeframe}
                isLoading={isLoadingComparison}
                onTimeframeChange={setTimeframe}
                onRemoveAsset={handleRemoveFromComparison}
              />
            </section>
          </>
        )}
      </main>
      
      <footer className="border-t border-border py-8 mt-16">
        <div className="container px-4 md:px-8 text-center text-sm text-muted-foreground">
          <p className="mb-2">Data provided by CoinGecko API</p>
          <p>CryptoHistorica &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
