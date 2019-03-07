const io = require('socket.io-client');

module.exports = {
  socket: undefined,
  connect(ip, port) {
    this.socket = io(`http://${ip}:${port}`);
  }
};
