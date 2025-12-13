import React, { useState, useEffect } from 'react';
import { Filter, Download, TrendingUp, TrendingDown, DollarSign, AlertCircle } from "lucide-react";
import transactionService from '../api/transactionService';
import reportService from '../api/reportService';

export default function Reports() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter states
    const [dateFrom, setDateFrom] = useState(() => {
        const date = new Date();
        date.setDate(1); // First day of current month
        return date.toISOString().split('T')[0];
    });
    const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
    const [filterType, setFilterType] = useState('all');

    // Data states
    const [summaryData, setSummaryData] = useState({
        totalIncome: 0,
        totalExpense: 0,
        netSavings: 0,
    });
    const [lineChartData, setLineChartData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);

    useEffect(() => {
        fetchReportData();
    }, [dateFrom, dateTo, filterType]);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch transactions
            const transactions = await transactionService.getAllTransactions();

            console.log('Fetched transactions for reports:', transactions);

            // Filter by date range and type
            const filtered = transactions.filter(t => {
                const tDate = new Date(t.date);
                const from = new Date(dateFrom);
                const to = new Date(dateTo);

                const inDateRange = tDate >= from && tDate <= to;
                const matchesType = filterType === 'all' || t.type === filterType.toUpperCase();

                return inDateRange && matchesType;
            });

            // Calculate summary
            const income = filtered
                .filter(t => t.type === 'INCOME')
                .reduce((sum, t) => sum + t.amount, 0);

            const expense = filtered
                .filter(t => t.type === 'EXPENSE')
                .reduce((sum, t) => sum + t.amount, 0);

            setSummaryData({
                totalIncome: income,
                totalExpense: expense,
                netSavings: income - expense
            });

            // Prepare line chart data (daily)
            const dailyData = prepareDailyData(filtered);
            setLineChartData(dailyData);

            // Prepare category data
            const catData = prepareCategoryData(filtered);
            setCategoryData(catData);

        } catch (err) {
            console.error('Error fetching report data:', err);
            setError('Failed to load report data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const prepareDailyData = (transactions) => {
        const dailyMap = {};

        transactions.forEach(t => {
            const date = t.date;
            if (!dailyMap[date]) {
                dailyMap[date] = { date, income: 0, expense: 0 };
            }

            if (t.type === 'INCOME') {
                dailyMap[date].income += t.amount;
            } else {
                dailyMap[date].expense += t.amount;
            }
        });

        return Object.values(dailyMap)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(-7); // Last 7 days
    };

    const prepareCategoryData = (transactions) => {
        const categoryMap = {};
        const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

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

    const handleExport = () => {
        // Create CSV content
        const csvContent = [
            ['Date', 'Type', 'Category', 'Amount', 'Description'],
            ...lineChartData.map(d => [
                d.date,
                'Summary',
                `Income: $${d.income.toFixed(2)}, Expense: $${d.expense.toFixed(2)}`,
                '',
                ''
            ])
        ].map(row => row.join(',')).join('\n');

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expense-report-${dateFrom}-to-${dateTo}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading reports...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-gray-800 mb-2 text-2xl font-semibold">
                    Financial Reports
                </h2>
                <p className="text-gray-600">
                    Analyze your income and expenses with detailed charts
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-red-700 font-medium">{error}</p>
                        <button
                            onClick={fetchReportData}
                            className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {/* FILTER SECTION */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="h-5 w-5 text-blue-600" />
                    <h3 className="text-gray-900 font-semibold">Filter Reports</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Date From */}
                    <div className="space-y-2">
                        <label className="block text-gray-700 font-medium text-sm">From Date</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full h-11 border border-gray-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Date To */}
                    <div className="space-y-2">
                        <label className="block text-gray-700 font-medium text-sm">To Date</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full h-11 border border-gray-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Select Type */}
                    <div className="space-y-2">
                        <label className="block text-gray-700 font-medium text-sm">Transaction Type</label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full h-11 border border-gray-300 rounded-lg px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>

                    {/* Export Button */}
                    <div className="flex items-end">
                        <button
                            onClick={handleExport}
                            className="w-full h-11 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 flex items-center justify-center gap-2 transition-colors"
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* INCOME */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-green-100 text-sm">Total Income</p>
                            <h3 className="text-3xl font-bold">${summaryData.totalIncome.toFixed(2)}</h3>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                    </div>
                    <p className="text-sm text-green-100">
                        {dateFrom} to {dateTo}
                    </p>
                </div>

                {/* EXPENSE */}
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-red-100 text-sm">Total Expense</p>
                            <h3 className="text-3xl font-bold">${summaryData.totalExpense.toFixed(2)}</h3>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl">
                            <TrendingDown className="h-6 w-6" />
                        </div>
                    </div>
                    <p className="text-sm text-red-100">
                        {dateFrom} to {dateTo}
                    </p>
                </div>

                {/* NET SAVINGS */}
                <div className={`bg-gradient-to-br ${summaryData.netSavings >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} rounded-2xl shadow-lg p-6 text-white`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-blue-100 text-sm">Net {summaryData.netSavings >= 0 ? 'Savings' : 'Deficit'}</p>
                            <h3 className="text-3xl font-bold">${Math.abs(summaryData.netSavings).toFixed(2)}</h3>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl">
                            <DollarSign className="h-6 w-6" />
                        </div>
                    </div>
                    <p className="text-sm text-blue-100">
                        {summaryData.netSavings >= 0 ? 'Positive balance' : 'Negative balance'}
                    </p>
                </div>
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LINE CHART (Simple Bar Chart) */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-gray-900 font-semibold mb-6">Income vs Expense (Daily)</h3>

                    {lineChartData.length > 0 ? (
                        <div className="space-y-4">
                            {lineChartData.map((day, i) => {
                                const maxValue = Math.max(
                                    ...lineChartData.map(d => Math.max(d.income, d.expense)),
                                    1
                                );

                                return (
                                    <div key={i} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-gray-700">{formatDate(day.date)}</span>
                                            <div className="flex gap-4 text-xs">
                                                <span className="text-green-600">+${day.income.toFixed(0)}</span>
                                                <span className="text-red-600">-${day.expense.toFixed(0)}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 h-8">
                                            {/* Income bar */}
                                            <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 rounded-lg transition-all"
                                                    style={{ width: `${(day.income / maxValue) * 100}%` }}
                                                />
                                            </div>
                                            {/* Expense bar */}
                                            <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden">
                                                <div
                                                    className="h-full bg-red-500 rounded-lg transition-all"
                                                    style={{ width: `${(day.expense / maxValue) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <p className="text-gray-400">No data for selected period</p>
                        </div>
                    )}
                </div>

                {/* PIE CHART */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-gray-900 font-semibold mb-6">Expense Breakdown</h3>

                    {categoryData.length > 0 ? (
                        <div className="flex flex-col items-center gap-6">
                            {/* Pie Chart SVG */}
                            <div className="relative w-48 h-48">
                                <svg viewBox="0 0 200 200" className="transform -rotate-90">
                                    {(() => {
                                        const total = categoryData.reduce((sum, cat) => sum + cat.value, 0);
                                        let currentAngle = 0;

                                        return categoryData.map((cat, i) => {
                                            const percentage = (cat.value / total) * 100;
                                            const angle = (percentage / 100) * 360;
                                            const startAngle = currentAngle;
                                            const endAngle = currentAngle + angle;

                                            const startRad = (startAngle * Math.PI) / 180;
                                            const endRad = (endAngle * Math.PI) / 180;
                                            const x1 = 100 + 90 * Math.cos(startRad);
                                            const y1 = 100 + 90 * Math.sin(startRad);
                                            const x2 = 100 + 90 * Math.cos(endRad);
                                            const y2 = 100 + 90 * Math.sin(endRad);
                                            const largeArc = angle > 180 ? 1 : 0;

                                            currentAngle = endAngle;

                                            return (
                                                <g key={i}>
                                                    <path
                                                        d={`M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                                        fill={cat.color}
                                                        stroke="white"
                                                        strokeWidth="2"
                                                    />
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
                                    <circle cx="100" cy="100" r="50" fill="white" />
                                </svg>
                            </div>

                            {/* Legend */}
                            <div className="w-full space-y-2">
                                {categoryData.map((cat, i) => {
                                    const total = categoryData.reduce((sum, c) => sum + c.value, 0);
                                    const percentage = ((cat.value / total) * 100).toFixed(1);

                                    return (
                                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                                            <div
                                                className="w-4 h-4 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: cat.color }}
                                            />
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
                        <div className="flex items-center justify-center h-64">
                            <p className="text-gray-400">No expense data</p>
                        </div>
                    )}
                </div>
            </div>

            {/* TOP CATEGORIES */}
            {categoryData.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-gray-900 mb-4 font-semibold">Top Spending Categories</h3>

                    <div className="space-y-3">
                        {categoryData.map((cat, i) => {
                            const total = categoryData.reduce((sum, c) => sum + c.value, 0);
                            const percentage = ((cat.value / total) * 100).toFixed(1);

                            return (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                                            style={{ backgroundColor: cat.color }}
                                        >
                                            #{i + 1}
                                        </div>
                                        <div>
                                            <p className="text-gray-900 font-medium">{cat.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {percentage}% of total expenses
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-red-600 font-bold text-lg">
                                        ${cat.value.toFixed(2)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
