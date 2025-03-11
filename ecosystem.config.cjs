module.exports = {
  apps: [{
    name: "Canvas Mailer",
    script: "dist/main.js",
    instances: 1,
    cron_restart: "* * * * *"
  }]
}
