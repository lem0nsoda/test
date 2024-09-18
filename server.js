const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const imageUrl1 = 'https://images.pexels.com/photos/11998666/pexels-photo-11998666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
const imageUrl2 = 'https://images.pexels.com/photos/28071784/pexels-photo-28071784/free-photo-of-rot-frau-koffein-kaffee.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
const imageUrl3 = 'https://images.pexels.com/photos/28369904/pexels-photo-28369904/free-photo-of-oregon.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';

let dataArray = [];

wss.on('connection', function connection(ws) {
    // Client-ID generieren
    const clientId = Math.floor(Math.random() * 10) + 1;

    // Client begrüßen
    const welcomeMessage = {
        sender: 'Server',
        text: 'Ein neuer Client hat sich verbunden.',
        clientId: clientId
    };
    ws.send(JSON.stringify(welcomeMessage));

    // Nachricht von Client erhalten
    ws.on('message', function incoming(message) {
        console.log('Erhalten: %s', message);

        const parsedMessage = JSON.parse(message);

        // Prüfen, ob die Client-ID bereits im Array vorhanden ist
        const existingClient = dataArray.find(client => client.clientId === clientId);

        if (!existingClient) {
            // Zum Array hinzufügen, wenn noch nicht vorhanden
            dataArray.push({
                clientId: clientId,
                screenWidth: parsedMessage.screenWidth,
                screenHeight: parsedMessage.screenHeight
            });

            // Array in der Konsole ausgeben
            console.log("Aktueller dataArray (neuer Eintrag hinzugefügt):", dataArray);
        }

        // Nachricht an alle Clients weiterleiten
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });

        // Prüfen, ob die Nachricht den Befehl zum Anzeigen eines Bildes enthält
        if (parsedMessage.text === 'showImage') {
            console.log("Bild soll angezeigt werden");

            // Nachricht senden, um dem Client mitzuteilen, dass er ein Bild anzeigen soll
            const displayImageMessage = {
                sender: 'Server',
                text: 'displayImage',
                imageUrl: imageUrl1 // Variable für den Bildpfad
            };

            // Nachricht an alle Clients senden
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(displayImageMessage));
                }
            });
        }

        // Diashow ausgeben
        if (parsedMessage.text === 'showDia') {
            console.log("Diashow soll angezeigt werden");

            // Nachricht senden, um dem Client mitzuteilen, dass er eine Diashow anzeigen soll
            const displayDiaMessage = {
                sender: 'Server',
                text: 'displayDia',
                images: [imageUrl1, imageUrl2, imageUrl3] // Array von Bild-URLs - später Ordner mit Bilder
            };

            // Nachricht an alle Clients senden
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(displayDiaMessage));
                }
            });
        }
    });

    // Wenn der Client die Verbindung trennt
    ws.on('close', function () {
        console.log(`Client ${clientId} hat die Verbindung getrennt.`);

        // Entferne den Client aus dem dataArray
        dataArray = dataArray.filter(client => client.clientId !== clientId);

        // Array in der Konsole ausgeben
        console.log("Aktuelles dataArray nach Trennung:", dataArray);

        // Nachricht an alle Clients senden, dass der Client die Verbindung getrennt hat
        const disconnectMessage = {
            sender: 'Server',
            text: `Client ${clientId} hat die Verbindung getrennt.`
        };

        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(disconnectMessage));
            }
        });
    });
});
