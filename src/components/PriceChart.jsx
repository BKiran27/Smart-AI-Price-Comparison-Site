import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function PriceChart({ historyData, productName }) {
  if (!historyData || !historyData.prices || historyData.prices.length === 0) {
    return <div className="no-chart-data">No price history available</div>;
  }

  const minPrice = Math.min(...historyData.prices);
  const maxPrice = Math.max(...historyData.prices);
  const currentPrice = historyData.prices[historyData.prices.length - 1];
  const priceDropPercent = Math.round(((maxPrice - currentPrice) / maxPrice) * 100);

  const data = {
    labels: historyData.labels,
    datasets: [
      {
        label: 'Cheapest Base Price (₹)',
        data: historyData.prices,
        fill: true,
        borderColor: '#6366f1', // Indigo neon
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');   // Indigo semi-transparent
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');   // Completely transparent
          return gradient;
        },
        borderWidth: 3,
        tension: 0.4, // Curved line
        pointBackgroundColor: '#818cf8',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Clean layout without legends
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)', // Slate 900
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function (context) {
            return `Price: ₹${context.raw.toLocaleString('en-IN')}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false, // Hide vertical grid lines
        },
        ticks: {
          color: '#94a3b8', // Slate 400
          font: {
            family: 'Outfit, sans-serif',
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.08)', // Very subtle horizontal grid lines
        },
        ticks: {
          color: '#94a3b8',
          font: {
            family: 'Outfit, sans-serif',
            size: 11
          },
          callback: function (value) {
            return '₹' + value.toLocaleString('en-IN');
          }
        }
      }
    }
  };

  return (
    <div className="price-chart-container">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Market Price Trend</h3>
          <p className="chart-subtitle">6-Month history for cheapest deals</p>
        </div>
        <div className="price-stats">
          <div className="stat-pill">
            <span className="stat-label">Lowest:</span>
            <span className="stat-value text-green">₹{minPrice.toLocaleString('en-IN')}</span>
          </div>
          <div className="stat-pill">
            <span className="stat-label">Highest:</span>
            <span className="stat-value text-red">₹{maxPrice.toLocaleString('en-IN')}</span>
          </div>
          {priceDropPercent > 0 && (
            <div className="stat-pill discount-pill">
              <span className="text-indigo">-{priceDropPercent}% from peak</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="chart-wrapper">
        <Line data={data} options={options} />
      </div>
      
      <div className="chart-footer">
        <span className="verdict-tag positive">
          {currentPrice === minPrice 
            ? "⭐ Recommended: Product is currently at its historical low!" 
            : currentPrice < (minPrice + maxPrice) / 2 
            ? "✓ Good Deal: Current price is below average market rate."
            : "⚠ Caution: Price is currently higher than average. Consider setting an alert."}
        </span>
      </div>
    </div>
  );
}
