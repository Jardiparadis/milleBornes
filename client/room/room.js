const {socket} = require('electron').remote.require('./socket');

let ready = false;

function leaveRoom() {
  location.href='../roomList/roomList.html';
  socket.emit('leaveRoom');
  socket.off('currentRoomInfos');
}

function changeState() {
  socket.emit('changeState');
  ready = !ready;
}

socket.on('startGame', () => {
  location.href='../game/game.html';
  socket.off('currentRoomInfos');
});

socket.on('currentRoomInfos', (room) => {
  let toAdd = '';

  let index = 0;
  for (const player of room.players) {
    toAdd += `<tr>
                <td>${room.names[index]}</td>
                <td>${room.isReady[index] === true ? 'Ready' : 'Unready'}</td>
              </tr>`;
    index += 1;
  }
  document.getElementById('player-list').innerHTML = toAdd;
});

//Inital room infos
socket.emit('getCurrentRoomInfos');
