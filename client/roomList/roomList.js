const {socket} = require('electron').remote.require('./socket');

//for every changes on gameList, the server will notify all clients
socket.on('listGames', (roomList) => {
  let toAdd = '';
  for (const room of roomList) {
    toAdd += `<tr>
                <td>${room.owner}</td>
                <td>players: ${room.room.players.length}/4</td>
                <td><button onclick="joinRoom('${room.room.id}')">join</button></td>
              </tr>`
  }
  document.getElementById('room-list').innerHTML = toAdd;
});

function joinRoom(id) {
  location.href='../room/room.html';
  socket.emit('joinRoom', id);
  socket.off('listGames');
}

function hostRoom() {
  location.href='../room/room.html';
  socket.emit('createNewRoom');
  socket.off('listGames');
}

//ask for initial games list
socket.emit('listGames');
