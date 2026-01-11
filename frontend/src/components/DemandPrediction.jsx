import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TrendingUp,
  Package,
  AlertCircle,
  Calendar,
  Target,
  RefreshCw,
} from "lucide-react";
import PredictionCharts from "./PredictionCharts";
import PredictionMetrics from "./PredictionMetrics";

const DemandPrediction = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await axios.get("http://localhost:3000/api/products", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handlePredictDemand = async () => {
    if (!selectedProduct) {
      setError("Please select a product");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setPrediction(null);

      const response = await axios.post(
        `http://localhost:3000/api/predictions/${selectedProduct}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );

      setPrediction(response.data.prediction);
    } catch (error) {
      console.error("Error computing prediction:", error);

      // Extract error message from response
      let errorMessage = "Failed to compute prediction. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Add helpful context for common errors
      if (errorMessage.includes("Insufficient historical data")) {
        errorMessage +=
          " This product needs at least 7 days of order history to generate predictions.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingProducts) {
    return (
      <div className="h-screen flex items-center justify-center text-xl font-semibold">
        Loading products...
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Title */}
      <h2 className="text-4xl font-bold text-gray-800 mb-6 tracking-tight flex items-center gap-3">
        <TrendingUp className="w-10 h-10 text-blue-600" />
        Demand Prediction
      </h2>

      {/* Product Selection Card */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-600" />
          Select Product
        </h3>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Predictions require at least 7 days of order
            history. Products without sufficient data will show an error.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => {
                setSelectedProduct(e.target.value);
                setPrediction(null);
                setError("");
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              <option value="">-- Select a product --</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} (Stock: {product.stock})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePredictDemand}
            disabled={loading || !selectedProduct}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Computing...
              </>
            ) : (
              <>
                <Target className="w-5 h-5" />
                Predict Demand
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-red-800 font-semibold">Error</h4>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-blue-800 font-semibold text-lg">
            Computing prediction...
          </p>
          <p className="text-blue-600 text-sm mt-2">
            Analyzing historical data and generating forecast
          </p>
        </div>
      )}

      {/* Empty State */}
      {!prediction && !loading && !error && selectedProduct && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            No prediction available for this product
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Click "Predict Demand" to generate a forecast
          </p>
        </div>
      )}

      {/* Prediction Results */}
      {prediction && !loading && (
        <div className="space-y-6">
          {/* Metrics */}
          <PredictionMetrics
            predictedTotal={prediction.predictedTotalNext30}
            confidence={prediction.confidence}
            recommendedReorder={prediction.recommendedReorder}
            method={prediction.method}
            generatedAt={prediction.generatedAt}
          />

          {/* Charts */}
          <PredictionCharts
            history={prediction.history}
            forecast={prediction.forecast}
          />
        </div>
      )}
    </div>
  );
};

export default DemandPrediction;
