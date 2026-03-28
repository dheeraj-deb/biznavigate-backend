module.exports = {
  apps: [
    {
      name: 'biznavigate',
      script: 'node',
      args: '-r tsconfig-paths/register dist/main',
      cwd: '/home/ubuntu/biznavigate-backend',

      // Restart policy
      autorestart: true,
      watch: false,
      max_restarts: 10,
      restart_delay: 5000,

      // Environment
      env_production: {
        NODE_ENV: 'production',
      },

      // Logging
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,

      // Memory threshold — restart if app exceeds 1GB
      max_memory_restart: '1G',
    },
  ],
};
