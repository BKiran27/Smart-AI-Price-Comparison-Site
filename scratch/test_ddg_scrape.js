import axios from 'axios';
import * as cheerio from 'cheerio';

async function testScrape() {
  try {
    const query = "site:amazon.in OR site:flipkart.com sony wh-1000xm5";
    const targetUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
    
    console.log("Fetching DuckDuckGo via CORS proxy...");
    const res = await axios.get(proxyUrl);
    const html = res.data.contents;
    const $ = cheerio.load(html);
    
    console.log("Parsing DuckDuckGo HTML...");
    const title = $('title').text();
    console.log("Page Title:", title);
    
    const results = [];
    $('.result__body').each((i, el) => {
      const title = $(el).find('.result__title').text().trim();
      const snippet = $(el).find('.result__snippet').text().trim();
      const link = $(el).find('.result__url').text().trim();
      results.push({ title, snippet, link });
    });
    
    console.log("Results found:", results.slice(0, 5));
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testScrape();
