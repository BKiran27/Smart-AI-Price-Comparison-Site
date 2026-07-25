import axios from 'axios';
import * as cheerio from 'cheerio';

async function testScrape() {
  try {
    const query = "sony wh-1000xm5";
    const targetUrl = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
    
    console.log("Fetching via CORS proxy...");
    const res = await axios.get(proxyUrl);
    const html = res.data.contents;
    const $ = cheerio.load(html);
    
    console.log("Parsing HTML...");
    // Let's print the title or check if we got actual shopping results
    const title = $('title').text();
    console.log("Page Title:", title);
    
    // Look for product names
    const items = [];
    $('h3').each((i, el) => {
      items.push($(el).text().trim());
    });
    console.log("H3 Elements found:", items.slice(0, 10));
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testScrape();
