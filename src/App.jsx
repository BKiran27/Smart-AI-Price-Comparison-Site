import React, { useState, useEffect } from 'react';
import { 
  Search, ArrowLeft, ExternalLink, TrendingDown, Check, 
  Plus, X, ChevronDown, ChevronUp, Scale, 
  Bot, Sparkles, Bell, ArrowUpRight, Award, Flame, Info,
  Settings, SlidersHorizontal, Tag, Star, ShoppingBag
} from 'lucide-react';

import { 
  searchProducts, getTrendingDeals, searchProductsWithAi,
  searchProductsList, searchProductsListWithAi,
  getProductDetails, getProductDetailsWithAi
} from './utils/SearchEngine';
import PriceChart from './components/PriceChart';
import PriceAnalyzer from './components/PriceAnalyzer';
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

// Skeleton loading component
function SkeletonLoader() {
  return (
    <div className="skeleton-container animate-fade-in">
      <div className="skeleton-header">
        <div className="skeleton-line skeleton-lg" style={{ width: '60%' }}></div>
        <div className="skeleton-line skeleton-sm" style={{ width: '40%', marginTop: '0.75rem' }}></div>
      </div>
      <div className="skeleton-grid">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="skeleton-card glass">
            <div className="skeleton-line skeleton-sm" style={{ width: '30%' }}></div>
            <div className="skeleton-line skeleton-lg" style={{ width: '80%', marginTop: '1rem' }}></div>
            <div className="skeleton-line skeleton-md" style={{ width: '100%', marginTop: '0.5rem' }}></div>
            <div className="skeleton-line skeleton-md" style={{ width: '65%', marginTop: '0.5rem' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <div className="skeleton-line skeleton-lg" style={{ width: '35%' }}></div>
              <div className="skeleton-line skeleton-md" style={{ width: '30%', borderRadius: '8px' }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Detail skeleton for price comparison view
function DetailSkeletonLoader() {
  return (
    <div className="skeleton-container animate-fade-in">
      <div className="skeleton-card glass" style={{ padding: '1.5rem' }}>
        <div className="skeleton-line skeleton-sm" style={{ width: '120px' }}></div>
        <div className="skeleton-line skeleton-lg" style={{ width: '70%', marginTop: '1rem' }}></div>
        <div className="skeleton-line skeleton-md" style={{ width: '50%', marginTop: '0.5rem' }}></div>
      </div>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="skeleton-card glass" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="skeleton-line" style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0 }}></div>
          <div style={{ flex: 1 }}>
            <div className="skeleton-line skeleton-md" style={{ width: '40%' }}></div>
            <div className="skeleton-line skeleton-sm" style={{ width: '25%', marginTop: '0.5rem' }}></div>
          </div>
          <div className="skeleton-line skeleton-lg" style={{ width: '100px' }}></div>
          <div className="skeleton-line skeleton-md" style={{ width: '90px', borderRadius: '8px' }}></div>
        </div>
      ))}
    </div>
  );
}

const CATEGORY_CHIPS = ['All', 'Smartphones', 'Laptops', 'Audio', 'Gaming', 'Appliances', 'Cameras'];

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('search'); // 'search', 'comparison'
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [selectedOffers, setSelectedOffers] = useState([]);
  const [expandedOfferId, setExpandedOfferId] = useState(null);
  const [sortOption, setSortOption] = useState('cheapest');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [trendingDeals, setTrendingDeals] = useState([]);
  const [searchResultsList, setSearchResultsList] = useState(null);
  const [apiKey, setApiKey] = useState(localStorage.getItem('smart_buyer_gemini_key') || '');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Collapsible section states
  const [isAiReportOpen, setIsAiReportOpen] = useState(false);
  const [isChartOpen, setIsChartOpen] = useState(false);
  
  // Sidebar filters states
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minPriceFilter, setMinPriceFilter] = useState('');
  const [maxPriceFilter, setMaxPriceFilter] = useState('');
  const [minRatingFilter, setMinRatingFilter] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [resultSortOption, setResultSortOption] = useState('relevance');

  // Fetch trending deals on mount
  useEffect(() => {
    setTrendingDeals(getTrendingDeals());
  }, []);

  // Perform search (clean, no fake delays)
  const performSearch = async (query) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setSearchResult(null);
    setSearchResultsList(null);
    setSelectedOffers([]);
    setActiveTab('search');
    setHasSearched(true);

    // Reset filters
    setSelectedBrands([]);
    setMinPriceFilter('');
    setMaxPriceFilter('');
    setMinRatingFilter(0);
    setSelectedCategory('All');
    setResultSortOption('relevance');

    try {
      const activeKey = localStorage.getItem('smart_buyer_gemini_key');
      if (activeKey) {
        const listData = await searchProductsListWithAi(query, activeKey);
        setSearchResultsList(listData);
      } else {
        // Try calling the backend API first (which runs live e-commerce scrapers!)
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          if (res.ok) {
            const data = await res.json();
            setSearchResult(data);
            return;
          }
        } catch (apiErr) {
          console.warn("Local backend API not reachable. Falling back to client-side simulation:", apiErr.message);
        }

        // Fallback: client-side simulated list
        const listData = searchProductsList(query);
        setSearchResultsList(listData);
      }
    } catch (err) {
      console.warn("Search failed, using local data:", err.message);
      const listData = searchProductsList(query);
      setSearchResultsList(listData);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    performSearch(searchQuery);
  };

  // Quick shortcut search trigger
  const triggerQuickSearch = (queryText) => {
    setSearchQuery(queryText);
    performSearch(queryText);
  };

  // Drill-down to single product detail
  const handleSelectProduct = async (productName) => {
    setIsLoading(true);
    setSearchResult(null);
    setSelectedOffers([]);
    setActiveTab('search');
    setIsAiReportOpen(false);
    setIsChartOpen(false);

    try {
      const activeKey = localStorage.getItem('smart_buyer_gemini_key');
      if (activeKey) {
        const details = await getProductDetailsWithAi(productName, searchQuery, activeKey);
        setSearchResult(details);
      } else {
        // Try calling backend API first
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(productName)}`);
          if (res.ok) {
            const data = await res.json();
            setSearchResult(data);
            return;
          }
        } catch (apiErr) {
          console.warn("Local backend API not reachable. Falling back to client-side simulation:", apiErr.message);
        }

        const details = getProductDetails(productName, searchQuery);
        setSearchResult(details);
      }
    } catch (err) {
      console.warn("Product details retrieval failed:", err.message);
      const details = getProductDetails(productName, searchQuery);
      setSearchResult(details);
    } finally {
      setIsLoading(false);
    }
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

  // Sort offers
  const getSortedOffers = () => {
    if (!searchResult) return [];
    let items = [...searchResult.offers];
    if (sortOption === 'cheapest') {
      return items.sort((a, b) => a.finalTotal - b.finalTotal);
    } else if (sortOption === 'rating') {
      return items.sort((a, b) => b.rating - a.rating);
    } else if (sortOption === 'shipping') {
      return items.sort((a, b) => a.shipping - b.shipping);
    }
    return items;
  };

  // Get the cheapest offer price
  const getLowestPrice = () => {
    if (!searchResult) return 0;
    return Math.min(...searchResult.offers.map(o => o.finalTotal));
  };

  // Filter products from search results list
  const uniqueBrands = searchResultsList 
    ? [...new Set(searchResultsList.map(p => p.brand))].filter(Boolean) 
    : [];

  const uniqueCategories = searchResultsList 
    ? [...new Set(searchResultsList.map(p => p.category))].filter(Boolean) 
    : [];

  let filteredProducts = (searchResultsList || []).filter(product => {
    if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) return false;
    if (selectedCategory !== 'All' && product.category !== selectedCategory) return false;
    if (minPriceFilter && product.minPrice < parseInt(minPriceFilter, 10)) return false;
    if (maxPriceFilter && product.maxPrice > parseInt(maxPriceFilter, 10)) return false;
    if (minRatingFilter && product.rating < minRatingFilter) return false;
    return true;
  });

  // Sort filtered products
  if (resultSortOption === 'price-low') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.minPrice - b.minPrice);
  } else if (resultSortOption === 'price-high') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.minPrice - a.minPrice);
  } else if (resultSortOption === 'rating') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.rating - a.rating);
  }

  const lowestPrice = getLowestPrice();
  const sortedOffers = getSortedOffers();

  return (
    <div className="app-container">
      {/* Decorative Blur Blobs */}
      <div className="bg-glow-blob blob-primary"></div>
      <div className="bg-glow-blob blob-accent"></div>

      {/* Navigation Header */}
      <header className="app-navbar glass">
        <div className="brand-logo" onClick={() => { setSearchResult(null); setSearchResultsList(null); setSearchQuery(''); setHasSearched(false); setActiveTab('search'); }}>
          <ShoppingBag className="logo-icon" size={22} />
          <span>SmartBuyer</span>
        </div>

        {/* Persistent Search Bar in Header */}
        {hasSearched && (
          <form onSubmit={handleSearchSubmit} className="nav-search-bar">
            <Search size={16} className="nav-search-icon" />
            <input
              type="text"
              className="nav-search-input"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="nav-search-submit">
              <Search size={14} />
            </button>
          </form>
        )}

        <div className="nav-right">
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
              Compare {selectedOffers.length > 0 && `(${selectedOffers.length})`}
            </span>
          </nav>
          <button className="settings-gear-btn" onClick={() => setIsSettingsOpen(true)} title="AI Settings">
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="dashboard-content">
        {/* Left Column */}
        <div className="main-column">
          {activeTab === 'search' && (
            <>
              {/* Hero Landing Page */}
              {!searchResultsList && !searchResult && !isLoading && (
                <div className="search-hero animate-fade-in">
                  {!apiKey && (
                    <div className="api-key-hint" onClick={() => setIsSettingsOpen(true)}>
                      <Info size={14} />
                      <span>Running in <strong>offline mode</strong>. Add your <strong>Gemini API Key</strong> for live prices.</span>
                    </div>
                  )}
                  
                  <h1 className="search-title">Find the Lowest Price.<br/>Across Every Store.</h1>
                  
                  <p className="search-subtitle">
                    Compare real-time prices from Amazon.in, Flipkart, Croma, Reliance Digital & Vijay Sales. Including GST, shipping, and auto-applied coupons.
                  </p>
                  
                  <form onSubmit={handleSearchSubmit} className="search-input-container">
                    <div className="search-input-glow"></div>
                    <div className="search-form-control glass">
                      <Search size={20} className="search-search-icon" />
                      <input
                        type="text"
                        className="search-bar-input"
                        placeholder="Search any product... e.g. iPhone 15 Pro, Sony WH-1000XM5"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <button type="submit" className="search-submit-btn">
                        Search <ArrowUpRight size={16} />
                      </button>
                    </div>
                  </form>

                  {/* Category Chips */}
                  <div className="category-chips">
                    {CATEGORY_CHIPS.map(cat => (
                      <button 
                        key={cat} 
                        className="category-chip"
                        onClick={() => triggerQuickSearch(cat === 'All' ? 'electronics' : cat.toLowerCase())}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Trending Deals - Horizontal Scroll */}
                  <div className="trending-section">
                    <div className="trending-header">
                      <h2><TrendingDown size={20} className="text-green" /> Hot Price Drops</h2>
                      <span className="text-muted text-xs">Updated hourly</span>
                    </div>
                    <div className="trending-scroll">
                      {trendingDeals.map((deal) => (
                        <div 
                          key={deal.id} 
                          className="deal-card glass" 
                          onClick={() => triggerQuickSearch(deal.name)}
                        >
                          <div className="deal-card-header">
                            <span className="deal-category">{deal.category}</span>
                            <span className="deal-discount-badge">-{deal.discount}%</span>
                          </div>
                          <div className="deal-name">{deal.name}</div>
                          
                          {/* Mini Sparkline */}
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
                                stroke="var(--color-lowest)"
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
                </div>
              )}

              {/* Skeleton Loading */}
              {isLoading && !searchResult && (
                searchResultsList === null && !searchResult
                  ? <SkeletonLoader />
                  : <DetailSkeletonLoader />
              )}

              {/* Multi-product Search Results Grid */}
              {searchResultsList && !searchResult && !isLoading && (
                <div className="shopping-results-view animate-fade-in">
                  <div className="shopping-results-header">
                    <button className="results-back-btn" onClick={() => { setSearchResultsList(null); setSearchQuery(''); setHasSearched(false); }}>
                      <ArrowLeft size={14} /> Clear Search
                    </button>
                    <div className="results-header-meta">
                      <h2>Results for "{searchQuery}"</h2>
                      <div className="results-controls">
                        <span className="text-muted text-sm">{filteredProducts.length} products</span>
                        <select 
                          className="sort-select" 
                          value={resultSortOption} 
                          onChange={(e) => setResultSortOption(e.target.value)}
                        >
                          <option value="relevance">Sort: Relevance</option>
                          <option value="price-low">Price: Low to High</option>
                          <option value="price-high">Price: High to Low</option>
                          <option value="rating">Highest Rated</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="shopping-layout-body">
                    {/* Filters Sidebar */}
                    <aside className="filters-sidebar glass">
                      <div className="filter-group">
                        <h4><SlidersHorizontal size={12} /> Filters</h4>
                      </div>

                      <div className="filter-group">
                        <h4>Category</h4>
                        <div className="filter-options">
                          <button 
                            className={`category-filter-btn ${selectedCategory === 'All' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('All')}
                          >All Categories</button>
                          {uniqueCategories.map(cat => (
                            <button
                              key={cat}
                              className={`category-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                              onClick={() => setSelectedCategory(cat)}
                            >{cat}</button>
                          ))}
                        </div>
                      </div>

                      <div className="filter-group">
                        <h4>Brand</h4>
                        <div className="filter-options">
                          {uniqueBrands.length > 0 ? uniqueBrands.map(brand => (
                            <label key={brand} className="filter-checkbox-label">
                              <input
                                type="checkbox"
                                checked={selectedBrands.includes(brand)}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedBrands(prev => [...prev, brand]);
                                  else setSelectedBrands(prev => prev.filter(b => b !== brand));
                                }}
                              />
                              <span>{brand}</span>
                            </label>
                          )) : <span className="text-muted text-xs">No brands</span>}
                        </div>
                      </div>

                      <div className="filter-group">
                        <h4>Price Range (₹)</h4>
                        <div className="price-range-inputs">
                          <input type="number" placeholder="Min" value={minPriceFilter} onChange={(e) => setMinPriceFilter(e.target.value)} className="price-filter-input" />
                          <span className="price-separator">–</span>
                          <input type="number" placeholder="Max" value={maxPriceFilter} onChange={(e) => setMaxPriceFilter(e.target.value)} className="price-filter-input" />
                        </div>
                      </div>

                      <div className="filter-group">
                        <h4>Rating</h4>
                        <div className="filter-options">
                          {[4, 3, 2].map(stars => (
                            <label key={stars} className="filter-radio-label">
                              <input type="radio" name="rating" checked={minRatingFilter === stars} onChange={() => setMinRatingFilter(stars)} />
                              <span>{stars}★ & up</span>
                            </label>
                          ))}
                          <label className="filter-radio-label">
                            <input type="radio" name="rating" checked={minRatingFilter === 0} onChange={() => setMinRatingFilter(0)} />
                            <span>All</span>
                          </label>
                        </div>
                      </div>

                      {(selectedBrands.length > 0 || minPriceFilter || maxPriceFilter || minRatingFilter > 0 || selectedCategory !== 'All') && (
                        <button className="clear-filters-btn" onClick={() => {
                          setSelectedBrands([]); setMinPriceFilter(''); setMaxPriceFilter(''); setMinRatingFilter(0); setSelectedCategory('All');
                        }}>Clear All Filters</button>
                      )}
                    </aside>

                    {/* Products Grid */}
                    <div className="products-grid-container">
                      {filteredProducts.length > 0 ? (
                        <div className="products-grid">
                          {filteredProducts.map(product => (
                            <div key={product.id} className="product-grid-card glass">
                              <div className="product-card-badge">{product.category}</div>
                              <h3 className="product-card-title">{product.name}</h3>
                              <p className="product-card-desc">{product.description}</p>
                              
                              <div className="product-card-meta">
                                <span className="product-card-brand">{product.brand}</span>
                                <span className="product-card-rating">⭐ {product.rating} <span className="text-muted text-xs">({product.reviewsCount})</span></span>
                              </div>

                              <div className="product-card-footer">
                                <div className="product-card-pricing">
                                  <div className="price-label">Lowest Price</div>
                                  <div className="price-value">₹{product.minPrice.toLocaleString('en-IN')}</div>
                                </div>
                                <button className="product-compare-btn" onClick={() => handleSelectProduct(product.name)}>
                                  Compare Prices <ArrowUpRight size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-products-found glass">
                          <ShoppingBag size={48} className="text-muted" />
                          <h3>No Products Found</h3>
                          <p className="text-secondary text-sm">Try a different search or clear your filters.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Product Detail / Price Comparison View */}
              {searchResult && !isLoading && (
                <div className="results-page-container animate-fade-in">
                  {/* Header */}
                  <div className="results-header-box glass">
                    <button className="results-back-btn" onClick={() => {
                      if (searchResultsList) { setSearchResult(null); }
                      else { setSearchResult(null); setSearchQuery(''); setHasSearched(false); }
                    }}>
                      <ArrowLeft size={14} /> {searchResultsList ? 'Back to results' : 'Back to home'}
                    </button>
                    <div className="results-header-content">
                      <div>
                        <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                          <span className="category-pill">{searchResult.category}</span>
                          <span className="lowest-badge"><Award size={10} /> Lowest: ₹{lowestPrice.toLocaleString('en-IN')}</span>
                        </div>
                        <h2 className="results-title">{searchResult.productName}</h2>
                        <p className="results-desc">{searchResult.description}</p>
                      </div>
                      <button className="action-pill-btn" onClick={() => setIsAlertModalOpen(true)}>
                        <Bell size={14} /> Set Price Alert
                      </button>
                    </div>
                  </div>

                  {/* PRICE COMPARISON TABLE — THE HERO */}
                  <div className="price-table-container glass">
                    <div className="price-table-header">
                      <h3><Tag size={16} /> Price Comparison</h3>
                      <div className="sort-pills">
                        {[
                          { key: 'cheapest', label: 'Cheapest' },
                          { key: 'rating', label: 'Top Rated' },
                          { key: 'shipping', label: 'Shipping' }
                        ].map(opt => (
                          <button 
                            key={opt.key}
                            className={`sort-pill ${sortOption === opt.key ? 'active' : ''}`}
                            onClick={() => setSortOption(opt.key)}
                          >{opt.label}</button>
                        ))}
                      </div>
                    </div>

                    <div className="price-table-body">
                      {sortedOffers.map((offer, index) => {
                        const isLowest = offer.finalTotal === lowestPrice;
                        const isChecked = selectedOffers.some((o) => o.storeId === offer.storeId);
                        
                        return (
                          <div key={offer.storeId} className={`price-row ${isLowest ? 'is-lowest' : ''}`}>
                            {/* Compare Checkbox */}
                            <div className="price-row-check">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => handleSelectOffer(offer, e.target.checked)}
                                title="Add to comparison"
                              />
                            </div>

                            {/* Store */}
                            <div className="store-cell">
                              <div className="store-logo-dot" style={{ backgroundColor: offer.logoColor, color: offer.textColor }}>
                                {offer.storeName[0]}
                              </div>
                              <div>
                                <div className="store-name">{offer.storeName}</div>
                                <div className="store-rating">⭐ {offer.rating} ({offer.reviews.toLocaleString()})</div>
                              </div>
                            </div>

                            {/* Base Price */}
                            <div className="price-cell">
                              <div className="cell-label">Base</div>
                              <div>₹{offer.basePrice.toLocaleString('en-IN')}</div>
                            </div>

                            {/* Shipping */}
                            <div className="price-cell">
                              <div className="cell-label">Shipping</div>
                              <div>{offer.shipping === 0 ? <span className="text-green">FREE</span> : `₹${offer.shipping}`}</div>
                            </div>

                            {/* Coupon */}
                            <div className="price-cell">
                              <div className="cell-label">Coupon</div>
                              {offer.coupon ? (
                                <span className="coupon-tag">-₹{offer.coupon.discount.toLocaleString('en-IN')}</span>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </div>

                            {/* Total */}
                            <div className="total-cell">
                              <div className="cell-label">Total (incl. GST)</div>
                              <div className={`total-amount ${isLowest ? 'lowest' : ''}`}>
                                ₹{offer.finalTotal.toLocaleString('en-IN')}
                                {isLowest && <span className="lowest-badge"><Award size={10} /> Lowest</span>}
                              </div>
                            </div>

                            {/* Action */}
                            <div className="action-cell">
                              <a href={offer.link} target="_blank" rel="noopener noreferrer" className="buy-btn">
                                Buy <ExternalLink size={12} />
                              </a>
                              <button className="detail-toggle-btn" onClick={() => toggleOfferBreakdown(offer.storeId)}>
                                {expandedOfferId === offer.storeId ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>
                            </div>

                            {/* Expanded Breakdown */}
                            {expandedOfferId === offer.storeId && (
                              <div className="offer-breakdown-tray">
                                <div className="breakdown-row">
                                  <span className="breakdown-label">Base Price</span>
                                  <span className="breakdown-value">₹{offer.basePrice.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="breakdown-row">
                                  <span className="breakdown-label">Delivery</span>
                                  <span className="breakdown-value">{offer.shipping === 0 ? 'FREE' : `₹${offer.shipping}`}</span>
                                </div>
                                <div className="breakdown-row">
                                  <span className="breakdown-label">GST (18%)</span>
                                  <span className="breakdown-value">₹{offer.tax.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="breakdown-row">
                                  <span className="breakdown-label">Coupon Discount</span>
                                  <span className="breakdown-value text-green">{offer.coupon ? `-₹${offer.coupon.discount.toLocaleString('en-IN')}` : '₹0'}</span>
                                </div>
                                <div className="breakdown-row breakdown-total">
                                  <span className="breakdown-label">Checkout Total</span>
                                  <span className="breakdown-value"style={{ color: 'var(--color-primary)' }}>₹{offer.finalTotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="breakdown-meta">
                                  <span>{offer.shippingSpeed}</span>
                                  <span>{offer.returnPolicy}</span>
                                  <span>{offer.warranty}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Collapsible AI Report */}
                  {searchResult.aiSummary && (
                    <div className="collapsible-section glass">
                      <div className="collapsible-header" onClick={() => setIsAiReportOpen(!isAiReportOpen)}>
                        <h3><Sparkles size={16} className="text-primary-color" /> AI Shopping Analysis</h3>
                        <ChevronDown size={18} className={`collapse-icon ${isAiReportOpen ? 'open' : ''}`} />
                      </div>
                      {isAiReportOpen && (
                        <div className="collapsible-body animate-fade-in">
                          <div className="ai-report-container">
                            {formatMarkdown(searchResult.aiSummary)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Collapsible Price History Chart */}
                  <div className="collapsible-section glass">
                    <div className="collapsible-header" onClick={() => setIsChartOpen(!isChartOpen)}>
                      <h3><TrendingDown size={16} className="text-green" /> 6-Month Price History</h3>
                      <ChevronDown size={18} className={`collapse-icon ${isChartOpen ? 'open' : ''}`} />
                    </div>
                    {isChartOpen && (
                      <div className="collapsible-body animate-fade-in">
                        <PriceChart 
                          historyData={searchResult.priceHistory} 
                          productName={searchResult.productName} 
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Price Analyzer */}
                  {searchResult.analytics && (
                    <PriceAnalyzer analytics={searchResult.analytics} />
                  )}
                </div>
              )}
            </>
          )}

          {/* Comparison Matrix Tab */}
          {activeTab === 'comparison' && (
            <div className="glass" style={{ borderRadius: 'var(--radius-lg)' }}>
              <ComparisonMatrix
                selectedOffers={selectedOffers}
                specs={searchResult?.specs || {}}
                onRemoveOffer={handleRemoveCompareOffer}
                productName={searchResult?.productName || "Search Results"}
              />
            </div>
          )}
        </div>

        {/* Right Column — AI Assistant */}
        <div className="side-column">
          <AiAssistant 
            currentSearchData={searchResult} 
            onSearchShortcut={triggerQuickSearch}
          />
        </div>
      </main>

      {/* Floating Comparison Drawer */}
      {selectedOffers.length > 0 && activeTab !== 'comparison' && (
        <div className="comparison-basket-drawer glass">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">Compare ({selectedOffers.length}/3):</span>
            <div className="basket-offers-list">
              {selectedOffers.map((offer) => (
                <div key={offer.storeId} className="basket-offer-chip">
                  <span className="basket-store-initial" style={{ backgroundColor: offer.logoColor, color: offer.textColor }}>
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
            <button className="basket-clear-btn" onClick={clearCompareBasket}>Clear</button>
            <button className="basket-compare-trigger-btn" onClick={() => setActiveTab('comparison')}>
              Compare <Scale size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {searchResult && (
        <AlertModal
          isOpen={isAlertModalOpen}
          onClose={() => setIsAlertModalOpen(false)}
          productName={searchResult.productName}
          currentPrice={searchResult.offers[0].finalTotal}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="settings-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsSettingsOpen(false); }}>
          <div className="settings-modal-content glass animate-fade-in">
            <button className="settings-modal-close" onClick={() => setIsSettingsOpen(false)}>
              <X size={16} />
            </button>
            <div className="settings-modal-header">
              <Settings size={20} className="text-primary-color" />
              <h3 className="settings-modal-title">Settings</h3>
            </div>
            <div className="settings-modal-body">
              <p className="text-secondary text-sm" style={{ marginBottom: '1.5rem' }}>
                Add your Google Gemini API Key to enable live web price grounding. Your key is stored only in your browser's local storage.
              </p>
              
              <label className="settings-label">Gemini API Key</label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  localStorage.setItem('smart_buyer_gemini_key', e.target.value);
                }}
                className="settings-input"
              />

              <div className="settings-actions">
                {apiKey && (
                  <button className="settings-clear-btn" onClick={() => { setApiKey(''); localStorage.removeItem('smart_buyer_gemini_key'); }}>
                    Clear Key
                  </button>
                )}
                <button className="settings-save-btn" onClick={() => setIsSettingsOpen(false)}>
                  Save & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
