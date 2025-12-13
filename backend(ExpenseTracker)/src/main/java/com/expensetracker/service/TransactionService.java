package com.expensetracker.service;

import com.expensetracker.dto.TransactionDto;

import java.util.List;

public interface TransactionService {
    TransactionDto createTransaction(TransactionDto dto);

    List<TransactionDto> getAllTransactions();

    TransactionDto getTransactionById(Long id);

    void deleteTransaction(Long id);
}
