
import { useState } from "react";
import { CryptoAsset, HistoricalData, TimeFrame } from "@/types/crypto";
import { PriceChart } from "./PriceChart";
import { TimeframeSelector } from "./TimeframeSelector";
import { CryptoCard } from "./CryptoCard";
import { X } from "lucide-react";

interface ComparisonViewProps {
  selectedAssets: CryptoAsset[];
  historicalDataMap: Record<string, HistoricalData | null>;
  timeframe: TimeFrame;
  isLoading: boolean;
  onTimeframeChange: (timeframe: TimeFrame) => void;
  onRemoveAsset: (assetId: string) => void;
}

export function ComparisonView({ 
  selectedAssets,
  historicalDataMap,
  timeframe,
  isLoading,
  onTimeframeChange,
  onRemoveAsset
}: ComparisonViewProps) {
  if (selectedAssets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] bg-secondary/10 rounded-lg">
        <p className="text-muted-foreground">Select cryptocurrencies to compare</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h2 className="text-xl font-semibold">Comparison View</h2>
        <TimeframeSelector value={timeframe} onChange={onTimeframeChange} />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {selectedAssets.map((asset) => (
          <div key={asset.id} className="relative group animate-scale-in">
            <CryptoCard asset={asset} />
            <button
              className="absolute -top-2 -right-2 bg-secondary/90 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => onRemoveAsset(asset.id)}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      
      <div className="border border-border rounded-lg p-4 bg-card">
        <MultiLineChart 
          assets={selectedAssets}
          historicalDataMap={historicalDataMap}
          timeframe={timeframe}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

import { useEffect, useRef } from "react";
import { formatDateByTimeframe, formatCurrency } from "@/lib/utils";

interface MultiLineChartProps {
  assets: CryptoAsset[];
  historicalDataMap: Record<string, HistoricalData | null>;
  timeframe: TimeFrame;
  isLoading: boolean;
}

function MultiLineChart({ 
  assets, 
  historicalDataMap, 
  timeframe, 
  isLoading 
}: MultiLineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);
  
  useEffect(() => {
    if (isLoading || assets.length === 0 || !canvasRef.current) return;
    
    // Cleanup previous chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    
    // Check if we have data for all assets
    const allDataAvailable = assets.every(asset => 
      historicalDataMap[asset.id] && 
      historicalDataMap[asset.id]?.prices.length > 0
    );
    
    if (!allDataAvailable) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    import('chart.js').then((ChartModule) => {
      const { Chart, LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip, Legend } = ChartModule;
      
      // Register the components
      Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip, Legend);
      
      // Generate colors for each asset
      const colors = [
        'rgb(75, 192, 192)',
        'rgb(153, 102, 255)',
        'rgb(255, 159, 64)',
        'rgb(54, 162, 235)',
        'rgb(255, 99, 132)',
        'rgb(255, 206, 86)',
      ];
      
      // Get reference data from the first asset for timeline
      const referenceData = historicalDataMap[assets[0].id]!;
      const timestamps = referenceData.prices.map(price => formatDateByTimeframe(price[0], timeframe));
      
      // Create datasets for each asset
      const datasets = assets.map((asset, index) => {
        const data = historicalDataMap[asset.id];
        if (!data) return null;
        
        const color = colors[index % colors.length];
        
        return {
          label: asset.symbol.toUpperCase(),
          data: data.prices.map(price => price[1]),
          borderColor: color,
          backgroundColor: color,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
          borderWidth: 2,
        };
      }).filter(Boolean);
      
      chartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: timestamps,
          datasets: datasets as any[],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          plugins: {
            tooltip: {
              padding: 12,
              caretPadding: 10,
              cornerRadius: 8,
              titleFont: {
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                size: 12,
                weight: 'bold'
              },
              bodyFont: {
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                size: 14
              },
              callbacks: {
                label: function(context) {
                  return `${context.dataset.label}: ${formatCurrency(context.raw as number)}`;
                }
              }
            },
            legend: {
              display: true,
              position: 'top',
              labels: {
                font: {
                  family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  size: 12
                },
                usePointStyle: true,
                padding: 20
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false,
                drawBorder: false,
              },
              ticks: {
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 6,
                font: {
                  size: 11,
                  family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }
              }
            },
            y: {
              grid: {
                color: 'rgba(0, 0, 0, 0.06)',
              },
              ticks: {
                font: {
                  size: 11,
                  family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                },
                callback: function(value) {
                  return formatCurrency(value as number, true);
                }
              }
            }
          },
          animations: {
            tension: {
              duration: 1000,
              easing: 'easeOutQuart',
              from: 0.8,
              to: 0.4,
              loop: false
            }
          }
        }
      });
    });
    
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [assets, historicalDataMap, timeframe, isLoading]);

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center animate-pulse bg-secondary/20 rounded-lg">
        <div className="text-muted-foreground">Loading comparison data...</div>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-secondary/10 rounded-lg">
        <div className="text-muted-foreground">Select assets to compare</div>
      </div>
    );
  }

  // Check if any data is missing
  const missingData = assets.some(asset => 
    !historicalDataMap[asset.id] || 
    !historicalDataMap[asset.id]?.prices.length
  );

  if (missingData) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-secondary/10 rounded-lg">
        <div className="text-muted-foreground">Some data is missing. Try again later.</div>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full animate-fade-in">
      <canvas ref={canvasRef} height="400" />
    </div>
  );
}
