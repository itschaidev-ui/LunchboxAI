const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'lunchbox.db');
const db = new sqlite3.Database(dbPath);

async function initializeDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Users table
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    discord_id TEXT UNIQUE NOT NULL,
                    username TEXT NOT NULL,
                    xp INTEGER DEFAULT 0,
                    level INTEGER DEFAULT 1,
                    streak_count INTEGER DEFAULT 0,
                    last_active DATE DEFAULT CURRENT_TIMESTAMP,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Tasks table
            db.run(`
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT,
                    category TEXT CHECK(category IN ('sweet', 'veggies', 'savory', 'sides')) NOT NULL,
                    priority INTEGER DEFAULT 1,
                    due_date DATETIME,
                    completed BOOLEAN DEFAULT FALSE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    completed_at DATETIME,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            `);

            // Reminders table
            db.run(`
                CREATE TABLE IF NOT EXISTS reminders (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    task_id INTEGER,
                    message TEXT NOT NULL,
                    remind_at DATETIME NOT NULL,
                    channel_id TEXT,
                    sent BOOLEAN DEFAULT FALSE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id),
                    FOREIGN KEY (task_id) REFERENCES tasks (id)
                )
            `);

            // Achievements table
            db.run(`
                CREATE TABLE IF NOT EXISTS achievements (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    achievement_type TEXT NOT NULL,
                    achievement_data TEXT,
                    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            `);

            // Study sessions table
            db.run(`
                CREATE TABLE IF NOT EXISTS study_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    subject TEXT NOT NULL,
                    topic TEXT,
                    duration_minutes INTEGER DEFAULT 0,
                    notes TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            `);

            logger.info('Database tables created successfully');
            resolve();
        });
    });
}

// Helper function to get or create user
function getOrCreateUser(discordId, username) {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT * FROM users WHERE discord_id = ?',
            [discordId],
            (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                if (row) {
                    resolve(row);
                } else {
                    // Create new user
                    db.run(
                        'INSERT INTO users (discord_id, username) VALUES (?, ?)',
                        [discordId, username],
                        function(err) {
                            if (err) {
                                reject(err);
                                return;
                            }
                            
                            // Return the new user
                            db.get(
                                'SELECT * FROM users WHERE id = ?',
                                [this.lastID],
                                (err, newRow) => {
                                    if (err) reject(err);
                                    else resolve(newRow);
                                }
                            );
                        }
                    );
                }
            }
        );
    });
}

// Helper function to add XP to user
function addXP(userId, amount) {
    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE users SET xp = xp + ?, last_active = CURRENT_TIMESTAMP WHERE id = ?',
            [amount, userId],
            function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            }
        );
    });
}

module.exports = {
    initializeDatabase,
    getOrCreateUser,
    addXP,
    db
};
