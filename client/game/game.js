const socket = require('electron').remote.require('./socket');

let playerHand = [];
let turn = false;
let initialised = false;

function createNewEnemyDisplay(isLeft, index) {
  let content = `<div id="enemy-${index}-infos" class="box">
      <div class="columns">
        <div class="column" style="width: 15em">
          Player 1
        </div>
        <div class="column" style="width: 15em">
          Km traveled: <span id="enemy-${index}-score">0</span>
        </div>
      </div>
      <div class="columns">
        <div class="column is-narrow">
          Malus:
        </div>
        <div class="column is-narrow">
          <img id="enemy-${index}-malus-1" src="" alt="card" style="width: auto; height: auto; resize: both; max-height: 3em">
        </div>
        <div class="column is-narrow">
          <img id="enemy-${index}-malus-2" src="" alt="card" style="width: auto; height: auto; resize: both; max-height: 3em">
        </div>
        <div class="column is-narrow">
          <img id="enemy-${index}-malus-3" src="" alt="card" style="width: auto; height: auto; resize: both; max-height: 3em">
        </div>
        <div class="column is-narrow">
          <img id="enemy-${index}-malus-4" src="" alt="card" style="width: auto; height: auto; resize: both; max-height: 3em">
        </div>
        <div class="column is-narrow">
          <img id="enemy-${index}-malus-5" src="" alt="card" style="width: auto; height: auto; resize: both; max-height: 3em">
        </div>
      </div>
      <div class="columns">
        <div class="column is-narrow">
          Assets:
        </div>
        <div class="column is-narrow">
          <img id="enemy-${index}-bonus-1" src="" alt="card" style="width: auto; height: auto; resize: both; max-height: 3em">
        </div>
        <div class="column is-narrow">
          <img id="enemy-${index}-bonus-2" src="" alt="card" style="width: auto; height: auto; resize: both; max-height: 3em">
        </div>
        <div class="column is-narrow">
          <img id="enemy-${index}-bonus-3" src="" alt="card" style="width: auto; height: auto; resize: both; max-height: 3em">
        </div>
        <div class="column is-narrow">
          <img id="enemy-${index}-bonus-4" src="" alt="card" style="width: auto; height: auto; resize: both; max-height: 3em">
        </div>
      </div>
    </div>`;

  let side = 'left';
  if (!isLeft) {
    side = 'right';
  }
  document.getElementById(`${side}-enemy-panel`).innerHTML += content;
}

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
    if (initialised === false) {
      createNewEnemyDisplay(Boolean(index % 2), index);
    }
    document.getElementById(`enemy-${index}-score`).innerText = playerDatas.score;
    for (const data of Object.entries(playerDatas.handicap)) {
      if (data[1] === true) {
        document.getElementById(`enemy-${index}-malus-${index}`).src = `../public/${data[0]}.png`;
      }
    }
    index += 1;
  }
  document.getElementById(`self-score`).innerText = selfDatas.score;
  initialised = true;
});

socket.emit('askHand');
