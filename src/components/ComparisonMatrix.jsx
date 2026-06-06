import React from 'react';
import { X, Check, ShoppingBag, Star, HelpCircle } from 'lucide-react';

export default function ComparisonMatrix({ selectedOffers, specs, onRemoveOffer, productName }) {
  if (!selectedOffers || selectedOffers.length === 0) {
    return (
      <div className="matrix-empty-state">
        <div className="empty-matrix-icon">⚖️</div>
        <h4>Compare Store Offers Side-by-Side</h4>
        <p>Select checkboxes on up to 3 store offers in the search results to load a detailed, side-by-side comparison matrix here.</p>
      </div>
    );
  }

  // Calculate an AI Value Score (out of 100) based on total cost, shipping speed, ratings and return policy
  const calculateAiScore = (offer) => {
    const minTotal = Math.min(...selectedOffers.map(o => o.finalTotal));
    const maxTotal = Math.max(...selectedOffers.map(o => o.finalTotal));
    
    // Price score: 50 points max (cheapest gets 50, most expensive gets less)
    const priceScore = maxTotal === minTotal 
      ? 50 
      : 50 - ((offer.finalTotal - minTotal) / (maxTotal - minTotal)) * 25;

    // Rating score: 30 points max (5.0 rating = 30 points)
    const ratingScore = (offer.rating / 5) * 30;

    // Return policy score: 10 points max (90 days = 10, 30 days = 7, 14/15 days = 5)
    let returnScore = 5;
    if (offer.returnPolicy.includes("90-day")) returnScore = 10;
    else if (offer.returnPolicy.includes("30-day")) returnScore = 8;

    // Shipping score: 10 points max (1-2 days = 10, 2-3 days = 8, 3-5 days = 5)
    let shippingScore = 5;
    if (offer.shippingSpeed.includes("1-2") || offer.shippingSpeed.includes("Prime")) shippingScore = 10;
    else if (offer.shippingSpeed.includes("2-3") || offer.shippingSpeed.includes("2 Days")) shippingScore = 8;

    return Math.round(priceScore + ratingScore + returnScore + shippingScore);
  };

  return (
    <div className="comparison-matrix-container">
      <div className="matrix-header-section">
        <h3 className="matrix-title">Comparison Matrix</h3>
        <p className="matrix-subtitle">Comparing offers for: <strong>{productName}</strong></p>
      </div>

      <div className="matrix-table-wrapper">
        <table className="matrix-table">
          <thead>
            <tr>
              <th className="feature-col">Feature Comparison</th>
              {selectedOffers.map((offer) => (
                <th key={offer.storeId} className="offer-header-col">
                  <div className="offer-header-card">
                    <span 
                      className="store-logo-header" 
                      style={{ backgroundColor: offer.logoColor, color: offer.textColor }}
                    >
                      {offer.storeName[0]}
                    </span>
                    <span className="store-name-text">{offer.storeName}</span>
                    <button className="remove-matrix-btn" onClick={() => onRemoveOffer(offer)}>
                      <X size={14} />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Financial Rows */}
            <tr className="highlight-row">
              <td className="feature-label">Base Price</td>
              {selectedOffers.map((offer) => (
                <td key={offer.storeId} className="price-val">₹{offer.basePrice.toLocaleString('en-IN')}</td>
              ))}
            </tr>
            <tr>
              <td className="feature-label">Shipping Cost</td>
              {selectedOffers.map((offer) => (
                <td key={offer.storeId} className={offer.shipping === 0 ? "text-green font-semibold" : ""}>
                  {offer.shipping === 0 ? "FREE" : `₹${offer.shipping}`}
                </td>
              ))}
            </tr>
            <tr>
              <td className="feature-label">Est. GST (18%)</td>
              {selectedOffers.map((offer) => (
                <td key={offer.storeId}>₹{offer.tax.toLocaleString('en-IN')}</td>
              ))}
            </tr>
            <tr>
              <td className="feature-label">Coupon Discount</td>
              {selectedOffers.map((offer) => (
                <td key={offer.storeId} className={offer.coupon ? "text-green" : "text-slate-400"}>
                  {offer.coupon ? `-₹${offer.coupon.discount.toLocaleString('en-IN')} (${offer.coupon.code})` : '—'}
                </td>
              ))}
            </tr>
            <tr className="grand-total-row">
              <td className="feature-label font-bold">True Total Cost</td>
              {selectedOffers.map((offer) => (
                <td key={offer.storeId} className="grand-total-price">
                  ₹{offer.finalTotal.toLocaleString('en-IN')}
                </td>
              ))}
            </tr>

            {/* Quality and Speed Rows */}
            <tr>
              <td className="feature-label">AI Value Rating</td>
              {selectedOffers.map((offer) => {
                const score = calculateAiScore(offer);
                let scoreClass = "text-green";
                if (score < 80) scoreClass = "text-yellow";
                if (score < 70) scoreClass = "text-red";
                
                return (
                  <td key={offer.storeId} className="font-bold">
                    <span className={`ai-score-badge ${scoreClass}`}>
                      {score} / 100
                    </span>
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="feature-label">Shipping Duration</td>
              {selectedOffers.map((offer) => (
                <td key={offer.storeId}>{offer.shippingSpeed}</td>
              ))}
            </tr>
            <tr>
              <td className="feature-label">Seller Rating</td>
              {selectedOffers.map((offer) => (
                <td key={offer.storeId}>
                  <div className="flex items-center gap-1 justify-center">
                    <Star size={12} fill="#eab308" className="text-yellow-500" />
                    <span>{offer.rating}</span>
                    <span className="text-slate-400 text-xs">({offer.reviews})</span>
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="feature-label">Return Window</td>
              {selectedOffers.map((offer) => (
                <td key={offer.storeId}>{offer.returnPolicy}</td>
              ))}
            </tr>
            <tr>
              <td className="feature-label">Warranty Included</td>
              {selectedOffers.map((offer) => (
                <td key={offer.storeId} className="text-xs">{offer.warranty}</td>
              ))}
            </tr>

            {/* Action Row */}
            <tr className="action-row">
              <td className="feature-label">Direct Link</td>
              {selectedOffers.map((offer) => (
                <td key={offer.storeId}>
                  <a 
                    href={offer.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="matrix-buy-btn"
                  >
                    Buy at {offer.storeName} <ShoppingBag size={13} />
                  </a>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      
      {specs && Object.keys(specs).length > 0 && (
        <div className="matrix-specs-section">
          <h4 className="specs-section-title">Technical Specifications Comparison</h4>
          <div className="specs-grid">
            {Object.entries(specs).map(([specName, specVal]) => (
              <div key={specName} className="spec-comparison-card">
                <div className="spec-name">{specName}</div>
                <div className="spec-value">{specVal}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
