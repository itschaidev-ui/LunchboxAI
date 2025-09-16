-- Lunchbox AI Database Schema
-- This file contains the complete database schema for the Lunchbox AI platform

-- Users table - stores user profiles and progress
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discord_id TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    discriminator TEXT,
    email TEXT,
    avatar_url TEXT,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak_count INTEGER DEFAULT 0,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_task_date DATE,
    total_tasks_completed INTEGER DEFAULT 0,
    total_study_time INTEGER DEFAULT 0, -- in minutes
    preferences JSON DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table - stores user tasks with AI guidance
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('Sweet', 'Veggies', 'Savory', 'Sides')),
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    due_date TIMESTAMP,
    estimated_duration INTEGER, -- in minutes
    ai_guidance JSON DEFAULT '{}', -- stores AI-generated steps and tips
    completion_steps JSON DEFAULT '[]', -- array of step objects
    current_step INTEGER DEFAULT 0,
    progress_percentage INTEGER DEFAULT 0,
    tags TEXT DEFAULT '[]', -- JSON array of tags
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Reminders table - stores scheduled reminders
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    reminder_time TIMESTAMP NOT NULL,
    sent BOOLEAN DEFAULT FALSE,
    repeat_interval INTEGER DEFAULT 0, -- in minutes, 0 = no repeat
    repeat_count INTEGER DEFAULT 0, -- how many times to repeat
    repeat_sent_count INTEGER DEFAULT 0,
    reminder_type TEXT DEFAULT 'task' CHECK (reminder_type IN ('task', 'study', 'general')),
    platform TEXT DEFAULT 'all' CHECK (platform IN ('all', 'web', 'discord', 'mobile')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Study sessions table - tracks learning activities
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    topic TEXT,
    duration INTEGER NOT NULL, -- in minutes
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    ai_guidance_used BOOLEAN DEFAULT FALSE,
    resources_accessed TEXT DEFAULT '[]', -- JSON array of resources
    notes TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Achievements table - stores user achievements and badges
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL,
    achievement_name TEXT NOT NULL,
    description TEXT,
    xp_reward INTEGER DEFAULT 0,
    badge_icon TEXT,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_type, achievement_name)
);

-- Quests table - stores active and completed quests
CREATE TABLE IF NOT EXISTS quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quest_name TEXT NOT NULL,
    description TEXT NOT NULL,
    quest_type TEXT NOT NULL CHECK (quest_type IN ('learning', 'productivity', 'community', 'creative')),
    requirements JSON NOT NULL, -- stores quest requirements
    progress JSON DEFAULT '{}', -- tracks current progress
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
    xp_reward INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Discord servers table - stores Discord server information
CREATE TABLE IF NOT EXISTS discord_servers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discord_guild_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    member_count INTEGER DEFAULT 0,
    settings JSON DEFAULT '{}',
    features_enabled JSON DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Server members table - tracks users in Discord servers
CREATE TABLE IF NOT EXISTS server_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    server_id TEXT NOT NULL REFERENCES discord_servers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    xp_in_server INTEGER DEFAULT 0,
    level_in_server INTEGER DEFAULT 1,
    roles TEXT DEFAULT '[]', -- JSON array of role names
    UNIQUE(server_id, user_id)
);

-- Polls table - stores Discord server polls
CREATE TABLE IF NOT EXISTS polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    server_id TEXT NOT NULL REFERENCES discord_servers(id) ON DELETE CASCADE,
    created_by TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    options JSON NOT NULL, -- array of poll options
    allow_multiple BOOLEAN DEFAULT FALSE,
    anonymous BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Poll votes table - stores individual votes
CREATE TABLE IF NOT EXISTS poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    option_index INTEGER NOT NULL,
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(poll_id, user_id)
);

-- Events table - stores Discord server events
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    server_id TEXT NOT NULL REFERENCES discord_servers(id) ON DELETE CASCADE,
    created_by TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT DEFAULT 'general' CHECK (event_type IN ('study', 'social', 'gaming', 'general')),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    location TEXT,
    max_participants INTEGER,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event participants table - tracks event RSVPs
CREATE TABLE IF NOT EXISTS event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
);

-- Giveaways table - stores Discord server giveaways
CREATE TABLE IF NOT EXISTS giveaways (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    server_id TEXT NOT NULL REFERENCES discord_servers(id) ON DELETE CASCADE,
    created_by TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    prize TEXT NOT NULL,
    winner_count INTEGER DEFAULT 1,
    entry_requirements JSON DEFAULT '{}',
    ends_at TIMESTAMP NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended', 'cancelled')),
    winners TEXT DEFAULT '[]', -- JSON array of winner user IDs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Giveaway entries table - tracks giveaway participation
CREATE TABLE IF NOT EXISTS giveaway_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    giveaway_id TEXT NOT NULL REFERENCES giveaways(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(giveaway_id, user_id)
);

-- Chat messages table - stores AI chat history
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('web', 'discord', 'mobile')),
    message_type TEXT DEFAULT 'user' CHECK (message_type IN ('user', 'ai', 'system')),
    content TEXT NOT NULL,
    context JSON DEFAULT '{}', -- stores conversation context
    tokens_used INTEGER DEFAULT 0,
    response_time INTEGER, -- in milliseconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics table - stores user activity analytics
CREATE TABLE IF NOT EXISTS user_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSON DEFAULT '{}',
    platform TEXT,
    session_id TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Calendar events table - stores calendar integration data
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    all_day BOOLEAN DEFAULT FALSE,
    location TEXT,
    calendar_source TEXT DEFAULT 'manual' CHECK (calendar_source IN ('manual', 'google', 'apple', 'outlook', 'ics_import')),
    external_id TEXT, -- ID from external calendar system
    reminder_minutes INTEGER DEFAULT 15, -- minutes before event
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);
CREATE INDEX IF NOT EXISTS idx_users_xp ON users(xp DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_time ON reminders(reminder_time);
CREATE INDEX IF NOT EXISTS idx_reminders_sent ON reminders(sent);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_quests_user_id ON quests(user_id);
CREATE INDEX IF NOT EXISTS idx_quests_status ON quests(status);
CREATE INDEX IF NOT EXISTS idx_discord_servers_guild_id ON discord_servers(discord_guild_id);
CREATE INDEX IF NOT EXISTS idx_server_members_server_user ON server_members(server_id, user_id);
CREATE INDEX IF NOT EXISTS idx_polls_server_id ON polls(server_id);
CREATE INDEX IF NOT EXISTS idx_events_server_id ON events(server_id);
CREATE INDEX IF NOT EXISTS idx_giveaways_server_id ON giveaways(server_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON user_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);

-- Triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_users_timestamp ON users;
DROP TRIGGER IF EXISTS update_tasks_timestamp ON tasks;
DROP TRIGGER IF EXISTS update_discord_servers_timestamp ON discord_servers;
DROP TRIGGER IF EXISTS update_calendar_events_timestamp ON calendar_events;

-- Create triggers
CREATE TRIGGER update_users_timestamp 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_timestamp 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discord_servers_timestamp 
    BEFORE UPDATE ON discord_servers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_timestamp 
    BEFORE UPDATE ON calendar_events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
