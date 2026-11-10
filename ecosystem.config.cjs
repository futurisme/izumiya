/**
 * ===================================================================================================
 * 🛡️ FADHILBOT 2026 - PM2 ECOSYSTEM CONFIGURATION (Linux VPS Ubuntu 22.04 LTS / Debian / CentOS)
 * Release: 2026-11-09 | 100% Rekayasa Internal Buatan Sendiri (Zero Crash PM2 Supervisor)
 * 
 * Penggunaan di VPS:
 *   pm2 start ecosystem.config.cjs
 *   pm2 logs fadhilbot
 *   pm2 restart fadhilbot
 *   pm2 stop fadhilbot
 * ===================================================================================================
 */

module.exports = {
  apps: [
    {
      name: "fadhilbot",
      script: "./index.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      watch: false,
      autorestart: true,
      max_restarts: 15,
      min_uptime: "10s",
      restart_delay: 4000,
      kill_timeout: 5000,
      listen_timeout: 8000,
      node_args: [
        "--no-warnings",
        "--experimental-vm-modules"
      ],
      env: {
        NODE_ENV: "production",
        PM2_SERVED: "true"
      }
    }
  ]
};
