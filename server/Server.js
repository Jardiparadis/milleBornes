const uid = require('uid');
const app = require('http').createServer();
const io = require('socket.io')(app);
const serverPort = 8089;

const clients = new Map();
const rooms = new Map();
const games = new Map();

rooms.set('1', {id: '1', players: ['1', '1', '1']});
rooms.set('2', {id: '2', players: ['1', '1']});

function listAllGames() {
    let response = [];

    rooms.forEach((value) => {
      response.push(value);
    });
    return response;
}

function getRoomInfo(roomId) {
  let room = rooms.get(roomId);

  let infosToSend = JSON.parse(JSON.stringify(room));
  let readyList = [];
  clients.forEach((value) => {
    if (room.players.indexOf(value.uid) !== -1)
      readyList.push(value.ready);
  });
  infosToSend.isReady = readyList;
  return (infosToSend);
}

io.on('connection', socket => {
    let client = {
        uid: uid(7),
        socket: socket,
        ready: false
    };
    clients.set(client.uid, client);
    console.log('New client conencted: ' + client.uid);
    socket.on('listGames', () => {
        socket.emit('listGames', listAllGames());
    });

    socket.on('joinRoom', (id) => {
      let room = rooms.get(id);
      room.players.push(client.uid);
      client.ready = false;
      socket.broadcast.emit('listGames', listAllGames());

      for (const room of rooms) {
        if (room[1].players.indexOf(client.uid) !== -1) {
          for (const player of room[1].players) {
              if (player === '1')
                continue;
              clients.get(player).socket.emit('currentRoomInfos', getRoomInfo(room[0]));
          }
        }
      }
    });

    socket.on('leaveRoom', () => {
      for (const room of rooms) {
        if (room[1].players.indexOf(client.uid) !== -1) {
          room[1].players.splice(room[1].players.indexOf(client.uid), 1);
          for (const player of room[1].players) {
            if (player === '1')
              continue;
            clients.get(player).socket.emit('currentRoomInfos', getRoomInfo(room[0]));
          }
        }
      }
      client.ready = false;
      socket.broadcast.emit('listGames', listAllGames());
    });

    socket.on('createNewRoom', () => {
      const newUid = uid(7);
      rooms.set(newUid, {id: newUid, players: [client.uid]});
      client.ready = false;
      socket.broadcast.emit('listGames', listAllGames());
    });

    socket.on('changeState', () => {
      client.ready = !client.ready;
      for (const room of rooms) {
        if (room[1].players.indexOf(client.uid) !== -1) {
          for (const player of room[1].players) {
            if (player === '1')
              continue;
            clients.get(player).socket.emit('currentRoomInfos', getRoomInfo(room[0]));
          }
        }
      }
    });

    socket.on('getCurrentRoomInfos', () => {
      for (const room of rooms) {
        for (const player of room[1].players) {
          console.log(player);
          console.log(client.uid);
          console.log(rooms);
          if (player === client.uid) {
            socket.emit('currentRoomInfos', getRoomInfo(room[0]));
          }
        }
      }
    });
});

app.listen(serverPort, () => {
    console.log(`Server listening on port ${app.address().port}.`)
});
