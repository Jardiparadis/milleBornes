const socket = require('electron').remote.require('./socket');

function goToRoomList() {
    let name = document.getElementById('name').value;
    let ip = document.getElementById('ip').value;
    let port = document.getElementById('port').value;

    if (name.length > 0 && ip.length > 0 && port.length > 0) {
        socket.init(ip, port);
        socket.socket.on('connect', () => {
            socket.socket.emit('setName', document.getElementById('name').value);
            location.href='../roomList/roomList.html';
        });
        socket.connectToServer();
    }
}
