-- Quick Supabase Setup for Lunchbox AI
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (simplified for quick start)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discord_id TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    discriminator TEXT,
    email TEXT,
    avatar_url TEXT,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak_count INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_tasks_completed INTEGER DEFAULT 0,
    total_study_time INTEGER DEFAULT 0,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('Sweet', 'Veggies', 'Savory', 'Sides')),
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    due_date TIMESTAMP WITH TIME ZONE,
    estimated_duration INTEGER,
    ai_guidance JSONB DEFAULT '{}',
    completion_steps JSONB DEFAULT '[]',
    current_step INTEGER DEFAULT 0,
    progress_percentage INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('web', 'discord', 'mobile')),
    message_type TEXT DEFAULT 'user' CHECK (message_type IN ('user', 'ai', 'system')),
    content TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    tokens_used INTEGER DEFAULT 0,
    response_time INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table
CREATE TABLE IF NOT EXISTS user_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    platform TEXT,
    session_id TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON user_analytics(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = discord_id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = discord_id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = discord_id);

CREATE POLICY "Users can view own tasks" ON tasks
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE discord_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can manage own tasks" ON tasks
    FOR ALL USING (
        user_id IN (
            SELECT id FROM users WHERE discord_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can view own chat messages" ON chat_messages
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE discord_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own chat messages" ON chat_messages
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM users WHERE discord_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can view own analytics" ON user_analytics
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE discord_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own analytics" ON user_analytics
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM users WHERE discord_id = auth.uid()::text
        )
    );

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Insert a test user (optional)
INSERT INTO users (discord_id, username, email) 
VALUES ('test-user-123', 'TestUser', 'test@example.com')
ON CONFLICT (discord_id) DO NOTHING;

-- Success message
SELECT 'Lunchbox AI database setup completed successfully! 🍱' as message;
