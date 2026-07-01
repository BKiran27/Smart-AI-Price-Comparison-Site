# Smart Buyer AI 🛍️

### India's Real-Time E-Commerce Price Finder & AI Coupon Engine

Smart Buyer AI is a premium, fullstack-capable, conversational shopping engine focused on the Indian market. It searches major Indian e-commerce sites (Amazon.in, Flipkart, Croma, Reliance Digital, Vijay Sales) in real time to calculate final checkout prices (including simulated 18% GST and delivery fees), find active coupon deductions, analyze price history trends, and synthesize purchasing reports via Gemini.

🔗 **Live Application:** [https://bkiran27.github.io/Smart-AI-Price-Comparison-Site/](https://bkiran27.github.io/Smart-AI-Price-Comparison-Site/)

---

## ✨ Features

- 🤖 **Client-Side AI Search Grounding:** Powered by Google Gemini (`gemini-2.0-flash`) directly in your browser. It uses Google Search to fetch real-time e-commerce prices, ratings, shipping speeds, and return policies.
- 📊 **Interactive Price Analytics:** Sleek 6-month historical price chart visualization (using Chart.js) and 7-day sparklines to find active price drops.
- ⚖️ **Comparison Matrix:** Compare up to 3 store offers side-by-side (including base price, delivery, GST, and active coupons).
- 🇮🇳 **Geo-focused:** Tailored for Indian shoppers with automatic Rupees (₹) formatting and GST calculations.
- ⚙️ **Offline Simulation Mode:** Falls back to a local pricing simulator if no API Key is provided, keeping the interface fully interactive.

---

## 🚀 Getting Started

### Prerequisites

- Node.js installed on your machine.
- A **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/) (to enable real-time AI searches).

### Installation & Run

1. Clone this repository:
   ```bash
   git clone https://github.com/BKiran27/Smart-AI-Price-Comparison-Site.git
   cd Smart-AI-Price-Comparison-Site
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open the site in your browser at `http://localhost:5173`.
5. Enter your Gemini API Key in the **Settings Gear (⚙️)** in the top right navbar to enable real-time price crawling!

---

## 📦 Deployment to GitHub Pages

To deploy changes to GitHub Pages:
```bash
npm run deploy
```
This runs a production build and pushes the compiled assets to the `gh-pages` branch.
