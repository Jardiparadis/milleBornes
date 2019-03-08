const uid = require('uid');
const app = require('http').createServer();
const io = require('socket.io')(app);
const serverPort = 8089;
const cards = require('./cards');

const clients = new Map();
const rooms = new Map();
const games = new Map();

const scoreGoal = 50;
const maxPlayers = 5;

const deckModule = require('./deck');
const playersModule = require('./players');

function emitScore(client) {
  let room = getRoomForPlayer(client.uid);
  let game = games.get(room.id);
  let scoreBoard = [];
  let isGameFinished = false;

  if (game.deck.length === 0) {
    isGameFinished = true;
  }
  for (const player of game.players) {
    if (player.score === scoreGoal) {
      isGameFinished = true;
    }
    scoreBoard.push({
      name: clients.get(player.uid).name,
      score: player.score
    })
  }
  if (isGameFinished === false) {
    return;
  }
  //console.log('WE HAVE A WINNER');
  //process.exit(0);
  let closest = scoreBoard.reduce((prev, curr) => {
    return (Math.abs(curr.score - scoreGoal) < Math.abs(prev.score - scoreGoal) ? curr : prev);
  });

  client.socket.emit('score', {
    winner: closest,
    score: scoreBoard
  })
}

function checkEndGameCondition(game) {
  let scoreBoard = [];
  let isGameFinished = false;

  if (game.deck.length === 0) {
    isGameFinished = true;
  }
  for (const player of game.players) {
    if (player.score === scoreGoal) {
      isGameFinished = true;
    }
    scoreBoard.push({
      name: clients.get(player.uid).name,
      score: player.score
    })
  }
  if (isGameFinished === false) {
    return;
  }

  for (const player of game.players) {
    clients.get(player.uid).socket.emit('gameFinished');
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

function startGame(room, socket) {
  let deck = deckModule.initDeck();
  let players = playersModule.initPlayers(room, deck, clients);

  games.set(room.id, {
    deck: deck,
    players: players,
    turnIndex: 0
  });
  socket.broadcast.emit('listGames', listAllGames());
  console.log(games);
  console.log(games.get(room.id).players);
}

function listAllGames() {
  let response = [];

  rooms.forEach((value) => {
    //remove this line when empty games are no more displayed
    if (games.has(value.id) === false) {
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

function leaveRoom(client, socket) {
  for (const room of rooms) {
    if (room[1].players.indexOf(client.uid) !== -1) {
      room[1].players.splice(room[1].players.indexOf(client.uid), 1);
      for (const player of room[1].players) {
        clients.get(player).socket.emit('currentRoomInfos', getRoomInfo(room[0]));
      }
      if (room[1].players.length === 0) {
        rooms.delete(room[0]);
        break;
      }
    }
  }
  client.ready = false;
  socket.broadcast.emit('listGames', listAllGames());
  //Remove game if empty
}

io.on('connection', socket => {
  let client = {
    uid: uid(7),
    socket: socket,
    name: 'default',
    ready: false
  };
  clients.set(client.uid, client);
  console.log('New client connected: ' + client.uid);

  socket.on('listGames', () => {
    socket.emit('listGames', listAllGames());
  });

  socket.on('disconnect', () => {
    let room = getRoomForPlayer(client.uid);

    clients.delete(client.uid);
    if (room !== null) {
      leaveRoom(client, socket);
      for (const playerUid of room.players) {
        if (playerUid !== client.uid) {
          clients.get(playerUid).socket.emit('aPlayerHasDisconnect');
        }
      }
      if (games.has(room.id) === false) {
        console.log('Bye <3');
        console.log(clients.size);
        return;
      }
      games.delete(room.id);
      rooms.delete(room.id);
    }
    console.log('Bye <3');
    console.log(clients.size);
  });

  socket.on('setName', (name) => {
    client.name = name;
  });

  socket.on('joinRoom', (id) => {
    let room = rooms.get(id);
    if (room.players.length >= maxPlayers) {
      return;
    }
    room.players.push(client.uid);
    client.ready = false;
    socket.broadcast.emit('listGames', listAllGames());
    client.socket.emit('joinRoomAccepted');

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
    leaveRoom(client, socket);
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
        if (allReady === false || room[1].players.length < 2)
          return;
        for (const uid of room[1].players) {
          clients.get(uid).socket.emit('startGame');
        }
        startGame(room[1], socket);
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
    checkEndGameCondition(games.get(room.id));
    changeGameTurn(games.get(room.id));
  });

  socket.on('getScore', () => {
    console.log("blabla");
    emitScore(client);
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
