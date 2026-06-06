import express from 'express';
import cors from 'cors';
import { getAggregatedSearch, getAiSynthesizedSearch } from './scrapers.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Endpoint for Product Search
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  
  if (!query) {
    return res.status(400).json({ error: "Search query parameter 'q' is required." });
  }

  console.log(`[Smart Buyer Backend] Processing search request for: "${query}"`);

  try {
    const data = await getAggregatedSearch(query);
    
    if (!data) {
      return res.status(404).json({ error: "No products found." });
    }

    console.log(`[Smart Buyer Backend] Successfully compiled comparison for "${data.productName}"`);
    return res.json(data);
  } catch (error) {
    console.error(`[Smart Buyer Backend] Search API processing failed:`, error);
    return res.status(500).json({ 
      error: "Internal server error occurred while performing search.",
      message: error.message
    });
  }
});

// API Endpoint for AI Synthesized Product Search
app.get('/api/ai-search', async (req, res) => {
  const query = req.query.q;
  
  if (!query) {
    return res.status(400).json({ error: "Search query parameter 'q' is required." });
  }

  console.log(`[Smart Buyer Backend] Processing AI search request for: "${query}"`);

  try {
    const data = await getAiSynthesizedSearch(query);
    
    if (!data) {
      return res.status(404).json({ error: "No products found." });
    }

    console.log(`[Smart Buyer Backend] Successfully compiled AI synthesis for "${data.productName}"`);
    return res.json(data);
  } catch (error) {
    console.error(`[Smart Buyer Backend] AI Search API processing failed:`, error);
    return res.status(500).json({ 
      error: "Internal server error occurred while performing AI search.",
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

// Start listening
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Smart Buyer AI Backend running on http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
