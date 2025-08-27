// index.js - TREND-XMD (CommonJS) - base64 session only (no QR)
// Rewritten from your supplied code, preserving original behavior and helpers.

const {
  default: makeWASocket,
  makeCacheableSignalKeyStore,
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
  delay,
  BufferJSON
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const readline = require('readline');
const fs = require('fs');
const os = require('os');
const path = require('path');
const chalk = require('chalk');
const _ = require('lodash');
const lolcatjs = require('lolcatjs');
const util = require('util');
const fetch = require('node-fetch');
const moment = require('moment-timezone');
const FileType = require('file-type');
const { Boom } = require('@hapi/boom');
const PhoneNumber = require('awesome-phonenumber');

// local libs (keep your folder layout)
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

const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');

/* ---------- Config & session source ---------- */
const config = {
  SESSION_ID: process.env.SESSION_ID || '' // Must be TREND-XMD~<base64-json>
};

/* ---------- Enforce using session-id only ---------- */
if (!config.SESSION_ID || !config.SESSION_ID.startsWith('TREND-XMD~')) {
  console.error('❌ SESSION_ID missing or invalid. Must start with TREND-XMD~<base64>');
  process.exit(1);
}

/* ---------- decode base64 session JSON ---------- */
let jsonSession;
try {
  const encoded = config.SESSION_ID.replace(/^TREND-XMD~/, '');
  const decoded = Buffer.from(encoded, 'base64').toString('utf8');
  jsonSession = JSON.parse(decoded, BufferJSON.reviver);
  if (!jsonSession.creds) throw new Error('missing creds');
} catch (e) {
  console.error('❌ Failed to decode SESSION_ID - make sure it is valid base64 of full auth state.');
  console.error(e);
  process.exit(1);
}

/* ---------- Prepare auth state wrapper (keys + creds) ---------- */
const sessionBackupPath = path.join(__dirname, 'session.json');

function saveSessionBackup() {
  try {
    const str = JSON.stringify(jsonSession, BufferJSON.replacer);
    fs.writeFileSync(sessionBackupPath, str);
    // optional: log quiet
    // console.log('Session backup saved to', sessionBackupPath);
  } catch (e) {
    console.error('Failed to save session backup:', e);
  }
}

// Provide keys.get and keys.set so makeWASocket can use them
const authState = {
  creds: jsonSession.creds,
  keys: {
    /**
     * get: async (type, ids) => { return { id: proto.Key.fromObject(...) } }
     * Baileys will call keys.get(type, [id1, id2...])
     */
    get: async (type, ids) => {
      const result = {};
      try {
        if (!jsonSession.keys) return result;
        const bucket = jsonSession.keys[type] || {};
        for (const id of ids) {
          const item = bucket[id];
          if (item) {
            // Some values are stored as plain JS objects; convert to proto objects if available
            // safest is to return the raw object - Baileys often expects Buffer JSON representation
            result[id] = item;
          }
        }
      } catch (e) { /* ignore */ }
      return result;
    },
    /**
     * set: async (data) => { merge into jsonSession.keys and persist }
     * data is an object like { type: { id: value } }
     */
    set: async (data) => {
      try {
        jsonSession.keys = jsonSession.keys || {};
        for (const type in data) {
          jsonSession.keys[type] = jsonSession.keys[type] || {};
          Object.assign(jsonSession.keys[type], data[type]);
        }
        saveSessionBackup();
      } catch (e) {
        console.error('authState.keys.set error', e);
      }
    }
  }
};

/* ---------- Express server (Heroku friendly) ---------- */
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('TREND-XMD Bot is running'));
app.listen(PORT, () => console.log(`HTTP server listening on ${PORT}`));

/* ---------- Logger & caches ---------- */
const MAIN_LOGGER = pino({ timestamp: () => `,"time":"${new Date().toJSON()}"` });
const logger = MAIN_LOGGER.child({});
logger.level = 'trace';

const msgRetryCounterCache = new NodeCache();

/* ---------- state/store placeholders ---------- */
let store = { contacts: {} }; // minimal store object used by your helpers
let conn = null; // will hold the socket instance

/* ---------- helper to start the client ---------- */
async function clientstart() {
  try {
    const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [4, 0, 0] }));
    conn = makeWASocket({
      version,
      logger,
      printQRInTerminal: false, // we never print QR
      auth: authState,
      getMessage: async (key) => { /* optional */ return null; },
      msgRetryCounterCache
    });

    // Persist when creds change
    conn.ev.on('creds.update', () => {
      try {
        authState.creds = conn.auth?.creds || authState.creds;
        jsonSession.creds = authState.creds;
        saveSessionBackup();
      } catch (e) {
        console.error('Error saving creds.update', e);
      }
    });

    // Bind a very small in-memory store for contacts if available
    try {
      // if the baileys-store is present in your deps, you could use it:
      // const { makeInMemoryStore } = require('@whiskeysockets/baileys') // if available
      // store = makeInMemoryStore({ logger });
    } catch (e) { /* ignore */ }

    /* ---------- Your original event handlers and helpers (fixed) ---------- */

    conn.ev.on('messages.upsert', async chatUpdate => {
      try {
        let mek = chatUpdate.messages && chatUpdate.messages[0];
        if (!mek) return;
        if (!mek.message) return;
        mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;
        if (mek.key && mek.key.remoteJid === 'status@broadcast') return;
        if (!conn.public && !mek.key.fromMe && chatUpdate.type === 'notify') return;
        let m = smsg(conn, mek, store);
        require("./start/system")(conn, m, chatUpdate, mek, store);
      } catch (err) {
        console.log(chalk.yellow.bold("[ ERROR ] system.js :\n") + chalk.redBright(util.format(err)));
      }
    });

    conn.decodeJid = (jid) => {
      if (!jid) return jid;
      if (/:\d+@/gi.test(jid)) {
        let decode = jidDecode(jid) || {};
        return (decode.user && decode.server && decode.user + '@' + decode.server) || jid;
      } else return jid;
    };

    conn.ev.on('contacts.update', update => {
      for (let contact of update) {
        let id = conn.decodeJid(contact.id);
        if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
      }
    });

    conn.sendTextWithMentions = async (jid, text, quoted, options = {}) =>
      conn.sendMessage(jid, {
        text: text,
        contextInfo: {
          mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map((v) => v[1] + "@s.whatsapp.net"),
        },
        ...options,
      }, { quoted });

    conn.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
      let buff = Buffer.isBuffer(path)
        ? path
        : /^data:.*?\/.*?;base64,/i.test(path)
          ? Buffer.from(path.split`, `[1], 'base64')
          : /^https?:\/\//.test(path)
            ? await (await getBuffer(path))
            : fs.existsSync(path)
              ? fs.readFileSync(path)
              : Buffer.alloc(0);

      let buffer;
      if (options && (options.packname || options.author)) {
        buffer = await writeExifImg(buff, options);
      } else {
        buffer = await imageToWebp(buff);
      }

      await conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
      return buffer;
    };

    conn.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
      let buff = Buffer.isBuffer(path)
        ? path
        : /^data:.*?\/.*?;base64,/i.test(path)
          ? Buffer.from(path.split`, `[1], 'base64')
          : /^https?:\/\//.test(path)
            ? await (await getBuffer(path))
            : fs.existsSync(path)
              ? fs.readFileSync(path)
              : Buffer.alloc(0);

      let buffer;
      if (options && (options.packname || options.author)) {
        buffer = await writeExifVid(buff, options);
      } else {
        buffer = await videoToWebp(buff);
      }

      await conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
      return buffer;
    };

    conn.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
      let quoted = message.msg ? message.msg : message;
      let mime = (message.msg || message).mimetype || "";
      let messageType = message.mtype ? message.mtype.replace(/Message/gi, "") : mime.split("/")[0];

      const stream = await downloadContentFromMessage(quoted, messageType);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      let type = await FileType.fromBuffer(buffer);
      let trueFileName = attachExtension ? filename + "." + type.ext : filename;
      await fs.writeFileSync(trueFileName, buffer);

      return trueFileName;
    };

    conn.getName = (jid, withoutContact = false) => {
      let id = conn.decodeJid(jid);
      withoutContact = conn.withoutContact || withoutContact;
      let v;
      if (id.endsWith("@g.us"))
        return new Promise(async (resolve) => {
          v = store.contacts[id] || {};
          if (!(v.name || v.subject)) v = conn.groupMetadata(id) || {};
          resolve(
            v.name ||
            v.subject ||
            PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber(
              "international",
            ),
          );
        });
      else
        v =
          id === "0@s.whatsapp.net"
            ? {
              id,
              name: "WhatsApp",
            }
            : id === conn.decodeJid(conn.user.id)
              ? conn.user
              : store.contacts[id] || {};
      return (
        (withoutContact ? "" : v.name) ||
        v.subject ||
        v.verifiedName ||
        PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber(
          "international",
        )
      );
    };

    conn.sendContact = async (jid, kon, quoted = '', opts = {}) => {
      let list = []
      for (let i of kon) {
        list.push({
          displayName: await conn.getName(i),
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await conn.getName(i)}\nFN:${await conn.getName(i)}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Contact\nEND:VCARD`
        })
      }
      conn.sendMessage(jid, { contacts: { displayName: `${list.length} Contact`, contacts: list }, ...opts }, { quoted })
    }

    conn.serializeM = (m) => smsg(conn, m, store);

    conn.copyNForward = async (jid, message, forceForward = false, options = {}) => {
      let vtype;
      if (options && options.readViewOnce) {
        message.message = message.message?.ephemeralMessage?.message || message.message;
        vtype = Object.keys(message.message.viewOnceMessage.message)[0];
        delete message.message.viewOnceMessage.message[vtype].viewOnce;
        message.message = { ...message.message.viewOnceMessage.message };
      }

      let mtype = Object.keys(message.message)[0];
      let content = await generateForwardMessageContent(message, forceForward);
      let ctype = Object.keys(content)[0];
      let context = {};

      if (mtype != "conversation") {
        context = message.message[mtype].contextInfo;
      }

      content[ctype].contextInfo = {
        ...context,
        ...content[ctype].contextInfo,
      };

      const waMessage = await generateWAMessageFromContent(
        jid,
        content,
        options
          ? {
            ...content[ctype],
            ...options,
            ...(options.contextInfo
              ? {
                contextInfo: {
                  ...content[ctype].contextInfo,
                  ...options.contextInfo,
                },
              }
              : {}),
          }
          : {}
      );

      await conn.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id });
      return waMessage;
    };

    function getTypeMessage(message) {
      const type = Object.keys(message)
      var restype = (!['senderKeyDistributionMessage', 'messageContextInfo'].includes(type[0]) && type[0]) ||
        (type.length >= 3 && type[1] !== 'messageContextInfo' && type[1]) ||
        type[type.length - 1] || Object.keys(message)[0]
      return restype
    }

    conn.prefa = '.';
    conn.public = global.status;
    conn.serializeM = (m) => smsg(conn, m, store);

    conn.ev.on('connection.update', async (update) => {
      let { Connecting } = require("./start/lib/connection/connect.js") || {};
      if (Connecting) {
        try {
          Connecting({ update, conn, Boom, DisconnectReason, sleep, color, clientstart: clientstart });
        } catch (e) {
          // ignore
        }
      }
      // fallback logging
      const { connection, lastDisconnect } = update;
      if (connection) {
        console.log('connection.update ->', connection);
        if (connection === 'open') {
          console.log('Connected to WhatsApp!');
        } else if (connection === 'close') {
          console.log('Connection closed:', lastDisconnect && lastDisconnect.error && lastDisconnect.error.output ? lastDisconnect.error.output.statusCode : lastDisconnect);
        }
      }
    });

    // anticall
    conn.ev.on('call', async (incomingCalls) => {
      let botId = conn.user && conn.user.id ? conn.user.id : null;

      if (!["decline", "block"].includes(global.anticall)) return;

      for (let call of incomingCalls) {
        if (!call.isGroup && call.status === "offer") {
          let message = `📞 *Call not allowed*\n\n`;
          message += `@${call.from.split('@')[0]}, my owner cannot receive ${call.isVideo ? `video` : `audio`} calls at the moment.\n\n`;

          if (global.anticall === "block") {
            message += `You are being *blocked* for calling the bot.`;
          } else {
            message += `Your call has been *declined*.`;
          }

          await conn.sendTextWithMentions(call.from, message);
          try { await conn.rejectCall(call.id, call.from); } catch (e) { /* ignore */ }

          if (global.anticall === "block") {
            await sleep(8000);
            await conn.updateBlockStatus(call.from, "block");
          }
        }
      }
    });

    conn.ev.on('group-participants.update', async (anu) => {
      if (global.welcome) {
        try {
          const groupMetadata = await conn.groupMetadata(anu.id);
          const participants = anu.participants;

          for (const participant of participants) {
            let ppUrl;
            try { ppUrl = await conn.profilePictureUrl(participant, 'image'); } catch { ppUrl = 'https://i.ibb.co/sFjX3nP/default.jpg'; }

            if (anu.action === 'add') {
              await conn.sendMessage(anu.id, {
                image: { url: ppUrl },
                caption: `Welcome @${participant.split('@')[0]} to *${groupMetadata.subject}*\nMembers: ${groupMetadata.participants.length}`,
                mentions: [participant]
              });
            } else if (anu.action === 'remove') {
              await conn.sendMessage(anu.id, {
                image: { url: ppUrl },
                caption: `Goodbye @${participant.split('@')[0]}\nNow: ${groupMetadata.participants.length} members`,
                mentions: [participant]
              });
            }
          }
        } catch (e) { console.log('group update error', e); }
      }

      if (global.adminevent) {
        try {
          let botNumber = await conn.decodeJid(conn.user.id);
          if (anu.participants.includes(botNumber)) return;
          let metadata = await conn.groupMetadata(anu.id)
          for (let num of anu.participants) {
            if (anu.action === "promote") {
              conn.sendMessage(anu.id, { text: `@${anu.author.split("@")[0]} promoted @${num.split("@")[0]}`, mentions: [anu.author, num] })
            }
            if (anu.action === "demote") {
              conn.sendMessage(anu.id, { text: `@${anu.author.split("@")[0]} demoted @${num.split("@")[0]}`, mentions: [anu.author, num] })
            }
          }
        } catch (err) { console.log(err) }
      }
    });

    conn.sendButtonImg = async (jid, buttons = [], text, image, footer, quoted = '', options = {}) => {
      const buttonMessage = {
        image: { url: image },
        caption: text,
        footer: footer,
        buttons: buttons.map(button => ({
          buttonId: button.id || '',
          buttonText: { displayText: button.text || 'Button' },
          type: button.type || 1
        })),
        headerType: 1,
        viewOnce: options.viewOnce || false,
      }
      await conn.sendMessage(jid, buttonMessage, { quoted })
    }

    conn.sendList = async (jid, title, footer, btn, quoted = '', options = {}) => {
      let msg = generateWAMessageFromContent(jid, {
        viewOnceMessage: {
          message: {
            "messageContextInfo": { "deviceListMetadata": {}, "deviceListMetadataVersion": 2 },
            interactiveMessage: proto.Message.InteractiveMessage.create({
              ...options,
              body: proto.Message.InteractiveMessage.Body.create({ text: title }),
              footer: proto.Message.InteractiveMessage.Footer.create({ text: footer || "puqi" }),
              nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                buttons: [
                  {
                    "name": "single_select",
                    "buttonParamsJson": JSON.stringify(btn)
                  },
                ]
              })
            })
          }
        }
      }, { quoted })
      return await conn.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id })
    }

    conn.sendButtonProto = async (jid, title, footer, buttons = [], quoted = '', options = {}) => {
      let msg = generateWAMessageFromContent(jid, {
        viewOnceMessage: {
          message: {
            "messageContextInfo": { "deviceListMetadata": {}, "deviceListMetadataVersion": 2 },
            interactiveMessage: proto.Message.InteractiveMessage.create({
              ...options,
              body: proto.Message.InteractiveMessage.Body.create({ text: title }),
              footer: proto.Message.InteractiveMessage.Footer.create({ text: footer || "puqi" }),
              nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                buttons: buttons
              })
            })
          }
        }
      }, { quoted })
      return await conn.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id })
    }

    conn.ments = (teks = '') => {
      return teks.match('@') ? [...teks.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net') : []
    };

    conn.cMod = (jid, copy, text = '', sender = conn.user.id, options = {}) => {
      let mtype = Object.keys(copy.message)[0];
      let isEphemeral = mtype === 'ephemeralMessage';
      if (isEphemeral) {
        mtype = Object.keys(copy.message.ephemeralMessage.message)[0];
      }
      let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message;
      let content = msg[mtype];
      if (typeof content === 'string') msg[mtype] = text || content;
      else if (content.caption) content.caption = text || content.caption;
      else if (content.text) content.text = text || content.text;
      if (typeof content !== 'string') msg[mtype] = {
        ...content,
        ...options
      };
      if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
      if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid;
      else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid;
      copy.key.remoteJid = jid;
      copy.key.fromMe = sender === conn.user.id;
      return proto.WebMessageInfo.fromObject(copy);
    }

    conn.sendText = (jid, text, quoted = '', options) => conn.sendMessage(jid, { text: text, ...options }, { quoted });

    conn.deleteMessage = async (chatId, key) => {
      try {
        await conn.sendMessage(chatId, { delete: key });
        console.log(`Pesan dihapus: ${key.id}`);
      } catch (error) {
        console.error('Gagal menghapus pesan:', error);
      }
    };

    conn.downloadMediaMessage = async (message) => {
      let mime = (message.msg || message).mimetype || ''
      let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
      const stream = await downloadContentFromMessage(message, messageType)
      let buffer = Buffer.from([])
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
      }
      return buffer
    }

    conn.ev.on('creds.update', saveSessionBackup);
    conn.serializeM = (m) => smsg(conn, m, store);

    console.log('✅ Client started (using SESSION_ID only).');

  } catch (err) {
    console.error('Failed to start client:', err);
    process.exit(1);
  }
}

/* ---------- Start the bot ---------- */
clientstart();

/* ---------- Hot reload file watcher (optional) ---------- */
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});

/* ---------- Crash handlers ---------- */
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
