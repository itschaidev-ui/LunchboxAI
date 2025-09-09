# 🍱 Lunchbox AI - Setup Guide

Welcome to Lunchbox AI! This guide will help you get your multi-platform productivity assistant up and running.

## 📋 Prerequisites

Before you begin, make sure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Discord Bot Token** (from Discord Developer Portal)
- **OpenAI API Key** (for AI features)
- **Git** (for version control)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd LunchboxAiAllPlatforms
```

### 2. Set Up Discord Bot

1. **Create Discord Application**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Click "New Application" and give it a name (e.g., "Lunchbox AI")
   - Go to "Bot" section and create a bot
   - Copy the bot token

2. **Set Up Environment Variables**
   ```bash
   cd discord-bot
   cp env.example .env
   ```
   
   Edit `.env` file with your tokens:
   ```env
   DISCORD_TOKEN=your_bot_token_here
   DISCORD_CLIENT_ID=your_client_id_here
   DISCORD_GUILD_ID=your_test_server_id_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Install Dependencies and Start**
   ```bash
   npm install
   npm run dev
   ```

4. **Deploy Slash Commands**
   ```bash
   node deploy.js
   ```

### 3. Set Up Web Dashboard

1. **Navigate to Web Dashboard**
   ```bash
   cd ../web-dashboard
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   Create `.env.local` file:
   ```env
   DISCORD_CLIENT_ID=your_client_id_here
   DISCORD_CLIENT_SECRET=your_client_secret_here
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_random_secret_here
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   Visit [http://localhost:3000](http://localhost:3000)

## 🎯 Features Overview

### Discord Bot Features
- **Task Management**: Add, list, and complete tasks
- **AI Chat**: Natural language interaction
- **Reminders**: Set custom reminders
- **Study Help**: Get AI-powered study assistance
- **Profile**: View your progress and stats

### Web Dashboard Features
- **Modern UI**: Beautiful, responsive interface
- **Task Management**: Full task CRUD operations
- **Calendar Integration**: Sync with your calendar
- **Customization**: Themes, fonts, and lunchbox styles
- **Real-time Sync**: Updates across all platforms

## 🛠️ Development Commands

### Discord Bot
```bash
# Start development server
npm run dev

# Start production server
npm start

# Deploy slash commands
node deploy.js

# Run tests
npm test
```

### Web Dashboard
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 📁 Project Structure

```
LunchboxAiAllPlatforms/
├── discord-bot/          # Discord bot implementation
│   ├── src/
│   │   ├── commands/     # Slash commands
│   │   ├── events/       # Discord events
│   │   ├── ai/          # AI chat handler
│   │   ├── database/    # Database setup
│   │   └── utils/       # Utility functions
│   ├── package.json
│   └── deploy.js
├── web-dashboard/        # Next.js web application
│   ├── app/             # App router pages
│   ├── components/      # React components
│   ├── lib/            # Utility libraries
│   └── styles/         # CSS and styling
├── mobile-app/          # React Native app (future)
├── shared/             # Shared components
├── docs/              # Documentation
└── deployment/        # Deployment configs
```

## 🔧 Configuration

### Discord Bot Permissions
Your bot needs these permissions:
- Send Messages
- Use Slash Commands
- Read Message History
- Send Direct Messages
- Embed Links
- Attach Files

### Database
The bot uses SQLite by default. For production, consider PostgreSQL:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/lunchbox_ai
```

## 🚀 Deployment

### Discord Bot
1. **Railway** (Recommended)
   - Connect your GitHub repo
   - Set environment variables
   - Deploy automatically

2. **Heroku**
   - Create new app
   - Add buildpack: `heroku/nodejs`
   - Set environment variables
   - Deploy

### Web Dashboard
1. **Vercel** (Recommended)
   - Connect your GitHub repo
   - Set environment variables
   - Deploy automatically

2. **Netlify**
   - Connect your GitHub repo
   - Set build command: `npm run build`
   - Set publish directory: `out`
   - Deploy

## 🐛 Troubleshooting

### Common Issues

1. **Bot not responding to commands**
   - Check if slash commands are deployed
   - Verify bot has proper permissions
   - Check console for errors

2. **Database errors**
   - Ensure database file is writable
   - Check database initialization
   - Verify SQLite installation

3. **AI chat not working**
   - Verify OpenAI API key
   - Check API quota and billing
   - Test API key with curl

4. **Web dashboard not loading**
   - Check environment variables
   - Verify Next.js installation
   - Check console for errors

### Getting Help

- Check the [Issues](https://github.com/your-repo/issues) page
- Join our [Discord Server](https://discord.gg/your-server)
- Read the [Documentation](docs/)

## 📚 Next Steps

1. **Customize the bot** for your needs
2. **Add new features** and commands
3. **Deploy to production**
4. **Set up monitoring** and analytics
5. **Create mobile app** (React Native)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Happy coding! 🍱✨**
