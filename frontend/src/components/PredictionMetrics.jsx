import React from "react";
import {
  Target,
  TrendingUp,
  ShoppingCart,
  Activity,
  Calendar,
} from "lucide-react";

const PredictionMetrics = ({
  predictedTotal,
  confidence,
  recommendedReorder,
  method,
  generatedAt,
}) => {
  const confidencePercentage = Math.round(confidence * 100);

  // Format date
  const formattedDate = new Date(generatedAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <Activity className="w-6 h-6 text-purple-600" />
        Prediction Metrics
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Predicted 30-Day Demand */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <p className="text-sm font-medium text-blue-800">
              Predicted Demand
            </p>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {Math.round(predictedTotal)}
          </p>
          <p className="text-xs text-blue-600 mt-1">Next 30 days</p>
        </div>

        {/* Confidence Score */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-800">Confidence</p>
          </div>
          <p className="text-2xl font-bold text-green-900">
            {confidencePercentage}%
          </p>
          <p className="text-xs text-green-600 mt-1">
            {confidencePercentage >= 70
              ? "High"
              : confidencePercentage >= 50
              ? "Medium"
              : "Low"}
          </p>
        </div>

        {/* Recommended Reorder */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-5 h-5 text-orange-600" />
            <p className="text-sm font-medium text-orange-800">Reorder Qty</p>
          </div>
          <p className="text-2xl font-bold text-orange-900">
            {recommendedReorder}
          </p>
          <p className="text-xs text-orange-600 mt-1">
            {recommendedReorder > 0 ? "Action needed" : "Stock sufficient"}
          </p>
        </div>

        {/* Method */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <p className="text-sm font-medium text-purple-800">Method</p>
          </div>
          <p className="text-sm font-semibold text-purple-900 mt-2">
            {method === "moving-average-trend" ? "MA + Trend" : method}
          </p>
          <p className="text-xs text-purple-600 mt-1">Algorithm</p>
        </div>

        {/* Generated At */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <p className="text-sm font-medium text-gray-800">Generated</p>
          </div>
          <p className="text-xs font-semibold text-gray-900 mt-2">
            {formattedDate}
          </p>
          <p className="text-xs text-gray-600 mt-1">Timestamp</p>
        </div>
      </div>
    </div>
  );
};

export default PredictionMetrics;
