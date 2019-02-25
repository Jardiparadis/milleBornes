const socket = require('electron').remote.require('./socket');

let playerHand = [];

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  let data = ev.dataTransfer.getData("text");
  document.getElementById('card-played').src = document.getElementById(data).src;
}

socket.on('hand', (hand) => {
  playerHand = hand;

  let index = 1;
  for (const cardName of hand) {
    let elem = document.getElementById(`hand-${index}`);
    elem.src = `../public/${cardName}.png`;
    index += 1;
  }
});

socket.emit('askHand');
