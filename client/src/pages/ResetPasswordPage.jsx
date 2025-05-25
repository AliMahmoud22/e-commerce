import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import axios from "axios";
import Alert from "../components/Alert";

export default function ResetPasswordPage() {
  const { resetToken } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!password || !passwordConfirm) {
      setAlertMessage("Please fill in all fields.");
      setAlertType("error");
      return;
    }
    if (password !== passwordConfirm) {
      setAlertMessage("Passwords do not match.");
      setAlertType("error");
      return;
    }
    setLoading(true);
    try {
      await axios.patch(`/api/users/resetPassword/${resetToken}`, {
        password,
        passwordConfirm,
      });
      setAlertMessage("Password reset successful! Redirecting to login...");
      setAlertType("success");
      setTimeout(() => navigate("/"), 2000);
      setLoading(false);
    } catch (error) {
      setAlertMessage(error.response?.data?.message || "Reset failed.❌");
      setAlertType("error");
    }
  };

  return (
    <>
      {/* Alert */}
      <Alert
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertMessage("")}
      />
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <form
          onSubmit={handleReset}
          className="bg-white p-8 rounded shadow-md w-full max-w-md mt-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">
            Reset Password
          </h2>

          <div className="mb-4">
            <label className="block mb-2 font-medium">New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-medium">
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded hover:bg-primary/90 transition"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
 
    </>
  );
}
