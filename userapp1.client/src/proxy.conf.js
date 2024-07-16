const { env } = require('process');

const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
  env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'http://localhost:5164';

const PROXY_CONFIG = [
  {
    context: ["/user"],
    target,
    secure: false,
    changeOrigin: true, // Helpful for dealing with CORS or host header issues
    logLevel: 'debug' // Provides detailed logging for debugging
  }
]

module.exports = PROXY_CONFIG;
