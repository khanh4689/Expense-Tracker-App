package com.expensetracker.service;

import com.expensetracker.dto.BudgetDto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface BudgetService {
    BudgetDto createBudget(BudgetDto dto);

    List<BudgetDto> getAllBudgets();

    void checkBudgetAvailability(BigDecimal amount, String category, LocalDate date);
}
