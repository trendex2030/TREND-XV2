console.clear();
console.log('starting...');
require('./setting/config');
process.on("uncaughtException", console.error);

const {
    default: makeWASocket,
    DisconnectReason,
    fetchLatestBaileysVersion,
    useMultiFileAuthState
} = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

// ================== SESSION HANDLER ================== //
async function loadSession(sessionID) {
    const sessionPath = path.join(__dirname, 'auth_info');
    fs.mkdirSync(sessionPath, { recursive: true });

    if (!sessionID) {
        console.log("❌ SESSION_ID not found. Please set env SESSION_ID");
        process.exit(1);
    }

    if (!sessionID.startsWith("TREND-XMD~")) {
        console.log("❌ Invalid SESSION_ID. Must start with TREND-XMD~");
        process.exit(1);
    }

    // Remove prefix & decode
    const base64Data = sessionID.replace("TREND-XMD~", "");
    const data = Buffer.from(base64Data, 'base64').toString('utf-8');

    // Save creds.json
    fs.writeFileSync(path.join(sessionPath, 'creds.json'), data);

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    return { state, saveCreds };
}

// ================== BOT STARTER ================== //
async function startBot() {
    const { version } = await fetchLatestBaileysVersion();
    const sessionID = process.env.SESSION_ID;

    const { state, saveCreds } = await loadSession(sessionID);

    const conn = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        syncFullHistory: true
    });

    // Save creds on update
    conn.ev.on('creds.update', saveCreds);

    // Reconnect logic
    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                console.log("⚠️ Reconnecting...");
                startBot();
            } else {
                console.log("❌ SESSION_ID expired or logged out. Please regenerate.");
            }
        } else if (connection === 'open') {
            console.log(`✅ ${global.botname} (${global.versions}) connected in ${global.modeStatus} mode!`);
        }
    });

    // ================== COMMANDS / FEATURES ================== //
    try {
        require('./start/system')(conn);
    } catch (e) {
        console.error("❌ Failed to load commands:", e);
    }
}

startBot();
