const socket = require('electron').remote.require('./socket');

function goToRoomList() {
    location.href='../roomList/roomList.html';
    socket.connect('localhost', 8089);
    socket.socket.emit('setName', document.getElementById('name').value);
}
