const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

const ipRequests = {};
const MAX_REQUESTS = 30;

io.on('connection', (socket) => {
    setInterval(() => {
        exec('netstat -an', (error, stdout) => {
            if (error) {
                console.error('خطأ في تشغيل', error);
                return;
            }
            
            const connections = stdout.split('\n')
                .filter(line => line.includes('TCP') || line.includes('UDP'))
                .map(line => line.trim().split(/\s+/));

            let flaggedIps = [];

            connections.forEach(conn => {
                let srcIP = conn[1].split(':')[0];

                if (srcIP !== '0.0.0.0' && srcIP !== '127.0.0.1') {
                    ipRequests[srcIP] = (ipRequests[srcIP] || 0) + 1;

                    if (ipRequests[srcIP] > MAX_REQUESTS) {
                        flaggedIps.push(srcIP);
                        console.log(`تم اكتشاف عنوان شبكة مشبوه : ${srcIP}`);
                    }
                }
            });

            io.emit('networkData', connections);
        });
    }, 3000);

    socket.on('disconnect', () => { console.log('disconnect'); });
});

server.listen(PORT, () => { console.log(`Server running on http://localhost:${PORT}`); });