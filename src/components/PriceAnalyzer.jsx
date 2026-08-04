import React from 'react';
import { TrendingDown, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const PriceAnalyzer = ({ analytics }) => {
  if (!analytics) return null;

  const { highestPrice, lowestPrice, averagePrice, priceDropPercentage, dealScore, verdict } = analytics;

  // Determine score color and icon
  let scoreColor = 'var(--color-yellow)';
  let VerdictIcon = Clock;
  let verdictColorClass = 'text-yellow';

  if (dealScore >= 75) {
    scoreColor = 'var(--color-lowest)'; // Green
    VerdictIcon = CheckCircle;
    verdictColorClass = 'text-green';
  } else if (dealScore < 40) {
    scoreColor = 'var(--color-red)';
    VerdictIcon = AlertCircle;
    verdictColorClass = 'text-red';
  }

  // Calculate position of current price on the min-max bar (0% to 100%)
  const currentPrice = lowestPrice; // For simplicity in UI, we assume lowest price is the current best price
  const range = highestPrice - lowestPrice;
  const positionPercentage = range === 0 ? 50 : ((currentPrice - lowestPrice) / range) * 100;

  return (
    <div className="price-analyzer-container">
      <div className="analyzer-header">
        <h4>Deal Analytics</h4>
      </div>

      <div className="analyzer-body">
        <div className="deal-score-section">
          <div className="score-circle" style={{ borderColor: scoreColor, boxShadow: `0 0 20px ${scoreColor}40` }}>
            <span className="score-value" style={{ color: scoreColor }}>{dealScore}</span>
            <span className="score-label">/ 100</span>
          </div>
          <div className="verdict-box">
            <VerdictIcon size={20} className={verdictColorClass} />
            <span className={`verdict-text ${verdictColorClass}`}>{verdict}</span>
          </div>
        </div>

        <div className="metrics-section">
          <div className="metric-row">
            <span className="metric-label">Historical High:</span>
            <span className="metric-value">₹{highestPrice.toLocaleString('en-IN')}</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">6-Month Average:</span>
            <span className="metric-value">₹{averagePrice.toLocaleString('en-IN')}</span>
          </div>
          <div className="metric-row highlight">
            <span className="metric-label">Current Best:</span>
            <span className="metric-value">₹{lowestPrice.toLocaleString('en-IN')}</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Price Drop:</span>
            <span className="metric-value drop">
              <TrendingDown size={14} /> {priceDropPercentage > 0 ? priceDropPercentage : 0}% from avg
            </span>
          </div>

          {/* Progress Bar visualization */}
          <div className="price-range-bar-container">
            <div className="range-labels">
              <span>Low</span>
              <span>High</span>
            </div>
            <div className="price-range-track">
              <div 
                className="price-current-marker" 
                style={{ left: `${positionPercentage}%`, backgroundColor: scoreColor }}
              >
                <div className="marker-tooltip">Current</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceAnalyzer;
