import axios from 'axios';
import * as cheerio from 'cheerio';

async function testCorsProxy() {
  try {
    const query = "sony wh-1000xm5";
    const targetUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + " price in India (site:amazon.in OR site:flipkart.com)")}`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    
    console.log("Fetching via corsproxy.io...");
    const res = await axios.get(proxyUrl);
    const html = res.data;
    const $ = cheerio.load(html);
    
    console.log("Parsing HTML...");
    const title = $('title').text();
    console.log("Page Title:", title);
    
    const results = [];
    $('.result__body').each((i, el) => {
      const titleText = $(el).find('.result__title').text().trim();
      const snippet = $(el).find('.result__snippet').text().trim();
      const rawLink = $(el).find('.result__url').text().trim() || $(el).find('.result__title a').attr('href') || "";
      results.push({ title: titleText, snippet, link: rawLink });
    });
    
    console.log("Results found:", results.slice(0, 3));
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testCorsProxy();
