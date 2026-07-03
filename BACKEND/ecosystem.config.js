module.exports = {
  apps: [
    {
      name: 'resume-report-backend',
      script: './server.js',
      instances: 'max',         // Run in cluster mode across all available CPU cores
      exec_mode: 'cluster',     // Enable Node.js clustering
      watch: false,             // Disable watching in production
      max_memory_restart: '1G', // Guard against potential Puppeteer/Node memory leaks by auto-restarting at 1GB RAM
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
