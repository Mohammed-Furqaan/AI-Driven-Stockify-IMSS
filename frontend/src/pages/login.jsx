import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import axios from "axios";

const LogoIcon = () => (
  <svg
    className="w-5 h-5 text-gray-800"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        await login(response.data.user, response.data.token);

        navigate(
          response.data.user.role === "admin"
            ? "/admin-dashboard"
            : "/customer-dashboard"
        );
      } else {
        setError(response.data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Login Error Details:", error.response?.data);

      const msg = error.response?.data?.message || error.response?.data?.error;

      if (msg === "User not found") {
        setError("User not found or credentials incorrect.");
      } else if (msg === "Invalid credentials") {
        setError("Invalid email or password.");
      } else if (error.response?.status === 400) {
        setError(
          msg || "Validation Failed. Check your email and password format."
        );
      } else {
        setError("Network or Server Error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ceb8af] p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden flex">
        {/* Left side */}
        <div className="w-1/2 p-14 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-3 h-3 bg-black rounded-full"></span>
            <span className="font-medium text-gray-800 text-lg">Stockify</span>
          </div>

          <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Login
          </h2>

          <p className="text-gray-500 mt-1 mb-10">
            Access your Stockify dashboard and manage your inventory
            efficiently.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="text-sm text-gray-700 font-medium">Email</label>
              <input
                type="email"
                className="w-full mt-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 
                focus:ring-2 focus:ring-orange-400 focus:bg-white transition"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {/* Password + Eye */}
            <div className="relative">
              <label className="text-sm text-gray-700 font-medium">
                Password
              </label>

              {/* Wrap input + icon in relative box */}
              <div className="relative">
                <input
                  type={visible ? "text" : "password"}
                  className="w-full mt-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 
      focus:ring-2 focus:ring-orange-400 focus:bg-white transition"
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />

                <button
                  type="button"
                  onClick={() => setVisible((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                >
                  {visible ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223C5.743 5.36 8.726 3.75 12 3.75c3.273 0 6.256 1.61 8.019 4.473a5.7 5.7 0 010 7.554C18.256 18.64 15.273 20.25 12 20.25c-3.274 0-6.257-1.61-8.02-4.473a5.7 5.7 0 010-7.554z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223C5.743 5.36 8.726 3.75 12 3.75c3.273 0 6.256 1.61 8.019 4.473a5.7 5.7 0 010 7.554c-1.091 1.71-2.636 3.02-4.5 3.778M9.53 9.53A3 3 0 0114.47 14.47M9.53 9.53L4.5 4.5m5.03 5.03l10.5 10.5"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold 
              shadow-sm hover:bg-orange-600 hover:shadow-md transition disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-xs text-gray-400 mt-12">© Stockify </p>
        </div>

        {/* Right side decoration */}
        <div className="w-1/2 bg-[#f8f3f1] relative flex items-center justify-center">
          <div className="absolute w-48 h-48 bg-orange-400 rounded-full bottom-24 shadow-[0px_40px_80px_rgba(255,130,100,0.5)]"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
