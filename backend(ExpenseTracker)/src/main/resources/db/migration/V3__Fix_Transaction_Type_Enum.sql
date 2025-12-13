-- ============================================================================
-- Migration V3: Fix Transaction Type Enum Compatibility
-- Convert transaction_type_enum to VARCHAR for better Hibernate compatibility
-- ============================================================================

-- Step 1: Add a temporary column with VARCHAR type
ALTER TABLE transactions ADD COLUMN type_temp VARCHAR(20);

-- Step 2: Copy data from the enum column to the temporary column
UPDATE transactions SET type_temp = type::text;

-- Step 3: Drop the old enum column
ALTER TABLE transactions DROP COLUMN type;

-- Step 4: Rename the temporary column to the original name
ALTER TABLE transactions RENAME COLUMN type_temp TO type;

-- Step 5: Add NOT NULL constraint
ALTER TABLE transactions ALTER COLUMN type SET NOT NULL;

-- Step 6: Add CHECK constraint to ensure only valid values
ALTER TABLE transactions ADD CONSTRAINT chk_transaction_type 
    CHECK (type IN ('INCOME', 'EXPENSE'));

-- Step 7: Drop the enum type since it's no longer needed
DROP TYPE IF EXISTS transaction_type_enum;

-- Step 8: Add comment to document the change
COMMENT ON COLUMN transactions.type IS 'Transaction type: INCOME or EXPENSE (converted from enum to varchar for Hibernate compatibility)';

-- ============================================================================
-- Migration completed successfully
-- ============================================================================