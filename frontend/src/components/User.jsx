import React, { useState, useEffect } from "react";
import axios from "axios";

const Users = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "",
  });

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilreredUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/api/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
        },
      });
      setUsers(response.data.users);
      setFilreredUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching Users:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:3000/api/users/add",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );

      if (response.data.success) {
        alert("User Added");
        setFormData({
          name: "",
          email: "",
          password: "",
          address: "",
          role: "",
        });

        fetchUsers();
      }
    } catch (err) {
      alert("Error adding user");
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this User?")) return;

    try {
      const response = await axios.delete(
        `http://localhost:3000/api/users/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );

      if (response.data.success) {
        alert("User deleted");
        fetchUsers();
      } else {
        alert("Error deleting user.");
      }
    } catch (error) {
      alert("Error deleting user");
    }
  };

  const handleSearch = (e) => {
    setFilreredUsers(
      users.filter((u) =>
        u.name.toLowerCase().includes(e.target.value.toLowerCase())
      )
    );
  };

  return (
    <div className="p-6 md:p-10 bg-[#F5F5F7] min-h-screen">
      {/* PAGE TITLE */}
      <h1 className="text-4xl font-semibold text-slate-900 tracking-tight mb-8">
        Users Management
      </h1>

      {/* ADD USER FORM */}
      <div className="bg-white/60 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-3xl p-8 mb-10">
        <h3 className="text-2xl font-medium text-slate-900 mb-6">
          Add New User
        </h3>

        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="px-4 py-3 rounded-xl border bg-white/70 border-gray-200 
            focus:ring-2 focus:ring-sky-300 shadow-sm"
            required
          />

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="px-4 py-3 rounded-xl border bg-white/70 border-gray-200 
            focus:ring-2 focus:ring-sky-300 shadow-sm"
            required
          />

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="px-4 py-3 rounded-xl border bg-white/70 border-gray-200 
            focus:ring-2 focus:ring-sky-300 shadow-sm"
            required
          />

          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            className="px-4 py-3 rounded-xl border bg-white/70 border-gray-200 
            focus:ring-2 focus:ring-sky-300 shadow-sm"
            required
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="px-4 py-3 rounded-xl border bg-white/70 border-gray-200 
            focus:ring-2 focus:ring-sky-300 shadow-sm"
          >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="customer">Customer</option>
          </select>

          <div className="md:col-span-2 flex justify-end mt-4">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r 
              from-sky-500 to-indigo-500 text-white text-sm font-medium 
              shadow-lg hover:scale-[1.02] transition-transform"
            >
              Add User
            </button>
          </div>
        </form>
      </div>

      {/* USER TABLE */}
      <div
        className="bg-white/60 backdrop-blur-2xl border border-white/40 shadow-2xl 
        rounded-3xl p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-medium text-slate-900">User List</h3>

          <input
            type="text"
            placeholder="Search users..."
            className="px-4 py-2 rounded-xl bg-white/70 border border-gray-200 
            shadow-sm focus:ring-2 focus:ring-sky-300"
            onChange={handleSearch}
          />
        </div>

        {loading ? (
          <p className="text-gray-500 text-center py-6">Loading...</p>
        ) : (
          <table className="w-full">
            <thead className="bg-white/70 border-b border-gray-200">
              <tr>
                <th className="py-3 text-left text-slate-700">S.No</th>
                <th className="py-3 text-left text-slate-700">Name</th>
                <th className="py-3 text-left text-slate-700">Email</th>
                <th className="py-3 text-left text-slate-700">Address</th>
                <th className="py-3 text-left text-slate-700">Role</th>
                <th className="py-3 text-center text-slate-700">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user, i) => (
                <tr
                  key={user._id}
                  className="odd:bg-white/40 even:bg-white/60 hover:bg-sky-50/70 transition"
                >
                  <td className="py-4 px-3">{i + 1}</td>
                  <td className="py-4 px-3 font-medium text-slate-800">
                    {user.name}
                  </td>
                  <td className="py-4 px-3 text-slate-600">{user.email}</td>
                  <td className="py-4 px-3 text-slate-600">{user.address}</td>
                  <td className="py-4 px-3 text-slate-600">{user.role}</td>

                  <td className="py-4 px-3 text-center">
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="px-4 py-1.5 rounded-full border border-red-400 
                      text-red-600 hover:bg-red-50 shadow-sm transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {filteredUsers.length === 0 && (
          <p className="text-center text-slate-500 py-6">No Users Found</p>
        )}
      </div>
    </div>
  );
};

export default Users;
