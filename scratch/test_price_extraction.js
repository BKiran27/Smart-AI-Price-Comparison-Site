import axios from 'axios';
import * as cheerio from 'cheerio';

// Seed Indian stores details
const STORES = {
  "amazon_in": { name: "Amazon.in", logoColor: "#FF9900", rating: 4.8, reviews: 14500, shippingSpeed: "1-2 Days (Prime)", returnPolicy: "10-day Replacement Only", warranty: "1 Year Brand Warranty" },
  "flipkart": { name: "Flipkart", logoColor: "#2874F0", rating: 4.5, reviews: 8200, shippingSpeed: "2-3 Days (Free with Plus)", returnPolicy: "7-day Replacement Only", warranty: "1 Year Brand Warranty" },
  "reliance_digital": { name: "Reliance Digital", logoColor: "#E42528", rating: 4.4, reviews: 3100, shippingSpeed: "Same Day / 1 Day Delivery", returnPolicy: "7-day Returns", warranty: "1 Year Reliance ResQ Protection" },
  "croma": { name: "Croma", logoColor: "#00E5D1", rating: 4.6, reviews: 4500, shippingSpeed: "1-2 Days Delivery", returnPolicy: "14-day Brand Exchange Policy", warranty: "1 Year Tata Croma Warranty" },
  "vijay_sales": { name: "Vijay Sales", logoColor: "#DA251D", rating: 4.3, reviews: 1200, shippingSpeed: "2-4 Days Delivery", returnPolicy: "7-day Returns", warranty: "1 Year Manufacturer Warranty" }
};

async function testExtractPrices() {
  try {
    const query = "sony wh-1000xm5";
    // We search across all stores
    const targetUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + " price in India (site:amazon.in OR site:flipkart.com OR site:croma.com OR site:reliancedigital.in OR site:vijaysales.com)")}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
    
    console.log("Fetching live prices...");
    const res = await axios.get(proxyUrl);
    const html = res.data.contents;
    const $ = cheerio.load(html);
    
    const results = [];
    $('.result__body').each((i, el) => {
      const titleText = $(el).find('.result__title').text().trim();
      const snippet = $(el).find('.result__snippet').text().trim();
      const rawLink = $(el).find('.result__url').text().trim() || $(el).find('.result__title a').attr('href') || "";
      
      // Determine store based on domain/url
      let storeId = null;
      if (rawLink.includes('amazon.in')) storeId = 'amazon_in';
      else if (rawLink.includes('flipkart.com')) storeId = 'flipkart';
      else if (rawLink.includes('croma.com')) storeId = 'croma';
      else if (rawLink.includes('reliancedigital.in')) storeId = 'reliance_digital';
      else if (rawLink.includes('vijaysales.com')) storeId = 'vijay_sales';
      
      if (!storeId) return; // skip other sites
      
      // Try to parse price from title or snippet
      // Look for patterns like Rs. 29,990, Rs 29990, ₹29,990, ₹ 29990, Rs.29990
      const priceRegexes = [
        /(?:Rs\.?|₹)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+)/i,
        /price\s*(?:of|is|at)?\s*(?:Rs\.?|₹)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+)/i,
        /Rs\s*([0-9]+)/i
      ];
      
      let price = null;
      const combinedText = titleText + " " + snippet;
      for (const regex of priceRegexes) {
        const match = combinedText.match(regex);
        if (match) {
          const rawPrice = match[1].replace(/,/g, '');
          const val = parseInt(rawPrice, 10);
          if (val > 100 && val < 500000) { // filter noise
            price = val;
            break;
          }
        }
      }
      
      if (price) {
        // Clean link
        let link = rawLink;
        if (!link.startsWith('http')) {
          link = `https://${link}`;
        }
        
        results.push({
          storeId,
          storeName: STORES[storeId].name,
          price,
          link,
          title: titleText
        });
      }
    });
    
    console.log("Parsed Offers:");
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testExtractPrices();
