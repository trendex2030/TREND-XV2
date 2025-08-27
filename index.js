// =======================
// index.js (CommonJS)
// =======================

/* ---------- Core & 3rd-party ---------- */
const express = require('express');
const pino = require('pino');
const readline = require('readline');
const fs = require('fs');
const os = require('os');
const path = require('path');
const chalk = require('chalk');
const _ = require('lodash');
const lolcatjs = require('lolcatjs');
const util = require('util');
const fetch = require('node-fetch'); // v2
const moment = require('moment-timezone');
const FileType = require('file-type');
const { Boom } = require('@hapi/boom');
const PhoneNumber = require('awesome-phonenumber');
const axios = require('axios');
const NodeCache = require('node-cache');

/* ---------- Baileys ---------- */
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  downloadContentFromMessage,
  jidDecode,
  proto,
  delay,
  makeInMemoryStore, // ensure your baileys build exposes this
} = require('@whiskeysockets/baileys');

/* ---------- Local libs ---------- */
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
  sleep,
} = require('./start/lib/myfunction');

const {
  imageToWebp,
  videoToWebp,
  writeExifImg,
  writeExifVid,
} = require('./start/lib/exif');

/* ---------- Express / Heroku ---------- */
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (_, res) => res.send('TREND-X bot is running'));
app.listen(PORT, () => console.log(`HTTP server listening on ${PORT}`));

/* ---------- Logger ---------- */
const MAIN_LOGGER = pino({
  timestamp: () => `,"time":"${new Date().toJSON()}"`,
});
const logger = MAIN_LOGGER.child({});
logger.level = 'info';

/* ---------- Globals / Safe defaults ---------- */
global.autoviewstatus = global.autoviewstatus ?? true;
global.welcome = global.welcome ?? true;
global.adminevent = global.adminevent ?? false;
global.antispam = global.antispam ?? true;
global.autoread = global.autoread ?? false;
// normalize anticall: true => "decline"
if (global.anticall === true) global.anticall = 'decline';
global.anticall = ['decline', 'block'].includes(global.anticall) ? global.anticall : 'decline';
global.autobio = global.autobio ?? true;
global.autoTyping = global.autoTyping ?? false;
global.autorecording = global.autorecording ?? false;
global.prefa = global.prefa ?? ['', '!', '.', ',', '🐤', '🦦'];
global.status = global.status ?? true; // used by conn.public fallback
global.modeStatus = global.modeStatus ?? 'Public';
global.versions = global.versions ?? '1.0.0';

/* ---------- Paths / Session ---------- */
const sessionName = 'session';
const sessionDir = path.join(__dirname, sessionName);
const credsPath = path.join(sessionDir, 'creds.json');
if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

/* ---------- Optional: SESSION_ID via MEGA ---------- */
const config = {
  SESSION_ID: process.env.SESSION_ID || '', // format: TREND-XMD~<mega-id-fragment>
};

async function downloadSessionData() {
  if (!config.SESSION_ID) return false; // not mandatory; fallback to QR
  const parts = String(config.SESSION_ID).split('TREND-XMD~');
  if (!parts[1]) return false;
  const url = `https://mega.nz/file/${parts[1]}`;
  try {
    const response = await axios.get(url);
    const data = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    await fs.promises.writeFile(credsPath, data);
    console.log('🔒 Session Successfully Loaded from MEGA');
    return true;
  } catch {
    // silently fail; will use QR
    return false;
  }
}

/* ---------- Store (contacts/messages) ---------- */
const store = makeInMemoryStore
  ? makeInMemoryStore({ logger: MAIN_LOGGER })
  : { contacts: {}, bind: () => {} };

/* ---------- Retry cache ---------- */
const msgRetryCounterCache = new NodeCache();

/* ---------- Main client start ---------- */
async function clientstart() {
  // Try to pre-seed session (optional)
  await downloadSessionData().catch(() => {});

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  const conn = makeWASocket({
    version,
    logger,
    auth: state,
    printQRInTerminal: true, // show QR in logs if no session
    msgRetryCounterCache,
    syncFullHistory: false,
    shouldIgnoreJid: (jid) => false,
  });

  // Bind store if available
  if (store?.bind) store.bind(conn.ev);

  /* ---------- Helpers / utils on conn ---------- */
  conn.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      const decode = jidDecode(jid) || {};
      return (decode.user && decode.server && `${decode.user}@${decode.server}`) || jid;
    }
    return jid;
  };

  conn.prefa = '.';
  conn.public = global.status;
  conn.serializeM = (m) => smsg(conn, m, store);

  /* ---------- Events ---------- */

  // Connection updates
  conn.ev.on('connection.update', async (update) => {
    try {
      const { connection, lastDisconnect, qr } = update;
      if (qr) console.log(chalk.yellow('Scan the QR code above to authenticate.'));

      if (connection === 'close') {
        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
        console.log(chalk.red('Connection closed:'), reason);
        // Auto-reconnect
        await delay(2000);
        clientstart().catch(() => {});
      } else if (connection === 'open') {
        console.log(chalk.green(`✅ Connected • Mode: ${global.modeStatus} • v${global.versions}`));
      }
    } catch (err) {
      console.log(chalk.red('connection.update error:'), err);
    }
  });

  // Save creds
  conn.ev.on('creds.update', saveCreds);

  // Contacts updates
  conn.ev.on('contacts.update', (update) => {
    try {
      for (const contact of update) {
        const id = conn.decodeJid(contact.id);
        if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
      }
    } catch {}
  });

  // Messages
  conn.ev.on('messages.upsert', async (chatUpdate) => {
    try {
      const mek = chatUpdate.messages?.[0];
      if (!mek?.message) return;

      mek.message =
        Object.keys(mek.message)[0] === 'ephemeralMessage'
          ? mek.message.ephemeralMessage.message
          : mek.message;

      if (mek.key?.remoteJid === 'status@broadcast') return;
      if (!conn.public && !mek.key.fromMe && chatUpdate.type === 'notify') return;

      const m = smsg(conn, mek, store);
      // route to your command handler
      require('./start/system')(conn, m, chatUpdate, mek, store);
    } catch (err) {
      console.log(chalk.yellow.bold('[ ERROR ] system.js :\n') + chalk.redBright(util.format(err)));
    }
  });

  // Anti-call
  conn.ev.on('call', async (incomingCalls) => {
    try {
      if (!['decline', 'block'].includes(global.anticall)) return;
      for (const call of incomingCalls) {
        if (!call.isGroup && call.status === 'offer') {
          const mention = `@${call.from.split('@')[0]}`;
          let message = `📣 *NO CALLS PLEASE!*\n\n${mention}, my owner cannot receive ${
            call.isVideo ? 'video' : 'audio'
          } calls at the moment.\n\n`;
          message +=
            global.anticall === 'block'
              ? `❤️ You are being *blocked* for causing a disturbance. If this was a mistake, contact my owner to be unblocked.`
              : `🚫 Your call has been *declined*. Please avoid calling.`;

          await conn.sendMessage(call.from, {
            text: message,
            mentions: [call.from],
          });

          await conn.rejectCall(call.id, call.from);

          if (global.anticall === 'block') {
            await sleep(8000);
            await conn.updateBlockStatus(call.from, 'block');
          }
        }
      }
    } catch (e) {
      console.log('call handler error:', e);
    }
  });

  // Group participants update (welcome/goodbye + admin events)
  conn.ev.on('group-participants.update', async (anu) => {
    try {
      const groupMetadata = await conn.groupMetadata(anu.id);
      const participants = anu.participants || [];

      if (global.welcome) {
        for (const participant of participants) {
          let ppUrl;
          try {
            ppUrl = await conn.profilePictureUrl(participant, 'image');
          } catch {
            ppUrl = 'https://i.ibb.co/sFjX3nP/default.jpg';
          }

          if (anu.action === 'add') {
            await conn.sendMessage(anu.id, {
              image: { url: ppUrl },
              caption: `
👋 *Welcome* @${participant.split('@')[0]}
📛 *Group:* ${groupMetadata.subject}
👥 *Members:* ${groupMetadata.participants.length}
              `.trim(),
              mentions: [participant],
            });
          } else if (anu.action === 'remove') {
            await conn.sendMessage(anu.id, {
              image: { url: ppUrl },
              caption: `
👋 *Goodbye* @${participant.split('@')[0]}
👥 *Now:* ${groupMetadata.participants.length} members
              `.trim(),
              mentions: [participant],
            });
          }
        }
      }

      if (global.adminevent) {
        const botNumber = await conn.decodeJid(conn.user.id);
        if (participants.includes(botNumber)) return;
        for (const num of participants) {
          if (anu.action === 'promote') {
            await conn.sendMessage(anu.id, {
              text: `@${anu.author?.split('@')[0]} promoted @${num.split('@')[0]} to admin`,
              mentions: [anu.author, num].filter(Boolean),
            });
          }
          if (anu.action === 'demote') {
            await conn.sendMessage(anu.id, {
              text: `@${anu.author?.split('@')[0]} demoted @${num.split('@')[0]} from admin`,
              mentions: [anu.author, num].filter(Boolean),
            });
          }
        }
      }
    } catch (err) {
      console.log('group-participants.update error:', err);
    }
  });

  /* ---------- Convenience methods on conn ---------- */

  conn.sendTextWithMentions = async (jid, text, quoted, options = {}) =>
    conn.sendMessage(
      jid,
      {
        text,
        contextInfo: {
          mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map((v) => v[1] + '@s.whatsapp.net'),
        },
        ...options,
      },
      { quoted }
    );

  conn.sendImageAsSticker = async (jid, input, quoted, options = {}) => {
    const buff = Buffer.isBuffer(input)
      ? input
      : /^data:.*?\/.*?;base64,/i.test(input)
      ? Buffer.from(input.split(',')[1], 'base64')
      : /^https?:\/\//.test(input)
      ? await (await getBuffer(input))
      : fs.existsSync(input)
      ? fs.readFileSync(input)
      : Buffer.alloc(0);

    const buffer = options?.packname || options?.author ? await writeExifImg(buff, options) : await imageToWebp(buff);
    await conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
    return buffer;
  };

  conn.sendVideoAsSticker = async (jid, input, quoted, options = {}) => {
    const buff = Buffer.isBuffer(input)
      ? input
      : /^data:.*?\/.*?;base64,/i.test(input)
      ? Buffer.from(input.split(',')[1], 'base64')
      : /^https?:\/\//.test(input)
      ? await (await getBuffer(input))
      : fs.existsSync(input)
      ? fs.readFileSync(input)
      : Buffer.alloc(0);

    const buffer = options?.packname || options?.author ? await writeExifVid(buff, options) : await videoToWebp(buff);
    await conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
    return buffer;
  };

  conn.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
    const quoted = message.msg ? message.msg : message;
    const mime = (message.msg || message).mimetype || '';
    const messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];

    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    const type = await FileType.fromBuffer(buffer);
    const trueFileName = attachExtension ? `${filename}.${type.ext}` : filename;
    await fs.promises.writeFile(trueFileName, buffer);
    return trueFileName;
  };

  conn.getName = (jid, withoutContact = false) => {
    const id = conn.decodeJid(jid);
    withoutContact = conn.withoutContact || withoutContact;
    let v;
    if (id.endsWith('@g.us'))
      return new Promise(async (resolve) => {
        v = store.contacts?.[id] || {};
        if (!(v.name || v.subject)) v = (await conn.groupMetadata(id)) || {};
        resolve(
          v.name ||
            v.subject ||
            PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international')
        );
      });

    v =
      id === '0@s.whatsapp.net'
        ? { id, name: 'WhatsApp' }
        : id === conn.decodeJid(conn.user.id)
        ? conn.user
        : store.contacts?.[id] || {};
    return (
      (withoutContact ? '' : v.name) ||
      v.subject ||
      v.verifiedName ||
      PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    );
  };

  conn.sendContact = async (jid, kon, quoted = '', opts = {}) => {
    const list = [];
    for (const i of kon) {
      list.push({
        displayName: await conn.getName(i),
        vcard: `BEGIN:VCARD
VERSION:3.0
N:${await conn.getName(i)}
FN:${await conn.getName(i)}
item1.TEL;waid=${i}:${i}
item1.X-ABLabel:WhatsApp
item2.EMAIL;type=INTERNET: sample@example.com
item2.X-ABLabel:Email
item3.URL:https://example.com
item3.X-ABLabel:Website
END:VCARD`,
      });
    }
    await conn.sendMessage(jid, { contacts: { displayName: `${list.length} Contact`, contacts: list }, ...opts }, { quoted });
  };

  conn.copyNForward = async (jid, message, forceForward = false, options = {}) => {
    if (options.readViewOnce) {
      message.message = message.message?.ephemeralMessage?.message || message.message;
      const vtype = Object.keys(message.message.viewOnceMessage.message)[0];
      delete message.message.viewOnceMessage.message[vtype].viewOnce;
      message.message = { ...message.message.viewOnceMessage.message };
    }

    const content = await generateForwardMessageContent(message, forceForward);
    const ctype = Object.keys(content)[0];
    const context = {};

    if (Object.keys(message.message)[0] !== 'conversation') {
      Object.assign(context, message.message[Object.keys(message.message)[0]].contextInfo);
    }

    content[ctype].contextInfo = { ...context, ...content[ctype].contextInfo };

    const waMessage = await generateWAMessageFromContent(
      jid,
      content,
      options
        ? {
            ...content[ctype],
            ...options,
            ...(options.contextInfo
              ? { contextInfo: { ...content[ctype].contextInfo, ...options.contextInfo } }
              : {}),
          }
        : {}
    );

    await conn.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id });
    return waMessage;
  };

  conn.ments = (teks = '') =>
    teks.match('@') ? [...teks.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net') : [];

  conn.cMod = (jid, copy, text = '', sender = conn.user.id, options = {}) => {
    let mtype = Object.keys(copy.message)[0];
    const isEphemeral = mtype === 'ephemeralMessage';
    if (isEphemeral) mtype = Object.keys(copy.message.ephemeralMessage.message)[0];
    const msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message;
    const content = msg[mtype];
    if (typeof content === 'string') msg[mtype] = text || content;
    else if (content.caption) content.caption = text || content.caption;
    else if (content.text) content.text = text || content.text;
    if (typeof content !== 'string') msg[mtype] = { ...content, ...options };
    if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
    if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid;
    else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid;
    copy.key.remoteJid = jid;
    copy.key.fromMe = sender === conn.user.id;
    return proto.WebMessageInfo.fromObject(copy);
  };

  conn.sendText = (jid, text, quoted = '', options = {}) =>
    conn.sendMessage(jid, { text, ...options }, { quoted });

  conn.deleteMessage = async (chatId, key) => {
    try {
      await conn.sendMessage(chatId, { delete: key });
      console.log(`Deleted message: ${key.id}`);
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  conn.downloadMediaMessage = async (message) => {
    const mime = (message.msg || message).mimetype || '';
    const messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
    const stream = await downloadContentFromMessage(message, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    return buffer;
  };

  return conn;
}

/* ---------- Start client ---------- */
clientstart().catch((e) => {
  console.error('Failed to start client:', e);
});

/* ---------- Hot-reload this file ---------- */
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});

/* ---------- Basic error guards ---------- */
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
