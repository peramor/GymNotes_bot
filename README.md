# gymBot

Телеграм бот для ведение дневника тренировок и отслеживания прогресса.

# Getting started

- `yarn`
- `npm start`

**Environment variables**

`TG_BOT_TOKEN` - should contain bot's token (required)  
`TELEGRAM_SESSION_HOST` - redis host (optional, localhost by default)  
`TELEGRAM_SESSION_PORT` - redis port (optional, 6379 by default)
`MONGO_HOST` - host of mongo container (optional, 127.0.0.1 by default)
`MONGO_PORT` - port where mongo is running (optional, 27017)