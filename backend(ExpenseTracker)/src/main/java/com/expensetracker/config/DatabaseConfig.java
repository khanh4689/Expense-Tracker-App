package com.expensetracker.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableJpaRepositories(basePackages = "com.expensetracker.repository")
@EntityScan(basePackages = "com.expensetracker.entity")
@EnableTransactionManagement
public class DatabaseConfig {
    // This class ensures proper JPA configuration
}