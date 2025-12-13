import React, { useState } from "react";
import { Mail, Send, ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email format");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setGeneralError("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await forgotPassword(email); // Gọi API Backend thật
      setIsSuccess(true);
    } catch (error) {
      setGeneralError(
        error.message || "Failed to send reset email. Try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ================= SUCCESS UI ==================
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg space-y-6">
          <h2 className="text-2xl font-bold text-center">Email Sent</h2>
          <p className="text-center text-gray-600">
            Please check your email inbox
          </p>

          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <p className="text-gray-700">
              We have sent password reset instructions to:
            </p>

            <p className="text-blue-700 font-medium">{email}</p>

            <div className="flex flex-col gap-2">
              <a
                href="/login"
                className="w-full h-12 bg-blue-700 hover:bg-blue-800 text-white rounded-lg flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Login
              </a>

              <button
                onClick={() => setIsSuccess(false)}
                className="text-blue-700 hover:underline"
              >
                Resend email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= MAIN FORM UI ==================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
        <p className="text-center text-gray-600 mb-6">
          Enter your email to receive password reset instructions
        </p>

        {generalError && (
          <p className="text-red-600 text-center mb-4">{generalError}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              className={`w-full h-12 border rounded-lg pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                error ? "border-red-500" : "border-gray-300"
              }`}
            />

            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-blue-700 hover:bg-blue-800 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? "Sending..." : <><Send className="w-5 h-5" /> Send Email</>}
          </button>

          <a
            href="/login"
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 mt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </a>
        </form>
      </div>
    </div>
  );
}
