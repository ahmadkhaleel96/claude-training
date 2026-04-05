require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { registerSocketHandlers } = require('./socket');

const PORT = 3001;

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

registerSocketHandlers(io);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = { app, server, io };
