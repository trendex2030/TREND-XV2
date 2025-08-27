const fs = require('fs');

// ========= Setting Owner ========= //
global.owner = ["254734939236"];
global.ownername = "TRENDEX";
global.botname = "TREND-X";

// ========= Setting Channel ========= //
global.namasaluran = "TREND-X";
global.idsaluran = "120363401765045963@newsletter";
global.linksaluran = "";

// ========= Setting Status ========= //
global.autoviewstatus = true;
global.welcome = true;
global.adminevent = false;
global.antispam = true;
global.autoread = false;
global.anticall = true;
global.antibug = true;
global.autobio = true;
global.autoTyping = false;
global.autorecording = false;
global.prefa = ['', '!', '.', ',', '🐤', '🦦'];

// ========= Add modeStatus and versions ========= //
global.modeStatus = "Public"; 
global.versions = "1.0.0";

// ========= Setting WM ========= //
global.packname = 'trend-x';
global.author = 'trendex';

global.gcount = {
    prem: 500,
    user: 15
};

global.limitCount = 10;

global.mess = {
    group: "*This is not a group*",
    admin: "*To use this feature first make TREND-X admin*",
    owner: "*Sorry bro😛, you're not my owner*",
    premium: "*First become a premium user*",
    botadmin: "*TREND-X needs to be admin*",
    limited: "*Limit reached*"
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(`\x1b[0;32m${__filename} \x1b[1;32mupdated!\x1b[0m`);
  delete require.cache[file];
  require(file);
});
