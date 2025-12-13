package com.expensetracker.service.impl;

import com.expensetracker.dto.BudgetDto;
import com.expensetracker.entity.Budget;
import com.expensetracker.entity.Transaction;
import com.expensetracker.entity.User;
import com.expensetracker.exception.CustomExceptions;
import com.expensetracker.repository.BudgetRepository;
import com.expensetracker.repository.TransactionRepository;
import com.expensetracker.service.AuthService;
import com.expensetracker.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository; // Needed to calc current spend
    private final AuthService authService;

    @Override
    @Transactional
    public BudgetDto createBudget(BudgetDto dto) {
        User user = authService.getCurrentUser();

        // Validation: Start date < End date
        if (dto.getStartDate().isAfter(dto.getEndDate())) {
            throw new IllegalArgumentException("Start date must be before end date");
        }

        Budget budget = Budget.builder()
                .user(user)
                .amount(dto.getAmount())
                .category(dto.getCategory())
                .period(dto.getPeriod())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .build();

        Budget saved = budgetRepository.save(budget);
        return mapToDto(saved);
    }

    @Override
    public List<BudgetDto> getAllBudgets() {
        User user = authService.getCurrentUser();
        return budgetRepository.findByUser(user).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void checkBudgetAvailability(BigDecimal amount, String category, LocalDate date) {
        User user = authService.getCurrentUser();

        // 1. Find active budgets for this user and date
        // (Logic: budget.startDate <= date <= budget.endDate)
        List<Budget> activeBudgets = budgetRepository.findActiveBudgets(user.getId(), date);

        for (Budget budget : activeBudgets) {
            // 2. Check strict category match OR global budget (null category)
            boolean isGlobalMethod = budget.getCategory() == null || budget.getCategory().isEmpty();
            boolean isCategoryMatch = category.equalsIgnoreCase(budget.getCategory());

            if (isGlobalMethod || isCategoryMatch) {
                // 3. Calculate total spent in this budget's period (inclusive)
                // We need to sum all EXPENSE transactions in this range for this User
                // If it's a category budget, we filter transactions by category too?
                // Usually: Global budget counts ALL expenses. Category budget counts ONLY
                // category expenses.

                List<Transaction> transactions = transactionRepository.findByUserIdAndDateRange(
                        user.getId(), budget.getStartDate(), budget.getEndDate());

                BigDecimal totalSpent = BigDecimal.ZERO;

                for (Transaction t : transactions) {
                    // Filter logic
                    if (t.getType() == Transaction.TransactionType.EXPENSE) {
                        if (isGlobalMethod) {
                            totalSpent = totalSpent.add(t.getAmount());
                        } else if (t.getCategory().equalsIgnoreCase(budget.getCategory())) {
                            totalSpent = totalSpent.add(t.getAmount());
                        }
                    }
                }

                // 4. Compare
                BigDecimal projectedTotal = totalSpent.add(amount);
                if (projectedTotal.compareTo(budget.getAmount()) > 0) {
                    throw new CustomExceptions.BudgetExceededException(
                            String.format("Budget exceeded! limit: %s, current: %s, new: %s. Budget Type: %s",
                                    budget.getAmount(), totalSpent, amount,
                                    isGlobalMethod ? "Global" : budget.getCategory()));
                }
            }
        }
    }

    private BudgetDto mapToDto(Budget budget) {
        return BudgetDto.builder()
                .id(budget.getId())
                .amount(budget.getAmount())
                .category(budget.getCategory())
                .startDate(budget.getStartDate())
                .endDate(budget.getEndDate())
                .build();
    }
}
