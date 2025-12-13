package com.expensetracker.service.impl;

import com.expensetracker.entity.Transaction;
import com.expensetracker.entity.User;
import com.expensetracker.repository.TransactionRepository;
import com.expensetracker.service.AuthService;
import com.expensetracker.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final TransactionRepository transactionRepository;
    private final AuthService authService;

    @Override
    public Map<String, Object> getWeeklyStatistics(LocalDate date) {
        // Calculate start and end of the week (Monday to Sunday)
        LocalDate startOfWeek = date.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        LocalDate endOfWeek = date.with(TemporalAdjusters.nextOrSame(java.time.DayOfWeek.SUNDAY));

        return generateReport(startOfWeek, endOfWeek);
    }

    @Override
    public Map<String, Object> getMonthlyStatistics(int year, int month) {
        LocalDate startOfMonth = LocalDate.of(year, month, 1);
        LocalDate endOfMonth = startOfMonth.with(TemporalAdjusters.lastDayOfMonth());

        return generateReport(startOfMonth, endOfMonth);
    }

    private Map<String, Object> generateReport(LocalDate start, LocalDate end) {
        User user = authService.getCurrentUser();
        List<Transaction> transactions = transactionRepository.findByUserIdAndDateRange(user.getId(), start, end);

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;

        // Group by Category (only expenses)
        Map<String, BigDecimal> expenseByCategory = new HashMap<>();

        // Group by Day (expense)
        Map<LocalDate, BigDecimal> expenseByDay = new HashMap<>();

        for (Transaction t : transactions) {
            if (t.getType() == Transaction.TransactionType.INCOME) {
                totalIncome = totalIncome.add(t.getAmount());
            } else {
                totalExpense = totalExpense.add(t.getAmount());

                // Category Grouping
                expenseByCategory.merge(t.getCategory(), t.getAmount(), BigDecimal::add);

                // Day Grouping
                expenseByDay.merge(t.getDate(), t.getAmount(), BigDecimal::add);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("totalIncome", totalIncome);
        response.put("totalExpense", totalExpense);
        response.put("netBalance", totalIncome.subtract(totalExpense));
        response.put("expenseByCategory", expenseByCategory);
        response.put("expenseByDay", expenseByDay);

        return response;
    }
}
