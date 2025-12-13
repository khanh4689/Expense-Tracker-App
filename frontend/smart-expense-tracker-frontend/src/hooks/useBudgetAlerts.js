import { useEffect, useCallback } from 'react';
import { useToast } from '../context/ToastContext';

/**
 * Custom hook to monitor budget and trigger alerts
 * @param {number} dailyLimit - Daily budget limit
 * @param {number} monthlyLimit - Monthly budget limit
 * @param {number} dailySpending - Current daily spending
 * @param {number} monthlySpending - Current monthly spending
 */
export const useBudgetAlerts = (dailyLimit, monthlyLimit, dailySpending, monthlySpending) => {
    const { showWarning, showError, showInfo } = useToast();

    const checkBudgetStatus = useCallback(() => {
        // Check daily budget
        if (dailyLimit > 0 && dailySpending > 0) {
            const dailyPercentage = (dailySpending / dailyLimit) * 100;

            if (dailyPercentage >= 100) {
                showError(`🚨 Daily budget exceeded! You've spent $${dailySpending.toFixed(2)} of $${dailyLimit.toFixed(2)}`);
            } else if (dailyPercentage >= 80) {
                showWarning(`⚠️ Approaching daily budget limit (${dailyPercentage.toFixed(0)}%)! $${(dailyLimit - dailySpending).toFixed(2)} remaining`);
            } else if (dailyPercentage >= 50 && dailyPercentage < 51) {
                showInfo(`You've used 50% of your daily budget. $${(dailyLimit - dailySpending).toFixed(2)} remaining`);
            }
        }

        // Check monthly budget
        if (monthlyLimit > 0 && monthlySpending > 0) {
            const monthlyPercentage = (monthlySpending / monthlyLimit) * 100;

            if (monthlyPercentage >= 100) {
                showError(`🚨 Monthly budget exceeded! You've spent $${monthlySpending.toFixed(2)} of $${monthlyLimit.toFixed(2)}`);
            } else if (monthlyPercentage >= 80) {
                showWarning(`⚠️ Approaching monthly budget limit (${monthlyPercentage.toFixed(0)}%)! $${(monthlyLimit - monthlySpending).toFixed(2)} remaining`);
            } else if (monthlyPercentage >= 50 && monthlyPercentage < 51) {
                showInfo(`You've used 50% of your monthly budget. $${(monthlyLimit - monthlySpending).toFixed(2)} remaining`);
            }
        }
    }, [dailyLimit, monthlyLimit, dailySpending, monthlySpending, showWarning, showError, showInfo]);

    const checkAfterTransaction = useCallback((transactionAmount, transactionType) => {
        if (transactionType !== 'EXPENSE') return;

        const newDailySpending = dailySpending + transactionAmount;
        const newMonthlySpending = monthlySpending + transactionAmount;

        // Check if this transaction pushes over any threshold
        if (dailyLimit > 0) {
            const newDailyPercentage = (newDailySpending / dailyLimit) * 100;
            const oldDailyPercentage = (dailySpending / dailyLimit) * 100;

            if (newDailyPercentage >= 100 && oldDailyPercentage < 100) {
                showError(`🚨 This expense puts you over your daily budget! Total: $${newDailySpending.toFixed(2)}`);
            } else if (newDailyPercentage >= 80 && oldDailyPercentage < 80) {
                showWarning(`⚠️ You're now at ${newDailyPercentage.toFixed(0)}% of your daily budget`);
            }
        }

        if (monthlyLimit > 0) {
            const newMonthlyPercentage = (newMonthlySpending / monthlyLimit) * 100;
            const oldMonthlyPercentage = (monthlySpending / monthlyLimit) * 100;

            if (newMonthlyPercentage >= 100 && oldMonthlyPercentage < 100) {
                showError(`🚨 This expense puts you over your monthly budget! Total: $${newMonthlySpending.toFixed(2)}`);
            } else if (newMonthlyPercentage >= 80 && oldMonthlyPercentage < 80) {
                showWarning(`⚠️ You're now at ${newMonthlyPercentage.toFixed(0)}% of your monthly budget`);
            }
        }
    }, [dailyLimit, monthlyLimit, dailySpending, monthlySpending, showWarning, showError]);

    return {
        checkBudgetStatus,
        checkAfterTransaction
    };
};

export default useBudgetAlerts;
