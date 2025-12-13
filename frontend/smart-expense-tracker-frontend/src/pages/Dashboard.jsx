import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet, Calendar, DollarSign, AlertCircle } from "lucide-react";
import transactionService from '../api/transactionService';
import budgetService from '../api/budgetService';
import reportService from '../api/reportService';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    todayExpense: 0,
    monthlyExpense: 0,
    remainingBudget: 0,
    monthlyBudget: 0,
    expenseByDay: [],
    expenseByCategory: [],
    recentTransactions: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all data
      const [transactions, budget] = await Promise.all([
        transactionService.getAllTransactions().catch(() => []),
        budgetService.getCurrentBudget().catch(() => null)
      ]);

      console.log('Fetched transactions:', transactions);
      console.log('Fetched budget:', budget);

      // Calculate today's expense
      const today = new Date().toISOString().split('T')[0];
      const todayExpense = calculateTodayExpense(transactions, today);

      // Calculate monthly expense
      const monthlyExpense = calculateMonthlyExpense(transactions);

      // Calculate remaining budget
      const monthlyBudget = budget?.monthlyLimit || 0;
      const remainingBudget = monthlyBudget - monthlyExpense;

      // Get expense by day (last 7 days)
      const expenseByDay = calculateExpenseByDay(transactions);

      // Get expense by category
      const expenseByCategory = calculateExpenseByCategory(transactions);

      // Get recent transactions (last 5)
      const recentTransactions = transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

      setDashboardData({
        todayExpense,
        monthlyExpense,
        remainingBudget,
        monthlyBudget,
        expenseByDay,
        expenseByCategory,
        recentTransactions
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTodayExpense = (transactions, today) => {
    return transactions
      .filter(t => t.type === 'EXPENSE' && t.date === today)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateMonthlyExpense = (transactions) => {
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

  const calculateExpenseByDay = (transactions) => {
    const last7Days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayExpense = transactions
        .filter(t => t.type === 'EXPENSE' && t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);

      last7Days.push({
        day: dayNames[date.getDay()],
        amount: dayExpense
      });
    }

    return last7Days;
  };

  const calculateExpenseByCategory = (transactions) => {
    const categoryMap = {};
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500', 'bg-green-500'];

    transactions
      .filter(t => t.type === 'EXPENSE')
      .forEach(t => {
        const category = t.category || 'Other';
        categoryMap[category] = (categoryMap[category] || 0) + t.amount;
      });

    return Object.entries(categoryMap)
      .map(([name, value], index) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const formatCurrency = (amount) => {
    return `$${Math.abs(amount).toFixed(2)}`;
  };

  const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 font-medium">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const summaryCards = [
    {
      title: "Today's Expense",
      amount: formatCurrency(dashboardData.todayExpense),
      change: "+12%",
      trend: "up",
      icon: Calendar,
      bg: "bg-blue-50",
    },
    {
      title: "Monthly Expense",
      amount: formatCurrency(dashboardData.monthlyExpense),
      change: "-5%",
      trend: "down",
      icon: TrendingUp,
      bg: "bg-purple-50",
    },
    {
      title: "Remaining Budget",
      amount: formatCurrency(dashboardData.remainingBudget),
      change: `${dashboardData.monthlyBudget > 0 ? ((dashboardData.remainingBudget / dashboardData.monthlyBudget) * 100).toFixed(0) : 0}%`,
      trend: dashboardData.remainingBudget > 0 ? "up" : "down",
      icon: Wallet,
      bg: "bg-green-50",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800">Dashboard Overview</h2>
        <p className="text-gray-600">Track your expenses and manage your budget</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          const TrendIcon = card.trend === "up" ? TrendingUp : TrendingDown;

          return (
            <div
              key={index}
              className="rounded-2xl shadow-lg p-6 bg-white hover:shadow-xl transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm">{card.title}</p>
                  <h3 className="text-xl font-bold text-gray-900">{card.amount}</h3>
                </div>
                <div className={`p-3 rounded-xl ${card.bg}`}>
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`flex items-center gap-1 ${card.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                >
                  <TrendIcon className="h-4 w-4" />
                  {card.change}
                </span>
                <span className="text-gray-500">vs last period</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense by Day */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Expense by Day</h3>
            <span className="text-xs text-gray-500">Last 7 days</span>
          </div>

          {/* Scrollable container for chart */}
          <div className="overflow-x-auto overflow-y-hidden">
            <div className="min-w-full" style={{ minWidth: `${Math.max(dashboardData.expenseByDay.length * 70, 350)}px` }}>
              {/* Chart container with extra space for labels */}
              <div className="flex items-end gap-2 sm:gap-4 h-56 px-2 pt-8">
                {dashboardData.expenseByDay.length > 0 ? (
                  dashboardData.expenseByDay.map((item, i) => {
                    const maxAmount = Math.max(...dashboardData.expenseByDay.map(d => d.amount), 1);
                    const heightPercentage = item.amount > 0 ? (item.amount / maxAmount) * 100 : 5;

                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center gap-2 flex-1 min-w-[50px]"
                      >
                        {/* Amount label above bar */}
                        <div className="h-6 flex items-end justify-center">
                          {item.amount > 0 && (
                            <span className="text-xs font-semibold text-gray-700">
                              ${item.amount.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Bar */}
                        <div className="relative flex flex-col items-center w-full flex-1">
                          <div
                            className="bg-gradient-to-t from-blue-600 to-blue-400 w-full rounded-t transition-all hover:from-blue-700 hover:to-blue-500 cursor-pointer shadow-sm"
                            style={{
                              height: `${Math.max(heightPercentage, 5)}%`,
                              minHeight: item.amount > 0 ? '30px' : '10px'
                            }}
                          />
                        </div>

                        {/* Day label */}
                        <span className="text-xs text-gray-600 font-medium whitespace-nowrap mt-1">
                          {item.day}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <p className="text-gray-400 text-sm">No data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scroll indicator for mobile */}
          {dashboardData.expenseByDay.length > 5 && (
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-400 sm:hidden">← Scroll to see more →</p>
            </div>
          )}
        </div>


        {/* Expense by Category - Pie Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Expense by Category</h3>

          {dashboardData.expenseByCategory.length > 0 ? (
            <div className="flex flex-col lg:flex-row items-center gap-6">
              {/* Pie Chart */}
              <div className="relative w-48 h-48 flex-shrink-0">
                <svg viewBox="0 0 200 200" className="transform -rotate-90">
                  {(() => {
                    const total = dashboardData.expenseByCategory.reduce((sum, cat) => sum + cat.value, 0);
                    let currentAngle = 0;
                    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

                    return dashboardData.expenseByCategory.map((cat, i) => {
                      const percentage = (cat.value / total) * 100;
                      const angle = (percentage / 100) * 360;
                      const startAngle = currentAngle;
                      const endAngle = currentAngle + angle;

                      // Calculate arc path
                      const startRad = (startAngle * Math.PI) / 180;
                      const endRad = (endAngle * Math.PI) / 180;
                      const x1 = 100 + 90 * Math.cos(startRad);
                      const y1 = 100 + 90 * Math.sin(startRad);
                      const x2 = 100 + 90 * Math.cos(endRad);
                      const y2 = 100 + 90 * Math.sin(endRad);
                      const largeArc = angle > 180 ? 1 : 0;

                      currentAngle = endAngle;

                      return (
                        <g key={i} className="hover:opacity-80 transition-opacity cursor-pointer">
                          <path
                            d={`M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z`}
                            fill={colors[i % colors.length]}
                            stroke="white"
                            strokeWidth="2"
                          />
                          {/* Percentage label */}
                          {percentage > 5 && (
                            <text
                              x={100 + 60 * Math.cos((startRad + endRad) / 2)}
                              y={100 + 60 * Math.sin((startRad + endRad) / 2)}
                              fill="white"
                              fontSize="12"
                              fontWeight="bold"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              transform={`rotate(90 ${100 + 60 * Math.cos((startRad + endRad) / 2)} ${100 + 60 * Math.sin((startRad + endRad) / 2)})`}
                            >
                              {percentage.toFixed(0)}%
                            </text>
                          )}
                        </g>
                      );
                    });
                  })()}

                  {/* Center circle for donut effect */}
                  <circle cx="100" cy="100" r="50" fill="white" />

                  {/* Total in center */}
                  <text
                    x="100"
                    y="95"
                    fill="#1f2937"
                    fontSize="12"
                    fontWeight="600"
                    textAnchor="middle"
                    transform="rotate(90 100 100)"
                  >
                    Total
                  </text>
                  <text
                    x="100"
                    y="110"
                    fill="#1f2937"
                    fontSize="16"
                    fontWeight="bold"
                    textAnchor="middle"
                    transform="rotate(90 100 100)"
                  >
                    ${dashboardData.expenseByCategory.reduce((sum, cat) => sum + cat.value, 0).toFixed(0)}
                  </text>
                </svg>
              </div>

              {/* Legend */}
              <div className="flex-1 space-y-3 w-full">
                {dashboardData.expenseByCategory.map((cat, i) => {
                  const total = dashboardData.expenseByCategory.reduce((sum, c) => sum + c.value, 0);
                  const percentage = ((cat.value / total) * 100).toFixed(1);
                  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500', 'bg-green-500'];

                  return (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`w-4 h-4 rounded-full ${colors[i % colors.length]} flex-shrink-0`} />
                      <span className="text-sm text-gray-700 flex-1 font-medium">
                        {cat.name}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900 block">
                          ${cat.value.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-gray-400 text-sm">No expense data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-gray-900 font-semibold">Recent Transactions</h3>
          <button
            onClick={() => window.location.href = '/transactions'}
            className="text-blue-600 text-sm hover:underline"
          >
            View All
          </button>
        </div>

        <div className="space-y-3">
          {dashboardData.recentTransactions.length > 0 ? (
            dashboardData.recentTransactions.map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition"
              >
                <div>
                  <p className="text-gray-900">{t.description || 'Transaction'}</p>
                  <p className="text-sm text-gray-500">
                    {t.category} • {formatTimeAgo(t.date)}
                  </p>
                </div>

                <p
                  className={`font-semibold ${t.type === 'INCOME' ? "text-green-600" : "text-red-600"
                    }`}
                >
                  {t.type === 'INCOME' ? "+" : "-"}${t.amount.toFixed(2)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No transactions yet. Start by adding one!</p>
          )}
        </div>
      </div>
    </div>
  );
}
