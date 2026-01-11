import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, TrendingUp } from "lucide-react";

const PredictionCharts = ({ history, forecast }) => {
  // Format history data for chart
  const historyData = history.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    quantity: item.quantity,
  }));

  // Format forecast data for chart
  const forecastData = forecast.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    predicted: Math.round(item.predicted * 10) / 10,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Historical Sales Chart */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          Historical Sales
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={historyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="quantity"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 4 }}
              activeDot={{ r: 6 }}
              name="Quantity Sold"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast Chart */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-600" />
          30-Day Forecast
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", r: 4 }}
              activeDot={{ r: 6 }}
              name="Predicted Demand"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PredictionCharts;
