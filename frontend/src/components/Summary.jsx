import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Package,
  Layers,
  ShoppingCart,
  IndianRupee,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import DashboardAlerts from "./DashboardAlerts";

const Summary = () => {
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalStock: 0,
    ordersToday: 0,
    revenue: 0,
    outOfStock: [],
    highestSaleProduct: null,
    lowStock: [],
  });

  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/api/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });
      setDashboardData(response.data.dashboardData);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-xl font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Title */}
      <h2 className="text-4xl font-bold text-gray-800 mb-6 tracking-tight">
        Dashboard Overview
      </h2>

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl transform transition hover:scale-[1.03] hover:shadow-2xl">
          <div className="flex items-center gap-3">
            <Package className="w-10 h-10 opacity-90" />
            <p className="text-lg font-semibold">Total Products</p>
          </div>
          <p className="text-4xl font-bold mt-4">
            {dashboardData.totalProducts}
          </p>
        </div>

        {/* Total Stock */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl transform transition hover:scale-[1.03] hover:shadow-2xl">
          <div className="flex items-center gap-3">
            <Layers className="w-10 h-10 opacity-90" />
            <p className="text-lg font-semibold">Total Stock</p>
          </div>
          <p className="text-4xl font-bold mt-4">{dashboardData.totalStock}</p>
        </div>

        {/* Orders Today */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-xl transform transition hover:scale-[1.03] hover:shadow-2xl">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-10 h-10 opacity-90" />
            <p className="text-lg font-semibold">Orders Today</p>
          </div>
          <p className="text-4xl font-bold mt-4">{dashboardData.ordersToday}</p>
        </div>

        {/* Revenue - FIXED FOR DECIMAL AND OVERFLOW */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl transform transition hover:scale-[1.03] hover:shadow-2xl">
          <div className="flex items-center gap-3">
            <IndianRupee className="w-10 h-10 opacity-90" />
            <p className="text-lg font-semibold">Revenue</p>
          </div>
          {/* Changes: Using Math.floor() to remove decimals and text-3xl with break-words for overflow fix */}
          <p className="text-3xl font-bold mt-4 break-words">
            ₹ {Math.floor(dashboardData.revenue)}
          </p>
        </div>
      </div>

      {/* HIGH DEMAND ALERTS */}
      <div className="mt-10">
        <DashboardAlerts />
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        {/* Out of Stock */}
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 shadow-md hover:shadow-lg transition">
          <h3 className="text-xl font-semibold text-red-700 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" /> Out of Stock
          </h3>

          {dashboardData.outOfStock.length > 0 ? (
            <ul className="space-y-2">
              {dashboardData.outOfStock.map((product, index) => (
                <li
                  key={index}
                  className="text-red-600 font-medium bg-red-100 p-2 rounded-md flex justify-between items-center"
                >
                  <span>{product.name}</span>
                  <span className="text-red-500 text-sm">
                    ({product.categoryId.categoryName})
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-red-500">No out of stock products.</p>
          )}
        </div>

        {/* Highest Sale Product */}
        <div className="p-6 rounded-2xl bg-white shadow-md border border-gray-200 hover:shadow-lg transition">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" /> Highest Sale
            Product
          </h3>

          {dashboardData.highestSaleProduct?.name ? (
            <div className="text-gray-700 space-y-2">
              <p>
                <strong>Name:</strong> {dashboardData.highestSaleProduct.name}
              </p>
              <p>
                <strong>Category:</strong>{" "}
                {dashboardData.highestSaleProduct.category}
              </p>
              <p>
                <strong>Total Sold:</strong>{" "}
                {dashboardData.highestSaleProduct.totalQuantity}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No data available.</p>
          )}
        </div>

        {/* Low Stock (Warning Style) */}
        <div className="p-6 rounded-2xl bg-yellow-50 border border-yellow-300 shadow-md hover:shadow-lg transition">
          <h3 className="text-xl font-semibold text-yellow-700 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" /> Low Stock
          </h3>

          {dashboardData.lowStock.length > 0 ? (
            <ul className="space-y-2">
              {dashboardData.lowStock.map((product, index) => (
                <li
                  key={index}
                  className="text-yellow-700 font-medium bg-yellow-100 p-2 rounded-md flex justify-between"
                >
                  <span>
                    <strong>{product.name}</strong> - {product.stock} left
                  </span>
                  <span className="text-yellow-600 text-sm">
                    ({product.categoryId.categoryName})
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-yellow-600">No low stock products.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Summary;
