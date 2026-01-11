import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    // FIX: Wrap side effects (logout and navigate) inside useEffect
    // This ensures they run only once after the component has rendered.

    // 1. Perform the logout (clears state, token, etc.)
    logout();

    // 2. Navigate the user away from the logout page
    navigate("/login");
  }, [logout, navigate]); // Dependencies ensure this runs when the component mounts

  // The component must return valid JSX, even if it's just a loading message
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Logging out...</p>
    </div>
  );
};

export default Logout;
