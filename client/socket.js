const io = require('socket.io-client');

const socket = io('http://localhost:8089');

module.exports = socket;
