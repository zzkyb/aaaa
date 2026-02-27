const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 托管前端静态文件
app.use(express.static(path.join(__dirname, 'public')));

// 全局在线人数
let onlineCount = 0;

io.on('connection', (socket) => {
    onlineCount++;
    // 广播当前人数
    io.emit('update_count', onlineCount);

    // 接收用户的涟漪 (Ping)
    socket.on('send_ripple', (data) => {
        // 广播给除了自己以外的所有人
        socket.broadcast.emit('receive_ripple', data);
    });

    // 接收用户离场变成流星
    socket.on('depart', (data) => {
        socket.broadcast.emit('user_departed', data);
    });

    socket.on('disconnect', () => {
        onlineCount--;
        io.emit('update_count', onlineCount);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`\n🌌 宇宙大门已开启: http://localhost:${PORT}\n`);
});