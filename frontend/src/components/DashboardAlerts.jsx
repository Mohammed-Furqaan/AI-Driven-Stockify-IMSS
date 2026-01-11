import React, { useState, useEffect } from "react";
import axios from "axios";
import { AlertTriangle, TrendingUp, Package, ShoppingCart } from "lucide-react";

const DashboardAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:3000/api/dashboard/alerts",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );
      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      setError("Failed to load demand alerts");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-orange-600" />
          High Demand Alerts
        </h3>
        <p className="text-gray-500">Loading alerts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-orange-600" />
          High Demand Alerts
        </h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <AlertTriangle className="w-6 h-6 text-orange-600" />
        High Demand Alerts
      </h3>

      {alerts.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-green-600" />
          <p className="text-green-700 font-medium">
            All stock levels are adequate. No high demand alerts at this time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div
              key={alert.productId || index}
              className="bg-orange-50 border border-orange-200 rounded-xl p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-5 h-5 text-orange-600" />
                    <h4 className="font-semibold text-orange-900">
                      {alert.productName}
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-orange-600 font-medium">
                        Predicted Demand
                      </p>
                      <p className="text-orange-900 font-bold">
                        {Math.round(alert.predictedDemand)}
                      </p>
                    </div>

                    <div>
                      <p className="text-orange-600 font-medium">
                        Current Stock
                      </p>
                      <p className="text-orange-900 font-bold">
                        {alert.currentStock}
                      </p>
                    </div>

                    <div>
                      <p className="text-orange-600 font-medium">Shortage</p>
                      <p className="text-red-700 font-bold">
                        {Math.round(alert.urgency)}
                      </p>
                    </div>

                    <div>
                      <p className="text-orange-600 font-medium">Reorder Qty</p>
                      <p className="text-orange-900 font-bold flex items-center gap-1">
                        <ShoppingCart className="w-4 h-4" />
                        {alert.recommendedReorder}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <div className="bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-xs font-semibold">
                    Action Needed
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardAlerts;
