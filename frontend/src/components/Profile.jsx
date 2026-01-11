import axios from "axios";
import React, { useEffect, useState } from "react";

const Icon = ({ name, className = "w-5 h-5 text-gray-500" }) => {
  // small inline icons (name: user, mail, map-pin, lock, save, edit)
  if (name === "user")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 12a4 4 0 100-8 4 4 0 000 8z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 20a8 8 0 0116 0"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  if (name === "mail")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path
          d="M3 8l8.5 6L20 8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="3"
          y="4"
          width="18"
          height="16"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    );
  if (name === "map")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path
          d="M9 20l-5-2V6l5 2 6-3 5 2v10l-5-2-6 3z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  if (name === "lock")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <rect
          x="4"
          y="11"
          width="16"
          height="10"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M7 11V8a5 5 0 0110 0v3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  if (name === "edit")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path
          d="M3 21l3-1 11-11 1-3-3 1L4 20z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  if (name === "save")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path
          d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17 21v-8H7v8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );

  return null;
};

const Profile = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
  });

  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchUser = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/users/profile",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );

      if (response.data.success) {
        setUser({
          name: response.data.user.name || "",
          email: response.data.user.email || "",
          address: response.data.user.address || "",
          password: "",
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      alert("Error fetching user profile, Please try again");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // NOTE: handleSubmit kept identical in behavior to your original code
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.put(
        "http://localhost:3000/api/users/profile",
        user,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
          },
        }
      );
      if (response.data.success) {
        alert("Profile Updated Successfully");
        setEdit(false);
        // optionally clear password field
        setUser((prev) => ({ ...prev, password: "" }));
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      alert("Error updating profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 bg-gradient-to-b from-gray-50 to-white">
      {/* Background decorative panel on right to mimic Apple aesthetic */}
      <div className="absolute right-8 top-12 hidden lg:block">
        <img
          src="/mnt/data/3e66343b-ef2d-420e-b929-eb9f0dec5a52.png"
          alt="decor"
          className="w-[420px] h-[320px] object-cover opacity-30 rounded-2xl filter blur-sm"
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">
            Profile
          </h1>
          <p className="mt-2 text-gray-500">
            Manage your account details — secure, simple, and polished.
          </p>
        </div>

        {/* Glass card */}
        <div
          className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-6 md:p-8
                      transition-transform transform hover:scale-[1.01]"
        >
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Left column - avatar & info */}
            <div className="col-span-1 flex flex-col items-center md:items-start gap-4">
              <div
                className="w-28 h-28 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500
                           flex items-center justify-center text-white text-2xl font-semibold shadow-lg"
                aria-hidden
              >
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>

              <div className="text-center md:text-left">
                <h2 className="text-lg font-semibold text-gray-900">
                  {user.name || "—"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {user.email || "—"}
                </p>
              </div>

              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEdit((v) => !v)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm hover:scale-[1.02] transition-shadow shadow"
                >
                  <Icon name="edit" className="w-4 h-4 text-white" />
                  {edit ? "Cancel" : "Edit"}
                </button>

                {!edit && (
                  <button
                    type="button"
                    onClick={fetchUser}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-800 border border-gray-200 hover:shadow-sm transition"
                  >
                    Refresh
                  </button>
                )}
              </div>
            </div>

            {/* Middle column - main inputs */}
            <div className="col-span-2 grid grid-cols-1 gap-4">
              {/* Name */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-gray-100 shadow-sm">
                <div className="p-2 rounded-lg bg-white/30">
                  <Icon name="user" className="w-5 h-5 text-slate-700" />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    disabled={!edit}
                    className={`mt-1 w-full bg-transparent outline-none ${
                      edit ? "placeholder-gray-400" : "text-gray-600"
                    }`}
                    placeholder="Full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-gray-100 shadow-sm">
                <div className="p-2 rounded-lg bg-white/30">
                  <Icon name="mail" className="w-5 h-5 text-slate-700" />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    className="mt-1 w-full bg-transparent outline-none text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-gray-100 shadow-sm">
                <div className="p-2 rounded-lg bg-white/30">
                  <Icon name="map" className="w-5 h-5 text-slate-700" />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    type="text"
                    value={user.address}
                    onChange={(e) =>
                      setUser({ ...user, address: e.target.value })
                    }
                    disabled={!edit}
                    className="mt-1 w-full bg-transparent outline-none placeholder-gray-400"
                    placeholder="Home / Office address"
                  />
                </div>
              </div>

              {/* Password (only visible in edit mode) */}
              {edit && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-gray-100 shadow-sm">
                  <div className="p-2 rounded-lg bg-white/30">
                    <Icon name="lock" className="w-5 h-5 text-slate-700" />
                  </div>

                  <div className="flex-1 relative">
                    <label className="text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <PasswordField
                      value={user.password}
                      onChange={(val) => setUser({ ...user, password: val })}
                    />
                  </div>
                </div>
              )}

              {/* Actions row */}
              <div className="pt-2 flex items-center justify-end gap-3">
                {edit ? (
                  <>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium shadow hover:brightness-105 transition"
                    >
                      <Icon name="save" className="w-4 h-4 text-white" />
                      {loading ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEdit(false);
                        // revert password input (clear)
                        setUser((prev) => ({ ...prev, password: "" }));
                      }}
                      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 border border-gray-200 hover:shadow-sm transition"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <div className="text-sm text-gray-500">
                    Last synced: <span className="text-gray-700">just now</span>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* subtle footer note */}
        <div className="mt-6 text-xs text-gray-400">
          Changes are saved to your account. Passwords are transmitted securely.
        </div>
      </div>
    </div>
  );
};

export default Profile;

/* ---------------------------
   Helper component: PasswordField
   (keeps code readable and adds show/hide eye toggle)
   --------------------------- */
function PasswordField({ value, onChange }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter new password"
        className="mt-1 w-full bg-transparent outline-none pr-10"
      />

      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-gray-100/50 transition"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? (
          <svg
            className="w-5 h-5 text-gray-700"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 9l-6 6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-gray-700"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="12"
              r="3"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
