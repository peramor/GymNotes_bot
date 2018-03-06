# gymBot  

Телеграм бот для ведения дневника тренировок и отслеживания прогресса.

# Getting started

- `yarn`
- `npm start`

**Environment variables**

`TG_BOT_TOKEN` - should contain bot's token (required)  
`TELEGRAM_SESSION_HOST` - redis host (optional, localhost by default)  
`TELEGRAM_SESSION_PORT` - redis port (optional, 6379 by default)  
`MONGO_HOST` - host of mongo container (optional, 127.0.0.1 by default)  
`MONGO_PORT` - port where mongo is running (optional, 27017)  
`SEED_MONGO` - set 'no' if uploading default exercises is not needed  
`METRICS_TOKEN` - token for metrics API (optional, if not set will not connect to app metrica)

## Scenes

1. rest
2. groups
3. exercises
4. repeats
5. new-exercise

TODO: update state machine graph
[![states diagram](docs/sm-map.jpg)](https://www.draw.io/#G13zr-dOdOzLFq-QRwO_9vNef2uWS-OtA1)