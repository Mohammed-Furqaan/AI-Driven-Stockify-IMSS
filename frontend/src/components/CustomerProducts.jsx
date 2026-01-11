import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  FiSearch,
  FiPlus,
  FiX,
  FiChevronDown,
  FiShoppingCart,
} from "react-icons/fi";

const CustomerProducts = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [orderData, setOrderData] = useState({
    productId: "",
    quantity: 1,
    total: 0,
    stock: 0,
    price: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/products", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });

      if (response.data.success) {
        setCategories(response.data.categories || []);
        setProducts(response.data.products || []);
        setFilteredProducts(response.data.products || []);
      } else {
        alert("Error fetching products");
      }
    } catch (error) {
      console.log("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Keep filtering logic identical but enhanced to consider both search and category
  useEffect(() => {
    let list = products || [];

    if (categoryFilter) {
      list = list.filter(
        (p) => p.categoryId && p.categoryId._id === categoryFilter
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(term));
    }

    setFilteredProducts(list);
  }, [products, searchTerm, categoryFilter]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleChangeCategory = (e) => {
    const selectedValue = e.target.value;
    setCategoryFilter(selectedValue);
  };

  const handleOrderChange = (product) => {
    setOrderData({
      productId: product._id,
      quantity: 1,
      total: product.price,
      stock: product.stock,
      price: product.price,
    });
    setOpenModal(true);
  };

  const closeModel = () => {
    setOpenModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3000/api/orders/add",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );

      if (response.data.success) {
        setOpenModal(false);
        setOrderData({
          productId: "",
          quantity: 1,
          total: 0,
          stock: 0,
          price: 0,
        });
        alert("Order added Successfully");
        // refresh product list so stock updates (optional)
        fetchProducts();
      }
    } catch (error) {
      console.log(error);
      alert("Error" + error);
    }
  };

  const onQuantityChange = (value) => {
    // validate numeric and >=1
    const qty = Math.max(1, parseInt(value || 0, 10));
    if (qty > orderData.stock) {
      alert("Not enough stock");
      return;
    }
    setOrderData((prev) => ({
      ...prev,
      quantity: qty,
      total: qty * Number(prev.price),
    }));
  };

  const increment = () => onQuantityChange(orderData.quantity + 1);
  const decrement = () => onQuantityChange(orderData.quantity - 1);

  // Small helper for stock badge
  const StockBadge = ({ stock }) => {
    if (stock === 0) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">
          {stock}
        </span>
      );
    } else if (stock < 5) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700">
          {stock}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
          {stock}
        </span>
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] p-6 bg-gray-100">
      {/* Header / Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-white/30 backdrop-blur-xl border border-white/40 shadow-lg p-3 flex items-center justify-center">
            <FiShoppingCart className="text-sky-600 text-2xl" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
            <p className="text-sm text-slate-500 mt-1">
              Browse & order products — elegant, fast and responsive.
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 w-full md:max-w-md">
          <label className="relative w-full">
            <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search products by name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/30 backdrop-blur-xl border border-white/40 text-sm shadow focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </label>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={handleChangeCategory}
              className="appearance-none pl-4 pr-10 py-2.5 rounded-lg bg-white/30 backdrop-blur-xl border border-white/40 text-sm shadow focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <button
            onClick={() => {
              setSearchTerm("");
              setCategoryFilter("");
            }}
            className="px-4 py-2 rounded-lg bg-white/30 backdrop-blur-xl border border-white/40 text-sm shadow hover:bg-white/40"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table container */}
      <div className="rounded-2xl overflow-hidden border border-white/40 bg-white/30 backdrop-blur-xl shadow-xl">
        <div className="px-4 py-3 border-b border-white/40 bg-white/20 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-700">
                Product Catalog
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {filteredProducts.length} products available
              </p>
            </div>

            <button
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-md bg-sky-500 text-white text-sm shadow hover:bg-sky-600"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[720px]">
            <thead className="bg-white/30 backdrop-blur-xl border-b border-white/40">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-slate-700">
                  #
                </th>
                <th className="px-6 py-3 text-xs font-bold text-slate-700">
                  Product
                </th>
                <th className="px-6 py-3 text-xs font-bold text-slate-700">
                  Category
                </th>
                <th className="px-6 py-3 text-xs font-bold text-slate-700">
                  Price
                </th>
                <th className="px-6 py-3 text-xs font-bold text-slate-700 text-center">
                  Stock
                </th>
                <th className="px-6 py-3 text-xs font-bold text-slate-700 text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product, index) => (
                <tr
                  key={product._id}
                  className="border-t border-white/30 even:bg-white/20 hover:bg-white/40 backdrop-blur-xl transition"
                >
                  <td className="px-6 py-4 text-sm text-slate-700 w-12">
                    {index + 1}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-md bg-white/30 backdrop-blur-xl border border-white/40 overflow-hidden flex items-center justify-center shadow">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="text-xs text-slate-500 px-2">
                            {product.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-800">
                          {product.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {product.description || ""}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-700">
                    {product.categoryId?.categoryName || "-"}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-800">
                    ₹{product.price}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <StockBadge stock={product.stock} />
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleOrderChange(product)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/40 backdrop-blur-xl border border-white/40 rounded-md text-slate-700 shadow-sm hover:bg-white/60"
                    >
                      <FiPlus className="text-sky-500" /> Order
                    </button>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="py-10 text-center text-slate-500 backdrop-blur-xl bg-white/20"
                  >
                    No Records Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModel}
          />

          <div className="relative z-60 w-full max-w-2xl bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Place Order
              </h2>
              <button
                onClick={closeModel}
                className="text-slate-500 hover:text-slate-700 text-2xl"
              >
                <FiX />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Quantity
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={decrement}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/40 backdrop-blur-xl border border-white/40"
                  >
                    -
                  </button>

                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    value={orderData.quantity}
                    onChange={(e) => onQuantityChange(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/40 backdrop-blur-xl border border-white/40 focus:ring-2 focus:ring-sky-200"
                    required
                  />

                  <button
                    type="button"
                    onClick={increment}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/40 backdrop-blur-xl border border-white/40"
                  >
                    +
                  </button>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Available stock: {orderData.stock}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Price & Total
                </label>

                <div className="flex flex-col gap-2">
                  <div className="inline-flex items-center justify-between px-4 py-2 rounded-lg bg-white/40 backdrop-blur-xl border border-white/40">
                    <span className="text-sm text-slate-600">Unit Price</span>
                    <span className="font-medium text-slate-900">
                      ₹{orderData.price}
                    </span>
                  </div>

                  <div className="inline-flex items-center justify-between px-4 py-3 rounded-lg bg-white/50 backdrop-blur-xl border border-white/40 shadow">
                    <span className="text-sm text-slate-600">Total</span>
                    <span className="text-lg font-semibold text-slate-900">
                      ₹{orderData.total}
                    </span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <button
                  onClick={closeModel}
                  type="button"
                  className="px-5 py-2.5 rounded-lg bg-white/40 backdrop-blur-xl border border-white/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-sky-600 text-white shadow hover:bg-sky-700"
                >
                  Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProducts;
