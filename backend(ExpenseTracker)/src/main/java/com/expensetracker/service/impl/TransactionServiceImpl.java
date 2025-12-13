package com.expensetracker.service.impl;

import com.expensetracker.dto.TransactionDto;
import com.expensetracker.entity.Transaction;
import com.expensetracker.entity.User;
import com.expensetracker.exception.CustomExceptions;
import com.expensetracker.repository.TransactionRepository;
import com.expensetracker.service.AuthService;
import com.expensetracker.service.BudgetService;
import com.expensetracker.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final BudgetService budgetService;
    private final AuthService authService;

    @Override
    @Transactional
    public TransactionDto createTransaction(TransactionDto dto) {
        User user = authService.getCurrentUser();

        // 1. Validate Amount (positive check is in DTO, but explicit check doesn't
        // hurt)
        if (dto.getAmount().signum() <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }

        // 2. Business Logic: Check Budget Availability (Only for Expenses)
        if (dto.getType() == Transaction.TransactionType.EXPENSE) {
            // Check if this transaction exceeds any active budget
            budgetService.checkBudgetAvailability(dto.getAmount(), dto.getCategory(), dto.getDate());
        }

        // 3. Save Data
        Transaction transaction = Transaction.builder()
                .amount(dto.getAmount())
                .category(dto.getCategory())
                .description(dto.getDescription())
                .date(dto.getDate())
                .type(dto.getType())
                .user(user)
                .build();

        Transaction saved = transactionRepository.save(transaction);
        return mapToDto(saved);
    }

    @Override
    public List<TransactionDto> getAllTransactions() {
        User user = authService.getCurrentUser();
        return transactionRepository.findByUser(user).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public TransactionDto getTransactionById(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Transaction not found"));
        // Security check: ensure transaction belongs to user?
        // Ideally yes.
        User user = authService.getCurrentUser();
        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new CustomExceptions.ResourceNotFoundException("Transaction not found");
        }
        return mapToDto(transaction);
    }

    @Override
    public void deleteTransaction(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Transaction not found"));
        User user = authService.getCurrentUser();
        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new CustomExceptions.ResourceNotFoundException("Transaction not found");
        }
        transactionRepository.delete(transaction);
    }

    private TransactionDto mapToDto(Transaction transaction) {
        return TransactionDto.builder()
                .id(transaction.getId())
                .amount(transaction.getAmount())
                .category(transaction.getCategory())
                .description(transaction.getDescription())
                .date(transaction.getDate())
                .type(transaction.getType())
                .build();
    }
}
