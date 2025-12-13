package com.expensetracker.repository;

import com.expensetracker.entity.Budget;
import com.expensetracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByUser(User user);

    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId AND :date BETWEEN b.startDate AND b.endDate")
    List<Budget> findActiveBudgets(@Param("userId") Long userId, @Param("date") LocalDate date);

    // Check if budget exists for category in time range
    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId AND b.category = :category AND ((:startDate BETWEEN b.startDate AND b.endDate) OR (:endDate BETWEEN b.startDate AND b.endDate))")
    List<Budget> findOverlappingBudgets(@Param("userId") Long userId, @Param("category") String category,
            @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
