package com.expensetracker.service;

import java.time.LocalDate;
import java.util.Map;

public interface ReportService {
    Map<String, Object> getWeeklyStatistics(LocalDate date); // week containing date or ending at date

    Map<String, Object> getMonthlyStatistics(int year, int month);
}
