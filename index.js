require('./setting/config');
process.on("uncaughtException", console.error); 

// index.js - TREND-XMD (CommonJS) - base64 session only (no QR)
const {
  default: makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  generateForwardMessageContent,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  generateMessageID,
  downloadContentFromMessage,
  getContentType,
  jidDecode,
  proto,
  delay,
  BufferJSON
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const util = require('util');
const NodeCache = require('node-cache');

const { JSONFileSync } = require('./start/lib/lowdb/adapters/JSONFileSync.js');
const { smsg } = require('./start/lib/myfunction'); // keep your helper

/* ---------- Config & session ---------- */
const SESSION_FILE = path.join(__dirname, 'session.json');
const db = new JSONFileSync(SESSION_FILE);
// ==========================
// 🔧 Deep Buffer Reviver
// ==========================
function reviveBuffersDeep(obj) {
  if (!obj || typeof obj !== "object") return obj;

  if (obj.type === "Buffer" && Array.isArray(obj.data)) {
    return Buffer.from(obj.data);
  }

  for (const k in obj) {
    obj[k] = reviveBuffersDeep(obj[k]);
  }
  return obj;
}

// ==========================
// 🔧 Load Session from ENV
// ==========================
function loadSession() {
  const encoded = process.env.SESSION_ID || "";
  if (!encoded.startsWith("TREND-XMD~")) return null;

  try {
    const base64 = encoded.replace("TREND-XMD~", "");
    const json = Buffer.from(base64, "base64").toString("utf-8");
    let credsData = JSON.parse(json);

    // revive all nested Buffers
    credsData = reviveBuffersDeep(credsData);

    // wrap creds if missing outer { creds, keys }
    if (!credsData.creds && (credsData.noiseKey || credsData.signedIdentityKey || credsData.me)) {
      console.log("⚠️ Wrapping creds-only session into { creds, keys } format.");
      credsData = { creds: credsData, keys: {} };
    }

    if (!credsData.creds) throw new Error("missing creds");
    if (!credsData.keys) credsData.keys = {};

    console.log("✅ SESSION restored with buffers");
    return credsData;
  } catch (err) {
    console.error("❌ Failed to decode SESSION_ID:", err.message);
    return null;
  }
}

// ==========================
// 🔧 Save Session Backup
// ==========================
function saveSessionBackup(credsData) {
  try {
    // stringify and base64 encode
    const json = JSON.stringify(credsData, null, 2);
    const base64 = Buffer.from(json, "utf-8").toString("base64");
    const wrapped = `TREND-XMD~${base64}`;

    // write to session.json for backup
    fs.writeFileSync("./session.json", wrapped);
    console.log("💾 Session backup saved.");
  } catch (err) {
    console.error("❌ Failed to save session backup:", err.message);
  }
}

/* ---------- Express server (Heroku) ---------- */
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('TREND-XMD Bot is running'));
app.listen(PORT, () => console.log(`HTTP server listening on ${PORT}`));

/* ---------- Logger & cache ---------- */
const MAIN_LOGGER = pino({ timestamp: () => `,"time":"${new Date().toJSON()}"` });
const logger = MAIN_LOGGER.child({});
logger.level = 'trace';
const msgRetryCounterCache = new NodeCache();

/* ---------- Minimal store ---------- */
let store = { contacts: {} };
let conn = null;

/* ---------- Start client ---------- */
async function clientstart() {
  try {
    const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [4, 0, 0] }));
    conn = makeWASocket({
      version,
      logger,
      printQRInTerminal: false,
      auth: authState,
      getMessage: async (key) => null,
      msgRetryCounterCache
    });

    conn.ev.on('creds.update', () => {
      authState.creds = conn.auth?.creds || authState.creds;
      jsonSession.creds = authState.creds;
      saveSessionBackup();
      console.log('💾 Session updated and saved');
    });

    conn.ev.on('messages.upsert', async chatUpdate => {
      try {
        let mek = chatUpdate.messages && chatUpdate.messages[0];
        if (!mek || !mek.message) return;
        mek.message = Object.keys(mek.message)[0] === 'ephemeralMessage' ? mek.message.ephemeralMessage.message : mek.message;
        let m = smsg(conn, mek, store);
        require('./start/system')(conn, m, chatUpdate, mek, store);
      } catch (err) {
        console.log(chalk.yellow.bold('[ ERROR ] system.js :\n') + chalk.redBright(util.format(err)));
      }
    });

    console.log('✅ Client started (using SESSION_ID only).');

  } catch (err) {
    console.error('Failed to start client:', err);
    process.exit(1);
  }
}

/* ---------- Run bot ---------- */
clientstart();

/* ---------- Hot reload ---------- */
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});

/* ---------- Crash handlers ---------- */
process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));
process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));
