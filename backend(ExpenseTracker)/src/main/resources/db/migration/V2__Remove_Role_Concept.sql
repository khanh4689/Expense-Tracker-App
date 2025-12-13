-- ============================================================================
-- Migration V2: Remove Role Concept from User Management
-- This migration safely removes all role-related structures from the database
-- ============================================================================

-- Step 1: Remove role column from users table if it exists
-- (Safe operation - column doesn't exist in current schema, but included for completeness)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE users DROP COLUMN role;
    END IF;
END $$;

-- Step 2: Drop user_role ENUM type if it exists
-- (Safe operation - type doesn't exist in current schema, but included for completeness)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'user_role'
    ) THEN
        DROP TYPE user_role;
    END IF;
END $$;

-- Step 3: Ensure users table has the correct structure without role
-- This is a verification step to ensure consistency
DO $$
BEGIN
    -- Verify that users table exists and has expected columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'users'
    ) THEN
        RAISE EXCEPTION 'Users table does not exist';
    END IF;
    
    -- Verify essential columns exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'enabled'
    ) THEN
        RAISE EXCEPTION 'Users table missing enabled column';
    END IF;
END $$;

-- Step 4: Add comment to document the change
COMMENT ON TABLE users IS 'User table without role-based access control - uses simple authentication model';

-- ============================================================================
-- Migration completed successfully
-- ============================================================================