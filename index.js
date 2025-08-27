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
} = require("@whiskeysockets/baileys")

const pino = require('pino');
const readline = require("readline");
const fs = require('fs');
const os = require('os')
const chalk = require('chalk')
const _ = require('lodash')
const lolcatjs = require('lolcatjs')
const util = require('util')
const fetch = require('node-fetch')
const moment = require('moment-timezone')
const FileType = require('file-type');
const { Boom } = require('@hapi/boom');
const PhoneNumber = require('awesome-phonenumber');
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
} = require('./start/lib/exif')

const sessionName = "session";
const app = express();
const orange = chalk.bold.hex("#FFA500");
const lime = chalk.bold.hex("#32CD32");
let useQR = false;
let initialConnection = true;
const PORT = process.env.PORT || 3000;

const MAIN_LOGGER = pino({
    timestamp: () => `,"time":"${new Date().toJSON()}"`
});
const logger = MAIN_LOGGER.child({});
logger.level = "trace";

const msgRetryCounterCache = new NodeCache();

const path = require('path');
const __filename = __filename; // Already provided by Node in CommonJS
const __dirname = __dirname;   // Already provided by Node in CommonJS

const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');

if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
}

async function downloadSessionData() {
    if (!config.SESSION_ID) {
        console.error('Please add your session to SESSION_ID env !!');
        return false;
    }
    const sessdata = config.SESSION_ID.split("TREND-XMD~")[1];
    const url = `https://mega.nz/file/${sessdata}`;
    try {
        const response = await axios.get(url);
        const data = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        await fs.promises.writeFile(credsPath, data);
        console.log("🔒 Session Successfully Loaded !!");
        return true;
    } catch (error) {
       // console.error('Failed to download session data:', error);
        return false;
    }
}

conn.ev.on('messages.upsert', async chatUpdate => {
try {
let mek = chatUpdate.messages[0]
if (!mek.message) return
mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
if (mek.key && mek.key.remoteJid === 'status@broadcast') return
 if (!conn.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
let m = smsg(conn, mek, store)
require("./start/system")(conn, m, chatUpdate, mek, store)
} catch (err) {
console.log(chalk.yellow.bold("[ ERROR ] system.js :\n") + chalk.redBright(util.format(err)))
}
})


conn.decodeJid = (jid) => {
if (!jid) return jid;
if (/:\d+@/gi.test(jid)) {
let decode = jidDecode(jid) || {};
return decode.user && decode.server && decode.user + '@' + decode.server || jid;
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
mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(
  (v) => v[1] + "@s.whatsapp.net",
),
  },
  ...options,
},
{ quoted },
  );

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
let messageType = message.mtype
? message.mtype.replace(/Message/gi, "")
: mime.split("/")[0];

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
vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await conn.getName(i)}\nFN:${await conn.getName(i)}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:jangan spam bang\nitem2.EMAIL;type=INTERNET: Zuurzyen\nitem2.X-ABLabel:YouTube\nitem3.URL:Zuuryzen.tech\nitem3.X-ABLabel:GitHub\nitem4.ADR:;;Indonesia;;;;\nitem4.X-ABLabel:Region\nEND:VCARD`
})
}
conn.sendMessage(jid, { contacts: { displayName: `${list.length} Contact`, contacts: list }, ...opts }, { quoted })
}

conn.serializeM = (m) => smsg(conn, m, store);

conn.copyNForward = async (jid, message, forceForward = false, options = {}) => {
let vtype;
if (options.readViewOnce) {
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

conn.prefa = '.'
conn.public = global.status;
conn.serializeM = (m) => smsg(conn, m, store)

conn.ev.on('connection.update', async (update) => {
let { Connecting } = require("./start/lib/connection/connect.js");
Connecting({ update, conn, Boom, DisconnectReason, sleep, color, clientstart });
})
//anticall
conn.ev.on('call', async (incomingCalls) => {
    let botId = await conn.decodeJid(conn.user.id);
    
    if (!["decline", "block"].includes(global.anticall)) return;

    console.log(incomingCalls);

    for (let call of incomingCalls) {
        if (!call.isGroup && call.status === "offer") { 
            let message = `馃毃 *饾櫜饾櫚饾櫥饾櫥 饾櫝饾櫞饾殐饾櫞饾櫜饾殐饾櫞饾櫝!* 馃毃\n\n`;
            message += `@${call.from.split('@')[0]}, my owner cannot receive ${call.isVideo ? `video` : `audio`} calls at the moment.\n\n`;

            if (global.anticall === "block") {
                message += `鉂� You are being *blocked* for causing a disturbance. If this was a mistake, contact my owner to be unblocked.`;
            } else {
                message += `鈿狅笍 Your call has been *declined*. Please avoid calling.`;
            }

            await conn.sendTextWithMentions(call.from, message);
            await conn.rejectCall(call.id, call.from);

            if (global.anticall === "block") {
                await sleep(8000);
                await conn.updateBlockStatus(call.from, "block");
            }
        }
    }
});

conn.ev.on('group-participants.update', async (anu) => {
if(global.welcome){
  const groupMetadata = await conn.groupMetadata(anu.id);
  const participants = anu.participants;

  for (const participant of participants) {
    let ppUrl;
    try {
      ppUrl = await conn.profilePictureUrl(participant, 'image');
    } catch {
      ppUrl = 'https://i.ibb.co/sFjX3nP/default.jpg'; // Fallback image
    }

    const name = (await conn.onWhatsApp(participant))[0]?.notify || participant;

    if (anu.action === 'add') {
const memberCount = groupMetadata.participants.length;
      await conn.sendMessage(anu.id, {
        image: { url: ppUrl },
        caption: `
  鈺戔灣  *Vinic-Xmd welcome*@${participant.split('@')[0]}  
  鈺戔灣  饾櫠饾殯饾殬饾殲饾殭饾櫧饾殜饾殩饾殠 :*${groupMetadata.subject}*
  鈺戔灣 *You're our${groupMetadata.participants.length}th member!*
  *Toatale members* : ${groupMetadata.participants.length}
  鈺戔灣  饾櫜饾殜饾殲饾殰饾殠 饾殞饾殤饾殜饾殬饾殰 饾殥饾殱饾殰 饾殜饾殨饾殸饾殜饾殺饾殰 饾殢饾殲饾殫
  
     `,
        mentions: [participant]
      });
    } else if (anu.action === 'remove') {
    const memberCount = groupMetadata.participants.length;
      await conn.sendMessage(anu.id, {
        image: { url: ppUrl },
        caption: `
  鈺戔灣  *馃憢 Goodbye*馃槳@${participant.split('@')[0]}
  鈺戔灣 We're now ${groupMetadata.participants.length} members.
  鈺戔灣  *Toatale members* : ${groupMetadata.participants.length}
      `,
        mentions: [participant]
      });
    }
  }
}
   
            if (global.adminevent) {
            console.log(anu)
        let botNumber = await conn.decodeJid(conn.user.id)
        if (anu.participants.includes(botNumber)) return
        try {
            let metadata = await conn.groupMetadata(anu.id)
            let namagc = metadata.subject
            let participants = anu.participants
            for (let num of participants) {
                let check = anu.author !== num && anu.author.length > 1
                let tag = check ? [anu.author, num] : [num]
                try {
                    ppuser = await conn.profilePictureUrl(num, 'image')
                } catch {
                    ppuser = 'https://telegra.ph/file/de7c8230aff02d7bd1a93.jpg'
                } 
                 if (anu.action == "promote") {
                     conn.sendMessage(anu.id, {
                         text: `@${anu.author.split("@")[0]} 饾棝饾棶饾榾 饾椊饾椏饾椉饾椇饾椉饾榿饾棽饾棻 @${num.split("@")[0]} 饾棓饾榾 饾棶饾棻饾椇饾椂饾椈`, 
                         
                     }
                 )
             }
                if (anu.action == "demote") {
                    conn.sendMessage(anu.id, {
                        text: `@${anu.author.split("@")[0]} 饾棝饾棶饾榾 饾棻饾棽饾椇饾椉饾榿饾棽饾棻  @${num.split("@")[0]} 饾棓饾榾 饾棶饾棻饾椇饾椂饾椈`, 
                        
                    })
                }
             
            } 
        } catch (err) {
            console.log(err)
        }
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

conn.sendMessage(jid, buttonMessage, { quoted })
}

conn.sendList = async (jid, title, footer, btn, quoted = '', options = {}) => {
let msg = generateWAMessageFromContent(jid, {
viewOnceMessage: {
message: {
"messageContextInfo": {
"deviceListMetadata": {},
"deviceListMetadataVersion": 2
},
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
return await conn.relayMessage(msg.key.remoteJid, msg.message, {
messageId: msg.key.id
})
}

conn.sendButtonProto = async (jid, title, footer, buttons = [], quoted = '', options = {}) => {
let msg = generateWAMessageFromContent(jid, {
viewOnceMessage: {
message: {
"messageContextInfo": {
"deviceListMetadata": {},
"deviceListMetadataVersion": 2
},
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
return await conn.relayMessage(msg.key.remoteJid, msg.message, {
messageId: msg.key.id
})
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
else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
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
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])}
return buffer
} 

conn.ev.on('creds.update', saveCreds);
conn.serializeM = (m) => smsg(conn, m, store);
return conn;
}

clientstart();

let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(chalk.redBright(`Update ${__filename}`))
delete require.cache[file]
require(file)
})
