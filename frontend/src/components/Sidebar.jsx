import React, { useEffect, useState } from "react";
import {
  FaHome,
  FaTable,
  FaBox,
  FaTruck,
  FaShoppingCart,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaComment, // <--- ADDED ICON FOR CHATBOT
  FaChartLine, // <--- ADDED ICON FOR DEMAND PREDICTION
} from "react-icons/fa";
import { NavLink } from "react-router";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin-dashboard",
      icon: <FaHome />,
      isParent: true,
    },
    {
      name: "Categories",
      path: "/admin-dashboard/categories",
      icon: <FaTable />,
      isParent: false,
    },
    {
      name: "Products",
      path: "/admin-dashboard/products",
      icon: <FaBox />,
      isParent: false,
    },
    {
      name: "Suppliers",
      path: "/admin-dashboard/suppliers",
      icon: <FaTruck />,
      isParent: false,
    },
    {
      name: "Orders",
      path: "/admin-dashboard/orders",
      icon: <FaShoppingCart />,
      isParent: false,
    },
    {
      name: "Users",
      path: "/admin-dashboard/users",
      icon: <FaUsers />,
      isParent: false,
    },
    // --- NEW CHATBOT LINK (ADMIN) ---
    {
      name: "StockBot AI",
      path: "/admin-dashboard/chatbot",
      icon: <FaComment />,
      isParent: false,
    },
    // --- NEW DEMAND PREDICTION LINK (ADMIN) ---
    {
      name: "Demand Prediction",
      path: "/admin-dashboard/demand-prediction",
      icon: <FaChartLine />,
      isParent: false,
    },
    // ---------------------------------
    {
      name: "Profile",
      path: "/admin-dashboard/profile",
      icon: <FaCog />,
      isParent: false,
    },
    {
      name: "Logout",
      path: "/admin-dashboard/logout",
      icon: <FaSignOutAlt />,
      isParent: false,
    },
  ];

  const customerItems = [
    {
      name: "Products",
      path: "/customer-dashboard",
      icon: <FaBox />,
      isParent: true,
    },
    {
      name: "Orders",
      path: "/customer-dashboard/orders",
      icon: <FaShoppingCart />,
      isParent: false,
    },
    // --- NEW CHATBOT LINK (CUSTOMER) ---
    {
      name: "StockBot AI",
      path: "/customer-dashboard/chatbot",
      icon: <FaComment />,
      isParent: false,
    },
    // ------------------------------------
    {
      name: "Profile",
      path: "/customer-dashboard/profile",
      icon: <FaCog />,
      isParent: false,
    },
    {
      name: "Logout",
      path: "/customer-dashboard/logout",
      icon: <FaSignOutAlt />,
      isParent: false,
    },
  ];

  const { user } = useAuth();
  const [menuLinks, setMenuLinks] = useState(customerItems);

  useEffect(() => {
    if (user && user.role === "admin") {
      setMenuLinks(menuItems);
    }
  }, [user]); // Added 'user' dependency to useEffect for proper role switching

  return (
    <div
      className="
      flex flex-col h-screen w-16 md:w-64 fixed 
      bg-white/60 backdrop-blur-xl 
      border-r border-white/30 
      shadow-[0_4px_30px_rgba(0,0,0,0.05)]
      text-slate-700
    "
    >
      {/* Header */}
      <div
        className="
        h-16 flex items-center justify-center 
        border-b border-white/30 bg-white/50 backdrop-blur-lg
      "
      >
        <span className="hidden md:block text-2xl font-bold text-slate-900 tracking-wide">
          Stockify
        </span>
        <span className="md:hidden text-xl font-bold text-slate-900">S</span>
      </div>

      {/* Menu */}
      <div className="flex-1 mt-4 overflow-y-auto">
        <ul className="space-y-2 px-3">
          {menuLinks.map((item) => (
            <li key={item.name}>
              <NavLink
                end={item.isParent}
                to={item.path}
                className={({ isActive }) =>
                  `
                  group flex items-center gap-3 p-3 rounded-xl
                  text-sm font-medium transition-all duration-300
                  
                  ${
                    isActive
                      ? "bg-white/70 backdrop-blur-md text-sky-600 shadow-md border border-white"
                      : "hover:bg-white/40 hover:shadow-sm hover:text-sky-600"
                  }
                  `
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Icon */}
                    <span
                      className={`
                        text-lg transition
                        ${
                          isActive
                            ? "text-sky-600"
                            : "text-slate-500 group-hover:text-sky-600"
                        }
                      `}
                    >
                      {item.icon}
                    </span>

                    {/* Text */}
                    <span className="hidden md:block text-[15px] tracking-wide">
                      {item.name}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/30 text-xs text-slate-500 text-center">
        © 2025 Stockify
      </div>
    </div>
  );
};

export default Sidebar;
