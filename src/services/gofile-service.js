const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const axios = require("axios");
const os = require('os');
const config = require('../config');
const { getStoragePath } = require('../utils/storage');

const machineId = os.hostname();

async function createFolder(parentFolderID, userToken, folderName) {
    try {
        const { data } = await axios.post('https://api.gofile.io/contents/createFolder', {
            parentFolderId: parentFolderID,
            token: userToken,
            folderName: folderName
        });
        return data;
    } catch (e) {
        console.error('Erro ao criar pasta no Gofile:', e.response?.data || e.message);
        throw e;
    }
}

async function uploadFile(server, fileToUpload, userToken, folderID) {
    try {
        const { data } = await axios.post(`https://${server}.gofile.io/uploadFile`, {
            folderId: folderID,
            file: fileToUpload,
            token: userToken,
        }, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return data;
    } catch (e) {
        console.error('Erro ao fazer upload para o Gofile:', e.response?.data || e.message);
        throw e;
    }
}

async function ensureFolder() {
    const storagePath = getStoragePath();
    const folderIdFile = path.join(storagePath, 'folder_id.txt');

    try {
        const savedId = await fs.readFile(folderIdFile, 'utf8');
        if (savedId) {
            return savedId.trim();
        }
    } catch (err) {
        // Ignora se o arquivo não existe, continuará para criar uma nova pasta
    }
    
    // O ID da pasta pai "c0e98ca0..." parece ser uma constante, pode ser movido para a config também
    const res = await createFolder("c0e98ca0-41c4-4287-8a6b-d197e67a74cf", config.gofileToken, machineId);
    const newId = res.data.id;

    await fs.writeFile(folderIdFile, newId);
    return newId;
}

async function sendFileToGofile(filePath) {
    const folderId = await ensureFolder();
    const fileStream = fsSync.createReadStream(filePath);
    
    // O servidor 'upload' parece ser fixo. Se puder variar, pode ser obtido de outra forma.
    const res = await uploadFile("upload", fileStream, config.gofileToken, folderId);
    return res.data.name;
}

module.exports = { sendFileToGofile };