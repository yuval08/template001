-- Initialize database with extensions and basic setup
-- This script runs automatically when the PostgreSQL container starts

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable case-insensitive text extension
CREATE EXTENSION IF NOT EXISTS "citext";

-- Create a function to update modified timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create indexes for commonly queried fields (will be applied after migrations)
-- These are examples and should match your entity designs

-- Performance optimization settings
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;
ALTER SYSTEM SET log_checkpoints = on;
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;

-- Reload configuration
SELECT pg_reload_conf();