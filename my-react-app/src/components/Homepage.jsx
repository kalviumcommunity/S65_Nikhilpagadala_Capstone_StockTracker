// StockPortfolio.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FINNHUB_API_KEY = "d10oqchr01qlsacaecfgd10oqchr01qlsacaecg0"; 

const StockPortfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchPortfolio = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/getStocks");

      const updated = await Promise.all(
        res.data.stocks.map(async (stock) => {
          try {
            const quote = await axios.get(
              `https://finnhub.io/api/v1/quote?symbol=${stock.stockSymbol}&token=${FINNHUB_API_KEY}`
            );

            const price = quote.data?.c || 0;
            return { ...stock, price };
          } catch {
            return { ...stock, price: 0 };
          }
        })
      );

      setPortfolio(updated);
      setError(""); // Clear any previous errors if fetch succeeds
    } catch (err) {
      // Only show error if we have stocks but failed to refresh
      if (portfolio.length > 0) {
        setError("Failed to refresh portfolio data");
      }
    }
  };

  useEffect(() => {
  fetchPortfolio(); // initial fetch

  const interval = setInterval(fetchPortfolio, 60000); // 1-minute full refresh

  // 🔁 Live price updater every 30 seconds
  const priceInterval = setInterval(async () => {
    try {
      const updated = await Promise.all(
        portfolio.map(async (stock) => {
          try {
            const quote = await axios.get(
              `https://finnhub.io/api/v1/quote?symbol=${stock.stockSymbol}&token=${FINNHUB_API_KEY}`
            );
            const price = quote.data?.c || 0;
            return { ...stock, price };
          } catch {
            return { ...stock, price: 0 };
          }
        })
      );
      setPortfolio(updated);
    } catch (err) {
      console.error("Live price update failed", err);
    }
  }, 30000); // 30-second interval

  return () => {
    clearInterval(interval);
    clearInterval(priceInterval); // ⛔ Clear on unmount
  };
}, []);


  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("Please enter a stock symbol");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const symbol = searchTerm.trim().toUpperCase();
      const quoteRes = await axios.get(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
      );

      const price = quoteRes.data?.c || 0;

      if (price === 0) {
        const pc = quoteRes.data?.pc || 0;
        if (pc > 0) {
          setSearchResult({ symbol, price: pc, note: "Market closed - showing previous close" });
        } else {
          setError(`No price data found for symbol: ${symbol}`);
          setSearchResult(null);
        }
      } else {
        setSearchResult({ symbol, price });
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setError("API rate limit exceeded. Please wait a moment and try again.");
      } else {
        setError("Search failed. Please try again.");
      }
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const addToPortfolio = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/addStock", {
        stockSymbol: searchResult.symbol,
        Number: 1,
      });

      setSuccess(response.data.message || `${searchResult.symbol} added to portfolio!`);
      fetchPortfolio();
      setSearchResult(null);
      setSearchTerm("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(
        error.response?.data?.message || error.response?.data?.error || "Failed to add stock"
      );
    }
  };

  const updateQuantity = async (symbol, newQuantity) => {
    if (newQuantity < 0) return;

    try {
      const response = await axios.put(`http://localhost:5000/api/updateStock/${symbol}`, {
        Number: newQuantity,
      });

      setSuccess(response.data.message || `${symbol} quantity updated!`);
      fetchPortfolio();
      setTimeout(() => setSuccess(""), 2000);
    } catch (error) {
      setError(
        error.response?.data?.message || error.response?.data?.error || "Failed to update quantity"
      );
    }
  };

  const deleteStock = async (symbol) => {
    try {
      await axios.delete(`http://localhost:5000/api/stocks/${symbol}`);
      fetchPortfolio();
      setError("");
    } catch {
      setError("Failed to delete stock from portfolio");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-blue-600 p-4 flex justify-between items-center">
        <div className="text-white text-2xl font-bold">Stock Tracker</div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search Symbol (e.g., AAPL)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="p-2 rounded bg-white text-black"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-white text-blue-600 px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "..." : "Search"}
          </button>
        </div>
        <div className="bg-white rounded-full p-2">
          <span className="text-black">&#128100;</span>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <strong>Success:</strong> {success}
          </div>
        )}

        {searchResult && (
          <div className="border p-4 mb-4 rounded-xl shadow-md">
            <div className="flex justify-between">
              <div>
                <div className="text-2xl font-bold">{searchResult.symbol}</div>
                <div className="text-xl text-green-600 font-semibold">
                  ${searchResult.price.toFixed(2)}
                </div>
                {searchResult.note && (
                  <div className="text-sm text-gray-600 mt-1">{searchResult.note}</div>
                )}
              </div>
              <button
                onClick={addToPortfolio}
                className="border px-4 py-2 rounded-full hover:bg-gray-100"
              >
                Save to Portfolio
              </button>
            </div>
          </div>
        )}

        <h2 className="text-xl font-bold mb-4">Current Holdings</h2>
        {portfolio.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No stocks in portfolio. Search and add some stocks to get started!
          </div>
        ) : (
          portfolio.map((stock) => (
            <div
              key={stock.stockSymbol}
              className="border rounded-xl p-4 mb-4 flex justify-between items-center shadow-md"
            >
              <div>
                <div className="text-2xl font-bold">{stock.stockSymbol}</div>
                <div
                  className={`text-xl font-bold ${
                    stock.price >= 500 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ${stock.price ? stock.price.toFixed(2) : "0.00"}
                </div>
                <div className="flex gap-2 mt-2">
                  <button className="border px-4 py-1 rounded-full hover:bg-gray-100">
                    Inspect
                  </button>
                  <button
                    onClick={() => deleteStock(stock.stockSymbol)}
                    className="border border-red-500 text-red-500 px-4 py-1 rounded-full hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="text-lg font-medium mb-2">Quantity</div>
                <div className="flex items-center">
                  <button
                    onClick={() => updateQuantity(stock.stockSymbol, Number(stock.Number || 0) - 1)}
                    disabled={stock.Number <= 0}
                    className="border px-2 py-1 rounded disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="mx-4 text-lg">{stock.Number}</span>
                  <button
                    onClick={() => updateQuantity(stock.stockSymbol, Number(stock.Number || 0) + 1)}
                    className="border px-2 py-1 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StockPortfolio;