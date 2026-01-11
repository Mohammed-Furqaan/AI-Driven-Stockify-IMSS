import axios from "axios";
import React, { useEffect, useState } from "react";

const Products = () => {
  const [openModal, setOpenModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    supplierId: "",
  });

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/products", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });

      if (response.data.success) {
        setSuppliers(response.data.suppliers);
        setCategories(response.data.categories);
        setProducts(response.data.products);
        setFilteredProducts(response.data.products);
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

  const handleSearch = (e) => {
    setFilteredProducts(
      products.filter((product) =>
        product.name.toLowerCase().includes(e.target.value.toLowerCase())
      )
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEdit = (product) => {
    setOpenModal(true);
    setEditProduct(product._id);

    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId._id,
      supplierId: product.supplierId._id,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      const response = await axios.delete(
        `http://localhost:3000/api/products/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );

      if (response.data.success) {
        alert("Product deleted");
        fetchProducts();
      }
    } catch (error) {
      alert("Error deleting product");
    }
  };

  const closeModel = () => {
    setOpenModal(false);
    setEditProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      categoryId: "",
      supplierId: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editProduct) {
        const response = await axios.put(
          `http://localhost:3000/api/products/${editProduct}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
            },
          }
        );

        if (response.data.success) {
          alert("Product updated");
          fetchProducts();
          closeModel();
        }
      } else {
        const response = await axios.post(
          "http://localhost:3000/api/products/add",
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
            },
          }
        );

        if (response.data.success) {
          alert("Product added");
          fetchProducts();
          closeModel();
        }
      }
    } catch (error) {
      alert("Error saving product");
    }
  };

  return (
    <div className="p-6 md:p-10">
      {/* ----------------- HEADER SECTION ----------------- */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <h1 className="text-4xl font-semibold text-slate-900 tracking-tight">
          Product Management
        </h1>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search products..."
            onChange={handleSearch}
            className="w-64 px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm 
              border border-gray-200 text-sm shadow-sm focus:outline-none
              focus:ring-2 focus:ring-sky-300"
          />

          {/* Add Button */}
          <button
            onClick={() => setOpenModal(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r 
              from-sky-500 to-indigo-500 text-white text-sm font-medium
              shadow-lg hover:scale-[1.03] transition-transform"
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* ----------------- TABLE SECTION ----------------- */}
      {/* ----------------- CARD GRID SECTION ----------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product, index) => (
          <div
            key={product._id}
            className="p-5 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 
      shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
          >
            {/* PRODUCT TITLE */}
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              {product.name}
            </h3>

            {/* CATEGORY & SUPPLIER */}
            <p className="text-sm text-slate-600">
              Category:{" "}
              <span className="font-medium">
                {product.categoryId.categoryName}
              </span>
            </p>
            <p className="text-sm text-slate-600 mb-3">
              Supplier:{" "}
              <span className="font-medium">{product.supplierId.name}</span>
            </p>

            {/* PRICE & STOCK */}
            <div className="flex justify-between items-center mt-3 mb-4">
              <span className="text-base font-semibold text-sky-600">
                ₹ {product.price}
              </span>

              {/* STOCK BADGE */}
              {product.stock == 0 ? (
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm font-medium">
                  {product.stock}
                </span>
              ) : product.stock < 5 ? (
                <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">
                  {product.stock}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                  {product.stock}
                </span>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => handleEdit(product)}
                className="px-4 py-2 rounded-xl bg-white/80 border border-gray-300 
          hover:bg-sky-50 text-sky-600 text-sm shadow-sm transition"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(product._id)}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm 
          hover:bg-red-700 shadow transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <p className="text-center text-slate-500 col-span-full py-6">
            No Products Found
          </p>
        )}
      </div>

      {/* ----------------- MODAL ----------------- */}
      {openModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/25 backdrop-blur-sm"
            onClick={closeModel}
          />

          <div
            className="relative z-50 w-full max-w-2xl p-6 rounded-3xl 
              bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl"
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">
                {editProduct ? "Edit Product" : "Add Product"}
              </h2>
              <button
                onClick={closeModel}
                className="text-slate-600 hover:text-slate-800 text-2xl"
              >
                ×
              </button>
            </div>

            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              onSubmit={handleSubmit}
            >
              <input
                type="text"
                name="name"
                placeholder="Product Name"
                value={formData.name}
                onChange={handleChange}
                className="px-4 py-3 rounded-xl border bg-white/70 
                    border-gray-200 focus:ring-2 focus:ring-sky-200"
                required
              />

              <input
                type="text"
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                className="px-4 py-3 rounded-xl border bg-white/70 
                  border-gray-200 focus:ring-2 focus:ring-sky-200"
              />

              <input
                type="number"
                name="price"
                placeholder="Price"
                min="10"
                value={formData.price}
                onChange={handleChange}
                className="px-4 py-3 rounded-xl border bg-white/70 
                  border-gray-200 focus:ring-2 focus:ring-sky-200"
              />

              <input
                type="number"
                name="stock"
                placeholder="Stock"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                className="px-4 py-3 rounded-xl border bg-white/70 
                  border-gray-200 focus:ring-2 focus:ring-sky-200"
              />

              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="px-4 py-3 rounded-xl border bg-white/70 
                  border-gray-200 focus:ring-2 focus:ring-sky-200"
              >
                <option>Select Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.categoryName}
                  </option>
                ))}
              </select>

              <select
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
                className="px-4 py-3 rounded-xl border bg-white/70 
                  border-gray-200 focus:ring-2 focus:ring-sky-200"
              >
                <option>Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </select>

              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <button
                  onClick={closeModel}
                  type="button"
                  className="px-6 py-2.5 rounded-xl bg-white border border-gray-200"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r 
                    from-sky-500 to-indigo-500 text-white shadow"
                >
                  {editProduct ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
