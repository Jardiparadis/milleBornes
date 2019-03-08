const io = require('socket.io-client');

module.exports = {
  socket: undefined,
  init(ip, port) {
    this.socket = io(`http://${ip}:${port}`, {autoConnect: false});
  },
  connectToServer() {
    this.socket.open();
  }
};
