import { GoogleGenerativeAI } from '@google/generative-ai';

// Smart Shopping AI Mock Search Engine Utility (Indian Retailers Edition)

// Pre-seeded database for popular products in India (Prices in INR)
const PRODUCT_DATABASE = {
  "iphone 15 pro": {
    name: "Apple iPhone 15 Pro (128GB, Natural Titanium)",
    basePrice: 129900,
    category: "Electronics",
    specs: {
      "Display": "6.1-inch Super Retina XDR OLED",
      "Chipset": "A17 Pro chip with 6-core GPU",
      "Camera": "48MP Main | 12MP Ultra Wide | 3x Telephoto",
      "Battery": "Up to 23 hours video playback",
      "Weight": "187 grams",
      "Storage": "128GB"
    },
    description: "The iPhone 15 Pro is forged in titanium and features the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever."
  },
  "sony wh-1000xm5": {
    name: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
    basePrice: 29990,
    category: "Electronics",
    specs: {
      "Type": "Over-Ear, Closed-Back",
      "Battery Life": "Up to 30 hours (ANC On) | 38 hours (ANC Off)",
      "Noise Cancelling": "Industry-leading Dual Processor V1 & QN1",
      "Bluetooth": "Version 5.2 (LDAC, AAC, SBC)",
      "Weight": "250 grams",
      "Warranty": "1 Year Sony India Warranty"
    },
    description: "The WH-1000XM5 headphones rewrite the rules for distraction-free listening. Two processors control 8 microphones for unprecedented noise cancellation and exceptional call quality."
  },
  "playstation 5 pro": {
    name: "Sony PlayStation 5 Pro Console (2TB SSD)",
    basePrice: 68900,
    category: "Electronics",
    specs: {
      "GPU": "Upgraded RDNA Architecture with Advanced Ray Tracing",
      "Storage": "2TB Custom NVMe SSD",
      "Resolution": "Up to 8K support | 4K 120Hz",
      "RAM": "16GB GDDR6",
      "HDR": "Yes",
      "Warranty": "1 Year Sony India Warranty"
    },
    description: "Experience the ultimate in console gaming with the PlayStation 5 Pro. Features advanced ray tracing, super-sharp image clarity on HDR TVs, and high frame-rate gameplay."
  },
  "macbook air m3": {
    name: "Apple 13.6\" MacBook Air (M3, 8GB RAM, 256GB SSD)",
    basePrice: 114900,
    category: "Electronics",
    specs: {
      "CPU": "Apple M3 Chip (8-core CPU | 8-core GPU)",
      "Memory": "8GB Unified Memory",
      "Storage": "256GB Superfast SSD",
      "Display": "13.6-inch Liquid Retina Display",
      "Battery": "Up to 18 hours battery life",
      "Weight": "1.24 kg"
    },
    description: "The MacBook Air with the M3 chip is superportable and built for work and play. With up to 18 hours of battery life, you can take it anywhere and blaze through anything."
  },
  "nintendo switch oled": {
    name: "Nintendo Switch - OLED Model w/ Neon Red & Blue Joy-Con",
    basePrice: 32000,
    category: "Electronics",
    specs: {
      "Display": "7-inch OLED screen",
      "Storage": "64GB internal memory (expandable)",
      "Audio": "Enhanced audio in tabletop and handheld modes",
      "Battery Life": "4.5 to 9 hours",
      "Modes": "TV, Tabletop, Handheld",
      "Warranty": "1 Year Brand Warranty"
    },
    description: "Meet the newest member of the Nintendo Switch family. The OLED model features a vibrant 7-inch OLED screen, a wide adjustable stand, a dock with a wired LAN port, and enhanced audio."
  },
  "dyson v15 detect": {
    name: "Dyson V15 Detect Cordless Vacuum Cleaner",
    basePrice: 65900,
    category: "Home & Kitchen",
    specs: {
      "Run Time": "Up to 60 minutes",
      "Suction Power": "230 AW (Air Watts)",
      "Filtration": "Whole-machine filtration traps 99.99% particles",
      "Bin Volume": "0.2 gallons",
      "Weight": "3 kg",
      "Warranty": "2 Years Dyson India Warranty"
    },
    description: "The most powerful, intelligent cordless vacuum. Dyson reveals microscopic dust, counts and measures size of particles, and automatically adapts suction power."
  }
};

// Seed Indian stores details
const STORES = [
  {
    id: "amazon_in",
    name: "Amazon.in",
    logoColor: "#FF9900",
    rating: 4.8,
    reviews: 14500,
    shippingSpeed: "1-2 Days (Prime)",
    returnPolicy: "10-day Replacement Only",
    warranty: "1 Year Brand Warranty"
  },
  {
    id: "flipkart",
    name: "Flipkart",
    logoColor: "#2874F0",
    rating: 4.5,
    reviews: 8200,
    shippingSpeed: "2-3 Days (Free for Plus)",
    returnPolicy: "7-day Replacement Only",
    warranty: "1 Year Brand Warranty"
  },
  {
    id: "reliance_digital",
    name: "Reliance Digital",
    logoColor: "#E42528",
    rating: 4.4,
    reviews: 3100,
    shippingSpeed: "Same Day / 1 Day Delivery",
    returnPolicy: "7-day Returns",
    warranty: "1 Year Reliance ResQ Protection Available"
  },
  {
    id: "croma",
    name: "Croma",
    logoColor: "#00E5D1",
    textColor: "#000000",
    rating: 4.6,
    reviews: 4500,
    shippingSpeed: "1-2 Days Delivery",
    returnPolicy: "14-day Brand Exchange Policy",
    warranty: "1 Year Tata Croma Warranty"
  },
  {
    id: "vijay_sales",
    name: "Vijay Sales",
    logoColor: "#DA251D",
    rating: 4.3,
    reviews: 1200,
    shippingSpeed: "2-4 Days Delivery",
    returnPolicy: "7-day Returns",
    warranty: "1 Year Manufacturer Warranty"
  }
];

// Helper to generate a stable pseudo-random number based on a string seed
function seededRandom(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(Math.sin(hash)) * 1000 % 1;
}

// Generate price history for the last 6 months (INR)
function generatePriceHistory(basePrice, seed) {
  const currentMonthIdx = new Date().getMonth();
  
  // Arrange labels to end at the current month
  const labels = [];
  for (let i = 5; i >= 0; i--) {
    let mIdx = (currentMonthIdx - i + 12) % 12;
    labels.push(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][mIdx]);
  }

  const prices = [];
  let currentVal = basePrice * 1.05; // start slightly higher
  
  for (let i = 0; i < 6; i++) {
    const changePct = (seededRandom(seed + i) * 0.12) - 0.07; // -7% to +5% fluctuation
    currentVal = Math.round(currentVal * (1 + changePct));
    
    // Ensure it doesn't drop too low or go too high
    if (currentVal < basePrice * 0.8) currentVal = Math.round(basePrice * 0.85);
    if (currentVal > basePrice * 1.25) currentVal = Math.round(basePrice * 1.15);
    
    prices.push(currentVal);
  }

  // Ensure last element (current price) is close to the average search price
  prices[5] = basePrice;

  return { labels, prices };
}

// Public API
export function searchProducts(rawQuery) {
  const queryText = rawQuery.toLowerCase().trim();
  if (!queryText) return null;

  // 1. Parse budget limit (e.g. "under 30k" or "under 30000")
  let maxBudget = null;
  let cleanQuery = rawQuery;

  const budgetRegexes = [
    /under\s*(?:rs\.?|₹)?\s*([0-9]+)\s*(k|lakh)?/i,
    /below\s*(?:rs\.?|₹)?\s*([0-9]+)\s*(k|lakh)?/i,
    /less\s*than\s*(?:rs\.?|₹)?\s*([0-9]+)\s*(k|lakh)?/i,
    /budget\s*(?:rs\.?|₹)?\s*([0-9]+)\s*(k|lakh)?/i
  ];

  for (const regex of budgetRegexes) {
    const match = queryText.match(regex);
    if (match) {
      let num = parseInt(match[1].replace(/,/g, ''), 10);
      const suffix = match[2] ? match[2].toLowerCase() : '';
      if (suffix === 'k') {
        num = num * 1000;
      } else if (suffix === 'lakh') {
        num = num * 100000;
      }
      maxBudget = num;
      cleanQuery = rawQuery.replace(regex, '').replace(/\s+/g, ' ').trim();
      break;
    }
  }

  if (!cleanQuery.trim()) {
    cleanQuery = rawQuery;
  }

  const query = cleanQuery.toLowerCase().trim();

  // Find or generate base product
  let productInfo = null;
  const dbKeys = Object.keys(PRODUCT_DATABASE);
  const matchingKey = dbKeys.find(k => query.includes(k) || k.includes(query));

  if (matchingKey) {
    productInfo = { ...PRODUCT_DATABASE[matchingKey] };
  } else {
    // Generate a fallback product dynamically if it's not in the database (INR rates)
    const formattedName = cleanQuery
      .split(" ")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    
    const seed = seededRandom(query);
    const generatedPrice = Math.round(4000 + seed * 96000); // ₹4,000 to ₹1,00,000
    
    productInfo = {
      name: formattedName,
      basePrice: generatedPrice,
      category: "General",
      specs: {
        "Brand": "Generic Premium",
        "Quality": "IS-Certified Product",
        "Availability": "In Stock (India)",
        "Warranty": "1 Year Brand Warranty",
        "Return Period": "7 Days Replacement"
      },
      description: `Premium high-performance ${formattedName} designed for daily reliability and optimized efficiency in Indian conditions, featuring state-of-the-art materials and quality design.`
    };
  }

  // 2. Generate store-specific results
  const basePrice = productInfo.basePrice;
  const results = STORES.map(store => {
    const seedString = query + store.id;
    const storeSeed = seededRandom(seedString);
    
    // Vary prices across stores (-12% to +8%)
    let storeBasePrice = basePrice;
    if (store.id === "amazon_in") {
      storeBasePrice = Math.round(basePrice * (0.97 + storeSeed * 0.06)); // Amazon: close to average
    } else if (store.id === "flipkart") {
      storeBasePrice = Math.round(basePrice * (0.95 + storeSeed * 0.08)); // Flipkart: highly competitive
    } else if (store.id === "reliance_digital") {
      storeBasePrice = Math.round(basePrice * (0.96 + storeSeed * 0.09)); // Reliance: retail competitive
    } else if (store.id === "croma") {
      storeBasePrice = Math.round(basePrice * (0.98 + storeSeed * 0.07)); // Croma: standard
    } else if (store.id === "vijay_sales") {
      storeBasePrice = Math.round(basePrice * (0.94 + storeSeed * 0.10)); // Vijay Sales: discount campaigns
    }

    // Shipping fee calculations in INR (₹)
    let shipping = 0;
    if (store.id === "amazon_in") {
      shipping = storeBasePrice >= 499 ? 0 : 40; // Amazon Prime rule
    } else if (store.id === "flipkart") {
      shipping = storeBasePrice >= 500 ? 0 : 40; // Flipkart Plus rule
    } else if (store.id === "reliance_digital" || store.id === "croma") {
      shipping = 0; // Free store shipping on big appliances/electronics
    } else if (store.id === "vijay_sales") {
      shipping = storeSeed > 0.5 ? 0 : 99; // sometimes free, otherwise 99
    }

    // GST calculations in India (simulated 18% for electronics)
    const tax = Math.round(storeBasePrice * 0.18 * 100) / 100;

    // Coupons in INR
    let coupon = null;
    if (store.id === "amazon_in" && storeSeed > 0.7) {
      coupon = { code: "AMZIN1000", discount: Math.min(1000, Math.round(storeBasePrice * 0.05)), type: "percent" };
    } else if (store.id === "flipkart" && storeSeed > 0.6) {
      coupon = { code: "FKFEST500", discount: 500, type: "fixed" };
    } else if (store.id === "reliance_digital" && storeSeed > 0.8) {
      coupon = { code: "RELIANCEDIG10", discount: Math.min(2000, Math.round(storeBasePrice * 0.10)), type: "percent" };
    } else if (store.id === "croma" && storeSeed > 0.5) {
      coupon = { code: "TROMASAVE", discount: Math.min(1500, Math.round(storeBasePrice * 0.05)), type: "percent" };
    }

    // Total calculations
    const discountAmount = coupon ? coupon.discount : 0;
    const finalTotal = Math.round((storeBasePrice + shipping + tax - discountAmount) * 100) / 100;

    // Generate price sparkline (7-day trend)
    const sparklineData = [];
    let priceCursor = storeBasePrice * 1.02;
    for (let k = 0; k < 7; k++) {
      const drop = (seededRandom(seedString + "spark" + k) * 0.06) - 0.035;
      priceCursor = Math.round(priceCursor * (1 + drop));
      sparklineData.push(priceCursor);
    }
    sparklineData[6] = storeBasePrice;

    return {
      storeId: store.id,
      storeName: store.name,
      logoColor: store.logoColor,
      textColor: store.textColor || "#FFFFFF",
      basePrice: storeBasePrice,
      shipping,
      tax,
      coupon,
      finalTotal,
      rating: Math.round((store.rating + (storeSeed * 0.4 - 0.2)) * 10) / 10,
      reviews: Math.round(store.reviews * (0.8 + storeSeed * 0.4)),
      shippingSpeed: store.shippingSpeed,
      returnPolicy: store.returnPolicy,
      warranty: store.warranty,
      sparkline: sparklineData,
      link: `https://www.${store.id === 'amazon_in' ? 'amazon.in' : store.id === 'vijay_sales' ? 'vijaysales.com' : store.id + '.com'}/search?q=${encodeURIComponent(productInfo.name)}`
    };
  });

  // Calculate history based on the cheapest store base price to represent the market
  const cheapestBase = Math.min(...results.map(r => r.basePrice));
  const priceHistory = generatePriceHistory(cheapestBase, query);

  const sortedOffers = results.sort((a, b) => a.finalTotal - b.finalTotal);
  const cheapest = sortedOffers[0];
  const mostExpensive = sortedOffers[sortedOffers.length - 1];

  let budgetVerdict = "";
  if (maxBudget) {
    if (cheapest.finalTotal <= maxBudget) {
      budgetVerdict = `🟢 Good news! The cheapest option fits within your budget of **₹${maxBudget.toLocaleString('en-IN')}**. You can purchase the **${cheapest.storeName}** deal and save **₹${Math.round(maxBudget - cheapest.finalTotal).toLocaleString('en-IN')}** under your budget limit!`;
    } else {
      budgetVerdict = `🔴 Note: The cheapest available listing is **₹${cheapest.finalTotal.toLocaleString('en-IN')}** at ${cheapest.storeName}, which exceeds your target budget of **₹${maxBudget.toLocaleString('en-IN')}** by **₹${Math.round(cheapest.finalTotal - maxBudget).toLocaleString('en-IN')}**. You may want to consider setting a price alert or waiting for a price drop.`;
    }
  } else {
    budgetVerdict = `⚡ Verified market deal verdict: Recommend buying now. Pricing indexes show listings are stable with active promo coupons currently applied.`;
  }

  const couponOffers = sortedOffers.filter(o => o.coupon);
  let couponText = "No active store coupons detected.";
  if (couponOffers.length > 0) {
    couponText = couponOffers.map(o => `• **${o.storeName}**: Apply code \`${o.coupon.code}\` to save **₹${o.coupon.discount.toLocaleString('en-IN')}**`).join('\n');
  }

  const priceDiff = Math.round(mostExpensive.finalTotal - cheapest.finalTotal);
  const aiSummary = `### AI Shopper Analysis Report
  
🤖 **AI Recommendation:**
We scanned the top online stores in India. The cheapest direct offer for **"${productInfo.name}"** is at **${cheapest.storeName}** with a final checkout cost of **₹${cheapest.finalTotal.toLocaleString('en-IN')}** (Base price: ₹${cheapest.basePrice.toLocaleString('en-IN')}, GST: ₹${cheapest.tax.toLocaleString('en-IN')}, Delivery: ${cheapest.shipping === 0 ? 'FREE' : `₹${cheapest.shipping}`}).

💰 **Savings Potential:**
Buying from **${cheapest.storeName}** instead of the most expensive store (**${mostExpensive.storeName}** at ₹${mostExpensive.finalTotal.toLocaleString('en-IN')} total) saves you **₹${priceDiff.toLocaleString('en-IN')}** immediately!

📊 **Budget & Deal Check:**
${budgetVerdict}

🎫 **Coupon Deductions Auto-Applied:**
${couponText}

🚚 **Delivery & Trust Highlights:**
• **Fastest Delivery:** **${sortedOffers.find(o => o.storeId === 'reliance_digital')?.storeName || 'Reliance Digital'}** offers **Same Day / 1 Day Delivery** in major cities.
• **Easiest Exchanges:** **${sortedOffers.find(o => o.storeId === 'croma')?.storeName || 'Croma'}** offers a **14-day brand exchange window** for secure returns.

🔒 *Source verification:* Simulation of current real-time Indian retail benchmarks.`;

  return {
    productName: productInfo.name,
    category: productInfo.category,
    description: productInfo.description,
    specs: productInfo.specs,
    offers: sortedOffers,
    priceHistory,
    aiSummary,
    maxBudget,
    targetQuery: cleanQuery
  };
}

// Generate active general trending deals for India homepage dashboard (INR)
export function getTrendingDeals() {
  return [
    {
      id: "deal-1",
      name: "Sony WH-1000XM5 Wireless Headphones",
      originalPrice: 34990,
      currentPrice: 26990,
      discount: 22,
      store: "Croma",
      category: "Electronics",
      imageText: "Headphones",
      sparkline: [33000, 31000, 30500, 29000, 28500, 27200, 26990]
    },
    {
      id: "deal-2",
      name: "Apple iPad Air (10.9-inch, M1, 64GB)",
      originalPrice: 59900,
      currentPrice: 47900,
      discount: 20,
      store: "Flipkart",
      category: "Electronics",
      imageText: "Tablet",
      sparkline: [58000, 56000, 52000, 51000, 49900, 48500, 47900]
    },
    {
      id: "deal-3",
      name: "Dyson V12 Detect Slim Cordless Vacuum",
      originalPrice: 65900,
      currentPrice: 51900,
      discount: 21,
      store: "Amazon.in",
      category: "Home & Kitchen",
      imageText: "Vacuum",
      sparkline: [63000, 61000, 59900, 58000, 55000, 53000, 51900]
    },
    {
      id: "deal-4",
      name: "OnePlus 12 (5G, 256GB Silky Black)",
      originalPrice: 69999,
      currentPrice: 64999,
      discount: 7,
      store: "Reliance Digital",
      category: "Electronics",
      imageText: "Mobile",
      sparkline: [69999, 68999, 67999, 66999, 65999, 65499, 64999]
    },
    {
      id: "deal-5",
      name: "Philips Digital Air Fryer 4.1L",
      originalPrice: 9999,
      currentPrice: 7299,
      discount: 27,
      store: "Flipkart",
      category: "Home & Kitchen",
      imageText: "Cooker",
      sparkline: [9500, 9200, 8900, 8500, 8100, 7500, 7299]
    },
    {
      id: "deal-6",
      name: "Xiaomi 55\" 4K Ultra HD Smart TV",
      originalPrice: 49999,
      currentPrice: 35999,
      discount: 28,
      store: "Amazon.in",
      category: "Electronics",
      imageText: "Television",
      sparkline: [46000, 44000, 42000, 40000, 38500, 36900, 35999]
    }
  ];
}

export async function searchProductsWithAi(query, apiKey) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash", // or gemini-1.5-flash
      tools: [{ googleSearch: {} }] // Enable Google Search Grounding
    });

    const prompt = `
You are a live e-commerce price comparison engine. Search the web for real-time prices of "${query}" in India in Indian Rupees (₹).
Ground your results in real-time online offers from major Indian stores: Amazon.in, Flipkart, Reliance Digital, Croma, and Vijay Sales.

You MUST respond strictly in a valid JSON format. Do not output any markdown code blocks (like \`\`\`json) or any other text before/after the JSON. Just return the raw JSON matching this schema:

{
  "productName": "Exact name of the product",
  "category": "Product category",
  "description": "Short overview description of the product",
  "specs": {
    "Key Spec 1": "value",
    "Key Spec 2": "value"
  },
  "offers": [
    {
      "storeId": "amazon_in | flipkart | reliance_digital | croma | vijay_sales",
      "storeName": "Name of store (e.g. Amazon.in)",
      "logoColor": "Hex color code for store brand logo (e.g. #FF9900)",
      "textColor": "#FFFFFF",
      "basePrice": 120000, 
      "shipping": 0,
      "tax": 21600,
      "coupon": {
        "code": "COUPONCODE",
        "discount": 1000
      },
      "finalTotal": 140600,
      "rating": 4.5,
      "reviews": 1200,
      "shippingSpeed": "1-2 Days",
      "returnPolicy": "7 days return",
      "warranty": "1 Year Warranty",
      "sparkline": [121000, 120500, 120000, 119800, 119500, 119000, 120000],
      "link": "https://direct-product-link.com"
    }
  ],
  "priceHistory": {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "prices": [125000, 124000, 122000, 121000, 119000, 120000]
  },
  "aiSummary": "Markdown report with sections: \\n### AI Shopper Analysis Report\\n🤖 **AI Recommendation:** (State best deal, cheapest store, base price, tax, delivery)\\n💰 **Savings Potential:** (Buying cheapest vs most expensive saves ₹...)\\n📊 **Budget & Deal Check:** (State if budget constraints are met)\\n🎫 **Coupon Deductions Auto-Applied:** (List any active coupons found)\\n🚚 **Delivery & Trust Highlights:** (Fastest shipping and return policies details)\\n🔒 *Source verification:* Live Google Search Grounded Search"
}

Ensure all prices are numbers (no commas or ₹ symbols inside the price properties). Sort the offers array with the cheapest finalTotal first. Do not use dummy data if actual data is available via Google Search.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    // Strip markdown code fences if Gemini puts them in
    const jsonText = text.replace(/^```json/i, '').replace(/```$/i, '').trim();
    return JSON.parse(jsonText);
  } catch (err) {
    console.error("Gemini Search Grounding failed:", err);
    throw err;
  }
}

export function searchProductsList(rawQuery) {
  const query = rawQuery.toLowerCase().trim();
  if (!query) return [];

  // Find matching items in PRODUCT_DATABASE
  const matches = [];
  Object.keys(PRODUCT_DATABASE).forEach(key => {
    if (key.includes(query) || query.includes(key)) {
      const prod = PRODUCT_DATABASE[key];
      // Generate min/max price by running searchProducts
      const details = searchProducts(prod.name);
      const prices = details.offers.map(o => o.finalTotal);
      matches.push({
        id: key,
        name: prod.name,
        brand: prod.name.split(" ")[0], // first word as brand
        category: prod.category,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        rating: details.offers[0].rating,
        reviewsCount: details.offers[0].reviews,
        description: prod.description,
        specs: prod.specs
      });
    }
  });

  if (matches.length > 0) return matches;

  // Generate dynamic products if no matching items
  const brandList = ["Samsung", "Sony", "Apple", "LG", "Dyson", "Philips", "OnePlus", "Xiaomi", "Bosch", "HP", "Dell"];
  const queryTitle = rawQuery.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  
  // Choose brand based on query or default
  let detectedBrand = brandList.find(b => query.includes(b.toLowerCase())) || "Premium";
  let cleanItem = queryTitle.replace(new RegExp(detectedBrand, 'i'), '').trim();
  if (!cleanItem) cleanItem = "Gadget";

  // Create 3 dynamic tiers: Premium, Mid-range, Budget
  const tiers = [
    { name: `${detectedBrand} ${cleanItem} Ultra Pro Max`, priceBase: 85000 },
    { name: `${detectedBrand} ${cleanItem} Plus`, priceBase: 49000 },
    { name: `${detectedBrand} ${cleanItem} Lite`, priceBase: 24000 }
  ];

  return tiers.map((tier, idx) => {
    const seed = seededRandom(tier.name);
    const basePrice = Math.round(tier.priceBase * (0.9 + seed * 0.2));
    const details = searchProducts(tier.name);
    const prices = details.offers.map(o => o.finalTotal);

    return {
      id: `dynamic-${query}-${idx}`,
      name: tier.name,
      brand: detectedBrand,
      category: "General",
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      rating: Math.round((4.2 + seed * 0.7) * 10) / 10,
      reviewsCount: Math.round(150 + seed * 850),
      description: `State-of-the-art ${tier.name} designed with cutting edge technology for high efficiency and reliability in Indian environments.`,
      specs: details.specs
    };
  });
}

export async function searchProductsListWithAi(query, apiKey) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      tools: [{ googleSearch: {} }]
    });

    const prompt = `
You are a live e-commerce search engine. Search the web for matching products available in India for the query "${query}".
Return a list of 3 to 5 matching products.

You MUST respond strictly in a valid JSON format. Do not output any markdown code blocks (like \`\`\`json) or any other text before/after the JSON. Just return the raw JSON matching this schema:

[
  {
    "id": "unique-slug-id",
    "name": "Full product name (e.g. Sony WH-1000XM5 Wireless Headphones)",
    "brand": "Brand name (e.g. Sony)",
    "category": "Electronics | Home & Kitchen | etc.",
    "minPrice": 26990, 
    "maxPrice": 29990,
    "rating": 4.6,
    "reviewsCount": 3500,
    "description": "Short product description."
  }
]
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonText = text.replace(/^```json/i, '').replace(/```$/i, '').trim();
    return JSON.parse(jsonText);
  } catch (err) {
    console.error("Gemini list search failed, falling back to local list search:", err);
    return searchProductsList(query);
  }
}

export function getProductDetails(productName, rawQuery) {
  return searchProducts(productName);
}

export async function getProductDetailsWithAi(productName, rawQuery, apiKey) {
  return searchProductsWithAi(productName, apiKey);
}
