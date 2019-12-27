module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABSE_URL || 'postgresql://dunder_mifflin@localhost/poker-winrate',
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || "http://localhost:3000/api",
  JWT_SECRET: process.env.JWT_SECRET || 'secret',
}
