module.exports = {
  apps: [
    {
      script: "./dist/server.js",
    },
  ],
  deploy: {
    production: {
      ref: "origin/main",
      "post-deploy":
        "npm install && pm2 reload ecosystem.config.js --env production",
    },
  },
};
