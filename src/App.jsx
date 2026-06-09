import React, { useState, useEffect } from 'react';
import { 
  Search, ArrowLeft, ExternalLink, TrendingDown, Check, 
  Plus, X, ChevronDown, ChevronUp, Globe, Scale, 
  Bot, Sparkles, Bell, ArrowUpRight, Award, Flame, Info
} from 'lucide-react';

import { searchProducts, getTrendingDeals } from './utils/SearchEngine';
import PriceChart from './components/PriceChart';
import AiAssistant from './components/AiAssistant';
import ComparisonMatrix from './components/ComparisonMatrix';
import AlertModal from './components/AlertModal';
import './App.css';

// Markdown helper to render AI report summaries cleanly as JSX
function formatMarkdown(text) {
  if (!text) return null;
  return text.split('\n').map((line, idx) => {
    let cleanLine = line.trim();
    if (!cleanLine) return <div key={idx} className="h-2" />;
    
    // Skip general header if it matches the main panel title
    if (cleanLine.startsWith('### AI Shopper Analysis Report')) {
      return null;
    }
    if (cleanLine.startsWith('###')) {
      return <h4 key={idx} className="ai-report-section-title">{cleanLine.replace('###', '').trim()}</h4>;
    }
    
    // Check for list bullet
    const isBullet = cleanLine.startsWith('•');
    if (isBullet) {
      cleanLine = cleanLine.substring(1).trim();
    }
    
    // Parse bold tags **text** -> <strong>text</strong>
    const parts = [];
    let remaining = cleanLine;
    let boldIndex = remaining.indexOf('**');
    
    while (boldIndex !== -1) {
      if (boldIndex > 0) {
        parts.push({ text: remaining.substring(0, boldIndex), bold: false });
      }
      remaining = remaining.substring(boldIndex + 2);
      const closeIndex = remaining.indexOf('**');
      if (closeIndex === -1) {
        parts.push({ text: '**' + remaining, bold: false });
        remaining = '';
        break;
      }
      parts.push({ text: remaining.substring(0, closeIndex), bold: true });
      remaining = remaining.substring(closeIndex + 2);
      boldIndex = remaining.indexOf('**');
    }
    if (remaining) {
      parts.push({ text: remaining, bold: false });
    }

    const inlineContent = parts.map((p, i) => p.bold ? <strong key={i} style={{ color: '#ffffff', fontWeight: '700' }}>{p.text}</strong> : p.text);
    
    if (isBullet) {
      return (
        <div key={idx} className="ai-report-bullet">
          <span className="bullet-dot">•</span>
          <span className="bullet-text">{inlineContent}</span>
        </div>
      );
    }
    
    return (
      <p key={idx} className="ai-report-paragraph">
        {inlineContent}
      </p>
    );
  });
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('search'); // 'search', 'comparison', 'extension'
  const [isLoading, setIsLoading] = useState(false);
  const [scrapingLogs, setScrapingLogs] = useState([]);
  const [searchResult, setSearchResult] = useState(null);
  const [selectedOffers, setSelectedOffers] = useState([]);
  const [expandedOfferId, setExpandedOfferId] = useState(null);
  const [sortOption, setSortOption] = useState('cheapest'); // 'cheapest', 'rating', 'shipping'
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [trendingDeals, setTrendingDeals] = useState([]);

  // Fetch trending deals on mount
  useEffect(() => {
    setTrendingDeals(getTrendingDeals());
  }, []);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setSearchResult(null);
    setSelectedOffers([]);
    setScrapingLogs([]);
    setActiveTab('search');

    // Sequence of mock scraping logs
    const logSteps = [
      { text: "Initializing real-time comparison engine...", delay: 200, status: "working" },
      { text: "Connecting to Amazon.in API gateway...", delay: 500, status: "working" },
      { text: "Bypassing Flipkart Cloudflare challenge proxy...", delay: 1000, status: "working" },
      { text: "Scraping live HTML price details from Croma and Reliance Digital...", delay: 1500, status: "working" },
      { text: "Querying active Indian coupon indexing services...", delay: 2000, status: "working" },
      { text: "Compiling local GST and delivery fee estimates...", delay: 2300, status: "working" },
      { text: "Comparison analysis completed successfully!", delay: 2700, status: "success" }
    ];

    logSteps.forEach((step) => {
      setTimeout(() => {
        setScrapingLogs((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            time: new Date().toLocaleTimeString([], { hour12: false }),
            text: step.text,
            status: step.status
          }
        ]);

        if (step.status === "success") {
          setTimeout(async () => {
            try {
              const response = await fetch(`/api/ai-search?q=${encodeURIComponent(searchQuery)}`);
              if (!response.ok) throw new Error("Network response was not ok");
              const data = await response.json();
              setSearchResult(data);
            } catch (err) {
              console.warn("Backend API not reachable. Performing client-side simulation:", err.message);
              const fallback = searchProducts(searchQuery);
              setSearchResult(fallback);
            } finally {
              setIsLoading(false);
            }
          }, 300);
        }
      }, step.delay);
    });
  };

  // Quick shortcut search trigger from AI Chat or Deals
  const triggerQuickSearch = (queryText) => {
    setSearchQuery(queryText);
    setTimeout(() => {
      // Small timeout to allow state to set, then submit
      setIsLoading(true);
      setSearchResult(null);
      setSelectedOffers([]);
      setScrapingLogs([]);
      setActiveTab('search');

      const logSteps = [
        { text: "Initializing AI shortcut search pipeline...", delay: 150, status: "working" },
        { text: "Connecting to e-commerce scrapers...", delay: 400, status: "working" },
        { text: "Analyzing competitor price lists...", delay: 800, status: "working" },
        { text: "Applying auto-coupon deductions...", delay: 1200, status: "working" },
        { text: "Scrape analysis completed!", delay: 1500, status: "success" }
      ];

      logSteps.forEach((step) => {
        setTimeout(() => {
          setScrapingLogs((prev) => [
            ...prev,
            {
              id: Math.random().toString(),
              time: new Date().toLocaleTimeString([], { hour12: false }),
              text: step.text,
              status: step.status
            }
          ]);

          if (step.status === "success") {
            setTimeout(async () => {
              try {
                const response = await fetch(`/api/ai-search?q=${encodeURIComponent(queryText)}`);
                if (!response.ok) throw new Error("Network response was not ok");
                const data = await response.json();
                setSearchResult(data);
              } catch (err) {
                console.warn("Backend API not reachable. Performing client-side simulation:", err.message);
                const fallback = searchProducts(queryText);
                setSearchResult(fallback);
              } finally {
                setIsLoading(false);
              }
            }, 200);
          }
        }, step.delay);
      });
    }, 50);
  };

  // Comparison list managers
  const handleSelectOffer = (offer, isChecked) => {
    if (isChecked) {
      if (selectedOffers.length >= 3) {
        alert("You can compare a maximum of 3 store offers side-by-side.");
        return;
      }
      setSelectedOffers((prev) => [...prev, offer]);
    } else {
      setSelectedOffers((prev) => prev.filter((o) => o.storeId !== offer.storeId));
    }
  };

  const handleRemoveCompareOffer = (offer) => {
    setSelectedOffers((prev) => prev.filter((o) => o.storeId !== offer.storeId));
  };

  const clearCompareBasket = () => {
    setSelectedOffers([]);
  };

  // Toggle detail breakdown under listing card
  const toggleOfferBreakdown = (offerId) => {
    setExpandedOfferId(expandedOfferId === offerId ? null : offerId);
  };

  // Filter sort handler
  const getSortedOffers = () => {
    if (!searchResult) return [];
    let items = [...searchResult.offers];
    if (sortOption === 'cheapest') {
      return items.sort((a, b) => a.finalTotal - b.finalTotal);
    } else if (sortOption === 'rating') {
      return items.sort((a, b) => b.rating - a.rating);
    } else if (sortOption === 'shipping') {
      // sort by shipping speed or shipping cost
      return items.sort((a, b) => a.shipping - b.shipping);
    }
    return items;
  };

  return (
    <div className="app-container">
      {/* Decorative Blur Blobs */}
      <div className="bg-glow-blob blob-indigo"></div>
      <div className="bg-glow-blob blob-purple"></div>

      {/* Navigation Header */}
      <header className="app-navbar glass">
        <div className="brand-logo" onClick={() => triggerQuickSearch('')}>
          <Bot className="logo-icon" />
          <span>Smart Buyer AI</span>
        </div>
        <nav className="nav-links">
          <span 
            className={`nav-link ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            Price Finder
          </span>
          <span 
            className={`nav-link ${activeTab === 'comparison' ? 'active' : ''}`}
            onClick={() => setActiveTab('comparison')}
          >
            Matrix Compare {selectedOffers.length > 0 && `(${selectedOffers.length})`}
          </span>
          <span 
            className={`nav-link ${activeTab === 'extension' ? 'active' : ''}`}
            onClick={() => setActiveTab('extension')}
          >
            Chrome Extension Demo
          </span>
        </nav>
        <div>
          <button className="chrome-ext-pill" onClick={() => setActiveTab('extension')}>
            <Globe size={14} /> Add to Chrome
          </button>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="dashboard-content">
        {/* Left Column (Main App / Search views) */}
        <div className="main-column animate-fade-in">
          {activeTab === 'search' && (
            <>
              {/* Home/Initial Search Hero Screen */}
              {!searchResult && !isLoading && (
                <div className="search-hero">
                  <div className="flex flex-wrap gap-2.5 mb-4 justify-center">
                    <div className="badge flex items-center gap-1.5 text-xs text-indigo glass px-4 py-2 rounded-full font-semibold">
                      <Sparkles size={12} className="text-indigo animate-pulse-glow" /> Powered by Live Indian Crawlers
                    </div>
                    <div className="badge flex items-center gap-1.5 text-xs text-indigo glass px-4 py-2 rounded-full font-semibold">
                      <span>🇮🇳</span> Geofocused (Rupees ₹ & GST)
                    </div>
                  </div>
                  
                  <h1 className="search-title">Shop Smarter in India. Compare Real-Time Prices.</h1>
                  
                  <p className="search-subtitle">
                    Our AI-powered shopping engine searches top Indian retailers (Amazon.in, Flipkart, Reliance Digital, Croma, Vijay Sales) instantly. Get accurate GST (18%) checkout estimates, auto-applied promo codes, and live pricing metrics.
                  </p>
                  
                  <form onSubmit={handleSearchSubmit} className="search-input-container">
                    <div className="search-input-glow animate-pulse-glow"></div>
                    <div className="search-form-control">
                      <div className="flex items-center flex-1">
                        <Search size={20} className="search-search-icon" />
                        <input
                          type="text"
                          className="search-bar-input"
                          placeholder="e.g. Sony WH-1000XM5, iPhone 15 Pro, Dyson Vacuum..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="search-submit-btn">
                        Find Best Price <ArrowUpRight size={16} />
                      </button>
                    </div>
                    <div className="search-tip text-xs text-secondary mt-3">
                      Press <kbd className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white text-[10px] border border-white/10">Enter ↵</kbd> to crawl live stores. Or click one of the suggestions below.
                    </div>
                  </form>
                </div>
              )}

              {/* Scraping Terminal Screen while loading */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-10">
                  <h3 className="mb-4 text-secondary text-sm">Real-time Search in Progress</h3>
                  <div className="scraping-console-container">
                    <div className="console-header">
                      <div className="flex">
                        <span className="console-dot red"></span>
                        <span className="console-dot yellow"></span>
                        <span className="console-dot green"></span>
                      </div>
                      <span className="console-title">smart-buyer-scraper-node-v1.log</span>
                    </div>
                    {scrapingLogs.map((log) => (
                      <div key={log.id} className="console-log-row">
                        <span className="console-log-time">[{log.time}]</span>
                        <span className={`console-log-status ${log.status}`}>
                          {log.status === "working" ? "RUN" : "OK"}
                        </span>
                        <span className="console-log-text">{log.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Result Dashboard Screen */}
              {searchResult && !isLoading && (
                <div className="results-page-container">
                  {/* Results Sub-header */}
                  <div className="results-header-box glass">
                    <button className="results-back-btn" onClick={() => { setSearchResult(null); setSearchQuery(''); }}>
                      <ArrowLeft size={14} /> Back to home
                    </button>
                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="category-pill text-xs px-2 py-0.5 rounded bg-indigo/20 text-indigo font-bold">
                            {searchResult.category}
                          </span>
                          <span className="trending-deal-pill text-xs px-2 py-0.5 rounded bg-green/20 text-green font-bold flex items-center gap-0.5">
                            <Flame size={10} /> Active Price Drop
                          </span>
                        </div>
                        <h2 className="results-title">{searchResult.productName}</h2>
                        <p className="results-desc">{searchResult.description}</p>
                      </div>
                      
                      <button className="action-pill-btn" onClick={() => setIsAlertModalOpen(true)}>
                        <Bell size={14} /> Set Price Alert
                      </button>
                    </div>
                  </div>

                  {/* AI Purchase Recommendation Report */}
                  {searchResult.aiSummary && (
                    <div className="ai-report-card glass animate-fade-in">
                      <div className="ai-report-header">
                        <Sparkles size={16} className="text-indigo animate-pulse-glow" />
                        <h3>AI Shopping Analysis Report</h3>
                        <span className="ai-badge">SMART AI v1.0</span>
                      </div>
                      <div className="ai-report-body">
                        {formatMarkdown(searchResult.aiSummary)}
                      </div>
                    </div>
                  )}

                  {/* 6-Month Chart Panel */}
                  <div className="glass card-container-with-shadow">
                    <PriceChart 
                      historyData={searchResult.priceHistory} 
                      productName={searchResult.productName} 
                    />
                  </div>

                  {/* Filters and sorting panel */}
                  <div className="filters-bar glass">
                    <div className="flex items-center gap-3">
                      <span className="text-secondary text-sm">Sort Results:</span>
                      <select 
                        value={sortOption} 
                        onChange={(e) => setSortOption(e.target.value)}
                        className="filter-select"
                      >
                        <option value="cheapest">Cheapest Total Price (Cheapest First)</option>
                        <option value="rating">Store Rating (Highest First)</option>
                        <option value="shipping">Shipping Cost (Lowest First)</option>
                      </select>
                    </div>
                    
                    <div className="text-xs text-secondary flex items-center gap-1">
                      <Info size={12} className="text-indigo" /> Click "Compare" to add listings to the matrix comparison tool.
                    </div>
                  </div>

                  {/* Offers List */}
                  <div className="offers-list-container">
                    {getSortedOffers().map((offer, index) => {
                      const isChecked = selectedOffers.some((o) => o.storeId === offer.storeId);
                      const isCheapest = index === 0 && sortOption === 'cheapest';
                      
                      return (
                        <div 
                          key={offer.storeId} 
                          className={`offer-card glass ${isCheapest ? 'cheapest-store' : ''}`}
                        >
                          {isCheapest && (
                            <span className="best-badge">
                              <Award size={10} style={{ display: 'inline', marginRight: '3px' }} /> Cheapest
                            </span>
                          )}

                          {/* Store badge and selection */}
                          <div className="offer-store-badge-col">
                            <label className="compare-checkbox-wrapper">
                              <input
                                type="checkbox"
                                className="compare-checkbox"
                                checked={isChecked}
                                onChange={(e) => handleSelectOffer(offer, e.target.checked)}
                              />
                            </label>
                            <div 
                              className="store-large-badge"
                              style={{ backgroundColor: offer.logoColor, color: offer.textColor }}
                            >
                              {offer.storeName[0]}
                            </div>
                          </div>

                          {/* Store specs, returns, ratings */}
                          <div className="offer-details-col">
                            <div className="offer-store-name">{offer.storeName}</div>
                            <div className="rating-stars">
                              <span>⭐ {offer.rating}</span>
                              <span className="text-muted">({offer.reviews.toLocaleString()} reviews)</span>
                            </div>
                            <div className="offer-policies">
                              <span className="policy-tag">{offer.shippingSpeed}</span>
                              <span className="policy-tag">{offer.returnPolicy}</span>
                            </div>
                          </div>

                          {/* Pricing (Base, discount, final total) */}
                          <div className="offer-price-col">
                            <span className="offer-base-price">Base: ₹{offer.basePrice.toLocaleString('en-IN')}</span>
                            <span className="offer-total-price">₹{offer.finalTotal.toLocaleString('en-IN')}</span>
                            {offer.coupon ? (
                              <span className="offer-coupon-tag">
                                🎫 Code {offer.coupon.code} applied (-₹{offer.coupon.discount.toLocaleString('en-IN')})
                              </span>
                            ) : (
                              <span className="text-muted text-xs">No active coupons</span>
                            )}
                          </div>

                          {/* Purchase Action Buttons */}
                          <div className="offer-action-col">
                            <a 
                              href={offer.link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="offer-buy-now-btn"
                            >
                              Go to Store <ExternalLink size={13} />
                            </a>
                            <button 
                              className="offer-breakdown-toggle" 
                              onClick={() => toggleOfferBreakdown(offer.storeId)}
                            >
                              {expandedOfferId === offer.storeId ? 'Hide details' : 'Show breakdown'}
                            </button>
                          </div>

                          {/* Detail Breakdown Tray (Toggled) */}
                          {expandedOfferId === offer.storeId && (
                            <div className="offer-breakdown-tray">
                              <div className="breakdown-item">
                                <span className="breakdown-label">Base Cost</span>
                                <span className="breakdown-value">₹{offer.basePrice.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="breakdown-item">
                                <span className="breakdown-label">Delivery</span>
                                <span className="breakdown-value">
                                  {offer.shipping === 0 ? 'FREE' : `₹${offer.shipping}`}
                                </span>
                              </div>
                              <div className="breakdown-item">
                                <span className="breakdown-label">Est. GST (18%)</span>
                                <span className="breakdown-value">₹{offer.tax.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="breakdown-item">
                                <span className="breakdown-label">Discount Applied</span>
                                <span className="breakdown-value text-green">
                                  {offer.coupon ? `-₹${offer.coupon.discount.toLocaleString('en-IN')}` : '₹0'}
                                </span>
                              </div>
                              <div className="breakdown-item">
                                <span className="breakdown-label">Final Checkout Total</span>
                                <span className="breakdown-value text-indigo font-bold">₹{offer.finalTotal.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* General Landing page: Trending deals grid */}
              {!searchResult && !isLoading && (
                <div className="trending-deals-section">
                  <div className="section-header-row">
                    <h3 className="section-title">
                      <TrendingDown className="text-green" size={20} /> Hot Price Drops Today
                    </h3>
                    <span className="text-secondary text-xs">Updated hourly</span>
                  </div>

                  <div className="deals-grid">
                    {trendingDeals.map((deal) => (
                      <div 
                        key={deal.id} 
                        className="deal-card glass" 
                        onClick={() => triggerQuickSearch(deal.name)}
                      >
                        <div className="deal-card-header">
                          <span className="deal-category">{deal.category}</span>
                          <span className="deal-tag">-{deal.discount}% drop</span>
                        </div>
                        <div className="deal-name">{deal.name}</div>
                        
                        {/* Mini Sparkline Price Trajectory Graph */}
                        <div className="deal-chart-area">
                          <svg className="deal-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <path
                              d={`M 0 ${30 - (deal.sparkline[0] - 250) * 0.15} 
                                  L 16 ${30 - (deal.sparkline[1] - 250) * 0.15} 
                                  L 32 ${30 - (deal.sparkline[2] - 250) * 0.15} 
                                  L 48 ${30 - (deal.sparkline[3] - 250) * 0.15} 
                                  L 64 ${30 - (deal.sparkline[4] - 250) * 0.15} 
                                  L 80 ${30 - (deal.sparkline[5] - 250) * 0.15} 
                                  L 100 ${30 - (deal.sparkline[6] - 250) * 0.15}`}
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>

                        <div className="deal-card-footer">
                          <div className="deal-pricing">
                            <span className="original-price">₹{deal.originalPrice.toLocaleString('en-IN')}</span>
                            <span className="current-price">₹{deal.currentPrice.toLocaleString('en-IN')}</span>
                          </div>
                          <span className="deal-store">{deal.store}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Tab 2: Comparison side-by-side specs matrix */}
          {activeTab === 'comparison' && (
            <div className="glass card-container-with-shadow">
              <ComparisonMatrix
                selectedOffers={selectedOffers}
                specs={searchResult?.specs || {}}
                onRemoveOffer={handleRemoveCompareOffer}
                productName={searchResult?.productName || "Search Results"}
              />
            </div>
          )}

          {/* Tab 3: Browser extension simulation window */}
          {activeTab === 'extension' && (
            <div className="chrome-simulator-page glass">
              <div className="simulator-hero">
                <h3 className="simulator-title">Smart Buyer Companion Extension</h3>
                <p className="simulator-subtitle">
                  Demo: See how our browser extension automatically alerts you of lower prices and auto-applies coupons while you browse e-commerce sites like Amazon!
                </p>
              </div>

              <div className="browser-window-frame">
                <div className="browser-titlebar">
                  <div className="browser-dots">
                    <span className="browser-dot c1"></span>
                    <span className="browser-dot c2"></span>
                    <span className="browser-dot c3"></span>
                  </div>
                  <div className="browser-addressbar">
                    <Globe size={12} className="text-secondary" />
                    <span>https://www.amazon.in/dp/B0CK193XF?tag=amzn-smart-buyer-in-21</span>
                  </div>
                </div>
                
                <div className="browser-webpage-viewport">
                  {/* Amazon mockup content */}
                  <div className="amzn-logo">amazon.in</div>
                  
                  <div className="amzn-product-layout">
                    <div className="amzn-product-image">
                      Sony WH-1000XM5 Headphones
                    </div>
                    <div className="amzn-product-details">
                      <div className="amzn-title">Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones</div>
                      <div className="amzn-rating">⭐⭐⭐⭐⭐ 4.8 out of 5 stars (14,500 ratings)</div>
                      
                      <div className="amzn-price-box">
                        <div className="amzn-price-label">Amazon List Price:</div>
                        <div className="amzn-price-tag">₹29,990</div>
                        <div className="amzn-prime">✓ prime Free Delivery</div>
                      </div>

                      <button className="amzn-buy-btn">Add to Cart</button>
                    </div>
                  </div>

                  {/* Glassmorphic Extension Popup Alert Simulator */}
                  <div className="simulated-extension-popup">
                    <div className="flex justify-between items-center">
                      <span className="ext-badge">Smart Buyer AI</span>
                      <Sparkles size={14} className="text-purple animate-pulse-glow" />
                    </div>
                    <div className="ext-title">💡 Save ₹3,000 Instantly!</div>
                    <p className="ext-message">
                      Croma currently has this same item in stock for **₹26,990** total.
                    </p>
                    <div className="ext-coupon-pill">
                      🎫 Promo Code "TROMASAVE" Auto-Applied
                    </div>
                    <div className="ext-savings-banner">
                      <div className="breakdown-label">Net Price:</div>
                      <div className="ext-savings-amt">₹26,990</div>
                    </div>
                    <button 
                      className="ext-action-btn"
                      onClick={() => triggerQuickSearch("Sony WH-1000XM5")}
                    >
                      Redirect & Compare Offers
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (AI Shopping Assistant Chatbot) */}
        <div className="side-column">
          <AiAssistant 
            currentSearchData={searchResult} 
            onSearchShortcut={triggerQuickSearch}
          />
        </div>
      </main>

      {/* Floating Comparison Drawer at bottom when item checked */}
      {selectedOffers.length > 0 && activeTab !== 'comparison' && (
        <div className="comparison-basket-drawer">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">Compare Basket ({selectedOffers.length}/3):</span>
            <div className="basket-offers-list">
              {selectedOffers.map((offer) => (
                <div key={offer.storeId} className="basket-offer-pill">
                  <span 
                    className="basket-store-initial" 
                    style={{ backgroundColor: offer.logoColor, color: offer.textColor }}
                  >
                    {offer.storeName[0]}
                  </span>
                  <span>{offer.storeName} (₹{offer.finalTotal.toLocaleString('en-IN')})</span>
                  <button className="basket-remove-btn" onClick={() => handleRemoveCompareOffer(offer)}>
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="basket-actions">
            <button className="basket-clear-btn" onClick={clearCompareBasket}>
              Clear All
            </button>
            <button className="basket-compare-trigger-btn" onClick={() => setActiveTab('comparison')}>
              Compare Side-by-Side <Scale size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Alert Subscription Modal */}
      {searchResult && (
        <AlertModal
          isOpen={isAlertModalOpen}
          onClose={() => setIsAlertModalOpen(false)}
          productName={searchResult.productName}
          currentPrice={searchResult.offers[0].finalTotal}
        />
      )}
    </div>
  );
}
