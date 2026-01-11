import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  FiPackage,
  FiCheck,
  FiX,
  FiClock,
  FiUser,
  FiCalendar,
  FiDollarSign,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

// Status Badge with Apple-style design
const StatusBadge = ({ status }) => {
  const styles = {
    pending: {
      bg: "bg-yellow-50/80 backdrop-blur-sm",
      text: "text-yellow-700",
      border: "border-yellow-200/50",
      icon: <FiClock className="w-3.5 h-3.5" />,
    },
    approved: {
      bg: "bg-green-50/80 backdrop-blur-sm",
      text: "text-green-700",
      border: "border-green-200/50",
      icon: <FiCheck className="w-3.5 h-3.5" />,
    },
    rejected: {
      bg: "bg-red-50/80 backdrop-blur-sm",
      text: "text-red-700",
      border: "border-red-200/50",
      icon: <FiX className="w-3.5 h-3.5" />,
    },
    cancelled: {
      bg: "bg-gray-50/80 backdrop-blur-sm",
      text: "text-gray-700",
      border: "border-gray-200/50",
      icon: <FiX className="w-3.5 h-3.5" />,
    },
  };

  const style = styles[status] || styles.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}
    >
      {style.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Order Card Component (for mobile/responsive view)
const OrderCard = ({
  order,
  isAdmin,
  onApprove,
  onReject,
  onCancel,
  actionLoading,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">Order ID</p>
          <p className="text-sm font-mono font-semibold text-gray-900">
            #{order._id.slice(-8)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Customer Info (Admin only) */}
      {isAdmin && order.customer && (
        <div className="mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-gray-700">
            <FiUser className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm font-semibold">
                {order.customer?.name || "Unknown Customer"}
              </p>
              <p className="text-xs text-gray-500">
                {order.customer?.email || "No email"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Product Info */}
      <div className="space-y-3 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Product</p>
          <p className="text-sm font-semibold text-gray-900">
            {order.product?.name || "Unknown Product"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Quantity</p>
            <p className="text-sm font-semibold text-gray-900">
              {order.quantity || 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Amount</p>
            <p className="text-sm font-semibold text-gray-900">
              ₹{order.totalPrice?.toLocaleString() || "0"}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Date</p>
          <div className="flex items-center gap-1.5 text-sm text-gray-700">
            <FiCalendar className="w-3.5 h-3.5 text-gray-400" />
            {order.orderDate
              ? new Date(order.orderDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "No date"}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {isAdmin ? (
          order.status === "pending" ? (
            <>
              <button
                onClick={() => onApprove(order._id)}
                disabled={actionLoading === order._id}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FiCheck className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={() => onReject(order._id)}
                disabled={actionLoading === order._id}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FiX className="w-4 h-4" />
                Reject
              </button>
            </>
          ) : (
            <p className="text-xs text-gray-500 italic text-center w-full py-2">
              No actions available
            </p>
          )
        ) : order.status === "pending" ? (
          <button
            onClick={() => onCancel(order._id)}
            disabled={actionLoading === order._id}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FiX className="w-4 h-4" />
            Cancel Order
          </button>
        ) : (
          <p className="text-xs text-gray-500 italic text-center w-full py-2">
            Cannot cancel
          </p>
        )}
      </div>
    </motion.div>
  );
};

const Orders = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/api/orders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });

      if (response.data.success) {
        setOrders(response.data.orders || []);
        setFiltered(response.data.orders || []);
      } else {
        console.error("Failed to fetch orders:", response.data.message);
        setOrders([]);
        setFiltered([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
      setFiltered([]);

      // Check if it's an authentication error
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        // You might want to redirect to login page here
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId) => {
    try {
      setActionLoading(orderId);
      const response = await axios.put(
        `http://localhost:3000/api/orders/${orderId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );

      if (response.data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: "approved" } : order
          )
        );
        setFiltered((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: "approved" } : order
          )
        );
      }
    } catch (error) {
      console.error("Error approving order:", error);
      alert(error.response?.data?.message || "Failed to approve order");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (orderId) => {
    try {
      setActionLoading(orderId);
      const response = await axios.put(
        `http://localhost:3000/api/orders/${orderId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );

      if (response.data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: "rejected" } : order
          )
        );
        setFiltered((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: "rejected" } : order
          )
        );
      }
    } catch (error) {
      console.error("Error rejecting order:", error);
      alert(error.response?.data?.message || "Failed to reject order");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (orderId) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      setActionLoading(orderId);
      const response = await axios.put(
        `http://localhost:3000/api/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );

      if (response.data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: "cancelled" } : order
          )
        );
        setFiltered((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: "cancelled" } : order
          )
        );
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    let data = [...(orders || [])];
    if (statusFilter) {
      data = data.filter((o) => o && o.status === statusFilter);
    }
    setFiltered(data);
  }, [statusFilter, orders]);

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      {/* Glassmorphism Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/40 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <FiPackage className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                {isAdmin ? "All Orders" : "My Orders"}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {(filtered || []).length}{" "}
                {(filtered || []).length === 1 ? "order" : "orders"}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-white/60 backdrop-blur-xl border border-white/20 rounded-xl text-sm font-medium text-gray-700 shadow-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button
              onClick={fetchOrders}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Refresh
            </button>
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white/40 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-lg animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* Orders Grid */}
      {!loading && (
        <AnimatePresence mode="wait">
          {(filtered || []).length > 0 ? (
            <motion.div
              key="orders"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {(filtered || []).map((order) =>
                order && order._id ? (
                  <OrderCard
                    key={order._id}
                    order={order}
                    isAdmin={isAdmin}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onCancel={handleCancel}
                    actionLoading={actionLoading}
                  />
                ) : null
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/40 backdrop-blur-2xl border border-white/20 rounded-3xl p-12 shadow-2xl text-center"
            >
              <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Orders Found
              </h3>
              <p className="text-gray-600">
                {statusFilter
                  ? "Try changing the status filter"
                  : "Orders will appear here once placed"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default Orders;
