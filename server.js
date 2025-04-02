const http = require('http');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
dotenv.config();

const key = process.env.CHAVE_CRIPTO;
const alf="abcdefghijklmnopqrstuvwxyz"

function positionInAlf(char) {
    return alf.indexOf(char.toLowerCase());
}

function getShift(position) {
    const keyChar = key[position % key.length];
    return (positionInAlf(keyChar) + position) % 26;
}

function encrypt(message) {
    let cript_message = "";
    for (let i = 0; i < message.length; i++) {
        const char = message[i].toLowerCase();
        const positionOrigin = positionInAlf(char);

        if (positionOrigin >= 0) {
            const shift = getShift(i);
            const newPosition = (positionOrigin + shift) % 26;
            cript_message += alf[newPosition];
        } else {
            cript_message += char;
        }
    }
    return cript_message;
}

function decrypt(encryptMessage) {
    let decrypt_message = "";
    for (let i = 0; i < encryptMessage.length; i++) {
        const char = encryptMessage[i].toLowerCase();
        const positionEncrypt = positionInAlf(char);

        if (positionEncrypt >= 0) {
            const shift = getShift(i);
            let positionOrigin = (positionEncrypt - shift) % 26;
            if (positionOrigin < 0) positionOrigin += 26;
            decrypt_message += alf[positionOrigin];
        } else {
            decrypt_message += char;
        }
    }
    return decrypt_message;
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Rota para servir o HTML
    if (req.url === '/' && req.method === 'GET') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                return res.end('Erro ao carregar a página');
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
        return;
    }

    // Rotas da API
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const dados = JSON.parse(body);
                let response;

                if (req.url === '/encrypt') {
                    const encrypt_message= encrypt(dados.message)
                    response = { 'encrypted': encrypt(dados.message || '') };
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(response));
                }
                else if (req.url === '/decrypt') {
                    response = { 'decrypted': decrypt(dados.encrypt || '') };
                    console.log(response)
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(response));
                }
                else {
                    res.writeHead(404);
                    res.end(JSON.stringify({ 'error': 'Route not found' }));
                }
            } catch (err) {
                res.writeHead(400);
                res.end(JSON.stringify({ 'error': 'Invalid request' }));
            }
        });
        return;
    }

    res.writeHead(404);
    res.end('Página não encontrada');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Endpoints:`);
    console.log(`GET / - Página HTML`);
    console.log(`POST /encrypt - {message: text}`);
    console.log(`POST /decrypt - {encrypt: text}`);
});