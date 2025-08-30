'use strict';

console.clear();
console.log('starting...');

const path = require('path');
const fs = require('fs');
const pino = require('pino');
const chalk = require('chalk');
const util = require('util');
const NodeCache = require('node-cache');
const express = require('express');
const axios = require('axios');
const moment = require('moment-timezone');
const { Boom } = require('@hapi/boom');
const FileType = require('file-type');
const PhoneNumber = require('awesome-phonenumber');
const fetch = require('node-fetch');
const os = require('os');
const _ = require('lodash');
// optional libs you referenced; keep them in case used by other modules
const lolcatjs = require('lolcatjs');

const config = require('./setting/config');            // <-- make sure this exports your env like SESSION_ID, MODE, etc.
process.on('uncaughtException', console.error);

// MEGA
const { File } = require('megajs');

// Baileys
const {
  default: makeWASocket,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  generateForwardMessageContent,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  generateMessageID,
  downloadContentFromMessage,
  getContentType,
  jidDecode,
  MessageRetryMap,
  getAggregateVotesInPollMessage,
  proto,
  delay
} = require('@whiskeysockets/baileys');

// Your helpers
const { color } = require('./start/lib/color');
const {
  smsg,
  sendGmail,
  formatSize,
  isUrl,
  generateMessageTag,
  getBuffer,
  getSizeMedia,
  runtime,
  fetchJson,
  sleep
} = require('./start/lib/myfunction');

const {
  imageToWebp,
  videoToWebp,
  writeExifImg,
  writeExifVid
} = require('./start/lib/exif');

// Optional external modules you referenced
let Handler, Callupdate, GroupUpdate;
try {
  Handler = require('./start/system'); // should export a function (chatUpdate, conn, logger)
} catch {}
try {
  Callupdate = require('./start/call'); // optional
} catch {}
try {
  GroupUpdate = require('./start/group'); // optional
} catch {}

const MAIN_LOGGER = pino({
  timestamp: () => `,"time":"${new Date().toJSON()}"`
});
const logger = MAIN_LOGGER.child({});
logger.level = 'trace';

const msgRetryCounterCache = new NodeCache();

// --- Paths / session files ---
const __root = __dirname; // CommonJS has __dirname
const sessionDir = path.join(__root, 'session');
const credsPath = path.join(sessionDir, 'creds.json');

if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true });
}

// --- Simple utils / placeholders used below ---
const emojis = ['👍','🔥','💯','✨','😎','🤖','✅','👋','🎯','🚀'];
async function doReact(emoji, mek, conn) {
  try {
    if (!mek?.key) return;
    await conn.sendMessage(mek.key.remoteJid, {
      react: { text: emoji, key: mek.key }
    });
  } catch (e) {
    // ignore
  }
}

// --- MEGA session download ---
async function downloadSessionData() {
  console.log('Debugging SESSION_ID:', config.SESSION_ID);

  if (!config.SESSION_ID) {
    console.error('❌ Please add your session to SESSION_ID env !!');
    return false;
  }

  // Expected format: TREND-XMD~<fileID>#<decryptKey>
  const sessdata = String(config.SESSION_ID).split('TREND-XMD~')[1];

  if (!sessdata || !sessdata.includes('#')) {
    console.error('❌ Invalid SESSION_ID format! It must contain both file ID and decryption key.');
    return false;
  }

  const [fileID, decryptKey] = sessdata.split('#');

  try {
    console.log('🔄 Downloading Session...');
    const file = File.fromURL(`https://mega.nz/file/${fileID}#${decryptKey}`);

    const data = await new Promise((resolve, reject) => {
      file.download((err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    await fs.promises.writeFile(credsPath, data);
    console.log('🔒 Session Successfully Loaded !!');
    return true;
  } catch (error) {
    console.error('❌ Failed to download session data:', error);
    return false;
  }
}

// --- Baileys boot ---
let useQR = false;
let initialConnection = true;

async function start() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`🤖 TREND-X using WA v${version.join('.')}, isLatest: ${isLatest}`);

    const conn = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: useQR,
      browser: ['TREND-X', 'Safari', '3.3'],
      auth: state,
      getMessage: async (key) => {
        // If you have a store, you can return from it, otherwise return a placeholder
        return { conversation: 'TREND-X whatsapp user bot' };
      }
    });

    // Connection updates (optional: your custom connector)
    try {
      const { Connecting } = require('./start/lib/connection/connect.js');
      conn.ev.on('connection.update', async (update) => {
        Connecting({ update, conn, Boom, DisconnectReason, sleep, color, clientstart: start });
        const { connection } = update;
        if (connection === 'open') {
          if (initialConnection) {
            console.log(chalk.green('✅ Connected.'));
            initialConnection = false;
          } else {
            console.log(chalk.blue('♻️ Connection reestablished after restart.'));
          }
        }
      });
    } catch {
      // Fallback default handler if your custom Connecting module is missing
      conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
          const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
          console.log('Connection closed. Reconnect:', shouldReconnect);
          if (shouldReconnect) start();
        } else if (connection === 'open') {
          if (initialConnection) {
            console.log(chalk.green('✅ Connected.'));
            initialConnection = false;
          } else {
            console.log(chalk.blue('♻️ Connection reestablished after restart.'));
          }
        }
      });
    }

    conn.ev.on('creds.update', saveCreds);

    // Main message pipeline: call your Handler if present
    if (typeof Handler === 'function') {
      conn.ev.on('messages.upsert', async (chatUpdate) => {
        try {
          await Handler(chatUpdate, conn, logger);
        } catch (err) {
          console.log(chalk.yellow.bold('[ ERROR ] system.js :\n') + chalk.redBright(util.format(err)));
        }
      });
    } else {
      // Minimal built-in handler if ./start/system is missing
      conn.ev.on('messages.upsert', async (chatUpdate) => {
        try {
          const mek = chatUpdate.messages?.[0];
          if (!mek?.message) return;
          if (mek.key?.remoteJid === 'status@broadcast') return;

          // Auto react
          if (!mek.key.fromMe && config.AUTO_REACT) {
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            await doReact(randomEmoji, mek, conn);
          }

          // Auto status seen + reply
          const isStatus = mek.key?.remoteJid === 'status@broadcast';
          if (isStatus && config.AUTO_STATUS_SEEN) {
            await conn.readMessages([mek.key]);
            if (config.AUTO_STATUS_REPLY) {
              const customMessage = config.STATUS_READ_MSG || '✅ Auto Status Seen Bot By TREND-X';
              const fromJid = mek.key.participant || mek.key.remoteJid;
              await conn.sendMessage(fromJid, { text: customMessage }, { quoted: mek });
            }
          }
        } catch (err) {
          console.error('Error during messages.upsert:', err);
        }
      });
    }

    if (typeof Callupdate === 'function') {
      conn.ev.on('call', async (json) => {
        try { await Callupdate(json, conn); } catch {}
      });
    }

    if (typeof GroupUpdate === 'function') {
      conn.ev.on('group-participants.update', async (event) => {
        try { await GroupUpdate(conn, event); } catch {}
      });
    }

    // Public/private
    conn.public = String(config.MODE).toLowerCase() === 'public';

    return conn;
  } catch (error) {
    console.error('Critical Error:', error);
    process.exit(1);
  }
}

// --- Init flow ---
async function init() {
  if (fs.existsSync(credsPath)) {
    console.log('🔒 Session file found, proceeding without QR code.');
    await start();
  } else {
    const sessionDownloaded = await downloadSessionData();
    if (sessionDownloaded) {
      console.log('🔒 Session downloaded, starting bot.');
      await start();
    } else {
      console.log('No session found or downloaded, QR code will be printed for authentication.');
      useQR = true;
      await start();
    }
  }
}

init();

// --- Minimal web server for Heroku/Render ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (_req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
