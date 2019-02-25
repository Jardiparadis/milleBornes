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
  ev.target.appendChild(document.getElementById(data));
  document.getElementById(data).style.height = "14em";
  document.getElementById(data).style.width = "9em";
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
