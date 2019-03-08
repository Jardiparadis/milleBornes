const {socket} = require('electron').remote.require('./socket');

//for every changes on gameList, the server will notify all clients
socket.on('listGames', (roomList) => {
  let toAdd = '';
  for (const room of roomList) {
    toAdd += `<tr>
                <td>${room.owner}'s room</td>
                <td>players: ${room.room.players.length}/5</td>
                <td><button class="button is-success" onclick="joinRoom('${room.room.id}')">join</button></td>
              </tr>`
  }
  if (toAdd.length === 0) {
    toAdd = `No room available`;
  }
  document.getElementById('room-list').innerHTML = toAdd;
});

socket.on('joinRoomAccepted', () => {
  socket.off('listGames');
  location.href='../room/room.html';
});

function joinRoom(id) {
  socket.emit('joinRoom', id);
}

function hostRoom() {
  location.href='../room/room.html';
  socket.emit('createNewRoom');
  socket.off('listGames');
}

//ask for initial games list
socket.emit('listGames');
