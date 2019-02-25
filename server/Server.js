const uid = require('uid');
const app = require('http').createServer();
const io = require('socket.io')(app);
const serverPort = 8089;

const clients = new Map();
const rooms = new Map();
const games = new Map();

const deckModule = require('./deck');
const playersModule = require('./players');

rooms.set('1', {id: '1', players: ['1', '1', '1']});
rooms.set('2', {id: '2', players: ['1', '1']});

function getRoomForPlayer(uid) {
  for (const room of rooms) {
    if (room[1].players.indexOf(uid) !== -1) {
      return (room[1]);
    }
  }
  return (null);
}

function startGame(room) {
  let deck = deckModule.initDeck();
  let players = playersModule.initPlayers(room, deck);

  games.set(room.id, {
    deck: deck,
    players: players
  });
  console.log(games);
  console.log(games.get(room.id).players);
}

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
      //Remove game if empty
    });

    socket.on('createNewRoom', () => {
      const newUid = uid(7);
      rooms.set(newUid, {id: newUid, players: [client.uid]});
      client.ready = false;
      socket.broadcast.emit('listGames', listAllGames());
    });

    socket.on('changeState', () => {
      client.ready = !client.ready;
      let allReady = true;
      for (const room of rooms) {
        if (room[1].players.indexOf(client.uid) !== -1) {
          for (const player of room[1].players) {
            if (player === '1')
              continue;
            clients.get(player).socket.emit('currentRoomInfos', getRoomInfo(room[0]));
            if (clients.get(player).ready === false)
              allReady = false;
          }
          // Start the game ?
          if (allReady === false)
            return;
          for (const uid of room[1].players) {
            clients.get(uid).socket.emit('startGame');
          }
          startGame(room[1]);
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

    socket.on('askHand', () => {
      let room = getRoomForPlayer(client.uid);

      if (room === null)
        return;
      for (const player of games.get(room.id).players) {
        if (player.uid === client.uid) {
          client.socket.emit('hand', player.hand);
        }
      }
    });

    socket.on('playedCard', (index) => {
      let room = getRoomForPlayer(client.uid);

      if (room === null)
        return;
      for (const player of games.get(room.id).players) {
        if (player.uid === client.uid) {
          player.hand[index] = deckModule.pick(games.get(room.id).deck);
          client.socket.emit('hand', player.hand);
        }
      }
    });
});

app.listen(serverPort, () => {
    console.log(`Server listening on port ${app.address().port}.`)
});
