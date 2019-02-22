const socket = require('electron').remote.require('./socket');

//for every changes on gameList, the server will notify all clients
socket.on('listGames', (roomList) => {
  let toAdd = '';
  for (const room of roomList) {
    toAdd += `<tr>
                <td>${room.id}</td>
                <td>players: ${room.players.length}/4</td>
                <td><button onclick="joinRoom('${room.id}')">join</button></td>
              </tr>`
  }
  document.getElementById('room-list').innerHTML = toAdd;
});

function joinRoom(id) {
  location.href='../room/room.html';
  socket.emit('joinRoom', id);
  socket.off('listGames');
}

//ask for initial games list
socket.emit('listGames');
