import React, { useState, useEffect } from "react";
import axios from "axios";

const Categories = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCategory, setEditCategory] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/api/category", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editCategory) {
        const response = await axios.put(
          `http://localhost:3000/api/category/${editCategory}`,
          { categoryName, categoryDescription },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
            },
          }
        );

        if (response.data.success) {
          alert("Category Updated");
          setEditCategory(null);
          setCategoryName("");
          setCategoryDescription("");
          fetchCategories();
        }
      } else {
        const response = await axios.post(
          "http://localhost:3000/api/category/add",
          { categoryName, categoryDescription },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
            },
          }
        );

        if (response.data.success) {
          alert("Category Added");
          setCategoryName("");
          setCategoryDescription("");
          fetchCategories();
        }
      }
    } catch (err) {
      alert("Something went wrong");
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      if (!window.confirm("Delete this category?")) return;

      const res = await axios.delete(
        `http://localhost:3000/api/category/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );

      if (res.data.success) {
        alert("Deleted");
        fetchCategories();
      }
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Error deleting category, Please try again");
      }
    }
  };

  return (
    <div className="p-6 bg-[#F5F5F7] min-h-screen overflow-y-auto">
      {/* Page Title */}
      <h2 className="text-3xl font-semibold text-[#1D1D1F] mb-6 tracking-tight">
        Categories
      </h2>

      {/* Form Card */}
      <div className="bg-white/70 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
        <h3 className="text-xl font-medium text-gray-800 mb-4">
          {editCategory ? "Edit Category" : "Add Category"}
        </h3>

        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Category Name"
            className="w-full p-3 border border-gray-300 rounded-xl bg-[#FAFAFA] focus:ring-2 focus:ring-sky-400 outline-none"
            required
          />

          {/* KEEP description, but not shown in table */}
          <input
            type="text"
            value={categoryDescription}
            onChange={(e) => setCategoryDescription(e.target.value)}
            placeholder="Category Description"
            className="w-full p-3 border border-gray-300 rounded-xl bg-[#FAFAFA] focus:ring-2 focus:ring-sky-400 outline-none"
            required
          />

          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-900 transition"
            >
              {editCategory ? "Update" : "Add Category"}
            </button>

            {editCategory && (
              <button
                type="button"
                onClick={() => {
                  setEditCategory(null);
                  setCategoryName("");
                  setCategoryDescription("");
                }}
                className="px-6 py-2 rounded-xl border border-gray-400 text-gray-700 text-sm hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Category Table */}
      <div className="bg-white/70 backdrop-blur-xl border border-gray-200 shadow-sm rounded-2xl p-6">
        <h3 className="text-xl font-medium text-gray-800 mb-4">
          Category List
        </h3>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="py-3 text-left text-gray-600 font-medium">
                  S.No
                </th>
                <th className="py-3 text-left text-gray-600 font-medium">
                  Name
                </th>

                {/* ❌ REMOVED DESCRIPTION COLUMN COMPLETELY */}

                <th className="py-3 text-center text-gray-600 font-medium">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {categories.map((c, i) => (
                <tr
                  key={c._id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="py-3">{i + 1}</td>
                  <td className="py-3">{c.categoryName}</td>

                  <td className="py-3 flex justify-center gap-4 text-sm">
                    {/* Modern Edit Button */}
                    <button
                      onClick={() => {
                        setEditCategory(c._id);
                        setCategoryName(c.categoryName);
                        setCategoryDescription(c.categoryDescription);
                      }}
                      className="px-4 py-1.5 rounded-full border border-blue-500 text-blue-600 hover:bg-blue-50 transition"
                    >
                      Edit
                    </button>

                    {/* Modern Delete Button */}
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="px-4 py-1.5 rounded-full border border-red-500 text-red-600 hover:bg-red-50 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {categories.length === 0 && (
                <tr>
                  <td colSpan="3" className="py-4 text-center text-gray-500">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Categories;
