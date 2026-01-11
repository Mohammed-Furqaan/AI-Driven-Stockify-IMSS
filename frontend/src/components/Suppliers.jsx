import axios from "axios";
import React, { useState, useEffect } from "react";

const Suppliers = () => {
  const [addModal, setAddModal] = useState(null);
  const [editSupplier, setEditSupplier] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/api/supplier", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });

      setSuppliers(response.data.suppliers);
      setFilteredSuppliers(response.data.suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleEdit = (supplier) => {
    setFormData({
      name: supplier.name,
      email: supplier.email,
      number: supplier.number,
      address: supplier.address,
    });
    setEditSupplier(supplier._id);
    setAddModal(true);
  };

  const closeModal = () => {
    setAddModal(false);
    setFormData({ name: "", email: "", number: "", address: "" });
    setEditSupplier(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editSupplier) {
      try {
        const response = await axios.put(
          `http://localhost:3000/api/supplier/${editSupplier}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
            },
          }
        );

        if (response.data.success) {
          fetchSuppliers();
          alert("Supplier updated successfully");
          closeModal();
        }
      } catch (error) {
        alert("Error updating supplier");
      }
    } else {
      try {
        const response = await axios.post(
          "http://localhost:3000/api/supplier/add",
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
            },
          }
        );

        if (response.data.success) {
          fetchSuppliers();
          alert("Supplier added successfully");
          closeModal();
        }
      } catch (error) {
        alert("Error adding supplier");
      }
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this supplier?");
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        `http://localhost:3000/api/supplier/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );

      if (response.data.success) {
        alert("Supplier deleted");
        fetchSuppliers();
      }
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Error deleting supplier, Please try again");
      }
    }
  };

  const handleSearch = (e) => {
    setFilteredSuppliers(
      suppliers.filter((s) =>
        s.name.toLowerCase().includes(e.target.value.toLowerCase())
      )
    );
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-white to-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">
            Supplier Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your supplier contacts and details
          </p>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search suppliers..."
            onChange={handleSearch}
            className="w-64 px-4 py-2 rounded-lg bg-white/60 backdrop-blur-sm 
            border border-gray-200 text-sm shadow-sm focus:outline-none
            focus:ring-2 focus:ring-sky-300"
          />

          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg 
            bg-gradient-to-r from-sky-500 to-indigo-500 text-white 
            font-medium shadow-lg hover:scale-[1.02] transform transition"
            onClick={() => setAddModal(true)}
          >
            <span className="text-lg">＋</span>
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden border border-white/30 
      shadow-xl bg-white/40 backdrop-blur-md"
      >
        <table className="w-full">
          <thead className="bg-white/60 backdrop-blur-sm border-b border-white/30">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                S No
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                Supplier Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                Address
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-slate-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-slate-600">
                  Loading...
                </td>
              </tr>
            ) : filteredSuppliers.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-slate-500">
                  No suppliers found
                </td>
              </tr>
            ) : (
              filteredSuppliers.map((supplier, index) => (
                <tr
                  key={supplier._id}
                  className="odd:bg-white/60 even:bg-white/40 hover:bg-sky-50 transition"
                >
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-800">
                    {supplier.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {supplier.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {supplier.number}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {supplier.address}
                  </td>

                  <td className="px-4 py-3 text-sm text-center">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="px-3 py-1.5 rounded-md bg-white border 
                        border-gray-200 shadow-sm hover:bg-sky-50 text-sky-600"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(supplier._id)}
                        className="px-3 py-1.5 rounded-md bg-red-600 text-white 
                        hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {addModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/25 backdrop-blur-sm"
            onClick={closeModal}
          />

          <div
            className="relative z-50 w-full max-w-2xl p-6 rounded-3xl 
          bg-white/60 backdrop-blur-md border border-white/30 shadow-2xl"
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">
                {editSupplier ? "Edit Supplier" : "Add Supplier"}
              </h2>
              <button
                onClick={closeModal}
                className="text-slate-600 hover:text-slate-800 text-2xl"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full name"
                className="px-4 py-3 rounded-xl border border-gray-200 bg-white/70 
                focus:outline-none focus:ring-2 focus:ring-sky-200"
                required
              />
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email (optional)"
                className="px-4 py-3 rounded-xl border border-gray-200 bg-white/70 
                focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
              <input
                name="number"
                value={formData.number}
                onChange={handleChange}
                placeholder="Phone number"
                className="px-4 py-3 rounded-xl border border-gray-200 bg-white/70 
                focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
                className="px-4 py-3 rounded-xl border border-gray-200 bg-white/70 
                focus:outline-none focus:ring-2 focus:ring-sky-200"
              />

              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl bg-white border border-gray-200"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r 
                  from-sky-500 to-indigo-500 text-white shadow"
                >
                  {editSupplier ? "Update" : "Add Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
