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
  //document.getElementById(data).src = '';
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

socket.emit('askHand');
