const uid = require('uid');
const app = require('http').createServer();
const io = require('socket.io')(app);
const serverPort = 8089;
const cards = require('./cards');

const clients = new Map();
const rooms = new Map();
const games = new Map();

const deckModule = require('./deck');
const playersModule = require('./players');

function checkEndGameCondition(game) {

  if (game.deck.length === 0) {
    for (const player of game.players) {

    }
  }
  for (const player of game.players) {

  }
}

function getPlayersGameState(playersInGame, client) {
  let players = [];
  let currentPlayer = null;

  for (const player of playersInGame) {
    if (player.uid === client.uid) {
      currentPlayer = player;
      continue;
    }
    players.push(player);
  }
  players.unshift(currentPlayer);
  console.log(players);
  return (players);
}

function emitPlayersGameState(client) {
  let room = getRoomForPlayer(client.uid);
  client.socket.emit(
    'gameState',
    getPlayersGameState(games.get(room.id).players, client)
  );
}

function applyCardEffet(client, player, cardName, target) {
  if (player.uid === client.uid) {
    console.log('======================');
    console.log(cardName);
    console.log('======================');
    if (cardName === undefined) {
      return (false);
    }
    return (cards[cardName](player, target));
  }
}

function getRoomForPlayer(uid) {
  for (const room of rooms) {
    if (room[1].players.indexOf(uid) !== -1) {
      return (room[1]);
    }
  }
  return (null);
}

function changeGameTurn(game) {
  game.turnIndex += 1;
  if (game.players.length === game.turnIndex) {
    game.turnIndex = 0;
  }
  for (const player of game.players) {
    let client = clients.get(player.uid);
    client.socket.emit('turn', isPlayerTurn(client));
  }
}

function isPlayerTurn(client) {
  let game = games.get(getRoomForPlayer(client.uid).id);
  if (game.players[game.turnIndex].uid === client.uid) {
    return (true);
  }
  return (game.players[game.turnIndex].uid);
}

function startGame(room) {
  let deck = deckModule.initDeck();
  let players = playersModule.initPlayers(room, deck, clients);

  games.set(room.id, {
    deck: deck,
    players: players,
    turnIndex: 0
  });
  console.log(games);
  console.log(games.get(room.id).players);
}

function listAllGames() {
  let response = [];

  rooms.forEach((value) => {
    //remove this line when empty games are no more displayed
    if (value.players.length !== 0) {
      response.push({room: value, owner: clients.get(value.players[0]).name});
    }
  });
  return response;
}

function getRoomInfo(roomId) {
  let room = rooms.get(roomId);

  let infosToSend = JSON.parse(JSON.stringify(room));
  let readyList = [];
  let nameList = [];
  clients.forEach((value) => {
    if (room.players.indexOf(value.uid) !== -1) {
      readyList.push(value.ready);
      nameList.push(value.name);
    }
  });
  infosToSend.isReady = readyList;
  infosToSend.names = nameList;
  return (infosToSend);
}

io.on('connection', socket => {
  let client = {
    uid: uid(7),
    socket: socket,
    name: 'default',
    ready: false
  };
  clients.set(client.uid, client);
  console.log('New client conencted: ' + client.uid);
  socket.on('listGames', () => {
    socket.emit('listGames', listAllGames());
  });

  socket.on('setName', (name) => {
    client.name = name;
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
        client.socket.emit('turn', isPlayerTurn(client));
        emitPlayersGameState(client);
      }
    }
  });

  socket.on('playedCard', (data) => {
    let room = getRoomForPlayer(client.uid);
    let playersInGame = games.get(room.id).players;
    let playedCard = null;

    if (room === null || playersInGame === null || isPlayerTurn(client) !== true)
      return;
    for (const player of games.get(room.id).players) {
      if (player.uid === client.uid) {
        playedCard = player.hand[data.owner];
        let target = null;
        if (data.target !== null) {
          for (const playerTargeted of playersInGame) {
            if (playerTargeted.uid === data.target) {
              target = playerTargeted;
            }
          }
        }
        if (data.trash === false) {
          if (applyCardEffet(client, player, playedCard, target) === false) {
            // Something went wrong during card effect process
            return;
          }
        } else {
          console.log('TRASH');
        }
        player.hand[data.owner] = deckModule.pick(games.get(room.id).deck);
        client.socket.emit('hand', player.hand);
      }
    }
    for (const player of playersInGame) {
      clients.get(player.uid).socket.emit('playedCard', {cardName: playedCard, isTrash: data.trash});
      emitPlayersGameState(clients.get(player.uid));
    }
    changeGameTurn(games.get(room.id));
  });

  socket.on('initPlayers', () => {
    let room = getRoomForPlayer(client.uid);
    client.socket.emit(
      'initPlayers',
      getPlayersGameState(games.get(room.id).players, client)
    );
  });
});

app.listen(serverPort, () => {
  console.log(`Server listening on port ${app.address().port}.`)
});
