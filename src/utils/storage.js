const path = require('path');
const os = require('os');
const fs = require('fs');
const config = require('../config');

function getStoragePath() {
    const base =
        process.platform === 'win32'
            ? process.env.APPDATA
            : process.platform === 'darwin'
                ? path.join(os.homedir(), 'Library', 'Application Support')
                : path.join(os.homedir(), '.config');

    const storagePath = path.join(base, config.appName);

    if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true });
    }
    
    return storagePath;
}

module.exports = { getStoragePath };