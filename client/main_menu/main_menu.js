const socket = require('electron').remote.require('./socket');

function goToRoomList() {
    location.href='../roomList/roomList.html';
    socket.emit('setName', document.getElementById('name').value);
}
