import React, { useState, useEffect } from 'react';
import transactionService from '../api/transactionService';
import LoadingSpinner from '../components/LoadingSpinner';
import { Trash2, AlertCircle } from 'lucide-react';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const data = await transactionService.getAllTransactions();
            setTransactions(data);
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this transaction?')) {
            return;
        }

        setDeleteId(id);
        try {
            await transactionService.deleteTransaction(id);
            // Remove from UI immediately
            setTransactions(transactions.filter(t => t.id !== id));
        } catch (err) {
            setError(err.message || 'Failed to delete transaction');
        } finally {
            setDeleteId(null);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatAmount = (amount, type) => {
        const formattedAmount = parseFloat(amount).toFixed(2);
        const prefix = type === 'INCOME' ? '+' : '-';
        const colorClass = type === 'INCOME' ? 'text-green-600' : 'text-red-600';
        return (
            <span className={`font-semibold ${colorClass}`}>
                {prefix}${formattedAmount}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">Transactions</h1>
                <p className="text-gray-600">{transactions.length} total transactions</p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}

            {transactions.length === 0 ? (
                <div className="bg-white shadow-md rounded-lg p-12 text-center">
                    <p className="text-gray-500 text-lg">No transactions found</p>
                    <p className="text-gray-400 mt-2">Start by adding your first transaction</p>
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {transactions.map((transaction) => (
                                <tr key={transaction.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(transaction.date)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {transaction.description || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                        {transaction.category}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.type === 'INCOME'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {transaction.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                        {formatAmount(transaction.amount, transaction.type)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <button
                                            onClick={() => handleDelete(transaction.id)}
                                            disabled={deleteId === transaction.id}
                                            className="text-red-600 hover:text-red-800 disabled:opacity-50 transition"
                                            title="Delete transaction"
                                        >
                                            {deleteId === transaction.id ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600 inline-block"></div>
                                            ) : (
                                                <Trash2 className="h-5 w-5 inline-block" />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Transactions;
