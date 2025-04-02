const http = require('http');
const dotenv= require('dotenv');
dotenv.config();

const key = process.env.CHAVE_CRIPTO;
const alf= "abcdefghijklmnopqrstuvwxyz";

function positionInAlf(char){
    return alf.indexOf(char.toLowerCase());
}

function getShift(position){
    const keyChar = key[position % key.length]
    return positionInAlf(keyChar + position) % 26;
}

function encrypt(message){
    let cript_message = "";
    for(let i = 0; i < message.length; i++){
        const char = message[i].toLowerCase();
        const positionOrigin = positionInAlf(char);

        if(positionOrigin >= 0){
            const shift = getShift(i);
            const newPosition = (positionOrigin + shift) % 26;
            cript_message += alf[newPosition];
        }else{
            cript_message += char;
        }
    }
}

function decrypt(encryptMessage){
    let decrypt_message = "";
    for(let i = 0; i < decrypt_message.length; i++){
        const char = decrypt_message[i].toLowerCase();
        const positionEncrypt = positionInAlf(char);

        if(positionEncrypt >= 0){
            const shift = getShift(i);
            const positionOrigin = (positionEncrypt - shift) % 26;
            if(positionOrigin < 0) positionOrigin += 26
            decrypt_message += alf[positionOrigin];
        }else{
            decrypt_message += char;
        }
    }
}

const server = http.createServer((req, res) =>{
     res.setHeader('Acceess-Control-Allow-Origin', '*');
     res.setHeader('Access-Control-Allow-Methods', 'POST');
     res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
     res.setHeader('Content-Type', 'application/json');

     if (req.method === 'OPTIONS'){
        res.writeHead(200);
        res.end();
        return;
     }

     if(req.method === 'POST'){
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () =>{
            try{
                const dados = JSON.parse(body);
                let response;
                

                if(req.url === '/encrypt'){
                    response = {'encrypted' : encrypt(dados.message || '')};
                }
                else if(req.url === '/decrypt'){
                    response = {'decrypted' : decrypt(dados.encrypt || '')};
                }
                else{
                    res.writeHead(404);
                    return res.end(JSON.stringify({'error': 'Route is not'}));
                }

                res.end(JSON.stringify(response));
            }catch (err){
                res.writeHead(400);
                res.end(JSON.stringify({'error': 'Request invalid'}));
            }
        })
     }else{
        res.writeHead(405);
        res.end(JSON.stringify({'error': 'Method is not permission'}))
     }
});


const PORT= process.env.PORT
server.listen(PORT,() =>{
    console.log(`Server is run port ${PORT}`);
    console.log(`Endpoints: `);
    console.log(`POST /encrypt - {message: text}`);
    console.log(`POST /decrypt - {encrypt: text}`);
})