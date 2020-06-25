const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const { spawn } = require('child_process');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer:true });

app.use((req, res, next)=>{
    next();
})

app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/index.html');
})

server.on('upgrade', (req, socket, head)=>{
    if(req.headers.origin !== 'http://localhost:8080'){
        socket.destroy();
        return;
    }

    wss.handleUpgrade(req, socket, head, (ws)=>{
        wss.emit('connection', ws);
    })
})

wss.on('connection', (ws)=>{
    ws.on('message', (message)=>{
        let command = message.toString();
        let runCommand = spawn(command, { shell: '/bin/bash' });

        runCommand.stdout.on('data', (data)=>{
            ws.send(data.toString());
        })

        runCommand.stderr.on('data', (data)=>{
            ws.send(data.toString());
        })

        runCommand.on('close', (signal)=>{
            ws.send('\n> ');
        })
    })
})

server.listen(8080);