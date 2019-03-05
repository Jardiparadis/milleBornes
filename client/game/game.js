const socket = require('electron').remote.require('./socket');

let playerHand = [];
let turn = false;
let initialised = false;

function dropOnTargetEnemy(ev, targetId) {
  ev.preventDefault();
  let data = ev.dataTransfer.getData("text");
  socket.emit('playedCard', {owner: data.split('-')[1], target: targetId, trash: false});
}

function createNewEnemyDisplay(isLeft, index, uid) {
  let content = `<div id="enemy-${index}-infos" class="box" ondrop="dropOnTargetEnemy(event, '${uid}')" ondragover="allowDrop(event)">
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
  socket.emit('playedCard', {owner: data.split('-')[1], target: null, trash: false});
}

function dropToTrash(ev) {
  ev.preventDefault();
  let data = ev.dataTransfer.getData("text");
  socket.emit('playedCard', {owner: data.split('-')[1], target: null, trash: true});
}

function resetEnemyState(index_player) {
  for (const index of [...Array(5).keys()]) {
    document.getElementById(`enemy-${index_player}-malus-${index + 1}`).src = '';
    document.getElementById(`enemy-${index_player}-malus-${index + 1}`).style.visibility = 'hidden';
  }
  for (const index of [...Array(4).keys()]) {
    document.getElementById(`enemy-${index_player}-bonus-${index + 1}`).src = '';
    document.getElementById(`enemy-${index_player}-bonus-${index + 1}`).style.visibility = 'hidden';
  }
}

function updateEnemyState(playerDatas, index_player) {
  let index_display = 1;

  document.getElementById(`enemy-${index_player}-score`).innerText = playerDatas.score;
  for (const data of Object.entries(playerDatas.handicap)) {
    let element = document.getElementById(`enemy-${index_player}-malus-${index_display}`);
    if (data[1] === true) {
      element.src = `../public/${data[0]}.png`;
      element.style.visibility = 'visible';
      index_display += 1;
    }
  }
  index_display = 1;
  for (const data of Object.entries(playerDatas.bonus)) {
    let element = document.getElementById(`enemy-${index_player}-bonus-${index_display}`);
    if (data[1] === true) {
      element.src = `../public/${data[0]}.png`;
      element.style.visibility = 'visible';
      index_display += 1;
    }
  }
}

function resetSelfState() {
  for (const index of [...Array(4).keys()]) {
    document.getElementById(`bonus-${index + 1}`).src = '';
    document.getElementById(`bonus-${index + 1}`).style.visibility = 'hidden';
  }
  for (const index of [...Array(5).keys()]) {
    document.getElementById(`malus-${index + 1}`).src = '';
    document.getElementById(`malus-${index + 1}`).style.visibility = 'hidden';
  }
}

function updateSelfState(selfDatas) {
  let index = 1;

  document.getElementById(`self-score`).innerText = selfDatas.score;
  for (const data of Object.entries(selfDatas.bonus)) {
    if (data[1] === true) {
      document.getElementById(`bonus-${index}`).src = `../public/${data[0]}.png`;
      document.getElementById(`bonus-${index}`).style.visibility = 'visible';
      index += 1;
    }
  }
  index = 1;
  for (const data of Object.entries(selfDatas.handicap)) {
    if (data[1] === true) {
      document.getElementById(`malus-${index}`).src = `../public/${data[0]}.png`;
      document.getElementById(`malus-${index}`).style.visibility = 'visible';
      index += 1;
    }
  }
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

socket.on('playedCard', ({cardName, isTrash}) => {
  if (isTrash === false) {
    document.getElementById('card-played').src = `../public/${cardName}.png`;
  }
});

socket.on('turn', (isPlayerTurn) => {
  turn = isPlayerTurn;
  if (isPlayerTurn) {
    document.getElementById('is-your-turn').style.visibility = 'visible';
  } else {
    document.getElementById('is-your-turn').style.visibility = 'hidden';
  }
});

socket.on('gameState', (playersDatas) => {
  let selfDatas = playersDatas[0];
  playersDatas.shift();

  let index_player = 1;
  for (const playerDatas of playersDatas) {
    if (initialised === false) {
      createNewEnemyDisplay(Boolean(index_player % 2), index_player, playerDatas.uid);
    }
    resetEnemyState(index_player);
    updateEnemyState(playerDatas, index_player);
    index_player += 1;
  }
  resetSelfState();
  updateSelfState(selfDatas);
  initialised = true;
});

socket.emit('askHand');
