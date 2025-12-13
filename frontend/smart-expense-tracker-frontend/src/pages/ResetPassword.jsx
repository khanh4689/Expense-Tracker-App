import React, { useState } from "react";
import { Eye, EyeOff, Lock, CheckCircle2, Key } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSearchParams } from "react-router-dom";

export default function ResetPasswordPage({ onNavigate }) {
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // GET TOKEN FROM URL

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthText = (strength) => {
    if (strength <= 1) return { text: "Yếu", color: "text-red-600" };
    if (strength === 2) return { text: "Trung bình", color: "text-yellow-600" };
    if (strength === 3) return { text: "Khá", color: "text-blue-600" };
    return { text: "Mạnh", color: "text-green-600" };
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) newErrors.password = "Mật khẩu là bắt buộc";
    else if (formData.password.length < 6)
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await resetPassword(token, formData.password);
      setIsSuccess(true);
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Đặt lại mật khẩu thất bại, thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto text-center p-6 text-red-600">
        Token không hợp lệ hoặc đã hết hạn.
      </div>
    );
  }

  // SUCCESS UI
  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto p-6 space-y-6 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>

        <h2 className="text-2xl font-semibold">Thành công</h2>
        <p className="text-gray-700">
          Mật khẩu của bạn đã được đặt lại thành công!
        </p>

        <button
          onClick={() => onNavigate("login")}
          className="w-full h-12 bg-blue-700 hover:bg-blue-800 text-white rounded-lg"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthInfo = getPasswordStrengthText(passwordStrength);

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-1">Đặt lại mật khẩu</h2>
      <p className="text-gray-600 mb-6">
        Nhập mật khẩu mới bạn muốn sử dụng
      </p>

      {serverError && (
        <p className="text-red-600 bg-red-100 border border-red-300 p-3 rounded-lg mb-4">
          {serverError}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* INFO BOX */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
          <Key className="w-5 h-5 text-blue-700 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p>Mật khẩu mạnh nên bao gồm:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Ít nhất 6 ký tự (khuyến nghị 10+)</li>
              <li>Chữ hoa và chữ thường</li>
              <li>Ít nhất một số</li>
              <li>Ký tự đặc biệt (!@#$%^&*)</li>
            </ul>
          </div>
        </div>

        {/* PASSWORD */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Nhập mật khẩu mới"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className={`w-full h-12 border rounded-lg pl-10 pr-10 focus:outline-none focus:ring-2 ${
              errors.password
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-600"
            }`}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>

          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}

          {/* Strength bar */}
          {formData.password && !errors.password && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Độ mạnh mật khẩu:</span>
                <span className={`${strengthInfo.color} text-sm`}>
                  {strengthInfo.text}
                </span>
              </div>

              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full ${
                      i < passwordStrength
                        ? passwordStrength <= 1
                          ? "bg-red-500"
                          : passwordStrength === 2
                          ? "bg-yellow-500"
                          : passwordStrength === 3
                          ? "bg-blue-500"
                          : "bg-green-500"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Xác nhận mật khẩu mới"
            value={formData.confirmPassword}
            onChange={(e) =>
              handleInputChange("confirmPassword", e.target.value)
            }
            className={`w-full h-12 border rounded-lg pl-10 pr-10 focus:outline-none focus:ring-2 ${
              errors.confirmPassword
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-600"
            }`}
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showConfirmPassword ? <EyeOff /> : <Eye />}
          </button>

          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-blue-700 hover:bg-blue-800 text-white rounded-lg disabled:opacity-60"
        >
          {isLoading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
        </button>

        <button
          type="button"
          onClick={() => onNavigate("login")}
          className="text-gray-600 hover:text-gray-800 text-sm mt-2"
        >
          Quay lại đăng nhập
        </button>
      </form>
    </div>
  );
}
