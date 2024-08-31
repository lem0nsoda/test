// server.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });



wss.on('connection', function connection(ws) {

    const message = {
        sender: 'Server',
        text: 'Ein neuer Client hat sich verbunden.'
    };
    ws.send(JSON.stringify(message));

    ws.on('message', function incoming(message) {
        console.log('Erhalten: %s', message);
        wss.clients.forEach(function each(client) {
            console.log ("Send to Client ...")
            if (client !== wss && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
    ws.on('close', () => console.log('Ein Client hat die Verbindung getrennt.'));
});