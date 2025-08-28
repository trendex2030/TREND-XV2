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

function loadSession() {
  const base64 = process.env.SESSION_ID;
  if (fs.existsSync(SESSION_FILE)) {
    console.log('✅ Using saved session.json');
    return db.read();
  }
  if (!base64 || !base64.startsWith('TREND-XMD~')) {
    console.error('❌ SESSION_ID missing or invalid. Must start with TREND-XMD~<base64>');
    process.exit(1);
  }
  console.log('✅ Decoding SESSION_ID from env');
  try {
    const decoded = Buffer.from(base64.replace('TREND-XMD~', ''), 'base64').toString('utf8');
    const json = JSON.parse(decoded, BufferJSON.reviver);
    if (!json.creds) throw new Error('missing creds');
    db.write(json);
    return json;
  } catch (e) {
    console.error('❌ Failed to decode SESSION_ID:', e);
    process.exit(1);
  }
}

/* ---------- Prepare auth state ---------- */
let jsonSession = loadSession();

const authState = {
  creds: jsonSession.creds,
  keys: {
    get: async (type, ids) => {
      const result = {};
      if (!jsonSession.keys) return result;
      const bucket = jsonSession.keys[type] || {};
      for (const id of ids) if (bucket[id]) result[id] = bucket[id];
      return result;
    },
    set: async (data) => {
      jsonSession.keys = jsonSession.keys || {};
      for (const type in data) {
        jsonSession.keys[type] = jsonSession.keys[type] || {};
        Object.assign(jsonSession.keys[type], data[type]);
      }
      db.write(jsonSession);
    }
  }
};

function saveSessionBackup() {
  db.write(jsonSession);
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
