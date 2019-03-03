const socket = require('electron').remote.require('./socket');

let playerHand = [];
let turn = false;

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  let data = ev.dataTransfer.getData("text");
  socket.emit('playedCard', data.split('-')[1]);
}

socket.on('hand', (hand) => {
  playerHand = hand;

  let index = 0;
  for (const cardName of hand) {
    let elem = document.getElementById(`hand-${index}`);
    elem.src = `../public/${cardName}.png`;
    index += 1;
  }
});

socket.on('playedCard', (cardName) => {
  document.getElementById('card-played').src = `../public/${cardName}.png`;
});

socket.on('turn', (isPlayerTurn) => {
  console.log(isPlayerTurn);
  turn = isPlayerTurn;
});

socket.on('gameState', (playersDatas) => {
  let selfDatas = playersDatas[0];
  playersDatas.shift();

  console.log(playersDatas);
  let index = 1;
  for (const playerDatas of playersDatas) {
    document.getElementById(`enemy-${index}-infos`).style.visibility = 'visible';
    document.getElementById(`enemy-${index}-score`).innerText = playerDatas.score;
    for (const data of Object.entries(playerDatas.handicap)) {
      if (data[1] === true) {
        document.getElementById(`enemy-${index}-malus-${index}`).src = `../public/${data[0]}.png`;
      }
    }
    index += 1;
  }
  document.getElementById(`self-score`).innerText = selfDatas.score;
});

socket.emit('askHand');
