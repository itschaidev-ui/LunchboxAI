# 🚀 Railway Deployment Guide for Lunchbox AI

This guide will help you deploy your Lunchbox AI web dashboard to Railway, a modern cloud platform perfect for your multi-platform productivity app.

## 🎯 Why Railway?

Railway is perfect for Lunchbox AI because:
- **Multi-platform support** - Host web app, Discord bot, and API
- **PostgreSQL database** - Shared data across all platforms
- **Discord OAuth integration** - Built-in support
- **Automatic deployments** - GitHub integration
- **Environment variables** - Secure token management
- **Scaling** - Grows with your user base
- **Cost-effective** - Great pricing for startups

## 📋 Prerequisites

Before deploying, make sure you have:
- [ ] GitHub repository set up
- [ ] Discord application created
- [ ] OpenAI API key
- [ ] Railway account (free tier available)

## 🚀 Step-by-Step Deployment

### 1. Set Up Railway Account

1. **Sign up at [Railway.app](https://railway.app/)**
2. **Connect your GitHub account**
3. **Verify your email address**

### 2. Create New Project

1. **Click "New Project"**
2. **Select "Deploy from GitHub repo"**
3. **Choose your Lunchbox AI repository**
4. **Select the `web-dashboard` folder**

### 3. Configure Environment Variables

In your Railway project dashboard, go to **Variables** and add:

```env
# Next.js Configuration
NEXTAUTH_URL=https://your-app-name.railway.app
NEXTAUTH_SECRET=your-random-secret-key-here

# Discord OAuth
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_CLIENT_SECRET=your_discord_client_secret_here

# Database (Railway PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database

# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here

# App Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app-name.railway.app
```

### 4. Add PostgreSQL Database

1. **In your Railway project, click "New"**
2. **Select "Database" → "PostgreSQL"**
3. **Railway will automatically set up the DATABASE_URL**
4. **Copy the connection string to your environment variables**

### 5. Deploy Discord Bot (Optional)

1. **Create a new service in Railway**
2. **Select "Deploy from GitHub repo"**
3. **Choose the `discord-bot` folder**
4. **Add environment variables:**
   ```env
   DISCORD_TOKEN=your_bot_token_here
   DISCORD_CLIENT_ID=your_client_id_here
   DISCORD_GUILD_ID=your_test_server_id_here
   OPENAI_API_KEY=your_openai_api_key_here
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

### 6. Configure Discord OAuth

1. **Go to [Discord Developer Portal](https://discord.com/developers/applications)**
2. **Select your application**
3. **Go to OAuth2 → General**
4. **Add redirect URI:**
   ```
   https://your-app-name.railway.app/api/auth/callback/discord
   ```
5. **Save changes**

### 7. Deploy and Test

1. **Railway will automatically deploy your app**
2. **Wait for deployment to complete**
3. **Visit your app URL**
4. **Test Discord OAuth login**
5. **Verify all features work**

## 🔧 Advanced Configuration

### Custom Domain

1. **In Railway project settings**
2. **Go to "Domains"**
3. **Add your custom domain**
4. **Update NEXTAUTH_URL to match**

### Environment-Specific Settings

```env
# Development
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000

# Production
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
```

### Database Migrations

```bash
# Run migrations after deployment
npx prisma migrate deploy
```

## 📊 Monitoring and Analytics

### Railway Dashboard
- **View deployment logs**
- **Monitor resource usage**
- **Check error rates**
- **View performance metrics**

### Custom Analytics
- **Add Google Analytics**
- **Implement error tracking**
- **Monitor user engagement**

## 🔒 Security Best Practices

### Environment Variables
- **Never commit secrets to Git**
- **Use Railway's secure variable storage**
- **Rotate keys regularly**

### Database Security
- **Use connection pooling**
- **Enable SSL connections**
- **Regular backups**

### API Security
- **Rate limiting**
- **Input validation**
- **Authentication checks**

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check build logs for errors

2. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check database service status
   - Ensure SSL is enabled

3. **Discord OAuth Issues**
   - Verify redirect URI matches exactly
   - Check client ID and secret
   - Ensure Discord app is properly configured

4. **Environment Variable Issues**
   - Check variable names match exactly
   - Verify no extra spaces or quotes
   - Restart service after changes

### Getting Help

- **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
- **Discord Support**: [discord.gg/railway](https://discord.gg/railway)
- **GitHub Issues**: [github.com/railwayapp/railway](https://github.com/railwayapp/railway)

## 💰 Pricing

### Free Tier
- **$5 credit monthly**
- **512MB RAM**
- **1GB storage**
- **Perfect for development**

### Pro Tier
- **$5/month per service**
- **8GB RAM**
- **100GB storage**
- **Custom domains**
- **Priority support**

## 🎯 Next Steps

After successful deployment:

1. **Set up custom domain**
2. **Configure SSL certificates**
3. **Set up monitoring**
4. **Implement CI/CD pipeline**
5. **Scale as needed**

## 📚 Additional Resources

- **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Discord OAuth Guide**: [discord.com/developers/docs/topics/oauth2](https://discord.com/developers/docs/topics/oauth2)
- **PostgreSQL Best Practices**: [postgresql.org/docs/current/](https://postgresql.org/docs/current/)

---

**Happy deploying! 🚀🍱**

Your Lunchbox AI will be live and ready to help students and creators stay productive!
