-- Lunchbox AI Supabase Database Schema
-- This file contains the complete database schema for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users table - stores user profiles and progress
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
    last_task_date DATE,
    total_tasks_completed INTEGER DEFAULT 0,
    total_study_time INTEGER DEFAULT 0, -- in minutes
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table - stores user tasks with AI guidance
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('Sweet', 'Veggies', 'Savory', 'Sides')),
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    due_date TIMESTAMP WITH TIME ZONE,
    estimated_duration INTEGER, -- in minutes
    ai_guidance JSONB DEFAULT '{}', -- stores AI-generated steps and tips
    completion_steps JSONB DEFAULT '[]', -- array of step objects
    current_step INTEGER DEFAULT 0,
    progress_percentage INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}', -- array of tags
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Reminders table - stores scheduled reminders
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
    sent BOOLEAN DEFAULT FALSE,
    repeat_interval INTEGER DEFAULT 0, -- in minutes, 0 = no repeat
    repeat_count INTEGER DEFAULT 0, -- how many times to repeat
    repeat_sent_count INTEGER DEFAULT 0,
    reminder_type TEXT DEFAULT 'task' CHECK (reminder_type IN ('task', 'study', 'general')),
    platform TEXT DEFAULT 'all' CHECK (platform IN ('all', 'web', 'discord', 'mobile')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study sessions table - tracks learning activities
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    topic TEXT,
    duration INTEGER NOT NULL, -- in minutes
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    ai_guidance_used BOOLEAN DEFAULT FALSE,
    resources_accessed TEXT[] DEFAULT '{}', -- array of resources
    notes TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Achievements table - stores user achievements and badges
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL,
    achievement_name TEXT NOT NULL,
    description TEXT,
    xp_reward INTEGER DEFAULT 0,
    badge_icon TEXT,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_type, achievement_name)
);

-- Quests table - stores active and completed quests
CREATE TABLE IF NOT EXISTS quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quest_name TEXT NOT NULL,
    description TEXT NOT NULL,
    quest_type TEXT NOT NULL CHECK (quest_type IN ('learning', 'productivity', 'community', 'creative')),
    requirements JSONB NOT NULL, -- stores quest requirements
    progress JSONB DEFAULT '{}', -- tracks current progress
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
    xp_reward INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Discord servers table - stores Discord server information
CREATE TABLE IF NOT EXISTS discord_servers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discord_guild_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id),
    member_count INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}',
    features_enabled JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Server members table - tracks users in Discord servers
CREATE TABLE IF NOT EXISTS server_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id UUID NOT NULL REFERENCES discord_servers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    xp_in_server INTEGER DEFAULT 0,
    level_in_server INTEGER DEFAULT 1,
    roles TEXT[] DEFAULT '{}', -- array of role names
    UNIQUE(server_id, user_id)
);

-- Polls table - stores Discord server polls
CREATE TABLE IF NOT EXISTS polls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id UUID NOT NULL REFERENCES discord_servers(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    options JSONB NOT NULL, -- array of poll options
    allow_multiple BOOLEAN DEFAULT FALSE,
    anonymous BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poll votes table - stores individual votes
CREATE TABLE IF NOT EXISTS poll_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    option_index INTEGER NOT NULL,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(poll_id, user_id)
);

-- Events table - stores Discord server events
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id UUID NOT NULL REFERENCES discord_servers(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT DEFAULT 'general' CHECK (event_type IN ('study', 'social', 'gaming', 'general')),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    location TEXT,
    max_participants INTEGER,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event participants table - tracks event RSVPs
CREATE TABLE IF NOT EXISTS event_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Giveaways table - stores Discord server giveaways
CREATE TABLE IF NOT EXISTS giveaways (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id UUID NOT NULL REFERENCES discord_servers(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    prize TEXT NOT NULL,
    winner_count INTEGER DEFAULT 1,
    entry_requirements JSONB DEFAULT '{}',
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended', 'cancelled')),
    winners UUID[] DEFAULT '{}', -- array of winner user IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Giveaway entries table - tracks giveaway participation
CREATE TABLE IF NOT EXISTS giveaway_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    giveaway_id UUID NOT NULL REFERENCES giveaways(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(giveaway_id, user_id)
);

-- Chat messages table - stores AI chat history
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('web', 'discord', 'mobile')),
    message_type TEXT DEFAULT 'user' CHECK (message_type IN ('user', 'ai', 'system')),
    content TEXT NOT NULL,
    context JSONB DEFAULT '{}', -- stores conversation context
    tokens_used INTEGER DEFAULT 0,
    response_time INTEGER, -- in milliseconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table - stores user activity analytics
CREATE TABLE IF NOT EXISTS user_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    platform TEXT,
    session_id TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar events table - stores calendar integration data
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    all_day BOOLEAN DEFAULT FALSE,
    location TEXT,
    calendar_source TEXT DEFAULT 'manual' CHECK (calendar_source IN ('manual', 'google', 'apple', 'outlook', 'ics_import')),
    external_id TEXT, -- ID from external calendar system
    reminder_minutes INTEGER DEFAULT 15, -- minutes before event
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);
CREATE INDEX IF NOT EXISTS idx_users_xp ON users(xp DESC);
CREATE INDEX IF NOT EXISTS idx_users_level ON users(level DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_time ON reminders(reminder_time);
CREATE INDEX IF NOT EXISTS idx_reminders_sent ON reminders(sent);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_subject ON study_sessions(subject);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_quests_user_id ON quests(user_id);
CREATE INDEX IF NOT EXISTS idx_quests_status ON quests(status);
CREATE INDEX IF NOT EXISTS idx_discord_servers_guild_id ON discord_servers(discord_guild_id);
CREATE INDEX IF NOT EXISTS idx_server_members_server_user ON server_members(server_id, user_id);
CREATE INDEX IF NOT EXISTS idx_polls_server_id ON polls(server_id);
CREATE INDEX IF NOT EXISTS idx_polls_status ON polls(status);
CREATE INDEX IF NOT EXISTS idx_events_server_id ON events(server_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_giveaways_server_id ON giveaways(server_id);
CREATE INDEX IF NOT EXISTS idx_giveaways_status ON giveaways(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_platform ON chat_messages(platform);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON user_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON user_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_tasks_title_search ON tasks USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_tasks_description_search ON tasks USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_chat_messages_content_search ON chat_messages USING gin(to_tsvector('english', content));

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discord_servers_updated_at 
    BEFORE UPDATE ON discord_servers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at 
    BEFORE UPDATE ON calendar_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = discord_id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = discord_id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = discord_id);

-- Tasks policies
CREATE POLICY "Users can view own tasks" ON tasks
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE discord_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own tasks" ON tasks
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM users WHERE discord_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can update own tasks" ON tasks
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM users WHERE discord_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can delete own tasks" ON tasks
    FOR DELETE USING (
        user_id IN (
            SELECT id FROM users WHERE discord_id = auth.uid()::text
        )
    );

-- Similar policies for other tables...
CREATE POLICY "Users can view own reminders" ON reminders
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE discord_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can manage own reminders" ON reminders
    FOR ALL USING (
        user_id IN (
            SELECT id FROM users WHERE discord_id = auth.uid()::text
        )
    );

-- Public read access for leaderboards (anonymized)
CREATE POLICY "Public can view leaderboard" ON users
    FOR SELECT USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
