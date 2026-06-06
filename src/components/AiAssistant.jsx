import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, Send, Sparkles, TrendingDown, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AiAssistant({ currentSearchData, onSearchShortcut }) {
  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      sender: 'ai',
      text: "Hello! I am your Smart Buyer AI Assistant. 🛍️\n\nSearch for any item above, and I will analyze all store listings, calculate final checkout totals, and give you an optimized purchasing strategy. How can I help you save money today?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle new search data to proactively offer advice
  useEffect(() => {
    if (currentSearchData) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        const offers = currentSearchData.offers;
        const cheapest = offers[0];
        const secondCheapest = offers[1];
        const priceDiff = Math.round(secondCheapest.finalTotal - cheapest.finalTotal);
        
        let couponAlertText = "";
        const couponOffers = offers.filter(o => o.coupon);
        if (couponOffers.length > 0) {
          couponAlertText = `\n\n💡 **Active Coupons Found:** I auto-detected coupons at ${couponOffers.map(o => `${o.storeName} (${o.coupon.code})`).join(', ')}.`;
        }

        const adviceText = `I've analyzed all store options for **"${currentSearchData.productName}"**! Here is my optimization summary:

🏆 **Top Verdict:** Buy from **${cheapest.storeName}** for a total of **₹${cheapest.finalTotal.toLocaleString('en-IN')}** (Base price ₹${cheapest.basePrice.toLocaleString('en-IN')} + ₹${cheapest.shipping} delivery + ₹${cheapest.tax.toLocaleString('en-IN')} est. GST${cheapest.coupon ? ` - ₹${cheapest.coupon.discount.toLocaleString('en-IN')} coupon applied` : ''}).

💸 This saves you **₹${priceDiff.toLocaleString('en-IN')}** compared to buying from ${secondCheapest.storeName} (₹${secondCheapest.finalTotal.toLocaleString('en-IN')}).${couponAlertText}

⏱️ **Buy Alert:** The price history chart shows this product is currently close to its historical low. I recommend purchasing now!`;

        setMessages(prev => [
          ...prev,
          {
            id: `msg-auto-${Date.now()}`,
            sender: 'ai',
            text: adviceText,
            timestamp: new Date(),
            offersCard: true
          }
        ]);
        setIsTyping(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [currentSearchData]);

  const handleSend = (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    // Add user message
    const userMsg = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    
    // Simulate AI response
    setIsTyping(true);
    setTimeout(() => {
      let aiText = "";
      const cleanedQuery = query.toLowerCase();

      if (currentSearchData) {
        const offers = currentSearchData.offers;
        const cheapest = offers[0];
        const mostExpensive = offers[offers.length - 1];

        if (cleanedQuery.includes('cheapest') || cleanedQuery.includes('best price') || cleanedQuery.includes('deal')) {
          aiText = `The cheapest option is **${cheapest.storeName}** at **₹${cheapest.finalTotal.toLocaleString('en-IN')}** (final price). The most expensive option is **${mostExpensive.storeName}** at **₹${mostExpensive.finalTotal.toLocaleString('en-IN')}**, representing a price spread of **₹${Math.round(mostExpensive.finalTotal - cheapest.finalTotal).toLocaleString('en-IN')}**. I highly recommend purchasing through ${cheapest.storeName}.`;
        } else if (cleanedQuery.includes('shipping') || cleanedQuery.includes('delivery')) {
          const freeShippingStores = offers.filter(o => o.shipping === 0).map(o => o.storeName);
          aiText = `Here's the delivery breakdown:\n\n` + 
            offers.map(o => `• **${o.storeName}**: ${o.shipping === 0 ? 'Free Delivery' : `₹${o.shipping}`} (${o.shippingSpeed})`).join('\n') + 
            `\n\n${freeShippingStores.length > 0 ? `Stores with free delivery: ${freeShippingStores.join(', ')}.` : 'No stores offer unconditional free delivery for this item.'}`;
        } else if (cleanedQuery.includes('coupon') || cleanedQuery.includes('promo') || cleanedQuery.includes('code')) {
          const couponOffers = offers.filter(o => o.coupon);
          if (couponOffers.length > 0) {
            aiText = `I found active promo codes that you can apply:\n\n` +
              couponOffers.map(o => `• **${o.storeName}**: Apply code \`${o.coupon.code}\` to save **₹${o.coupon.discount.toLocaleString('en-IN')}** (already factored in the comparison).`).join('\n');
          } else {
            aiText = `I scanned all major databases but could not find active coupons for this item. However, Flipkart and Amazon.in are running standard base discounts on their listings.`;
          }
        } else if (cleanedQuery.includes('return') || cleanedQuery.includes('refund') || cleanedQuery.includes('warranty')) {
          aiText = `Here is the return and warranty details:\n\n` + 
            offers.map(o => `• **${o.storeName}**: ${o.returnPolicy} | ${o.warranty}`).join('\n') +
            `\n\nIf return windows are important to you, **Croma** offers the longest brand exchange option (14 days).`;
        } else {
          aiText = `I am analyzing the details for "${currentSearchData.productName}". The current price spectrum starts at **₹${cheapest.finalTotal.toLocaleString('en-IN')}** at ${cheapest.storeName} up to **₹${mostExpensive.finalTotal.toLocaleString('en-IN')}** at ${mostExpensive.storeName}. Is there a specific detail you would like to know, such as delivery speeds, active coupons, or specifications?`;
        }
      } else {
        // General query responses when no search is active
        if (cleanedQuery.includes('iphone') || cleanedQuery.includes('headphones') || cleanedQuery.includes('macbook') || cleanedQuery.includes('dyson')) {
          aiText = `I see you are interested in hot tech/home products! Try searching for "${query}" in the search bar above, and I will immediately pull the cheapest live listings for you.`;
        } else {
          aiText = `I can analyze any product price and find coupons! Please search for a product using the search bar at the top of the screen (e.g. "Sony WH-1000XM5" or "iPhone 15 Pro"), and I will provide instant, real-time comparisons.`;
        }
      }

      setMessages(prev => [
        ...prev,
        {
          id: `msg-ai-${Date.now()}`,
          sender: 'ai',
          text: aiText,
          timestamp: new Date()
        }
      ]);
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="ai-assistant-card">
      <div className="ai-assistant-header">
        <div className="flex items-center gap-2">
          <div className="bot-avatar">
            <Bot size={18} />
          </div>
          <div>
            <div className="bot-name flex items-center gap-1.5">
              Smart Buyer AI <Sparkles size={12} className="text-purple" />
            </div>
            <div className="bot-status">Agent Online & Analyzing</div>
          </div>
        </div>
        <div className="ai-trust-badge">
          <ShieldCheck size={14} className="text-green" /> 100% Secure Comparison
        </div>
      </div>

      <div className="ai-messages-container">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-bubble-wrapper ${msg.sender}`}>
            <div className="message-avatar">
              {msg.sender === 'ai' ? <Bot size={14} /> : <User size={14} />}
            </div>
            <div className="message-bubble">
              <p className="message-text" style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
              {msg.offersCard && currentSearchData && (
                <div className="mini-offers-card">
                  <div className="mini-offers-title">Indexed Store Offers</div>
                  <div className="mini-offers-list">
                    {currentSearchData.offers.slice(0, 3).map((offer, index) => (
                      <div key={offer.storeId} className="mini-offer-item">
                        <div className="flex items-center gap-2">
                          <span className="mini-store-badge" style={{ backgroundColor: offer.logoColor, color: offer.textColor }}>
                            {offer.storeName[0]}
                          </span>
                          <span className="mini-store-name">{offer.storeName}</span>
                          {index === 0 && <span className="cheapest-pills">Best Deal</span>}
                        </div>
                        <div className="mini-offer-price">₹{offer.finalTotal.toLocaleString('en-IN')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <span className="message-time">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message-bubble-wrapper ai">
            <div className="message-avatar">
              <Bot size={14} />
            </div>
            <div className="message-bubble typing">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Recommended shortcuts */}
      <div className="chat-shortcuts">
        {currentSearchData ? (
          <>
            <button className="shortcut-btn" onClick={() => handleSend("Where is the cheapest deal?")}>
              💰 Cheapest deal?
            </button>
            <button className="shortcut-btn" onClick={() => handleSend("Are there any promo codes?")}>
              🎫 Promo codes?
            </button>
            <button className="shortcut-btn" onClick={() => handleSend("Show shipping and delivery times")}>
              🚚 Shipping speeds?
            </button>
            <button className="shortcut-btn" onClick={() => handleSend("What is the return policy?")}>
              🛡️ Return policies?
            </button>
          </>
        ) : (
          <>
            <button className="shortcut-btn" onClick={() => onSearchShortcut("iphone 15 pro")}>
              📱 iPhone 15 Pro
            </button>
            <button className="shortcut-btn" onClick={() => onSearchShortcut("sony wh-1000xm5")}>
              🎧 Sony WH-1000XM5
            </button>
            <button className="shortcut-btn" onClick={() => onSearchShortcut("dyson v15 detect")}>
              🧹 Dyson V15 Vacuum
            </button>
          </>
        )}
      </div>

      <div className="ai-chat-input-wrapper">
        <input
          type="text"
          placeholder={currentSearchData ? "Ask about shipping, tax, or coupons..." : "Ask me anything..."}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          className="ai-chat-input"
        />
        <button onClick={() => handleSend()} className="ai-chat-send-btn" disabled={!inputText.trim()}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
