// setting/config.js

module.exports = {
  // Auto mark messages as seen
  AUTO_STATUS_SEEN: true,

  // Anticall behavior: "decline" or "block"
  ANTICALL: "block",

  // Welcome and goodbye messages
  WELCOME: true,
  GOODBYE: true,

  // Admin promotion/demotion notifications
  ADMIN_EVENT: true,

  // Global bot prefix
  PREFIX: ".",

  // Your SESSION_ID env variable should already be set
  SESSION_ID: process.env.SESSION_ID || '',

  // Optional: bot owner number(s) in full international format
  OWNER: ["2547110081982"],

  // Optional: bot name
  BOT_NAME: "TREND-XMD",

  // Optional: set bot public visibility
  PUBLIC: true
};
