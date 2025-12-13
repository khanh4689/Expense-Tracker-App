import React, { useState, useEffect } from "react";
import {
  Save,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import budgetService from "../api/budgetService";
import transactionService from "../api/transactionService";

export default function Budget() {
  const [dailyLimit, setDailyLimit] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [budgetId, setBudgetId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  const [currentDailySpending, setCurrentDailySpending] = useState(0);
  const [currentMonthlySpending, setCurrentMonthlySpending] = useState(0);

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch budget and transactions
      const [budget, transactions] = await Promise.all([
        budgetService.getCurrentBudget().catch(() => null),
        transactionService.getAllTransactions().catch(() => [])
      ]);

      console.log('Fetched budget:', budget);
      console.log('Fetched transactions:', transactions);

      // Set budget limits
      if (budget) {
        setDailyLimit(budget.dailyLimit?.toString() || "100.00");
        setMonthlyLimit(budget.monthlyLimit?.toString() || "3000.00");
        setBudgetId(budget.id);
      } else {
        // Default values if no budget exists
        setDailyLimit("100.00");
        setMonthlyLimit("3000.00");
      }

      // Calculate current spending
      const todaySpending = calculateTodaySpending(transactions);
      const monthSpending = calculateMonthSpending(transactions);

      setCurrentDailySpending(todaySpending);
      setCurrentMonthlySpending(monthSpending);

    } catch (err) {
      console.error('Error fetching budget data:', err);
      setError('Failed to load budget data. Using default values.');
      setDailyLimit("100.00");
      setMonthlyLimit("3000.00");
    } finally {
      setLoading(false);
    }
  };

  const calculateTodaySpending = (transactions) => {
    const today = new Date().toISOString().split('T')[0];
    return transactions
      .filter(t => t.type === 'EXPENSE' && t.date === today)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateMonthSpending = (transactions) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'EXPENSE' &&
          tDate.getMonth() === currentMonth &&
          tDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const budgetData = {
        dailyLimit: parseFloat(dailyLimit),
        monthlyLimit: parseFloat(monthlyLimit)
      };

      console.log('Saving budget:', budgetData);

      if (budgetId) {
        // Update existing budget
        await budgetService.updateBudget(budgetId, budgetData);
      } else {
        // Create new budget
        const newBudget = await budgetService.createBudget(budgetData);
        setBudgetId(newBudget.id);
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (err) {
      console.error('Error saving budget:', err);
      setError(err.message || 'Failed to save budget settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const dailyPercentage = dailyLimit > 0
    ? (currentDailySpending / parseFloat(dailyLimit)) * 100
    : 0;

  const monthlyPercentage = monthlyLimit > 0
    ? (currentMonthlySpending / parseFloat(monthlyLimit)) * 100
    : 0;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading budget settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-gray-800 mb-2 text-2xl font-semibold">
          Budget Settings
        </h2>
        <p className="text-gray-600">
          Set your daily and monthly spending limits
        </p>
      </div>

      {/* Success */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-800">
            Budget settings saved successfully!
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Status Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-gray-900 font-semibold">
                Daily Budget
              </h3>
              <p className="text-sm text-gray-500">
                Today's spending
              </p>
            </div>
          </div>

          <p className="text-2xl font-bold text-gray-900">
            ${currentDailySpending.toFixed(2)}
            <span className="text-sm text-gray-500 font-normal">
              {" "}
              / ${parseFloat(dailyLimit || 0).toFixed(2)}
            </span>
          </p>

          <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{
                width: `${Math.min(dailyPercentage, 100)}%`,
              }}
            />
          </div>

          <div className="mt-3 text-sm flex items-center gap-2">
            {dailyPercentage < 80 ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-600">
                  {(100 - dailyPercentage).toFixed(1)}%
                  remaining
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-600">
                  {dailyPercentage > 100
                    ? "Over budget!"
                    : "Approaching limit"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Monthly */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-gray-900 font-semibold">
                Monthly Budget
              </h3>
              <p className="text-sm text-gray-500">
                This month
              </p>
            </div>
          </div>

          <p className="text-2xl font-bold text-gray-900">
            ${currentMonthlySpending.toFixed(2)}
            <span className="text-sm text-gray-500 font-normal">
              {" "}
              / ${parseFloat(monthlyLimit || 0).toFixed(2)}
            </span>
          </p>

          <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
            <div
              className="bg-purple-600 h-3 rounded-full transition-all"
              style={{
                width: `${Math.min(monthlyPercentage, 100)}%`,
              }}
            />
          </div>

          <div className="mt-3 text-sm flex items-center gap-2">
            {monthlyPercentage < 80 ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-600">
                  {(100 - monthlyPercentage).toFixed(1)}%
                  remaining
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-600">
                  {monthlyPercentage > 100
                    ? "Over budget!"
                    : "Approaching limit"}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          Update Budget Limits
        </h3>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-700 mb-1 font-medium">
              Daily Limit
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                className="w-full h-12 border border-gray-300 rounded-lg pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1 font-medium">
              Monthly Limit
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                className="w-full h-12 border border-gray-300 rounded-lg pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="0"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full h-12 rounded-lg bg-blue-900 text-white hover:bg-blue-800 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Budget Settings
              </>
            )}
          </button>
        </form>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6">
        <h3 className="text-gray-900 font-semibold mb-3">
          Budget Tips
        </h3>
        <ul className="text-gray-700 space-y-2 text-sm">
          <li>• Review your budget monthly and adjust as needed</li>
          <li>• Keep daily limit realistic based on your lifestyle</li>
          <li>• Save at least 20% of income for emergencies</li>
          <li>• Track reports regularly to identify spending patterns</li>
          <li>• Set alerts when approaching budget limits</li>
        </ul>
      </div>
    </div>
  );
}
