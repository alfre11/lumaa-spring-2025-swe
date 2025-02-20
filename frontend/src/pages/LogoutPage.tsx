import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token"); // Clear token on logout
  }, []);

  return (
    <div>
      <h2>You have been logged out.</h2>
      <p>Click below to return to the login page.</p>
      <button onClick={() => navigate("/")}>Go to Login</button>
    </div>
  );
};

export default LogoutPage;
