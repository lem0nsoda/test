const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const imageUrl = 'https://storage.kawasaki.eu/public/kawasaki.eu/en-EU/model/23MY_Z400_GN1_STU__1_.png'; // Bild-URL als Variable
let dataArray = [];

wss.on('connection', function connection(ws) {
    // Client-ID generieren, da noch ohne URl(xxamp) aus der man ID liest
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

        // Zum Array hinzufügen
        dataArray.push({
            clientId: clientId,
            screenWidth: parsedMessage.screenWidth,
            screenHeight: parsedMessage.screenHeight
        });

        // Array in der Konsole ausgeben
        console.log("Aktueller dataArray:", dataArray);

        // Nachricht an alle anderen Clients weiterleiten
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
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
                imageUrl: imageUrl // Variable für den Bildpfad
            };
            ws.send(JSON.stringify(displayImageMessage));
        }
    });

    // Wenn der Client die Verbindung trennt
    ws.on('close', function () {
        console.log(`Client ${clientId} hat die Verbindung getrennt.`);

        // Entferne den Client aus dem dataArray
        dataArray = dataArray.filter(client => client.clientId !== clientId);

        // Array in der Konsole ausgeben
        console.log("Aktuelles dataArray nach Trennung:", dataArray);
    });
});
