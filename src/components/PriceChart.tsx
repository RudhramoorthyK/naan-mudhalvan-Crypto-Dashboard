
import { useEffect, useRef } from "react";
import { HistoricalData, TimeFrame } from "@/types/crypto";
import { formatDateByTimeframe, formatCurrency } from "@/lib/utils";

interface PriceChartProps {
  data: HistoricalData | null;
  timeframe: TimeFrame;
  isLoading: boolean;
  symbol: string;
  color?: string;
}

export function PriceChart({ 
  data, 
  timeframe, 
  isLoading, 
  symbol,
  color = "rgba(59, 130, 246, 0.5)"
}: PriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!data || !data.prices || !canvasRef.current) return;
    
    // Cleanup previous chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    import('chart.js').then((ChartModule) => {
      const { Chart, LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip, Filler } = ChartModule;
      
      // Register the components
      Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip, Filler);
      
      // Prepare data
      const prices = data.prices.map(price => price[1]);
      const timestamps = data.prices.map(price => formatDateByTimeframe(price[0], timeframe));
      
      // Calculate gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      const isPositive = prices[0] <= prices[prices.length - 1];
      
      if (isPositive) {
        // Green gradient for uptrend
        gradient.addColorStop(0, 'rgba(74, 222, 128, 0.2)');
        gradient.addColorStop(1, 'rgba(74, 222, 128, 0)');
      } else {
        // Red gradient for downtrend
        gradient.addColorStop(0, 'rgba(248, 113, 113, 0.2)');
        gradient.addColorStop(1, 'rgba(248, 113, 113, 0)');
      }
      
      chartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: timestamps,
          datasets: [{
            label: `${symbol.toUpperCase()} Price`,
            data: prices,
            borderWidth: 2,
            borderColor: isPositive ? 'rgb(74, 222, 128)' : 'rgb(248, 113, 113)',
            backgroundColor: gradient,
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: isPositive ? 'rgb(74, 222, 128)' : 'rgb(248, 113, 113)',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
          }]
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
                  return `${symbol.toUpperCase()}: ${formatCurrency(context.raw as number)}`;
                }
              }
            },
            legend: {
              display: false
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
  }, [data, timeframe, symbol, color]);

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center animate-pulse bg-secondary/20 rounded-lg">
        <div className="text-muted-foreground">Loading chart data...</div>
      </div>
    );
  }

  if (!data || !data.prices || data.prices.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-secondary/10 rounded-lg">
        <div className="text-muted-foreground">No chart data available</div>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full animate-fade-in px-2">
      <canvas ref={canvasRef} height="400" />
    </div>
  );
}
