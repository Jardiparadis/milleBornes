const socket = require('electron').remote.require('./socket');

function leaveRoom() {
  location.href='../roomList/roomList.html';
  socket.emit('leaveRoom');
  socket.off('currentRoomInfos');
}

socket.on('currentRoomInfos', (room) => {
  let toAdd = '';

  for (const player of room.players) {
    toAdd += `<tr>
                <td>Player ${player}</td>
              </tr>`;
  }
  document.getElementById('player-list').innerHTML = toAdd;
});

//Inital room infos
socket.emit('getCurrentRoomInfos');
