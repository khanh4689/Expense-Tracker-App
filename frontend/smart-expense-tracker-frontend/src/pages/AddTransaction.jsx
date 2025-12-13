import React, { useState } from "react";
import transactionService from "../api/transactionService";
import ErrorMessage from "../components/ErrorMessage";
import {
  DollarSign,
  Tag,
  Calendar,
  FileText,
  Save,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function AddTransaction() {
  const [formData, setFormData] = useState({
    amount: "",
    type: "EXPENSE",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [generalError, setGeneralError] = useState("");

  const categories = [
    { value: "food", label: "Food & Dining", icon: "🍔" },
    { value: "transport", label: "Transportation", icon: "🚗" },
    { value: "shopping", label: "Shopping", icon: "🛍️" },
    { value: "bills", label: "Bills & Utilities", icon: "📄" },
    { value: "entertainment", label: "Entertainment", icon: "🎮" },
    { value: "health", label: "Healthcare", icon: "🏥" },
    { value: "education", label: "Education", icon: "📚" },
    { value: "other", label: "Other", icon: "📦" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage("");
    setGeneralError("");

    try {
      const payload = {
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: formData.date,
        type: formData.type,
      };

      console.log('Submitting transaction:', payload);
      const response = await transactionService.createTransaction(payload);
      console.log('Transaction created successfully:', response);

      setSuccessMessage("Transaction added successfully!");

      // Reset form and clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
        handleReset();
      }, 3000);
    } catch (error) {
      console.error('Transaction creation error:', error);

      if (error.validationErrors) {
        setErrors(error.validationErrors);
      } else {
        setGeneralError(error.message || "Failed to add transaction");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      amount: "",
      type: "EXPENSE",
      category: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
    setErrors({});
    setSuccessMessage("");
    setGeneralError("");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Add New Transaction
        </h2>
        <p className="text-gray-600">
          Record your income or expense transaction
        </p>
      </div>

      <div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
      >
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 text-sm">{successMessage}</p>
          </div>
        )}

        {/* General Error */}
        {generalError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{generalError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transaction type */}
          <div className="space-y-3">
            <label className="text-base font-semibold">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, type: "EXPENSE" })
                }
                className={`p-4 rounded-xl border-2 transition-all ${formData.type === "EXPENSE"
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${formData.type === "EXPENSE"
                      ? "bg-red-500"
                      : "bg-gray-200"
                      }`}
                  >
                    <TrendingDown
                      className={`h-5 w-5 ${formData.type === "EXPENSE"
                        ? "text-white"
                        : "text-gray-600"
                        }`}
                    />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Expense</p>
                    <p className="text-xs text-gray-500">Money out</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, type: "INCOME" })
                }
                className={`p-4 rounded-xl border-2 transition-all ${formData.type === "INCOME"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${formData.type === "INCOME"
                      ? "bg-green-500"
                      : "bg-gray-200"
                      }`}
                  >
                    <TrendingUp
                      className={`h-5 w-5 ${formData.type === "INCOME"
                        ? "text-white"
                        : "text-gray-600"
                        }`}
                    />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Income</p>
                    <p className="text-xs text-gray-500">Money in</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label htmlFor="amount" className="font-semibold">
              Amount *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className={`pl-10 h-12 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                required
              />
            </div>
            <ErrorMessage error={errors.amount} />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label htmlFor="category" className="font-semibold">
              Category *
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <select
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className={`pl-10 h-12 w-full border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <ErrorMessage error={errors.category} />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label htmlFor="date" className="font-semibold">
              Transaction Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className={`pl-10 h-12 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                required
              />
            </div>
            <ErrorMessage error={errors.date} />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="font-semibold">
              Description
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                id="description"
                placeholder="Add a description..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className={`pl-10 min-h-[100px] w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
            </div>
            <ErrorMessage error={errors.description} />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.amount ||
                !formData.category
              }
              className="flex-1 h-12 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Save className="h-5 w-5" />
              Save Transaction
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex-1 sm:flex-none h-12 border border-gray-300 hover:bg-gray-50 font-semibold rounded-lg flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-5 w-5" />
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
