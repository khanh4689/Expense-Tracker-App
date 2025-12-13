-- ============================================================================
-- Migration V4: Add OAuth2 Support to Users Table
-- Add avatar_url and auth_provider columns for Google OAuth2 integration
-- ============================================================================

-- Step 1: Add avatar_url column
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);

-- Step 2: Add auth_provider column with default value
ALTER TABLE users ADD COLUMN auth_provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL';

-- Step 3: Add CHECK constraint for auth_provider
ALTER TABLE users ADD CONSTRAINT chk_auth_provider 
    CHECK (auth_provider IN ('LOCAL', 'GOOGLE'));

-- Step 4: Make password nullable for OAuth2 users
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- Step 5: Add comments to document the changes
COMMENT ON COLUMN users.avatar_url IS 'User avatar URL from OAuth2 provider';
COMMENT ON COLUMN users.auth_provider IS 'Authentication provider: LOCAL or GOOGLE';
COMMENT ON COLUMN users.password IS 'User password (nullable for OAuth2 users)';

-- ============================================================================
-- Migration completed successfully
-- ============================================================================