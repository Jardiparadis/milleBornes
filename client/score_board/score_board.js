const {socket} = require('electron').remote.require('./socket');

socket.on('score', (scoreBoard) => {
  document.getElementById('winner-name').innerText = scoreBoard.winner.name;
  let toAdd = '';

  for (const playerScore of scoreBoard.score) {
    toAdd += `<tr>
                <td>${playerScore.name}</td>
                <td>${playerScore.score} km</td>
              </tr>`;
  }
  document.getElementById('score-board').innerHTML = toAdd;
});

socket.emit('getScore');
