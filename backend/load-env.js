// Load env file: default .env (local), or ENV_FILE=.env.cloud for cloud
const path = require('path');

const envFile = process.env.ENV_FILE || '.env';
require('dotenv').config({
  path: path.resolve(__dirname, envFile),
  // Khi chọn ENV_FILE rõ ràng, ghi đè biến đã có (tránh bị .env local chiếm trước)
  override: Boolean(process.env.ENV_FILE),
});
